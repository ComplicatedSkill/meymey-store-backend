import { IsString, IsOptional, IsNumber, IsIn, Min } from 'class-validator';

export class CreateAccountsReceivableDto {
  @IsOptional() @IsString() customer_id?: string;
  @IsOptional() @IsString() sales_order_id?: string;

  @IsNumber() @Min(0) total_amount: number;

  @IsOptional() @IsString() issue_date?: string;
  @IsOptional() @IsString() due_date?: string;
  @IsOptional() @IsString() currency?: string;

  @IsOptional()
  @IsIn(['open', 'partial', 'paid', 'overdue', 'cancelled'])
  status?: string;

  @IsOptional() @IsString() notes?: string;
}
