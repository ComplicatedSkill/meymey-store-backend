import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

export { CreateSupplierDto, UpdateSupplierDto };

@Injectable()
export class SuppliersService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('suppliers')
      .insert({ ...createSupplierDto })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new NotFoundException(`Supplier with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
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
      .getAdminClient()
      .from('suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Supplier deleted' };
  }
}
