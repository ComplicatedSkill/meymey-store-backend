import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAuthorizationLetterDto } from './dto/create-authorization-letter.dto';
import { UpdateAuthorizationLetterDto } from './dto/update-authorization-letter.dto';
import { UpdateAuthorizationDefaultsDto } from './dto/update-defaults.dto';

// DATE columns reject empty strings — turn '' into null before sending to Supabase.
const DATE_FIELDS = [
  'customs_card_expiry',
  'invoice_date',
  'packing_list_date',
  'transport_doc_date',
  'onetime_valid_until',
  'contract_date',
  'letter_date',
];

function sanitizeDates<T extends Record<string, any>>(payload: T): T {
  for (const field of DATE_FIELDS) {
    if (payload[field] === '') (payload as any)[field] = null;
  }
  return payload;
}

@Injectable()
export class AuthorizationLettersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateAuthorizationLetterDto, storeId?: string) {
    const payload: any = sanitizeDates({ ...createDto });
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letters')
      .insert(payload)
      .select('*, customer:customers(id, name, company_name)')
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(storeId?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('authorization_letters')
      .select('*, customer:customers(id, name, company_name)')
      .order('created_at', { ascending: false });
    if (storeId) query = query.eq('store_id', storeId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letters')
      .select('*, customer:customers(id, name, company_name)')
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Authorization letter ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateAuthorizationLetterDto) {
    const payload = sanitizeDates({
      ...updateDto,
      updated_at: new Date().toISOString(),
    });
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letters')
      .update(payload)
      .eq('id', id)
      .select('*, customer:customers(id, name, company_name)')
      .single();
    if (error)
      throw new NotFoundException(`Authorization letter ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letters')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Authorization letter deleted successfully' };
  }

  // ── Broker defaults (one row per store) ──────────────────────────────
  async getDefaults(storeId?: string) {
    if (!storeId) return null;
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letter_defaults')
      .select('*')
      .eq('store_id', storeId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateDefaults(dto: UpdateAuthorizationDefaultsDto, storeId?: string) {
    if (!storeId) throw new NotFoundException('Store not found');
    const payload = sanitizeDates({
      ...dto,
      store_id: storeId,
      updated_at: new Date().toISOString(),
    });
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('authorization_letter_defaults')
      .upsert(payload, { onConflict: 'store_id' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }
}
