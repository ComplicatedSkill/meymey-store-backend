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
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.categoriesService.create(createCategoryDto, storeId);
  }

  @Get()
  findAll(@Query('storeId') storeId?: string) {
    return this.categoriesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('storeId') storeId?: string) {
    return this.categoriesService.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.categoriesService.update(id, updateCategoryDto, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.categoriesService.remove(id, storeId);
  }
}
