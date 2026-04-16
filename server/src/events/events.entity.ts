import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  type: string; // 'match', 'training', etc.

  @ApiProperty()
  @Column()
  date: string;

  @ApiProperty()
  @Column()
  time: string;

  @ApiProperty()
  @Column({ default: 'Stade AS FIVE' })
  location: string;

  @ApiProperty()
  @Column({ default: 0 })
  scoreGreen: number;

  @ApiProperty()
  @Column({ default: 0 })
  scoreOrange: number;

  @ApiProperty()
  @Column({ default: 'pending' })
  result: string; // 'win', 'loss', 'draw', 'pending'

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  scorersGreen: string[]; // Liste d'IDs de membres

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  scorersOrange: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  assistsGreen: string[];

  @ApiProperty()
  @Column('simple-array', { nullable: true })
  assistsOrange: string[];

  // Calcul automatique du résultat avant insertion ou mise à jour
  @BeforeInsert()
  @BeforeUpdate()
  calculateResult() {
    if (this.type !== 'match') {
      this.result = 'n/a';
      return;
    }
    
    if (this.scoreGreen > this.scoreOrange) {
      this.result = 'win';
    } else if (this.scoreGreen < this.scoreOrange) {
      this.result = 'loss';
    } else {
      this.result = 'draw';
    }
  }
}
