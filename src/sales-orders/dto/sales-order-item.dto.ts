export class SalesOrderItemDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
}
