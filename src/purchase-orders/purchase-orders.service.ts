import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  private readonly logger = new Logger(PurchaseOrdersService.name);

  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreatePurchaseOrderDto) {
    const { items, ...orderData } = createDto;

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
        '*, supplier:suppliers(*), items:purchase_inventory(*, product:products(*), variant:product_variants(*))',
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
        '*, supplier:suppliers(*), items:purchase_inventory(*, product:products(*), variant:product_variants(*))',
      )
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .update({ ...updateDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    return data;
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
        status: status.toUpperCase(),
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

    const stockBatches = order.items.map((item: any) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      batch_number: `PO-${order.order_number}-${Date.now().toString(36).toUpperCase()}`,
      quantity_received: item.quantity,
      quantity_remaining: item.quantity,
      unit_cost: item.unit_price,
      purchase_order_id: orderId,
      received_date: new Date().toISOString().split('T')[0],
    }));

    const { error: batchError } = await this.supabaseService
      .getAdminClient()
      .from('stock_batches')
      .insert(stockBatches);
    if (batchError) throw batchError;

    const stockMovements = order.items.map((item: any) => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      type: 'in',
      reference: `Purchase Order: ${order.order_number}`,
      notes: `Stock received from purchase order`,
    }));
    await this.supabaseService
      .getAdminClient()
      .from('stock_movements')
      .insert(stockMovements);

    for (const item of order.items) {
      await this.supabaseService
        .getAdminClient()
        .from('purchase_inventory')
        .update({ received_quantity: item.quantity })
        .eq('id', item.id);
    }
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
