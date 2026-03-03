export class CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  uom_id?: string;
  price?: number;
  cost?: number;
  reorder_level?: number;
}
