import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WebhooksService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
  ) {}

  async handleExternalOrder(orderData: any) {
    const { data: store, error: sError } = await this.supabaseService
      .getAdminClient()
      .from('stores')
      .select('id')
      .limit(1)
      .single();

    if (sError || !store) {
      throw new BadRequestException('No store found');
    }
    const storeId = store.id;

    const { customer_name, customer_phone, items, notes, source } = orderData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Calculate totals and prepare items
    let total = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      // Find product price
      const { data: product, error: pError } = await this.supabaseService
        .getAdminClient()
        .from('products')
        .select('price, name')
        .eq('id', item.product_id)
        .single();

      if (pError || !product) {
        throw new BadRequestException(`Product ${item.product_id} not found`);
      }

      const price = item.unit_price || product.price || 0;
      total += price * item.quantity;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: price,
        subtotal: price * item.quantity,
      });
    }

    // Insert Sales Order
    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .insert({
        store_id: storeId,
        customer_name,
        customer_phone,
        notes,
        total_amount: total,
        status: 'PENDING',
        source: source || 'external_webhook',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert Items
    const itemsWithOrderId = orderItems.map((i: any) => ({
      ...i,
      sales_order_id: order.id,
    }));

    const { error: itemsError } = await this.supabaseService
      .getAdminClient()
      .from('sales_order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error('Failed to insert items for external order:', itemsError);
    }

    // Trigger Notifications
    try {
      await this.notificationsService.create(
        {
          type: 'new_order',
          title: 'New External Order',
          message: `A new order (${source || 'External'}) has been placed by ${customer_name || 'Customer'} for ${total}`,
          data: {
            order_id: order.id,
            source: source || 'external_webhook',
          },
        },
        storeId,
      );
    } catch (e) {
      console.error('Failed to trigger notification for external order:', e);
    }

    return { success: true, order_id: order.id };
  }
}
