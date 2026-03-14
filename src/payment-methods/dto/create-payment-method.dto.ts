import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsIn(['cash', 'bank_transfer', 'credit_card', 'mobile_payment', 'other'])
  type: 'cash' | 'bank_transfer' | 'credit_card' | 'mobile_payment' | 'other';

  @IsOptional()
  @IsString()
  account_details?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
