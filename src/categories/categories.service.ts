import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Note: categories table does not have store_id column - categories are global
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .insert({ ...createCategoryDto })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    // Categories are global - no store_id filter
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const virtualCategories = [{ id: 'package', name: 'Package' }];
    return [...(data || []), ...virtualCategories];
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Category with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .update({ ...updateCategoryDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      throw error;
    }
    if (!data) throw new NotFoundException(`Category with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Category deleted successfully' };
  }
}
