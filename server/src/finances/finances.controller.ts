import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FinancesService } from './finances.service';
import { Transaction } from './finances.entity';

@ApiTags('finances')
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les transactions' })
  findAll(): Promise<Transaction[]> {
    return this.financesService.findAll();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Calculer le bilan financier' })
  getMetrics() {
    return this.financesService.getMetrics();
  }

  @Post()
  @ApiOperation({ summary: 'Enregistrer une nouvelle transaction' })
  create(@Body() transactionData: Partial<Transaction>): Promise<Transaction> {
    return this.financesService.create(transactionData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une transaction' })
  remove(@Param('id') id: string): Promise<void> {
    return this.financesService.remove(+id);
  }
}
