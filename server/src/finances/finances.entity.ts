import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Member } from '../members/members.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column()
  date: string;

  @ApiProperty()
  @Column()
  category: string; // 'dues', 'equipment', 'match_fees', etc.

  @ApiProperty()
  @Column()
  type: string; // 'income' or 'expense'

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  paypalTransactionId: string;

  // Relation avec un membre (ex: pour le paiement des cotisations)
  @ManyToOne(() => Member, { nullable: true, onDelete: 'SET NULL' })
  member: Member;

  @CreateDateColumn()
  createdAt: Date;
}
