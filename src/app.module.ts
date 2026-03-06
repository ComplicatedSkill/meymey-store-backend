import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupabaseModule } from './supabase/supabase.module';
import { CategoriesModule } from './categories/categories.module';
import { UomModule } from './uom/uom.module';
import { ProductsModule } from './products/products.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { PurchaseInventoryModule } from './purchase-inventory/purchase-inventory.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { StockAdjustmentsModule } from './stock-adjustments/stock-adjustments.module';
import { StoresModule } from './stores/stores.module';
import { CustomersModule } from './customers/customers.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StockBatchesModule } from './stock-batches/stock-batches.module';
import { ReportsModule } from './reports/reports.module';
import { StorefrontModule } from './storefront/storefront.module';
import { UploadModule } from './upload/upload.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    UomModule,
    ProductsModule,
    ProductVariantsModule,
    StockMovementsModule,
    PurchaseOrdersModule,
    PurchaseInventoryModule,
    SuppliersModule,
    StockAdjustmentsModule,
    StoresModule,
    CustomersModule,
    SalesOrdersModule,
    InvoicesModule,
    PaymentMethodsModule,
    ExchangeRatesModule,
    NotificationsModule,
    StockBatchesModule,
    ReportsModule,
    StorefrontModule,
    UploadModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
