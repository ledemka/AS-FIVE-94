import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('import')
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('sync-google')
  @ApiOperation({ summary: 'Synchroniser les données avec Google Sheets' })
  async syncGoogle() {
    try {
      return await this.importService.syncGoogleSheets();
    } catch (error) {
      throw new HttpException(`Erreur lors de la synchronisation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('excel')
  @ApiOperation({ summary: 'Importer des membres depuis un fichier Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importMembers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Fichier manquant', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.importService.importExcel(file.buffer);
    } catch (error) {
      throw new HttpException(`Erreur lors de l'importation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
