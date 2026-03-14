import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsIn(['low_stock', 'order_status', 'payment_received', 'system', 'new_order'])
  type: 'low_stock' | 'order_status' | 'payment_received' | 'system' | 'new_order';

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  user_id?: string;
}
