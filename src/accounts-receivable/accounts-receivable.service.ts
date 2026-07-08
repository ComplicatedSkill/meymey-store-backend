import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { UpdateAccountsReceivableDto } from './dto/update-accounts-receivable.dto';
import { RecordArPaymentDto } from './dto/record-ar-payment.dto';

const SELECT =
  '*, customer:customers(id, name, company_name, phone, email), sales_order:sales_orders(id, order_number), payments:ar_payments(*, payment_method:payment_methods(id, name))';

// Default credit term when a sales order does not carry a due date.
const DEFAULT_TERM_DAYS = 30;

@Injectable()
export class AccountsReceivableService {
  constructor(private supabaseService: SupabaseService) {}

  private generateArNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AR-${timestamp}-${random}`;
  }

  private addDays(date: Date, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private resolveStatus(total: number, paid: number, dueDate?: string | null) {
    if (paid >= total && total > 0) return 'paid';
    const overdue =
      dueDate && new Date(dueDate) < new Date(new Date().toDateString());
    if (paid > 0) return overdue ? 'overdue' : 'partial';
    return overdue ? 'overdue' : 'open';
  }

  async create(createDto: CreateAccountsReceivableDto, storeId?: string) {
    const total = Number(createDto.total_amount) || 0;
    const issueDate = createDto.issue_date || new Date().toISOString().split('T')[0];
    const payload: any = {
      ...createDto,
      ar_number: this.generateArNumber(),
      issue_date: issueDate,
      due_date: createDto.due_date || this.addDays(new Date(issueDate), DEFAULT_TERM_DAYS),
      total_amount: total,
      amount_paid: 0,
      balance: total,
      status: createDto.status || 'open',
    };
    if (storeId) payload.store_id = storeId;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Create a receivable from a sales order. Used when the order's
   * payment_type is 'AR' (a credit sale). Idempotent per order.
   */
  async createFromSalesOrder(salesOrderId: string, storeId?: string) {
    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('sales_orders')
      .select('id, order_number, customer_id, total_amount, order_date, store_id')
      .eq('id', salesOrderId)
      .single();
    if (orderError)
      throw new NotFoundException(`Sales order ${salesOrderId} not found`);

    // Don't create a duplicate receivable for the same order.
    const { data: existing } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .select('id')
      .eq('sales_order_id', salesOrderId)
      .maybeSingle();
    if (existing) return this.findOne(existing.id);

    const total = Number(order.total_amount) || 0;
    const issueDate = order.order_date
      ? new Date(order.order_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const payload: any = {
      store_id: storeId || order.store_id || null,
      customer_id: order.customer_id || null,
      sales_order_id: order.id,
      ar_number: this.generateArNumber(),
      issue_date: issueDate,
      due_date: this.addDays(new Date(issueDate), DEFAULT_TERM_DAYS),
      total_amount: total,
      amount_paid: 0,
      balance: total,
      status: 'open',
    };

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(storeId?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (storeId) query = query.eq('store_id', storeId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Receivable ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateAccountsReceivableDto) {
    const existing = await this.findOne(id);
    const total =
      updateDto.total_amount !== undefined
        ? Number(updateDto.total_amount)
        : Number(existing.total_amount);
    const paid = Number(existing.amount_paid) || 0;

    const payload: any = {
      ...updateDto,
      total_amount: total,
      balance: total - paid,
      updated_at: new Date().toISOString(),
    };
    if (!updateDto.status) {
      payload.status = this.resolveStatus(
        total,
        paid,
        updateDto.due_date ?? existing.due_date,
      );
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .update(payload)
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw new NotFoundException(`Receivable ${id} not found`);
    return data;
  }

  async recordPayment(id: string, dto: RecordArPaymentDto) {
    const ar = await this.findOne(id);
    if (ar.status === 'cancelled')
      throw new BadRequestException('Cannot record a receipt on a cancelled receivable');

    const amount = Number(dto.amount) || 0;
    if (amount <= 0)
      throw new BadRequestException('Payment amount must be greater than zero');

    const newPaid = Number(ar.amount_paid) + amount;
    const total = Number(ar.total_amount);
    if (newPaid > total + 0.001)
      throw new BadRequestException(
        `Payment exceeds outstanding balance (${total - Number(ar.amount_paid)})`,
      );

    const { error: payError } = await this.supabaseService
      .getAdminClient()
      .from('ar_payments')
      .insert({
        ar_id: id,
        store_id: ar.store_id || null,
        amount,
        payment_method_id: dto.payment_method_id || null,
        payment_date: dto.payment_date || new Date().toISOString().split('T')[0],
        reference: dto.reference || null,
        notes: dto.notes || null,
      });
    if (payError) throw payError;

    const status = this.resolveStatus(total, newPaid, ar.due_date);
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .update({
        amount_paid: newPaid,
        balance: total - newPaid,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) throw error;

    return this.findOne(id);
  }

  async findPayments(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('ar_payments')
      .select('*, payment_method:payment_methods(id, name)')
      .eq('ar_id', id)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const ar = await this.findOne(id);
    if (Number(ar.amount_paid) > 0)
      throw new BadRequestException(
        'Cannot delete a receivable that has recorded receipts',
      );
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_receivable')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Receivable deleted successfully' };
  }
}
