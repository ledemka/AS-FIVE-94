import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './finances.entity';
import { Member } from '../members/members.entity';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Transaction)
    private financesRepository: Repository<Transaction>,
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  findAll(): Promise<Transaction[]> {
    return this.financesRepository.find({ relations: ['member'], order: { date: 'DESC' } });
  }

  create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.financesRepository.create(transactionData);
    return this.financesRepository.save(transaction);
  }

  async getMetrics() {
    const transactions = await this.findAll();
    const members = await this.membersRepository.find();
    
    // Revenue is the sum of all member cotisations (totalPaid) 
    // PLUS any other income transactions that are NOT in the "Cotisation" category
    const memberIncome = members.reduce((sum, m) => sum + (m.totalPaid || 0), 0);
    
    const otherIncome = transactions
      .filter(t => t.type === 'income' && t.category !== 'Cotisation')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    const income = memberIncome + otherIncome;
    
    // Expenses are from transactions (type === 'expense')
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      memberIncome,
      otherIncome
    };
  }

  async remove(id: number): Promise<void> {
    await this.financesRepository.delete(id);
  }
}
