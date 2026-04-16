import { Injectable, NotFoundException } from '@nestjs/common';
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
