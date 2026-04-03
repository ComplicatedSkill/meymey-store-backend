import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateProductUomConversionDto {
  @IsString()
  uom_id: string;

  @IsNumber()
  @Min(0.0001)
  conversion_factor: number; // how many base units = 1 of this UOM (e.g. 10 for box of 10 sheets)

  @IsNumber()
  @Min(0)
  price: number; // selling price per this UOM

  @IsOptional()
  @IsBoolean()
  is_base_uom?: boolean;

  @IsOptional()
  @IsBoolean()
  is_purchase_uom?: boolean;
}
