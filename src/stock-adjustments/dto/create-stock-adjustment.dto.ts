import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class CreateStockAdjustmentDto {
  @IsString()
  product_id: string;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsIn(['increase', 'decrease', 'correction'])
  adjustment_type: 'increase' | 'decrease' | 'correction';

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  adjusted_by?: string;

  @IsOptional()
  @IsString()
  store_id?: string;
}
