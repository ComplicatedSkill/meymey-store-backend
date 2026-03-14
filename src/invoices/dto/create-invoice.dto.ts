import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  sales_order_id?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  due_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
