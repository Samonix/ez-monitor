import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Express, Request, Response } from 'express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api/v1', {
    exclude: ['pts/jsonPTS', 'pts/:uri', 'jsonPTS', 'api/v1/jsonPTS', 'health']
  });

  const config = new DocumentBuilder()
    .setTitle('EZ MONITOR API')
    .setDescription('API для EZ MONITOR, PTS-2 ingestion, карток і аналітики.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, openApiDocument);

  const express = app.getHttpAdapter().getInstance() as Express;
  express.get('/api/v1/openapi.json', (_request: Request, response: Response): void => {
    response.json(openApiDocument);
  });

  await app.listen(Number(process.env.API_PORT ?? 3000), '0.0.0.0');
}

bootstrap();