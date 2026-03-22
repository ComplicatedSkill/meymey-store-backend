import { IsArray, IsString, IsOptional } from 'class-validator';

export class BatchUpdateBrandDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsOptional()
  brandId: string | null;
}

export class BatchUpdateCategoryDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[] | null;
}
