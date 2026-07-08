import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';

export class CreateAuthorizationLetterDto {
  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsInt()
  template_version?: number;

  @IsOptional()
  @IsIn(['inside', 'outside'])
  resident_type?: string;

  @IsOptional()
  @IsString()
  letter_no?: string;

  // authorizer (client)
  @IsOptional() @IsString() authorizer_name?: string;
  @IsOptional() @IsString() authorizer_id_no?: string;
  @IsOptional() @IsIn(['chairman', 'board_member', 'other']) authorizer_role?: string;
  @IsOptional() @IsString() authorizer_role_other?: string;
  @IsOptional() @IsString() authorizer_company?: string;
  @IsOptional() @IsString() authorizer_vat?: string;
  @IsOptional() @IsString() authorizer_phone?: string;

  // authorized (broker)
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

  // scope / purpose
  @IsOptional() @IsIn(['documents', 'one_time']) scope_type?: string;
  @IsOptional() @IsString() invoice_no?: string;
  @IsOptional() @IsString() invoice_date?: string;
  @IsOptional() @IsString() packing_list_no?: string;
  @IsOptional() @IsString() packing_list_date?: string;
  @IsOptional() @IsString() transport_doc_no?: string;
  @IsOptional() @IsString() transport_doc_date?: string;
  @IsOptional() @IsString() other_docs?: string;
  @IsOptional() @IsString() onetime_valid_until?: string;
  @IsOptional() @IsString() contract_date?: string;

  // meta
  @IsOptional() @IsString() place?: string;
  @IsOptional() @IsString() letter_date?: string;
}
