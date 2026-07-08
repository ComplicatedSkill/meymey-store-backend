import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class RecordArPaymentDto {
  @IsNumber() @Min(0) amount: number;

  @IsOptional() @IsString() payment_method_id?: string;
  @IsOptional() @IsString() payment_date?: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() notes?: string;
}
