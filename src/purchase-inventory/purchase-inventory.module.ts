import { Module } from '@nestjs/common';
import { PurchaseInventoryService } from './purchase-inventory.service';
import { PurchaseInventoryController } from './purchase-inventory.controller';

@Module({
  controllers: [PurchaseInventoryController],
  providers: [PurchaseInventoryService],
  exports: [PurchaseInventoryService],
})
export class PurchaseInventoryModule {}
