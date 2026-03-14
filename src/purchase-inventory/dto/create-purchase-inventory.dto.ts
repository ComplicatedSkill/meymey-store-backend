import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePurchaseInventoryDto {
  @IsString()
  purchase_order_id: string;

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

  @IsOptional()
  @IsNumber()
  @Min(0)
  received_quantity?: number;
}
