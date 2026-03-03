import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateStockAdjustmentDto {
  product_id: string;
  adjustment_type: 'increase' | 'decrease' | 'correction';
  quantity: number;
  reason?: string;
  adjusted_by?: string;
}

@Injectable()
export class StockAdjustmentsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateStockAdjustmentDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_adjustments')
      .insert({ ...createDto })
      .select()
      .single();
    if (error) throw error;
    return data;
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
