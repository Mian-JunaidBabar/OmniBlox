import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './products/product.module';
import { SalesModule } from './sales/sales.module';
import { CustomersModule } from './customers/customers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [PrismaModule, AuthModule, ProductModule, SalesModule, CustomersModule, SuppliersModule, WarehousesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
