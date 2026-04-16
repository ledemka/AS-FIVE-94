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

  @Column({ default: 'senior' })
  category: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: 'unpaid' })
  dues: string;

  @Column({ default: 0 })
  attendance: number;

  @CreateDateColumn()
  joinDate: Date;
}
