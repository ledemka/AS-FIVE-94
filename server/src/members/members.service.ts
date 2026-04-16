import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './members.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private membersRepository: Repository<Member>,
  ) {}

  findAll(): Promise<Member[]> {
    return this.membersRepository.find();
  }

  async findOne(id: number): Promise<Member> {
    const member = await this.membersRepository.findOneBy({ id });
    if (!member) throw new NotFoundException(`Member with ID ${id} not found`);
    return member;
  }

  create(memberData: Partial<Member>): Promise<Member> {
    const member = this.membersRepository.create(memberData);
    return this.membersRepository.save(member);
  }

  async update(id: number, memberData: Partial<Member>): Promise<Member> {
    await this.membersRepository.update(id, memberData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.membersRepository.delete(id);
  }
}
