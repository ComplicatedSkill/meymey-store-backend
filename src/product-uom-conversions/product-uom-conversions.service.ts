import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductUomConversionDto } from './dto/create-product-uom-conversion.dto';
import { UpdateProductUomConversionDto } from './dto/update-product-uom-conversion.dto';

@Injectable()
export class ProductUomConversionsService {
  constructor(private supabaseService: SupabaseService) {}

  async findByProduct(productId: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('product_uom_conversions')
      .select('*, uom:uom(*)')
      .eq('product_id', productId)
      .order('conversion_factor', { ascending: true });
    if (error) throw error;
    return data;
  }

  async create(productId: string, dto: CreateProductUomConversionDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('product_uom_conversions')
      .insert({ ...dto, product_id: productId })
      .select('*, uom:uom(*)')
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('This UOM is already configured for this product');
      }
      throw error;
    }
    return data;
  }

  async update(id: string, productId: string, dto: UpdateProductUomConversionDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('product_uom_conversions')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('product_id', productId)
      .select('*, uom:uom(*)')
      .single();
    if (error) throw new NotFoundException(`UOM conversion not found`);
    if (!data) throw new NotFoundException(`UOM conversion not found`);
    return data;
  }

  async remove(id: string, productId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('product_uom_conversions')
      .delete()
      .eq('id', id)
      .eq('product_id', productId);
    if (error) throw error;
    return { message: 'UOM conversion deleted successfully' };
  }

  /**
   * Resolves a uom_id to its conversion_factor for a product.
   * Returns 1 if no conversion is found (treats as base unit).
   */
  async getConversionFactor(productId: string, uomId: string | null | undefined): Promise<number> {
    if (!uomId) return 1;
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('product_uom_conversions')
      .select('conversion_factor')
      .eq('product_id', productId)
      .eq('uom_id', uomId)
      .single();
    return data?.conversion_factor ?? 1;
  }
}
