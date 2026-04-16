import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './finances.entity';

@Injectable()
export class FinancesService {
  constructor(
    @InjectRepository(Transaction)
    private financesRepository: Repository<Transaction>,
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
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }
}
