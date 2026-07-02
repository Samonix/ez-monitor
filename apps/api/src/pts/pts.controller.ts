import { Body, Controller, Headers, HttpCode, Param, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { JsonPtsEnvelope } from '@ez-monitor/pts-protocol';
import { PtsIngestionService } from './pts-ingestion.service.js';

@ApiTags('PTS-2 ingestion')
@Controller()
export class PtsController {
  constructor(private readonly ingestion: PtsIngestionService) {}

  @Post(['pts/jsonPTS', 'pts/:uri', 'jsonPTS', 'api/v1/jsonPTS'])
  @HttpCode(200)
  @ApiOperation({ summary: 'Приймає jsonPTS upload/status/tag packets від PTS-2.' })
  @ApiBody({ description: 'Generic jsonPTS envelope', required: true })
  async ingest(
    @Param('uri') uri: string | undefined,
    @Body() envelope: JsonPtsEnvelope,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() request: Request & { rawBody?: Buffer }
  ) {
    const basicUser = process.env.PTS_HTTP_BASIC_USER;
    const basicPassword = process.env.PTS_HTTP_BASIC_PASSWORD;
    if (basicUser && basicPassword && !this.ingestion.verifyBasicAuth(headers.authorization, basicUser, basicPassword)) {
      throw new UnauthorizedException('Invalid PTS credentials');
    }

    const requestPath = request.path.replace(/^\/+/, '') || 'jsonPTS';
    return this.ingestion.acceptEnvelope({ uri: uri ?? requestPath, envelope, headers, rawBody: request.rawBody });
  }
}