import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './members.entity';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(): Promise<Member[]> {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Member> {
    return this.membersService.findOne(+id);
  }

  @Post()
  create(@Body() memberData: Partial<Member>): Promise<Member> {
    return this.membersService.create(memberData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() memberData: Partial<Member>): Promise<Member> {
    return this.membersService.update(+id, memberData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.membersService.remove(+id);
  }
}
