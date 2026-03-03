import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { StockBatchesService } from './stock-batches.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('stock-batches')
@UseGuards(SupabaseAuthGuard)
export class StockBatchesController {
  constructor(private readonly stockBatchesService: StockBatchesService) {}

  @Post()
  create(@Body() createDto: CreateStockBatchDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.create(createDto, storeId);
  }

  @Get()
  findAll(@Request() req: any) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.findAll(storeId);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId') productId: string,
    @Query('variantId') variantId: string,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.findByProduct(
      productId,
      storeId,
      variantId,
    );
  }

  @Get('available/:productId')
  getAvailableStock(
    @Param('productId') productId: string,
    @Query('variantId') variantId: string,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.getAvailableStock(
      productId,
      storeId,
      variantId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.findOne(id, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.stockBatchesService.remove(id, storeId);
  }
}
