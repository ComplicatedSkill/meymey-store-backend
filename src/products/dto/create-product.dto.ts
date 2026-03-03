export class CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  image_url?: string;
  image_urls?: string[];
  category_id?: string;
  uom_id?: string;
  price?: number;
  cost?: number;
  reorder_level?: number;
}
