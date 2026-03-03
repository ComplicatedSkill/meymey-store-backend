import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateStockMovementDto, storeId: string) {
    // Note: stock_movements table does not have store_id column
    // We filter by product's store_id instead
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .insert({ ...createDto })
      .select('*, product:products(*), variant:product_variants(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId: string) {
    // Filter stock movements by products that belong to the store
    const { data: products } = await this.supabaseService
      .getClient()
      .from('products')
      .select('id')
      .eq('store_id', storeId);

    const productIds = products?.map((p) => p.id) || [];

    if (productIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .select('*, product:products(*), variant:product_variants(*)')
      .in('product_id', productIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByProduct(productId: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('id', id)
      .single();

    if (error)
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateStockMovementDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .update(updateDto)
      .eq('id', id)
      .select('*, product:products(*), variant:product_variants(*)')
      .single();

    if (error)
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    return data;
  }

  async remove(id: string, storeId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('stock_movements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Stock movement deleted successfully' };
  }

  async getStockLevel(productId: string, storeId: string, variantId?: string) {
    let query = this.supabaseService
      .getClient()
      .from('stock_movements')
      .select('quantity, type')
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stockLevel = data.reduce((total, movement) => {
      if (movement.type === 'in') return total + movement.quantity;
      if (movement.type === 'out') return total - movement.quantity;
      return total + movement.quantity; // adjustment
    }, 0);

    return {
      product_id: productId,
      variant_id: variantId,
      stock_level: stockLevel,
    };
  }
}
