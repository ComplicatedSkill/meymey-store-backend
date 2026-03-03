import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorefrontService {
  constructor(private supabaseService: SupabaseService) {}

  private async resolveStoreId(identifier: string): Promise<string> {
    // Check if it's a UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) {
      return identifier;
    }

    // Attempt to resolve by username (slug)
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stores')
      .select('id')
      .eq('username', identifier)
      .single();

    if (error || !data) {
      // Fallback: Try store_name match (case-insensitive, hyphens to spaces)
      const { data: nameData, error: nameError } = await this.supabaseService
        .getAdminClient()
        .from('stores')
        .select('id')
        .ilike('store_name', identifier.replace(/-/g, ' '))
        .single();

      if (nameError || !nameData) {
        throw new NotFoundException(`Store not found: ${identifier}`);
      }
      return nameData.id;
    }
    return data.id;
  }

  async getStores() {
    try {
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('stores')
        .select('*')
        .order('store_name', { ascending: true });

      if (error) {
        console.error('getStores error:', error);
        throw error;
      }
      return data ?? [];
    } catch (e) {
      console.error('getStores catch:', e);
      throw e;
    }
  }

  async getStore(storeIdentifier: string) {
    const storeId = await this.resolveStoreId(storeIdentifier);
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();

    if (error || !data) throw new NotFoundException(`Store not found`);
    return data;
  }

  async getProducts(storeIdentifier: string) {
    const storeId = await this.resolveStoreId(storeIdentifier);
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select(
        '*, category:categories(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((product: any) => {
      const stockBatches = product.stock || [];
      const totalStock = stockBatches.reduce(
        (sum: number, b: any) => sum + (b.quantity_remaining || 0),
        0,
      );
      const variantsWithStock = product.variants?.map((v: any) => ({
        ...v,
        stock_level: stockBatches
          .filter((b: any) => b.variant_id === v.id)
          .reduce(
            (sum: number, b: any) => sum + (b.quantity_remaining || 0),
            0,
          ),
      }));
      return {
        ...product,
        stock_level: totalStock,
        variants: variantsWithStock,
        stock: undefined,
      };
    });
  }

  async getProduct(storeIdentifier: string, productId: string) {
    const storeId = await this.resolveStoreId(storeIdentifier);
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select(
        '*, category:categories(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .eq('id', productId)
      .eq('store_id', storeId)
      .single();

    if (error || !data) throw new NotFoundException(`Product not found`);

    const stockBatches = data.stock || [];
    const totalStock = stockBatches.reduce(
      (sum: number, b: any) => sum + (b.quantity_remaining || 0),
      0,
    );
    const variantsWithStock = data.variants?.map((v: any) => ({
      ...v,
      stock_level: stockBatches
        .filter((b: any) => b.variant_id === v.id)
        .reduce((sum: number, b: any) => sum + (b.quantity_remaining || 0), 0),
    }));

    return {
      ...data,
      stock_level: totalStock,
      variants: variantsWithStock,
      stock: undefined,
    };
  }

  async getCategories(storeIdentifier: string) {
    const storeId = await this.resolveStoreId(storeIdentifier);
    // Get category IDs for products in this store
    const { data: products } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select('category_id')
      .eq('store_id', storeId)
      .not('category_id', 'is', null);

    const categoryIds = [
      ...new Set((products ?? []).map((p: any) => p.category_id)),
    ];

    if (categoryIds.length === 0) return [];

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .select('*')
      .in('id', categoryIds)
      .order('name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async placeOrder(storeIdentifier: string, orderDto: any) {
    const storeId = await this.resolveStoreId(storeIdentifier);
    const { customer_name, customer_phone, notes, items } = orderDto;

    // Calculate total from items
    let total = 0;
    const orderItems: Array<{
      product_id: string;
      variant_id: string | null;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const productData = await this.getProduct(storeId, item.product_id);
      const price = item.variant_id
        ? (productData.variants?.find((v: any) => v.id === item.variant_id)
            ?.price ?? productData.price)
        : productData.price;

      total += price * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: price,
        subtotal: price * item.quantity,
      });
    }

    // Insert a sales order
    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .insert({
        store_id: storeId,
        customer_name,
        customer_phone,
        notes,
        total_amount: total,
        status: 'pending',
        source: 'storefront',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const itemsWithOrderId = orderItems.map((i) => ({
      ...i,
      order_id: order.id,
    }));
    await this.supabaseService
      .getAdminClient()
      .from('sales_order_items')
      .insert(itemsWithOrderId);

    return { order_id: order.id, total_amount: total, status: 'pending' };
  }
}
