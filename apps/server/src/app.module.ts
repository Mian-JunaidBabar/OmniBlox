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
import { ExpensesModule } from './expenses/expenses.module';
import { TeamModule } from './team/team.module';
import { BillersModule } from './billers/billers.module';
import { InventoryModule } from './inventory/inventory.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { StockAdjustmentsModule } from './stock-adjustments/stock-adjustments.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { AuthModule as BetterAuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth/auth.config';

@Module({
  imports: [
    BetterAuthModule.forRoot({ auth }),
    PrismaModule,
    AuthModule,
    ProductModule,
    SalesModule,
    CustomersModule,
    SuppliersModule,
    WarehousesModule,
    ExpensesModule,
    TeamModule,
    BillersModule,
    InventoryModule,
    DeliveriesModule,
    StockAdjustmentsModule,
    PurchasesModule,
    ExpenseCategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
