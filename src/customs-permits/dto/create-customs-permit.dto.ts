import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateCustomsPermitDto {
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() @IsString() authorization_letter_id?: string;

  @IsOptional() @IsIn(['import', 'export']) permit_type?: string;

  // declaration & permit
  @IsOptional() @IsString() declaration_no?: string;
  @IsOptional() @IsString() declaration_date?: string;
  @IsOptional() @IsString() permit_no?: string;
  @IsOptional() @IsString() permit_date?: string;

  // goods & shipment
  @IsOptional() @IsString() goods_description?: string;
  @IsOptional() @IsString() hs_code?: string;
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsString() container_no?: string;
  @IsOptional() @IsString() transport_doc_no?: string;
  @IsOptional() @IsString() port?: string;
  @IsOptional() @IsString() country_origin?: string;
  @IsOptional() @IsNumber() gross_weight?: number;
  @IsOptional() @IsNumber() net_weight?: number;

  // duties & taxes
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() customs_duty?: number;
  @IsOptional() @IsNumber() vat?: number;
  @IsOptional() @IsNumber() special_tax?: number;
  @IsOptional() @IsNumber() other_fees?: number;

  @IsOptional() @IsString() notes?: string;
}
