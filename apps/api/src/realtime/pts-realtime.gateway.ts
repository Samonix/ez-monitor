import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import type { Socket } from 'socket.io';

@WebSocketGateway({ path: '/pts/ws', cors: true })
export class PtsRealtimeGateway {
  private readonly logger = new Logger(PtsRealtimeGateway.name);

  @SubscribeMessage('jsonPTS')
  handleJsonPts(@MessageBody() payload: unknown, @ConnectedSocket() socket: Socket) {
    this.logger.debug(`PTS WebSocket skeleton received packet from ${socket.id}`);
    return { Protocol: 'jsonPTS', Message: 'EZ_MONITOR_WEBSOCKET_SKELETON', Data: payload };
  }
}