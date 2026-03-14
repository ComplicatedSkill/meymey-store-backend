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
import { ProductPackagesService } from '../product-packages/product-packages.service';

@Injectable()
export class SalesOrdersService {
  constructor(
    private supabaseService: SupabaseService,
    private notificationsService: NotificationsService,
    private productPackagesService: ProductPackagesService,
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

    const willBeCompleted =
      (createDto.status || 'DRAFT').toUpperCase() === 'COMPLETED';

    if (willBeCompleted) {
      for (const item of items) {
        if (item.package_id) {
          await this.checkPackageStockAvailability(
            item.package_id,
            item.quantity,
          );
        } else {
          await this.checkStockAvailability(
            item.product_id!,
            item.variant_id ?? null,
            item.quantity,
          );
        }
      }
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
      .getAdminClient()
      .from('sales_orders')
      .insert(payload)
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      sales_order_id: order.id,
      product_id: item.product_id || null,
      package_id: item.package_id || null,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0,
      total: this.calculateItemTotal(item),
    }));
    const { error: itemsError } = await this.supabaseService
      .getAdminClient()
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
      .getAdminClient()
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
      .getAdminClient()
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
    const existingOrder = await this.findOne(id);
    const wasCompleted = existingOrder.status?.toUpperCase() === 'COMPLETED';
    const { items, ...orderData } = updateDto;
    const finalStatus =
      updateDto.status?.toUpperCase() ?? existingOrder.status?.toUpperCase();
    const itemsChanged = !!(items && items.length > 0);

    // Only restore stock if something that affects stock actually changed:
    // - items were replaced (removed items must return stock)
    // - OR status is moving away from COMPLETED (order cancelled/reverted)
    const shouldRestoreStock =
      wasCompleted && (itemsChanged || finalStatus !== 'COMPLETED');

    // Only deduct stock if the order will be COMPLETED and stock hasn't been
    // deducted yet for the current set of items:
    // - was not completed before (first time completing)
    // - OR items changed (old stock restored above, new items need deduction)
    const shouldDeductStock =
      finalStatus === 'COMPLETED' && (!wasCompleted || itemsChanged);

    // Step 1: Restore stock for old items when needed
    if (shouldRestoreStock) {
      await this.restoreStock(id);
    }

    let updateData: any = {
      ...orderData,
      updated_at: new Date().toISOString(),
      order_date: updateDto.order_date || undefined,
    };

    // Step 2: Replace items if provided
    if (itemsChanged) {
      // Validate stock for new items only when the order will be COMPLETED
      if (shouldDeductStock) {
        for (const item of items!) {
          if (item.package_id) {
            await this.checkPackageStockAvailability(
              item.package_id,
              item.quantity,
            );
          } else {
            await this.checkStockAvailability(
              item.product_id!,
              item.variant_id ?? null,
              item.quantity,
            );
          }
        }
      }

      const { subtotal, totalAmount } = this.calculateOrderTotals(
        items!,
        updateDto.tax ?? existingOrder.tax ?? 0,
        updateDto.discount ?? existingOrder.discount ?? 0,
      );
      updateData = { ...updateData, subtotal, total_amount: totalAmount };

      // Delete old items and re-insert new ones
      await this.supabaseService
        .getAdminClient()
        .from('sales_order_items')
        .delete()
        .eq('sales_order_id', id);

      const orderItems = items!.map((item) => ({
        sales_order_id: id,
        product_id: item.product_id || null,
        package_id: item.package_id || null,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        total: this.calculateItemTotal(item),
      }));
      const { error: itemsError } = await this.supabaseService
        .getAdminClient()
        .from('sales_order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // Step 3: Persist the order-level changes
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Sales order with ID ${id} not found`);

    // Step 4: Deduct stock for the new items when needed
    if (shouldDeductStock) {
      await this.deductStock(id);
    }

    return this.findOne(id);
  }

  /**
   * Restore stock back to the original stock batches by reversing the
   * FIFO allocations recorded in sales_order_item_costs.
   */
  private async restoreStock(orderId: string) {
    // Gather all cost-allocation records for this order's items
    const { data: orderItems, error: itemsError } = await this.supabaseService
      .getAdminClient()
      .from('sales_order_items')
      .select('id')
      .eq('sales_order_id', orderId);
    if (itemsError) throw itemsError;

    if (!orderItems || orderItems.length === 0) return;

    const itemIds = orderItems.map((i) => i.id);
    const { data: costs, error: costsError } = await this.supabaseService
      .getAdminClient()
      .from('sales_order_item_costs')
      .select('batch_id, quantity')
      .in('sales_order_item_id', itemIds);
    if (costsError) throw costsError;

    // Return each allocated quantity back to its batch
    for (const cost of costs || []) {
      const { data: batch, error: batchError } = await this.supabaseService
        .getAdminClient()
        .from('stock_batches')
        .select('quantity_remaining')
        .eq('id', cost.batch_id)
        .single();
      if (batchError) continue; // batch may have been deleted; skip gracefully

      await this.supabaseService
        .getAdminClient()
        .from('stock_batches')
        .update({
          quantity_remaining: batch.quantity_remaining + cost.quantity,
        })
        .eq('id', cost.batch_id);
    }

    // Remove the old cost-allocation records so they can be re-created fresh
    if (itemIds.length > 0) {
      await this.supabaseService
        .getAdminClient()
        .from('sales_order_item_costs')
        .delete()
        .in('sales_order_item_id', itemIds);
    }
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

    const existingOrder = await this.findOne(id);
    const wasCompleted = existingOrder.status?.toUpperCase() === 'COMPLETED';
    const willBeCompleted = status.toLowerCase() === 'completed';

    if (wasCompleted && !willBeCompleted) {
      // Moving away from COMPLETED (e.g. → CANCELLED): return all stock
      await this.restoreStock(id);
    } else if (!wasCompleted && willBeCompleted) {
      // Moving to COMPLETED for the first time: deduct stock
      await this.deductStock(id);
    }
    // wasCompleted && willBeCompleted → already deducted, no-op
    // !wasCompleted && !willBeCompleted → never deducted, no-op

    const { data, error } = await this.supabaseService
      .getAdminClient()
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
      await this.notificationsService.createOrderStatusNotification(
        existingOrder.store_id,
        id,
        existingOrder.order_number,
        existingOrder.status,
        status,
      );
    } catch (e) {
      console.error('Failed to trigger status notification:', e);
    }

    return data;
  }

  private async deductStock(orderId: string) {
    const { data: items, error } = await this.supabaseService
      .getAdminClient()
      .from('sales_order_items')
      .select('*, sales_order:sales_orders!inner(order_number)')
      .eq('sales_order_id', orderId);
    if (error) throw error;

    for (const item of items) {
      if (item.package_id) {
        const packageItems = await this.productPackagesService.getPackageItems(
          item.package_id,
        );
        for (const pItem of packageItems) {
          await this.allocateFIFO(
            item.id,
            pItem.product_id,
            null, // allocate from any batch (same logic as stock check)
            pItem.quantity * item.quantity,
            item.sales_order.order_number,
          );
        }
      } else {
        await this.allocateFIFO(
          item.id,
          item.product_id,
          item.variant_id ?? null,
          item.quantity,
          item.sales_order.order_number,
        );
      }
    }

    const stockMovements: any[] = [];
    for (const item of items) {
      if (item.package_id) {
        const packageItems = await this.productPackagesService.getPackageItems(
          item.package_id,
        );
        for (const pItem of packageItems) {
          stockMovements.push({
            product_id: pItem.product_id,
            variant_id: pItem.variant_id,
            quantity: pItem.quantity * item.quantity,
            type: 'out',
            reference: `Sales Order: ${item.sales_order.order_number} (Package)`,
            notes: `Stock deducted for package item (FIFO)`,
          });
        }
      } else {
        stockMovements.push({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          type: 'out',
          reference: `Sales Order: ${item.sales_order.order_number}`,
          notes: `Stock deducted for sales order (FIFO)`,
        });
      }
    }
    if (stockMovements.length > 0) {
      await this.supabaseService
        .getAdminClient()
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
      .getAdminClient()
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
        .getAdminClient()
        .from('stock_batches')
        .update({ quantity_remaining: batch.quantity_remaining - allocateQty })
        .eq('id', batch.id);
      remaining -= allocateQty;
      await this.supabaseService
        .getAdminClient()
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
      .getAdminClient()
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
        .getAdminClient()
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();
      throw new BadRequestException(
        `Insufficient stock for "${product?.name || 'Product'}". Available: ${totalAvailable}, Requested: ${requestedQuantity}`,
      );
    }
  }

  private async checkPackageStockAvailability(
    packageId: string,
    requestedQuantity: number,
  ) {
    const packageItems =
      await this.productPackagesService.getPackageItems(packageId);
    for (const pItem of packageItems) {
      // Check total product stock without variant filter.
      // Package stock is tracked at the product level (matching how stock_level
      // is computed in attachStockLevel), so we ignore variant_id here.
      await this.checkStockAvailability(
        pItem.product_id,
        null,
        pItem.quantity * requestedQuantity,
      );
    }
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    if (order.status !== 'DRAFT')
      throw new BadRequestException('Only draft orders can be deleted');
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Sales order deleted successfully' };
  }
}
