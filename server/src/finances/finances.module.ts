import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { Transaction } from './finances.entity';
import { Member } from '../members/members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Member])],
  providers: [FinancesService],
  controllers: [FinancesController],
  exports: [FinancesService],
})
export class FinancesModule {}
