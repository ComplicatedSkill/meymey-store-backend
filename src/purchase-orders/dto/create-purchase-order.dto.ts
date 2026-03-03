export class CreatePurchaseOrderDto {
  order_number: string;
  supplier_id?: string;
  supplier_name?: string;
  status?: 'pending' | 'approved' | 'received' | 'cancelled';
  total_amount?: number;
  order_date?: string;
  expected_date?: string;
  notes?: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }[];
}
