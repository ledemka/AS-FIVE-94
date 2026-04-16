import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { Member } from './members.entity';
import { FinancesModule } from '../finances/finances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    FinancesModule,
  ],
  providers: [MembersService],
  controllers: [MembersController],
  exports: [MembersService],
})
export class MembersModule {}
