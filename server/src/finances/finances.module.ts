import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancesService } from './finances.service';
import { FinancesController } from './finances.controller';
import { Transaction } from './finances.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [FinancesService],
  controllers: [FinancesController],
})
export class FinancesModule {}
