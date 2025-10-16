import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // The 'super' call invokes the constructor of the PrismaClient.
    // We pass it a configuration object to override the default datasource URL.
    super({
      datasources: {
        db: {
          // Use the pooled connection string for the running application
          url: process.env.DATABASE_URL_POOLED,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log(
      '[PrismaService] Database connected successfully (using pooled connection)',
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[PrismaService] Database disconnected');
  }
}
