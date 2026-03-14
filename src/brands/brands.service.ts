import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createBrandDto: CreateBrandDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('brands')
      .insert({ ...createBrandDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Brand with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    // Build update payload — omit updated_at if the column doesn't exist
    const updatePayload: any = { ...updateBrandDto };

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('brands')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // PGRST116 = "no rows returned" (record not found)
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }
      throw error;
    }
    if (!data) throw new NotFoundException(`Brand with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Brand deleted successfully' };
  }
}
