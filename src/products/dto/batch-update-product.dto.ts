export class BatchUpdateBrandDto {
  productIds: string[];
  brandId: string | null;
}

export class BatchUpdateCategoryDto {
  productIds: string[];
  categoryId: string | null;
}
