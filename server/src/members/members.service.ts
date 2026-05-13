import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './members.entity';
import { FinancesService } from '../finances/finances.service';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
    private financesService: FinancesService,
  ) {}

  async findAll(): Promise<any[]> {
    const members = await this.membersRepository.find();
    return members.map(m => {
      const computedDuesStatus = m.totalPaid >= 120 ? 'paid' : 'pending';
      return {
        ...m,
        duesStatus: computedDuesStatus,
        isRegularized: m.registrationStatus === 'registered' && computedDuesStatus === 'paid'
      };
    });
  }

  async findOne(id: number): Promise<any> {
    const member = await this.membersRepository.findOneBy({ id });
    if (!member) throw new NotFoundException(`Member with ID ${id} not found`);
    const computedDuesStatus = member.totalPaid >= 120 ? 'paid' : 'pending';
    return {
      ...member,
      duesStatus: computedDuesStatus,
      isRegularized: member.registrationStatus === 'registered' && computedDuesStatus === 'paid'
    };
  }

  create(memberData: Partial<Member>): Promise<Member> {
    const member = this.membersRepository.create(memberData);
    return this.membersRepository.save(member);
  }

  async update(id: number, memberData: Partial<Member>): Promise<any> {
    const oldMember = await this.findOne(id);
    
    // Logique de génération de transaction automatique
    if (memberData.registrationStatus === 'registered' && oldMember.registrationStatus !== 'registered') {
      await this.financesService.create({
        amount: 10,
        type: 'income',
        category: 'Inscription',
        description: `Frais d'inscription - ${oldMember.firstName} ${oldMember.lastName}`,
        date: new Date().toISOString().slice(0, 10),
        member: { id } as any
      });
    }

    if (memberData.duesStatus === 'paid' && oldMember.duesStatus !== 'paid') {
      await this.financesService.create({
        amount: 50, // Montant par défaut pour la cotisation
        type: 'income',
        category: 'Cotisation',
        description: `Cotisation annuelle - ${oldMember.firstName} ${oldMember.lastName}`,
        date: new Date().toISOString().slice(0, 10),
        member: { id } as any
      });
    }

    await this.membersRepository.update(id, memberData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.membersRepository.delete(id);
  }
}
