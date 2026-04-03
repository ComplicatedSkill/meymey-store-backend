import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductPackagesModule } from '../product-packages/product-packages.module';
import { ProductUomConversionsModule } from '../product-uom-conversions/product-uom-conversions.module';

@Module({
  imports: [SupabaseModule, NotificationsModule, ProductPackagesModule, ProductUomConversionsModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
