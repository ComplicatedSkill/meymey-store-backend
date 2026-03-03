import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  StockAdjustmentsService,
  CreateStockAdjustmentDto,
} from './stock-adjustments.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('stock-adjustments')
@UseGuards(SupabaseAuthGuard)
export class StockAdjustmentsController {
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStockAdjustmentDto, @Request() req: any) {
    createDto.adjusted_by = req.user?.userId;
    return this.stockAdjustmentsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.stockAdjustmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockAdjustmentsService.findOne(id);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.stockAdjustmentsService.findByProduct(productId);
  }
}
