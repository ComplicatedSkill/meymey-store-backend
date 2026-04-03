import { PartialType } from '@nestjs/mapped-types';
import { CreateProductUomConversionDto } from './create-product-uom-conversion.dto';

export class UpdateProductUomConversionDto extends PartialType(CreateProductUomConversionDto) {}
