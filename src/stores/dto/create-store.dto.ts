import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  store_name: string;

  @IsOptional()
  @IsString()
  store_category?: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products_sold?: string[];

  @IsOptional()
  @IsString()
  address?: string;

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
  postal_code?: string;

  @IsOptional()
  @IsString()
  secondary_phone?: string;

  @IsOptional()
  @IsString()
  whatsapp_number?: string;
}
