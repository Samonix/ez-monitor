import { Module } from '@nestjs/common';
import { PublicApiController } from './public-api/public-api.controller.js';
import { PublicApiService } from './public-api/public-api.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PtsController } from './pts/pts.controller.js';
import { PtsIngestionService } from './pts/pts-ingestion.service.js';
import { PtsRealtimeGateway } from './realtime/pts-realtime.gateway.js';

@Module({ controllers: [PublicApiController, PtsController], providers: [PrismaService, PublicApiService, PtsIngestionService, PtsRealtimeGateway] })
export class AppModule {}