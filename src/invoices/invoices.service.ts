import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class InvoicesService {
  constructor(private supabaseService: SupabaseService) {}

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }

  async create(createDto: CreateInvoiceDto, storeId: string) {
    const invoiceData: any = {
      ...createDto,
      store_id: storeId,
      invoice_number: this.generateInvoiceNumber(),
      status: 'unpaid',
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createFromSalesOrder(salesOrderId: string, storeId: string) {
    // Get the sales order with items
    const { data: salesOrder, error: orderError } = await this.supabaseService
      .getClient()
      .from('sales_orders')
      .select('*, items:sales_order_items(*, product:products(name))')
      .eq('id', salesOrderId)
      .eq('store_id', storeId)
      .single();

    if (orderError) {
      throw new NotFoundException(
        `Sales order with ID ${salesOrderId} not found`,
      );
    }

    if (salesOrder.status?.toLowerCase() !== 'completed') {
      throw new BadRequestException(
        'Can only create invoice from completed orders',
      );
    }

    // Check if invoice already exists for this order
    const { data: existingInvoice } = await this.supabaseService
      .getClient()
      .from('invoices')
      .select('id')
      .eq('sales_order_id', salesOrderId)
      .single();

    if (existingInvoice) {
      throw new BadRequestException(
        'Invoice already exists for this sales order',
      );
    }

    // Create the invoice
    const { data: invoice, error: invoiceError } = await this.supabaseService
      .getClient()
      .from('invoices')
      .insert({
        store_id: storeId,
        invoice_number: this.generateInvoiceNumber(),
        sales_order_id: salesOrderId,
        customer_id: salesOrder.customer_id,
        subtotal: salesOrder.subtotal,
        tax: salesOrder.tax,
        discount: salesOrder.discount,
        total_amount: salesOrder.total_amount,
        status: 'unpaid',
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Create invoice items from sales order items
    const invoiceItems = salesOrder.items.map((item: any) => ({
      invoice_id: invoice.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      description: item.product?.name || 'Product',
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      total: item.total,
    }));

    if (invoiceItems.length > 0) {
      const { error: itemsError } = await this.supabaseService
        .getClient()
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;
    }

    return this.findOne(invoice.id, storeId);
  }

  async findAll(storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .select(
        '*, customer:customers(*), sales_order:sales_orders(order_number)',
      )
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .select(
        '*, customer:customers(*), sales_order:sales_orders(order_number), items:invoice_items(*, product:products(*), variant:product_variants(*))',
      )
      .eq('id', id)
      .eq('store_id', storeId)
      .single();

    if (error) throw new NotFoundException(`Invoice with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateInvoiceDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .update({ ...updateDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw new NotFoundException(`Invoice with ID ${id} not found`);
    return data;
  }

  async recordPayment(
    id: string,
    paymentDto: RecordPaymentDto,
    storeId: string,
  ) {
    // Get current invoice
    const invoice = await this.findOne(id, storeId);

    if (invoice.status === 'paid') {
      throw new BadRequestException('Invoice is already fully paid');
    }

    if (invoice.status === 'cancelled') {
      throw new BadRequestException(
        'Cannot record payment on cancelled invoice',
      );
    }

    const newAmountPaid =
      Number(invoice.amount_paid) + Number(paymentDto.amount);
    const totalAmount = Number(invoice.total_amount);

    let newStatus: string;
    if (newAmountPaid >= totalAmount) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'unpaid';
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .update({
        amount_paid: newAmountPaid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string, storeId: string) {
    const invoice = await this.findOne(id, storeId);

    if (invoice.status === 'paid' || invoice.status === 'partial') {
      throw new BadRequestException('Cannot delete invoice with payments');
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);

    if (error) throw error;
    return { message: 'Invoice deleted successfully' };
  }
}
