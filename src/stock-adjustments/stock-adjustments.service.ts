import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { StockBatchesService } from '../stock-batches/stock-batches.service';

export class CreateStockAdjustmentDto {
  product_id: string;
  variant_id?: string;
  adjustment_type: 'increase' | 'decrease' | 'correction';
  quantity: number;
  reason?: string;
  adjusted_by?: string;
  store_id?: string;
}

@Injectable()
export class StockAdjustmentsService {
  constructor(
    private supabaseService: SupabaseService,
    private stockBatchesService: StockBatchesService,
  ) {}

  async create(createDto: CreateStockAdjustmentDto) {
    const { store_id, ...adjustmentData } = createDto;
    const storeIdToUse = store_id;

    // 1. Create the adjustment record
    const { data: adjustment, error } = await this.supabaseService
      .getClient()
      .from('stock_adjustments')
      .insert({ ...adjustmentData })
      .select()
      .single();

    if (error) throw error;

    // 2. Update the actual stock in batches
    try {
      if (createDto.adjustment_type === 'increase') {
        await this.stockBatchesService.returnStock(
          createDto.product_id,
          createDto.variant_id || null,
          createDto.quantity,
          storeIdToUse || '',
        );
      } else if (createDto.adjustment_type === 'decrease') {
        await this.stockBatchesService.allocateFIFO(
          createDto.product_id,
          createDto.variant_id || null,
          createDto.quantity,
          storeIdToUse || '',
        );
      }
      // Note: 'correction' can be handled here if needed by calculating difference
    } catch (stockError) {
      // If stock update fails, we might want to handle it (e.g., delete the adjustment record or just log the error)
      console.error('Failed to update stock for adjustment:', stockError);
      // For now, let's keep the adjustment record but surface the error
      throw stockError;
    }

    return adjustment;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_adjustments')
      .select('*, products(name, sku)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_adjustments')
      .select('*, products(name, sku)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findByProduct(productId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_adjustments')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
