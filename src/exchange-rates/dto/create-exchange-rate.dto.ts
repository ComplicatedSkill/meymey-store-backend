import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  from_currency: string;

  @IsString()
  to_currency: string;

  @IsNumber()
  @IsPositive()
  rate: number;

  @IsOptional()
  @IsString()
  effective_date?: string;
}
