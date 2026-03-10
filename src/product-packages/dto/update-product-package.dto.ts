import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPackageDto } from './create-product-package.dto';

export class UpdateProductPackageDto extends PartialType(
  CreateProductPackageDto,
) {}
