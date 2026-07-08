import { IsString, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  tax_id?: string;

  @IsOptional()
  @IsString()
  id_card_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
