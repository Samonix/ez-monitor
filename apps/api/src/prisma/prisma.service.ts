import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Prisma client підключиться тут після `pnpm db:generate`.
  }
  async onModuleDestroy() {
    // Закрити Prisma connection pool після підключення реального client.
  }
}