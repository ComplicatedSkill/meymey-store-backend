import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseInventoryDto } from './create-purchase-inventory.dto';

export class UpdatePurchaseInventoryDto extends PartialType(
  CreatePurchaseInventoryDto,
) {}
