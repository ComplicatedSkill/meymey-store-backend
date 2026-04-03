import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProductUomConversionsService } from '../product-uom-conversions/product-uom-conversions.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(
    private supabaseService: SupabaseService,
    private uomConversionsService: ProductUomConversionsService,
  ) {}

  async create(createDto: CreatePurchaseOrderDto) {
    const { items, ...orderData } = createDto;
    if (!orderData.status) orderData.status = 'pending';

    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .insert(orderData)
      .select()
      .single();
    if (orderError) {
      this.logger.error('Create purchase order error', { code: orderError.code, message: orderError.message, details: orderError.details });
      throw new InternalServerErrorException(orderError.message);
    }

    if (items && items.length > 0) {
      const inventoryItems = items.map((item) => ({
        ...item,
        purchase_order_id: order.id,
      }));
      const { error: itemError } = await this.supabaseService
        .getAdminClient()
        .from('purchase_inventory')
        .insert(inventoryItems);
      if (itemError) console.error('Error creating PO items:', itemError);
    }

    return order;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .select(
        '*, supplier:suppliers(*), items:purchase_inventory(*, product:products(id, name, sku, price, cost, image_url, category_id), variant:product_variants(*))',
      )
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .select(
        '*, supplier:suppliers(*), items:purchase_inventory(*, product:products(id, name, sku, price, cost, image_url, category_id), variant:product_variants(*))',
      )
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    const { items, ...orderFields } = updateDto;

    // Replace items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await this.supabaseService
        .getAdminClient()
        .from('purchase_inventory')
        .delete()
        .eq('purchase_order_id', id);

      // Insert new items
      const newItems = items.map((item) => ({
        ...item,
        purchase_order_id: id,
      }));
      const { error: itemError } = await this.supabaseService
        .getAdminClient()
        .from('purchase_inventory')
        .insert(newItems);
      if (itemError) throw itemError;

      // Recalculate total
      if (!orderFields.total_amount) {
        orderFields.total_amount = items.reduce(
          (sum, i) => sum + i.quantity * i.unit_price,
          0,
        );
      }

      // Cascade cost update: update stock_batches and sales_order_item_costs
      // so the profit report reflects the corrected unit cost.
      for (const item of items) {
        const { data: batches } = await this.supabaseService
          .getAdminClient()
          .from('stock_batches')
          .select('id')
          .eq('purchase_order_id', id)
          .eq('product_id', item.product_id);

        if (!batches || batches.length === 0) continue;
        const batchIds = batches.map((b) => b.id);

        // Update cost on the stock batches themselves
        await this.supabaseService
          .getAdminClient()
          .from('stock_batches')
          .update({ unit_cost: item.unit_price })
          .in('id', batchIds);

        // Update cost on all sales that were allocated from these batches
        await this.supabaseService
          .getAdminClient()
          .from('sales_order_item_costs')
          .update({ unit_cost: item.unit_price })
          .in('batch_id', batchIds);
      }
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .update({ ...orderFields, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error)
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['pending', 'approved', 'received', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      );
    }

    if (status.toLowerCase() === 'received') {
      await this.receiveOrder(id);
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .update({
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    return data;
  }

  private async receiveOrder(orderId: string) {
    const order = await this.findOne(orderId);
    if (!order.items || order.items.length === 0) return;

    // Check if stock batches already exist for this PO (prevent double-receiving)
    const { data: existingBatches } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .select('id')
      .eq('purchase_order_id', orderId)
      .limit(1);
    if (existingBatches && existingBatches.length > 0) return;

    const stockBatches: any[] = [];
    const stockMovements: any[] = [];

    for (const item of order.items) {
      const factor = await this.uomConversionsService.getConversionFactor(
        item.product_id,
        item.purchase_uom_id ?? null,
      );
      const baseQty = item.quantity * factor;
      const baseUnitCost = factor > 1 ? item.unit_price / factor : item.unit_price;

      stockBatches.push({
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        batch_number: `PO-${order.order_number}-${Date.now().toString(36).toUpperCase()}`,
        quantity_received: baseQty,
        quantity_remaining: baseQty,
        unit_cost: baseUnitCost,
        purchase_order_id: orderId,
        received_date: new Date().toISOString().split('T')[0],
      });

      stockMovements.push({
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: baseQty,
        type: 'in',
        reference: `Purchase Order: ${order.order_number}`,
        notes: `Stock received from purchase order${factor > 1 ? ` (${item.quantity} × ${factor} base units)` : ''}`,
      });
    }

    const { error: batchError } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .insert(stockBatches);
    if (batchError) throw batchError;

    await this.supabaseService
      .getAdminClient()
      .from('stock_movements')
      .insert(stockMovements);
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Purchase order deleted successfully' };
  }
}
