import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from '../finances/finances.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  externalId: string; // Adherent ID from Excel (e.g., A001)

  @Column({ nullable: true })
  paymentMethod: string; // HelloAsso, Paypal, Espece

  @Column({ default: false })
  registrationDues: boolean; // Frais d'inscription payés

  @Column({ nullable: true })
  duesFrequency: string; // Mensuel, Trimestriel, Annuel

  @Column({ default: 'senior' })
  category: string;

  @Column({ default: 'unregistered' }) // registered, unregistered
  registrationStatus: string;

  @Column({ default: 'unpaid' }) // paid, unpaid, pending
  duesStatus: string;

  @Column({ default: 0 })
  attendance: number;

  @CreateDateColumn()
  joinDate: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.member)
  transactions: Transaction[];

  // Le statut global est calculé : Régularisé si Inscrit ET Cotisation Payée
  get isRegularized(): boolean {
    return this.registrationStatus === 'registered' && this.duesStatus === 'paid';
  }
}
