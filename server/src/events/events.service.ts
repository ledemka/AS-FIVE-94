import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './events.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  async onModuleInit() {
    await this.seedPlanning();
  }

  async seedPlanning() {
    // 1. Supprimer le match de ce jeudi (2026-04-16)
    await this.eventsRepository.delete({ date: '2026-04-16' });

    // 2. Remplir chaque samedi pour les 3 prochains mois
    const startDate = new Date('2026-04-16');
    const endDate = new Date('2026-07-16'); // 3 mois plus tard

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentDate.getDay() === 6) { // 6 = Samedi
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Vérifier si l'événement existe déjà
        const exists = await this.eventsRepository.findOneBy({ date: dateStr });
        if (!exists) {
          await this.create({
            title: 'Match Hebdomadaire',
            type: 'match',
            date: dateStr,
            time: '09:30',
            location: 'Stade AS FIVE',
            scoreGreen: 0,
            scoreOrange: 0,
            scorersGreen: [],
            scorersOrange: [],
            assistsGreen: [],
            assistsOrange: []
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find({ order: { date: 'ASC', time: 'ASC' } });
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  async update(id: number, updateData: Partial<Event>): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, updateData);
    return this.eventsRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    await this.eventsRepository.delete(id);
  }
}
