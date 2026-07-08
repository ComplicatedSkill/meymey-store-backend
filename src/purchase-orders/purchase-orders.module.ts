import { Module } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { ProductUomConversionsModule } from '../product-uom-conversions/product-uom-conversions.module';
import { AccountsPayableModule } from '../accounts-payable/accounts-payable.module';

@Module({
  imports: [ProductUomConversionsModule, AccountsPayableModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
