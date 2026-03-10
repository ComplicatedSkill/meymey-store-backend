export class PackageItemDto {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export class CreateProductPackageDto {
  name: string;
  sku: string;
  description?: string;
  image_url?: string;
  price?: number;
  is_active?: boolean;
  items: PackageItemDto[];
}
