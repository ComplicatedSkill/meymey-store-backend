import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStockBatchDto } from './dto/create-stock-batch.dto';

export interface FIFOAllocation {
  batch_id: string;
  quantity: number;
  unit_cost: number;
}

@Injectable()
export class StockBatchesService {
  constructor(private supabaseService: SupabaseService) {}

  private generateBatchNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `BATCH-${timestamp}-${random}`;
  }

  async create(createDto: CreateStockBatchDto, storeId: string) {
    // Note: stock_batches table does not have store_id column
    const batchData = {
      ...createDto,
      batch_number: createDto.batch_number || this.generateBatchNumber(),
      quantity_remaining: createDto.quantity_received,
    };

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .insert(batchData)
      .select('*, product:products(*), variant:product_variants(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId: string) {
    // stock_batches doesn't have store_id - return all
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select(
        '*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(order_number)',
      )
      .order('received_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByProduct(productId: string, storeId: string, variantId?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('product_id', productId)
      .gt('quantity_remaining', 0)
      .order('received_date', { ascending: true }); // FIFO: oldest first

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('id', id)
      .single();

    if (error)
      throw new NotFoundException(`Stock batch with ID ${id} not found`);
    return data;
  }

  async getAvailableStock(
    productId: string,
    storeId: string,
    variantId?: string,
  ) {
    let query = this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select('quantity_remaining')
      .eq('product_id', productId)
      .gt('quantity_remaining', 0);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalAvailable = data.reduce(
      (sum, batch) => sum + batch.quantity_remaining,
      0,
    );

    return {
      product_id: productId,
      variant_id: variantId,
      available_stock: totalAvailable,
    };
  }

  /**
   * FIFO Allocation: Deduct quantity from oldest batches first
   * Returns allocation details for cost tracking
   */
  async allocateFIFO(
    productId: string,
    variantId: string | null,
    quantity: number,
    storeId: string,
  ): Promise<FIFOAllocation[]> {
    // Get batches ordered by received_date (oldest first - FIFO)
    const batches = await this.findByProduct(
      productId,
      storeId,
      variantId || undefined,
    );

    let remaining = quantity;
    const allocations: FIFOAllocation[] = [];

    for (const batch of batches) {
      if (remaining <= 0) break;

      const allocateQty = Math.min(batch.quantity_remaining, remaining);

      allocations.push({
        batch_id: batch.id,
        quantity: allocateQty,
        unit_cost: Number(batch.unit_cost),
      });

      // Update batch remaining quantity
      const newRemaining = batch.quantity_remaining - allocateQty;
      await this.supabaseService
        .getAdminClient()
        .from('stock_batches')
        .update({ quantity_remaining: newRemaining })
        .eq('id', batch.id);

      remaining -= allocateQty;
    }

    if (remaining > 0) {
      throw new BadRequestException(
        `Insufficient stock. Requested: ${quantity}, Available: ${quantity - remaining}`,
      );
    }

    return allocations;
  }

  /**
   * Add stock back to batches (for returns/cancellations)
   * Uses LIFO for returns (add back to most recent batches first)
   */
  async returnStock(
    productId: string,
    variantId: string | null,
    quantity: number,
    storeId: string,
    unitCost?: number,
  ) {
    if (unitCost !== undefined) {
      // Create a new batch for the returned stock
      return this.create(
        {
          product_id: productId,
          variant_id: variantId || undefined,
          quantity_received: quantity,
          unit_cost: unitCost,
        },
        storeId,
      );
    }

    // Or add back to the most recent batch
    const { data: latestBatch } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select('*')
      .eq('product_id', productId)
      .order('received_date', { ascending: false })
      .limit(1)
      .single();

    if (latestBatch) {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('stock_batches')
        .update({
          quantity_remaining: latestBatch.quantity_remaining + quantity,
        })
        .eq('id', latestBatch.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    throw new BadRequestException('No batch found to return stock to');
  }

  async remove(id: string, storeId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Stock batch deleted successfully' };
  }
}
