import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PurchaseOrderItemDto {
  @IsString()
  product_id: string;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  // Optional: the UOM the purchase is made in (e.g. box).
  // If provided, quantity will be converted to base units on receive.
  @IsOptional()
  @IsString()
  purchase_uom_id?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  order_number: string;

  @IsOptional()
  @IsString()
  supplier_id?: string;

  @IsOptional()
  @IsString()
  supplier_name?: string;

  @IsOptional()
  @Transform(({ value }) => (value ? value.toLowerCase() : 'pending'))
  @IsIn(['pending', 'approved', 'received', 'cancelled'])
  status: 'pending' | 'approved' | 'received' | 'cancelled' = 'pending';

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_amount?: number;

  @IsOptional()
  @IsString()
  order_date?: string;

  @IsOptional()
  @IsString()
  expected_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}
