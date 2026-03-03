export class CreatePurchaseInventoryDto {
  purchase_order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  received_quantity?: number;
}
