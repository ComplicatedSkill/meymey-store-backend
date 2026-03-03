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
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('stock-movements')
@UseGuards(SupabaseAuthGuard)
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  @Post()
  create(@Body() createDto: CreateStockMovementDto, @Request() req: any) {
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

  @Get('stock-level/:productId')
  getStockLevel(
    @Param('productId') productId: string,
    @Request() req: any,
    @Query('variant_id') variantId?: string,
  ) {
    const storeId = req.user.store?.id;
    return this.service.getStockLevel(productId, storeId, variantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.service.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStockMovementDto,
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
