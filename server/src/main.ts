import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS
  app.enableCors();

  // Configuration Swagger (OpenAPI) - Pattern multi-agent pour la testabilité
  const config = new DocumentBuilder()
    .setTitle('AS FIVE 94 API')
    .setDescription('Documentation technique de l\'application de gestion sportive')
    .setVersion('1.0')
    .addTag('members')
    .addTag('events')
    .addTag('finances')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation available on: http://localhost:3000/api`);
}
bootstrap();
