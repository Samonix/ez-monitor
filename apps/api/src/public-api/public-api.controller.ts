import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicApiService } from './public-api.service.js';

@ApiTags('EZ MONITOR public API')
@Controller()
export class PublicApiController {
  constructor(private readonly service: PublicApiService) {}

  @Get('/health')
  health() {
    return { status: 'ok', service: 'ez-monitor-api' };
  }

  @Get('/stations')
  @ApiOperation({ summary: 'Список станцій мережі.' })
  listStations() {
    return this.service.listStations();
  }

  @Get('/stations/:id/summary')
  stationSummary(@Param('id') id: string) {
    return this.service.stationSummary(id);
  }

  @Get('/stations/:id/transactions')
  stationTransactions(@Param('id') id: string) {
    return this.service.stationTransactions(id);
  }

  @Get('/stations/:id/tanks')
  stationTanks(@Param('id') id: string) {
    return this.service.stationTanks(id);
  }

  @Get('/alerts')
  alerts() {
    return this.service.alerts();
  }

  @Get('/cards')
  cards() {
    return this.service.cards();
  }

  @Post('/cards')
  createCard(@Body() body: Record<string, unknown>) {
    return { id: 'card-draft', ...body, status: 'active' };
  }

  @Patch('/cards/:id')
  updateCard(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return { id, ...body };
  }

  @Get('/analytics/revenue')
  revenue(@Query('stationId') stationId?: string, @Query('period') period?: string) {
    return this.service.revenue(stationId, period);
  }
}