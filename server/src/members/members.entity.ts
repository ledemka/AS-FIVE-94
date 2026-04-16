import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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

  // Le statut global est calculé : Régularisé si Inscrit ET Cotisation Payée
  get isRegularized(): boolean {
    return this.registrationStatus === 'registered' && this.duesStatus === 'paid';
  }
}
