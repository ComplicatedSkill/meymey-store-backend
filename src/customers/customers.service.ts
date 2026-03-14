import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateCustomerDto, storeId?: string) {
    const payload: any = { ...createDto };
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Customer with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateCustomerDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('customers')
      .update({ ...updateDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException(`Customer with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Customer deleted successfully' };
  }
}
