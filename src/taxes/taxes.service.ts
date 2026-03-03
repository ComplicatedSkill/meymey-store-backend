import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';

@Injectable()
export class TaxesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateTaxDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('taxes')
      .insert({ ...createDto, store_id: storeId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('taxes')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('taxes')
      .select('*')
      .eq('id', id)
      .eq('store_id', storeId)
      .single();

    if (error || !data)
      throw new NotFoundException(`Tax with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateDto: UpdateTaxDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('taxes')
      .update({ ...updateDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('store_id', storeId)
      .select()
      .single();

    if (error) throw new NotFoundException(`Tax with ID ${id} not found`);
    return data;
  }

  async remove(id: string, storeId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('taxes')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);

    if (error) throw error;
    return { message: 'Tax deleted successfully' };
  }
}
