import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomsPermitDto } from './dto/create-customs-permit.dto';
import { UpdateCustomsPermitDto } from './dto/update-customs-permit.dto';

const DATE_FIELDS = ['declaration_date', 'permit_date'];
const NUM_FIELDS = [
  'quantity',
  'gross_weight',
  'net_weight',
  'customs_duty',
  'vat',
  'special_tax',
  'other_fees',
];

function sanitize<T extends Record<string, any>>(payload: T): T {
  for (const f of DATE_FIELDS) {
    if (payload[f] === '') (payload as any)[f] = null;
  }
  for (const f of NUM_FIELDS) {
    if (payload[f] === '' || payload[f] === undefined) continue;
    if (payload[f] === null) continue;
    (payload as any)[f] = Number(payload[f]);
  }
  return payload;
}

function withTotal<T extends Record<string, any>>(payload: T): T {
  const num = (v: any) => Number(v) || 0;
  (payload as any).total_taxes =
    num(payload.customs_duty) +
    num(payload.vat) +
    num(payload.special_tax) +
    num(payload.other_fees);
  return payload;
}

const SELECT =
  '*, customer:customers(id, name, company_name), authorization_letter:authorization_letters(id, letter_no, invoice_no)';

@Injectable()
export class CustomsPermitsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateCustomsPermitDto, storeId?: string) {
    const payload: any = withTotal(sanitize({ ...createDto }));
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customs_permits')
      .insert(payload)
      .select(SELECT)
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(storeId?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('customs_permits')
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
      .from('customs_permits')
      .select(SELECT)
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Customs permit ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateCustomsPermitDto) {
    // Recompute total from the merged record so partial updates stay correct.
    const existing = await this.findOne(id);
    const merged = sanitize({ ...existing, ...updateDto });
    const payload = withTotal(merged);
    delete (payload as any).customer;
    delete (payload as any).authorization_letter;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customs_permits')
      .update(payload)
      .eq('id', id)
      .select(SELECT)
      .single();
    if (error) throw new NotFoundException(`Customs permit ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('customs_permits')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Customs permit deleted successfully' };
  }
}
