export class CreateNotificationDto {
  type: 'low_stock' | 'order_status' | 'payment_received' | 'system';
  title: string;
  message?: string;
  data?: Record<string, any>;
  user_id?: string;
}
