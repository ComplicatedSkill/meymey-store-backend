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
      .getClient()
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
    return data;
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
      .getClient()
      .from('categories')
      .update({ ...updateCategoryDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new NotFoundException(`Category with ID ${id} not found`);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Category deleted successfully' };
  }
}
