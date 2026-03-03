import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';

@Injectable()
export class UomService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createUomDto: CreateUomDto, storeId: string) {
    // Note: uom table does not have store_id column - UOMs are global
    const { data, error } = await this.supabaseService
      .getClient()
      .from('uom')
      .insert({ ...createUomDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId: string) {
    // UOMs are global - no store_id filter
    const { data, error } = await this.supabaseService
      .getClient()
      .from('uom')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('uom')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`UOM with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateUomDto: UpdateUomDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('uom')
      .update(updateUomDto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`UOM with ID ${id} not found`);
    return data;
  }

  async remove(id: string, storeId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('uom')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'UOM deleted successfully' };
  }
}
