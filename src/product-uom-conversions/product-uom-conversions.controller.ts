import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ProductUomConversionsService } from './product-uom-conversions.service';
import { CreateProductUomConversionDto } from './dto/create-product-uom-conversion.dto';
import { UpdateProductUomConversionDto } from './dto/update-product-uom-conversion.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@UseGuards(SupabaseAuthGuard)
@Controller('products/:productId/uom-conversions')
export class ProductUomConversionsController {
  constructor(private readonly service: ProductUomConversionsService) {}

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.service.findByProduct(productId);
  }

  @Post()
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateProductUomConversionDto,
  ) {
    return this.service.create(productId, dto);
  }

  @Patch(':id')
  update(
    @Param('productId') productId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductUomConversionDto,
  ) {
    return this.service.update(id, productId, dto);
  }

  @Delete(':id')
  remove(
    @Param('productId') productId: string,
    @Param('id') id: string,
  ) {
    return this.service.remove(id, productId);
  }
}
