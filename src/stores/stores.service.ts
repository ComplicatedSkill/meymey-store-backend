import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createStoreDto: CreateStoreDto, userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stores')
      .insert({ ...createStoreDto, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async findOne(id: string, userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stores')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new NotFoundException(`Store with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto, userId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('stores')
      .update({ ...updateStoreDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new NotFoundException(`Store with ID ${id} not found`);
    return data;
  }

  async remove(id: string, userId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('stores')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return { message: 'Store deleted successfully' };
  }
}
