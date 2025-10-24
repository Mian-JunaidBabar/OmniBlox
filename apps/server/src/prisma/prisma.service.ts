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
    const databaseUrl =
      process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;

    if (databaseUrl) {
      // If a runtime database URL is available, pass it explicitly to Prisma.
      super({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
    } else {
      // If no DB URL is provided, avoid passing `undefined` to PrismaClient.
      // Let Prisma use its default behavior (read from `schema.prisma` env()).
      console.warn(
        '[PrismaService] No DATABASE_URL or DATABASE_URL_POOLED found; creating PrismaClient without explicit datasource override.',
      );

      super();
    }
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
