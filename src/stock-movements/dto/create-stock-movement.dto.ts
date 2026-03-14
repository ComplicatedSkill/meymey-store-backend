import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateStockMovementDto {
  @IsString()
  product_id: string;

  @IsOptional()
  @IsString()
  variant_id?: string;

  @IsNumber()
  quantity: number;

  @IsIn(['in', 'out', 'adjustment'])
  type: 'in' | 'out' | 'adjustment';

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
