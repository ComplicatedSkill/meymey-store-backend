import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { StockBatchesService } from '../stock-batches/stock-batches.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

export { CreateStockAdjustmentDto };

@Injectable()
export class StockAdjustmentsService {
  constructor(
    private supabaseService: SupabaseService,
    private stockBatchesService: StockBatchesService,
  ) {}

  async create(createDto: CreateStockAdjustmentDto) {
    const { store_id, ...adjustmentData } = createDto;

    const { data: adjustment, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_adjustments')
      .insert({ ...adjustmentData })
      .select()
      .single();

    if (error) throw error;

    try {
      if (createDto.adjustment_type === 'increase') {
        await this.stockBatchesService.returnStock(
          createDto.product_id,
          createDto.variant_id || null,
          createDto.quantity,
          store_id || '',
        );
      } else if (createDto.adjustment_type === 'decrease') {
        await this.stockBatchesService.allocateFIFO(
          createDto.product_id,
          createDto.variant_id || null,
          createDto.quantity,
          store_id || '',
        );
      }
    } catch (stockError) {
      console.error('Failed to update stock for adjustment:', stockError);
      throw stockError;
    }

    return adjustment;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_adjustments')
      .select('*, products(name, sku)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_adjustments')
      .select('*, products(name, sku)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findByProduct(productId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_adjustments')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
