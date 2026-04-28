import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../members/members.entity';
import { Transaction } from '../finances/finances.entity';
import { GoogleSheetsService } from './google-sheets.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private googleSheetsService: GoogleSheetsService,
  ) {}

  async syncGoogleSheets() {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID not set in .env');

    this.logger.log('Starting Google Sheets synchronization...');

    const results = {
      membersUpdated: 0,
      cotisationsAdded: 0,
      transactionsAdded: 0,
    };

    // Store member map for cross-tab referencing
    const memberMap = new Map<string, number>(); // adherentId -> memberDbId

    // PHASE 1: Sync Members from "Suivi adhesion"
    results.membersUpdated = await this.syncMembersTab(spreadsheetId, memberMap);

    // PHASE 2: Sync Dues from "Suivi de cotisation"
    results.cotisationsAdded = await this.syncCotisationsTab(spreadsheetId, memberMap);

    // PHASE 3: Sync General Transactions from "Flux monétaires"
    results.transactionsAdded = await this.syncFluxTab(spreadsheetId);

    this.logger.log('Synchronization complete.');
    return results;
  }

  private async syncMembersTab(spreadsheetId: string, memberMap: Map<string, number>): Promise<number> {
    const rows = await this.googleSheetsService.getSheetData(spreadsheetId, 'Suivi adhesion!A2:I');
    if (!rows) {
      this.logger.warn('No data found in "Suivi adhesion" tab');
      return 0;
    }

    this.logger.log(`Fetched ${rows.length} rows from "Suivi adhesion" tab`);

    let count = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const adherentId = row[0]?.toString()?.trim() || '';
      const lastName = row[1]?.toString()?.trim() || '';
      const firstName = row[2]?.toString()?.trim() || '';
      const regDuesValue = row[4]?.toString();
      const duesFreq = row[6]?.toString();
      const duesStatusRaw = row[7]?.toString();
      const paymentMethod = row[8]?.toString() || 'Espece';
      
      if (!lastName && !firstName) {
        if (adherentId || row.some(cell => cell && cell.toString().trim())) {
          this.logger.warn(`Skipping row ${i + 2}: Both names are empty. Content: ${JSON.stringify(row)}`);
        }
        continue;
      }

      let member = await this.membersRepository.findOne({
        where: { firstName, lastName }
      });

      const memberData: Partial<Member> = {
        externalId: adherentId,
        lastName,
        firstName,
        registrationDues: regDuesValue === 'OUI',
        registrationStatus: regDuesValue === 'OUI' ? 'registered' : 'unregistered',
        duesFrequency: duesFreq,
        paymentMethod,
        duesStatus: this.mapDuesStatus(duesStatusRaw),
        email: member?.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      };

      if (member) {
        Object.assign(member, memberData);
        member = await this.membersRepository.save(member);
      } else {
        member = await this.membersRepository.save(this.membersRepository.create(memberData));
      }

      this.logger.log(`Synced member: ${firstName} ${lastName}`);

      if (adherentId) {
        memberMap.set(adherentId, member.id);
      }
      count++;
    }
    return count;
  }

  private async syncCotisationsTab(spreadsheetId: string, memberMap: Map<string, number>): Promise<number> {
    const rows = await this.googleSheetsService.getSheetData(spreadsheetId, 'Suivi de cotisation!A2:Z');
    const headers = await this.googleSheetsService.getSheetData(spreadsheetId, 'Suivi de cotisation!A1:Z1');
    if (!rows || !headers) return 0;

    const headerRow = headers[0];
    let count = 0;

    for (const row of rows) {
      const adherentId = row[0]?.toString();
      const memberId = memberMap.get(adherentId);
      if (!memberId) continue;

      const member = await this.membersRepository.findOneBy({ id: memberId });

      // Iterate through columns to find months
      for (let i = 2; i < row.length; i++) {
        const header = headerRow[i]?.toString();
        // Check if header is a month (e.g. "Septembre 25")
        if (header && /^[A-Z][a-z]+ \d{2}$/.test(header)) {
          const amountStr = row[i]?.toString();
          const method = row[i + 1]?.toString(); // Usually method is the next column
          const amount = this.parseCurrency(amountStr);

          if (amount > 0) {
            const description = `Cotisation ${header} - ${member.firstName} ${member.lastName}`;
            const existing = await this.transactionsRepository.findOneBy({
              member: { id: member.id },
              description: description
            });

            if (!existing) {
              await this.transactionsRepository.save(this.transactionsRepository.create({
                description,
                amount,
                type: 'income',
                category: 'Cotisation',
                date: this.monthHeaderToDate(header),
                paymentMethod: method || member.paymentMethod,
                member: member
              }));
              count++;
            }
          }
          i++; // Skip the "Moyen de paiement" column
        }
      }
    }
    return count;
  }

  private async syncFluxTab(spreadsheetId: string): Promise<number> {
    const rows = await this.googleSheetsService.getSheetData(spreadsheetId, 'Flux monétaires!A3:E');
    if (!rows) return 0;

    let count = 0;
    for (const row of rows) {
      const dateStr = row[0]?.toString();
      const typeRaw = row[1]?.toString();
      const amountStr = row[2]?.toString();
      const source = row[3]?.toString();
      const method = row[4]?.toString();

      const amount = this.parseCurrency(amountStr);
      if (!dateStr || amount === 0) continue;

      const type = typeRaw?.includes('Entrée') ? 'income' : 'expense';
      const description = source || 'Transaction Divers';
      const date = this.formatDateForDb(dateStr);

      const existing = await this.transactionsRepository.findOneBy({
        date,
        amount,
        description
      });

      if (!existing) {
        await this.transactionsRepository.save(this.transactionsRepository.create({
          description,
          amount,
          type,
          category: 'General',
          date,
          paymentMethod: method || 'Espece'
        }));
        count++;
      }
    }
    return count;
  }

  private monthHeaderToDate(header: string): string {
    // Convert "Septembre 25" to "2025-09-01"
    const months = {
      'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12',
      'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
      'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08'
    };
    const parts = header.split(' ');
    if (parts.length === 2) {
      const month = months[parts[0]];
      const year = `20${parts[1]}`;
      if (month) return `${year}-${month}-01`;
    }
    return new Date().toISOString().split('T')[0];
  }

  private parseCurrency(val: string): number {
    if (!val) return 0;
    const clean = val.replace(/[^\d,.-]/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  }

  private parseDate(val: string): Date {
    if (!val) return new Date();
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private mapDuesStatus(val: string): string {
    if (!val) return 'pending';
    const clean = val.toLowerCase();
    if (clean.includes('oui') || clean.includes('payé') || clean === '0,00 €' || clean === '0' || clean.includes('à jour')) {
      return 'paid';
    }
    return 'pending';
  }

  private formatDateForDb(val: string): string {
    if (!val) return new Date().toISOString().split('T')[0];
    const parts = val.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  }

  async importExcel(buffer: Buffer) {
    return { message: 'Use Google Sheets sync for best results' };
  }
}
