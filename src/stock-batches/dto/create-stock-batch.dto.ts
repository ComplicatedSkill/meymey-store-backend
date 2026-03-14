import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateStockBatchDto {
  @IsString()
  product_id: string;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsOptional()
  @IsString()
  batch_number?: string;

  @IsNumber()
  @Min(0)
  quantity_received: number;

  @IsNumber()
  @Min(0)
  unit_cost: number;

  @IsOptional()
  @IsString()
  purchase_order_id?: string;

  @IsOptional()
  @IsString()
  received_date?: string;

  @IsOptional()
  @IsString()
  expiry_date?: string;
}
