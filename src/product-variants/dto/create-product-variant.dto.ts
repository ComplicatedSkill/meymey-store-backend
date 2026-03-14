import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProductVariantDto {
  @IsString()
  product_id: string;

  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  attributes?: Record<string, any>;
}
