import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(createDto: CreateProductVariantDto, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .insert({ ...createDto, store_id: storeId })
      .select('*, product:products(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByProduct(productId: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('store_id', storeId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOne(id: string, storeId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .select('*, product:products(*)')
      .eq('id', id)
      .eq('store_id', storeId)
      .single();

    if (error)
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    return data;
  }

  async update(
    id: string,
    updateDto: UpdateProductVariantDto,
    storeId: string,
  ) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .update(updateDto)
      .eq('id', id)
      .eq('store_id', storeId)
      .select('*, product:products(*)')
      .single();

    if (error)
      throw new NotFoundException(`Product variant with ID ${id} not found`);
    return data;
  }

  async remove(id: string, storeId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('product_variants')
      .delete()
      .eq('id', id)
      .eq('store_id', storeId);

    if (error) throw error;
    return { message: 'Product variant deleted successfully' };
  }
}
