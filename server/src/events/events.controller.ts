import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { Event } from './events.entity';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tout le planning' })
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel événement (Match/Entraînement)' })
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateData: Partial<Event>): Promise<Event> {
    return this.eventsService.update(+id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.eventsService.remove(+id);
  }
}
