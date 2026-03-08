import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderItemDto } from './dto/sales-order-item.dto';

@Injectable()
export class SalesOrdersService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SO-${timestamp}-${random}`;
  }

  private calculateItemTotal(item: SalesOrderItemDto): number {
    const subtotal = item.quantity * item.unit_price;
    const discount = item.discount || 0;
    return subtotal - discount;
  }

  private calculateOrderTotals(
    items: SalesOrderItemDto[],
    tax: number = 0,
    discount: number = 0,
  ) {
    const subtotal = items.reduce(
      (sum, item) => sum + this.calculateItemTotal(item),
      0,
    );
    return { subtotal, totalAmount: subtotal + tax - discount };
  }

  async create(createDto: CreateSalesOrderDto, storeId?: string) {
    const { items, ...orderData } = createDto;
    if (!items || items.length === 0)
      throw new BadRequestException('Sales order must have at least one item');

    for (const item of items) {
      await this.checkStockAvailability(
        item.product_id,
        item.variant_id ?? null,
        item.quantity,
      );
    }

    const { subtotal, totalAmount } = this.calculateOrderTotals(
      items,
      createDto.tax || 0,
      createDto.discount || 0,
    );

    const payload: any = {
      ...orderData,
      order_number: this.generateOrderNumber(),
      order_date: createDto.order_date || new Date().toISOString(),
      subtotal,
      total_amount: totalAmount,
      status: createDto.status || 'DRAFT',
    };
    if (storeId) payload.store_id = storeId;

    const { data: order, error: orderError } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .insert(payload)
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      sales_order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0,
      total: this.calculateItemTotal(item),
    }));
    const { error: itemsError } = await this.supabaseService
      .getClient()
      .from('sales_order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;

    if (createDto.status?.toLowerCase() === 'completed') {
      await this.deductStock(order.id);
    }

    return this.findOne(order.id);
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .select(
        '*, customer:customers(*), items:sales_order_items(*, product:products(*), variant:product_variants(*))',
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .select(
        '*, customer:customers(*), items:sales_order_items(*, product:products(*), variant:product_variants(*))',
      )
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateSalesOrderDto) {
    const { items, ...orderData } = updateDto;
    let updateData: any = {
      ...orderData,
      updated_at: new Date().toISOString(),
      order_date: updateDto.order_date || undefined,
    };

    if (items && items.length > 0) {
      const { subtotal, totalAmount } = this.calculateOrderTotals(
        items,
        updateDto.tax || 0,
        updateDto.discount || 0,
      );
      updateData = { ...updateData, subtotal, total_amount: totalAmount };
      await this.supabaseService
        .getClient()
        .from('sales_order_items')
        .delete()
        .eq('sales_order_id', id);
      const orderItems = items.map((item) => ({
        sales_order_id: id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        total: this.calculateItemTotal(item),
      }));
      await this.supabaseService
        .getClient()
        .from('sales_order_items')
        .insert(orderItems);
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Sales order with ID ${id} not found`);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = [
      'draft',
      'confirmed',
      'processing',
      'completed',
      'cancelled',
    ];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }
    if (status.toLowerCase() === 'completed') {
      await this.deductStock(id);
    }
    const { data, error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .update({
        status: status.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Sales order with ID ${id} not found`);

    // Trigger status update notification
    try {
      const { data: order } = await this.supabaseService
        .getClient()
        .from('sales_orders')
        .select('order_number, store_id')
        .eq('id', id)
        .single();

      if (order) {
        await this.notificationsService.createOrderStatusNotification(
          order.store_id,
          id,
          order.order_number,
          'Previous',
          status,
        );
      }
    } catch (e) {
      console.error('Failed to trigger status notification:', e);
    }

    return data;
  }

  private async deductStock(orderId: string) {
    const { data: items, error } = await this.supabaseService
      .getClient()
      .from('sales_order_items')
      .select('*, sales_order:sales_orders!inner(order_number)')
      .eq('sales_order_id', orderId);
    if (error) throw error;

    for (const item of items) {
      await this.allocateFIFO(
        item.id,
        item.product_id,
        item.variant_id ?? null,
        item.quantity,
        item.sales_order.order_number,
      );
    }

    const stockMovements = items.map((item: any) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      type: 'out',
      reference: `Sales Order: ${item.sales_order.order_number}`,
      notes: `Stock deducted for sales order (FIFO)`,
    }));
    if (stockMovements.length > 0) {
      await this.supabaseService
        .getClient()
        .from('stock_movements')
        .insert(stockMovements);
    }
  }

  private async allocateFIFO(
    salesOrderItemId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    orderNumber: string,
  ) {
    let query = this.supabaseService
      .getClient()
      .from('stock_batches')
      .select('*')
      .eq('product_id', productId)
      .gt('quantity_remaining', 0)
      .order('received_date', { ascending: true });
    if (variantId) query = query.eq('variant_id', variantId);
    const { data: batches, error } = await query;
    if (error) throw error;

    let remaining = quantity;
    for (const batch of batches || []) {
      if (remaining <= 0) break;
      const allocateQty = Math.min(batch.quantity_remaining, remaining);
      await this.supabaseService
        .getClient()
        .from('stock_batches')
        .update({ quantity_remaining: batch.quantity_remaining - allocateQty })
        .eq('id', batch.id);
      remaining -= allocateQty;
      await this.supabaseService
        .getClient()
        .from('sales_order_item_costs')
        .insert({
          sales_order_item_id: salesOrderItemId,
          batch_id: batch.id,
          quantity: allocateQty,
          unit_cost: batch.unit_cost,
        });
    }
    if (remaining > 0) {
      throw new BadRequestException(
        `Insufficient stock for order ${orderNumber}. Requested: ${quantity}, Available: ${quantity - remaining}`,
      );
    }
  }

  private async checkStockAvailability(
    productId: string,
    variantId: string | null,
    requestedQuantity: number,
  ) {
    let query = this.supabaseService
      .getClient()
      .from('stock_batches')
      .select('quantity_remaining')
      .eq('product_id', productId)
      .gt('quantity_remaining', 0);
    if (variantId) query = query.eq('variant_id', variantId);
    const { data: batches, error } = await query;
    if (error) throw error;

    const totalAvailable =
      batches?.reduce((sum, b) => sum + (b.quantity_remaining || 0), 0) || 0;
    if (totalAvailable < requestedQuantity) {
      const { data: product } = await this.supabaseService
        .getClient()
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();
      throw new BadRequestException(
        `Insufficient stock for "${product?.name || 'Product'}". Available: ${totalAvailable}, Requested: ${requestedQuantity}`,
      );
    }
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'DRAFT')
      throw new BadRequestException('Only draft orders can be deleted');
    const { error } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Sales order deleted successfully' };
  }
}
