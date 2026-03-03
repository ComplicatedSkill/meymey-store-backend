import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('product-variants')
@UseGuards(SupabaseAuthGuard)
export class ProductVariantsController {
  constructor(private readonly service: ProductVariantsService) {}

  @Post()
  create(@Body() createDto: CreateProductVariantDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.service.create(createDto, storeId);
  }

  @Get()
  findAll(@Request() req: any, @Query('product_id') productId?: string) {
    const storeId = req.user.store?.id;
    if (productId) {
      return this.service.findByProduct(productId, storeId);
    }
    return this.service.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.service.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductVariantDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.service.update(id, updateDto, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.service.remove(id, storeId);
  }
}
