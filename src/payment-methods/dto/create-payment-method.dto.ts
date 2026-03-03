export class CreatePaymentMethodDto {
  name: string;
  type: 'cash' | 'bank_transfer' | 'credit_card' | 'mobile_payment' | 'other';
  account_details?: string;
  is_active?: boolean;
  is_default?: boolean;
}
