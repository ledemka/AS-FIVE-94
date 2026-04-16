import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MembersModule } from './members/members.module';
import { EventsModule } from './events/events.module';
import { FinancesModule } from './finances/finances.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration de la base de données SQLite - Identifié comme pattern stable local
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'sportflow.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Désactivé en prod, mais parfait pour le dev local initial
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'app'),
    }),
    MembersModule,
    EventsModule,
    FinancesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
