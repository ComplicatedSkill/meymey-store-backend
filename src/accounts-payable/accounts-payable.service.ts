import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { RecordApPaymentDto } from './dto/record-ap-payment.dto';

const SELECT =
  '*, supplier:suppliers(*), purchase_order:purchase_orders(id, order_number), payments:ap_payments(*, payment_method:payment_methods(id, name))';

// Default credit term when a purchase order does not carry a due date.
const DEFAULT_TERM_DAYS = 30;

@Injectable()
export class AccountsPayableService {
  constructor(private supabaseService: SupabaseService) {}

  private generateApNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AP-${timestamp}-${random}`;
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

  async create(createDto: CreateAccountsPayableDto, storeId?: string) {
    const total = Number(createDto.total_amount) || 0;
    const issueDate = createDto.issue_date || new Date().toISOString().split('T')[0];
    const payload: any = {
      ...createDto,
      ap_number: this.generateApNumber(),
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
      .from('accounts_payable')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Create a payable from a purchase order. Used when the order's
   * payment_type is 'AP' (a credit purchase). Idempotent per order.
   */
  async createFromPurchaseOrder(purchaseOrderId: string, storeId?: string) {
    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('purchase_orders')
      .select('id, order_number, supplier_id, total_amount, order_date, store_id')
      .eq('id', purchaseOrderId)
      .single();
    if (orderError)
      throw new NotFoundException(`Purchase order ${purchaseOrderId} not found`);

    // Don't create a duplicate payable for the same order.
    const { data: existing } = await this.supabaseService
      .getAdminClient()
      .from('accounts_payable')
      .select('id')
      .eq('purchase_order_id', purchaseOrderId)
      .maybeSingle();
    if (existing) return this.findOne(existing.id);

    const total = Number(order.total_amount) || 0;
    const issueDate = order.order_date
      ? new Date(order.order_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const payload: any = {
      store_id: storeId || order.store_id || null,
      supplier_id: order.supplier_id || null,
      purchase_order_id: order.id,
      ap_number: this.generateApNumber(),
      issue_date: issueDate,
      due_date: this.addDays(new Date(issueDate), DEFAULT_TERM_DAYS),
      total_amount: total,
      amount_paid: 0,
      balance: total,
      status: 'open',
    };

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_payable')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(storeId?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('accounts_payable')
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
      .from('accounts_payable')
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Payable ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateAccountsPayableDto) {
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
      .from('accounts_payable')
      .update(payload)
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw new NotFoundException(`Payable ${id} not found`);
    return data;
  }

  async recordPayment(id: string, dto: RecordApPaymentDto) {
    const ap = await this.findOne(id);
    if (ap.status === 'cancelled')
      throw new BadRequestException('Cannot record a payment on a cancelled payable');

    const amount = Number(dto.amount) || 0;
    if (amount <= 0)
      throw new BadRequestException('Payment amount must be greater than zero');

    const newPaid = Number(ap.amount_paid) + amount;
    const total = Number(ap.total_amount);
    if (newPaid > total + 0.001)
      throw new BadRequestException(
        `Payment exceeds outstanding balance (${total - Number(ap.amount_paid)})`,
      );

    const { error: payError } = await this.supabaseService
      .getAdminClient()
      .from('ap_payments')
      .insert({
        ap_id: id,
        store_id: ap.store_id || null,
        amount,
        payment_method_id: dto.payment_method_id || null,
        payment_date: dto.payment_date || new Date().toISOString().split('T')[0],
        reference: dto.reference || null,
        notes: dto.notes || null,
      });
    if (payError) throw payError;

    const status = this.resolveStatus(total, newPaid, ap.due_date);
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_payable')
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
      .from('ap_payments')
      .select('*, payment_method:payment_methods(id, name)')
      .eq('ap_id', id)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const ap = await this.findOne(id);
    if (Number(ap.amount_paid) > 0)
      throw new BadRequestException(
        'Cannot delete a payable that has recorded payments',
      );
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('accounts_payable')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Payable deleted successfully' };
  }
}
