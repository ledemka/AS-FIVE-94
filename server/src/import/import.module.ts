import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/members.entity';
import { Transaction } from '../finances/finances.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { GoogleSheetsService } from './google-sheets.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Transaction])],
  controllers: [ImportController],
  providers: [ImportService, GoogleSheetsService],
  exports: [ImportService, GoogleSheetsService],
})
export class ImportModule {}
