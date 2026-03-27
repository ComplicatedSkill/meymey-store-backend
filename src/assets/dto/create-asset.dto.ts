import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  purchase_price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_value?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsDateString()
  purchase_date: string;

  @IsOptional()
  @IsString()
  status?: string;
}
