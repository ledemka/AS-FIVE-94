import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { join } from 'path';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheets;

  constructor() {
    this.initSheets();
  }

  private initSheets() {
    try {
      const jsonPath = join(process.cwd(), 'google-key.json');
      
      const auth = new google.auth.GoogleAuth({
        keyFile: jsonPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.logger.log(`Google Sheets API initialized via local JSON: ${jsonPath}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Google Sheets API: ${error.message}`);
    }
  }

  async getSheetData(spreadsheetId: string, range: string): Promise<any[][]> {
    if (!this.sheets) {
      this.initSheets();
      if (!this.sheets) throw new Error('Google Sheets API not initialized');
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    } catch (error) {
      this.logger.error(`Error fetching sheet data: ${error.message}`);
      throw error;
    }
  }

  async appendData(spreadsheetId: string, range: string, values: any[][]) {
    if (!this.sheets) throw new Error('Google Sheets API not initialized');

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    } catch (error) {
      this.logger.error(`Error appending data: ${error.message}`);
      throw error;
    }
  }

  async updateData(spreadsheetId: string, range: string, values: any[][]) {
    if (!this.sheets) throw new Error('Google Sheets API not initialized');

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    } catch (error) {
      this.logger.error(`Error updating data: ${error.message}`);
      throw error;
    }
  }
}
