import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreatePaymentMethodDto, storeId?: string) {
    if (createDto.is_default) await this.unsetAllDefaults();
    const payload: any = { ...createDto };
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findActive() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .select('*')
      .eq('id', id)
      .single();
    if (error)
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdatePaymentMethodDto) {
    if (updateDto.is_default) await this.unsetAllDefaults();
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    return data;
  }

  async setDefault(id: string) {
    await this.unsetAllDefaults();
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    return data;
  }

  private async unsetAllDefaults() {
    await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .update({ is_default: false })
      .eq('is_default', true);
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('payment_methods')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Payment method deleted successfully' };
  }
}
