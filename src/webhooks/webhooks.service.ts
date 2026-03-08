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

    const {
      customer_name,
      customer_phone,
      customer_address,
      address,
      items,
      notes,
      source,
    } = orderData;
    const finalPhone = customer_phone || orderData.phone;
    const finalAddress = customer_address || address;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Calculate totals and prepare items
    let total = 0;
    const orderItems: any[] = [];
    const itemDetails: any[] = [];

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
        total: price * item.quantity,
      });

      itemDetails.push({
        name: product.name,
        quantity: item.quantity,
        price,
      });
    }

    // Generate Order Number similar to SalesOrdersService
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `SO-EXT-${timestamp}-${random}`;

    // Insert Sales Order
    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .insert({
        store_id: storeId,
        order_number: orderNumber,
        customer_name,
        customer_phone: finalPhone,
        customer_address: finalAddress,
        notes,
        subtotal: total,
        total_amount: total,
        tax: 0,
        discount: 0,
        status: 'PENDING',
        source: source || 'external_webhook',
        order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to insert external order:', orderError);
      throw orderError;
    }

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
          title: `New Order from ${customer_name || 'Customer'}`,
          message: `A new order has been placed by ${customer_name || 'Customer'} for ${total}`,
          data: {
            order_id: order.id,
            order_number: orderNumber,
            customer_name,
            customer_phone: finalPhone,
            customer_address: finalAddress,
            items: itemDetails,
            total_amount: total,
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
