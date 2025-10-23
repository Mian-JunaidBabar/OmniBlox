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
          url: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log(
        '[PrismaService] Database connected successfully (using pooled connection)',
      );
    } catch (err) {
      // Don't crash the whole app if the DB is unreachable during boot.
      // Log error and allow the application to continue; individual requests
      // will surface DB errors as needed.
      console.error(
        '[PrismaService] Failed to connect to database:',
        err instanceof Error ? err.message : err,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('[PrismaService] Database disconnected');
  }
}
