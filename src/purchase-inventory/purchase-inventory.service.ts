import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePurchaseInventoryDto } from './dto/create-purchase-inventory.dto';
import { UpdatePurchaseInventoryDto } from './dto/update-purchase-inventory.dto';

@Injectable()
export class PurchaseInventoryService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreatePurchaseInventoryDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .insert(createDto)
      .select(
        '*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)',
      )
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .select(
        '*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)',
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByPurchaseOrder(purchaseOrderId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .select('*, product:products(*), variant:product_variants(*)')
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .select(
        '*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)',
      )
      .eq('id', id)
      .single();

    if (error)
      throw new NotFoundException(
        `Purchase inventory item with ID ${id} not found`,
      );
    return data;
  }

  async update(id: string, updateDto: UpdatePurchaseInventoryDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .update(updateDto)
      .eq('id', id)
      .select(
        '*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)',
      )
      .single();

    if (error)
      throw new NotFoundException(
        `Purchase inventory item with ID ${id} not found`,
      );
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Purchase inventory item deleted successfully' };
  }
}
