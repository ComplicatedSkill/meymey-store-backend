import { IsString, IsOptional } from 'class-validator';

export class UpdateAuthorizationDefaultsDto {
  @IsOptional() @IsString() authorized_name?: string;
  @IsOptional() @IsString() authorized_id_no?: string;
  @IsOptional() @IsString() authorized_phone?: string;
  @IsOptional() @IsString() authorized_company?: string;
  @IsOptional() @IsString() authorized_vat?: string;
  @IsOptional() @IsString() authorized_patent_no?: string;
  @IsOptional() @IsString() authorized_commercial_id?: string;
  @IsOptional() @IsString() authorized_phone2?: string;
  @IsOptional() @IsString() customs_card_no?: string;
  @IsOptional() @IsString() customs_card_expiry?: string;
  @IsOptional() @IsString() place?: string;
}
