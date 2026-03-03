import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export class CreateSupplierDto {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export class UpdateSupplierDto {
  name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class SuppliersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createSupplierDto: CreateSupplierDto, storeId?: string) {
    const payload: any = { ...createSupplierDto };
    if (storeId) payload.store_id = storeId;
    const { data, error } = await this.supabaseService
      .getClient()
      .from('suppliers')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Supplier with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('suppliers')
      .update(updateSupplierDto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new NotFoundException(`Supplier with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Supplier deleted' };
  }
}
