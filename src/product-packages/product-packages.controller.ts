import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductPackagesService } from './product-packages.service';
import { CreateProductPackageDto } from './dto/create-product-package.dto';
import { UpdateProductPackageDto } from './dto/update-product-package.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('product-packages')
export class ProductPackagesController {
  constructor(
    private readonly productPackagesService: ProductPackagesService,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Body() createDto: CreateProductPackageDto, @Request() req: any) {
    const storeId = req.user?.store?.id;
    return this.productPackagesService.create(createDto, storeId);
  }

  @Get()
  findAll() {
    return this.productPackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productPackagesService.findOne(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProductPackageDto) {
    return this.productPackagesService.update(id, updateDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPackagesService.remove(id);
  }
}
