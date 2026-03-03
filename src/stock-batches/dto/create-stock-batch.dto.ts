export class CreateStockBatchDto {
  product_id: string;
  variant_id?: string;
  batch_number?: string;
  quantity_received: number;
  unit_cost: number;
  purchase_order_id?: string;
  received_date?: string;
  expiry_date?: string;
}
