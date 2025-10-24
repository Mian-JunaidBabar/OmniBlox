import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/product.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductModule, SalesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
