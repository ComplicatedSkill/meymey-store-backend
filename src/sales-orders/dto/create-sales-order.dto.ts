import { SalesOrderItemDto } from './sales-order-item.dto';

export class CreateSalesOrderDto {
  customer_id?: string;
  items: SalesOrderItemDto[];
  tax?: number;
  discount?: number;
  notes?: string;
  order_date?: string;
  status?: string;
}
