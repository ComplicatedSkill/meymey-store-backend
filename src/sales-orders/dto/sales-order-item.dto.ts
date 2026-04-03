import { IsOptional, IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class SalesOrderItemDto {
  @IsOptional()
  @IsString()
  product_id?: string;

  @IsOptional()
  @IsString()
  package_id?: string;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  // Optional: the UOM being sold in (e.g. box).
  // Stock deduction will use the conversion factor to deduct base units.
  @IsOptional()
  @IsString()
  sale_uom_id?: string;
}
