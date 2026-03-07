import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  private mapProduct(product: any) {
    if (!product) return null;
    const stockBatches = product.stock || [];
    const totalStock = stockBatches.reduce(
      (sum: number, batch: any) => sum + (batch.quantity_remaining || 0),
      0,
    );
    const variantsWithStock = product.variants?.map((variant: any) => ({
      ...variant,
      stock_level: stockBatches
        .filter((batch: any) => batch.variant_id === variant.id)
        .reduce(
          (sum: number, batch: any) => sum + (batch.quantity_remaining || 0),
          0,
        ),
    }));
    return {
      ...product,
      stock_level: totalStock,
      variants: variantsWithStock,
      stock: undefined,
    };
  }

  private async getRecommendations(currentProduct: any, limit: number = 4) {
    const recommendations: any[] = [];
    const usedIds = new Set<string>([currentProduct.id]);

    // 1. Same Category
    if (currentProduct.category_id) {
      const { data: catProducts } = await this.supabaseService
        .getClient()
        .from('products')
        .select(
          '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
        )
        .eq('category_id', currentProduct.category_id)
        .neq('id', currentProduct.id)
        .limit(limit);

      if (catProducts) {
        catProducts.forEach((p) => {
          if (!usedIds.has(p.id)) {
            recommendations.push(this.mapProduct(p));
            usedIds.add(p.id);
          }
        });
      }
    }

    // 2. Same Brand
    const { data: brandProducts } = await this.supabaseService
      .getClient()
      .from('products')
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .eq('brand_id', currentProduct.brand_id)
      .neq('id', currentProduct.id)
      .limit(limit - recommendations.length);

    if (brandProducts) {
      brandProducts.forEach((p) => {
        if (!usedIds.has(p.id)) {
          recommendations.push(this.mapProduct(p));
          usedIds.add(p.id);
        }
      });
    }

    // 3. Most in stock (Fallback)
    // Note: Ordering by stock_batches quantity_remaining directly is tricky due to join.
    // We'll fetch more products and sort them in memory or just fetch recent ones if stock join is complex.
    // For now, let's fetch products with stock info and sort.
    const { data: topStockProducts } = await this.supabaseService
      .getClient()
      .from('products')
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .neq('id', currentProduct.id)
      .limit(limit * 2); // Fetch more to filter out usedIds and sort

    if (topStockProducts) {
      const mapped = topStockProducts
        .map((p) => this.mapProduct(p))
        .filter((p) => !usedIds.has(p.id))
        .sort((a, b) => (b.stock_level || 0) - (a.stock_level || 0));

      mapped.slice(0, limit - recommendations.length).forEach((p) => {
        recommendations.push(p);
        usedIds.add(p.id);
      });
    }

    return recommendations.slice(0, limit);
  }

  async create(
    createProductDto: CreateProductDto & { store_id?: string },
    storeId?: string,
  ) {
    const productData: any = { ...createProductDto };
    if (storeId) productData.store_id = storeId;

    if (productData.category_id === '') productData.category_id = null;
    if (productData.brand_id === '') productData.brand_id = null;
    if (productData.uom_id === '') productData.uom_id = null;

    const { variants, ...productDtoWithoutVariants } = productData;

    // Check for duplicate SKU
    const skuQuery = this.supabaseService
      .getClient()
      .from('products')
      .select('id')
      .eq('sku', productDtoWithoutVariants.sku);
    if (storeId) skuQuery.eq('store_id', storeId);
    const { data: existingProduct } = await skuQuery.maybeSingle();

    if (existingProduct) {
      throw new BadRequestException(
        `Product with SKU "${productDtoWithoutVariants.sku}" already exists.`,
      );
    }

    const { data: product, error: productError } = await this.supabaseService
      .getClient()
      .from('products')
      .insert(productDtoWithoutVariants)
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .single();

    if (productError) throw productError;

    if (variants && variants.length > 0) {
      const variantsWithProductId = variants.map((v: any) => ({
        ...v,
        product_id: product.id,
        ...(storeId ? { store_id: storeId } : {}),
      }));
      const { error: variantsError } = await this.supabaseService
        .getClient()
        .from('product_variants')
        .insert(variantsWithProductId);
      if (variantsError) {
        await this.supabaseService
          .getClient()
          .from('products')
          .delete()
          .eq('id', product.id);
        throw variantsError;
      }
      const result = await this.findOne(product.id);
      return result;
    }

    const finalProduct = this.mapProduct(product);
    const recommendations = await this.getRecommendations(finalProduct);
    return { ...finalProduct, recommendations };
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
  }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 30;
    const offset = (page - 1) * limit;
    const search = params?.search?.trim();
    const categoryId = params?.categoryId;
    const brandId = params?.brandId;

    let query = this.supabaseService
      .getClient()
      .from('products')
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
        { count: 'exact' },
      )
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    if (categoryId && categoryId !== 'all' && categoryId !== 'uncategorized') {
      query = query.eq('category_id', categoryId);
    } else if (categoryId === 'uncategorized') {
      query = query.is('category_id', null);
    }

    if (brandId && brandId !== 'all') {
      query = query.eq('brand_id', brandId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const products = (data || []).map((p: any) => this.mapProduct(p));
    return {
      data: products,
      total: count ?? 0,
      page,
      limit,
      hasMore: offset + products.length < (count ?? 0),
    };
  }

  async findByCategory(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const result = await this.findAll(params);
    const { data: categories } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    // Group current page of products by category
    const grouped: Array<{
      category: { id: string; name: string };
      products: any[];
    }> = [];
    const uncategorized = result.data.filter((p) => !p.category_id);
    if (uncategorized.length > 0)
      grouped.push({
        category: { id: 'uncategorized', name: 'Uncategorized' },
        products: uncategorized,
      });
    for (const cat of categories || []) {
      const catProducts = result.data.filter((p) => p.category_id === cat.id);
      if (catProducts.length > 0)
        grouped.push({ category: cat, products: catProducts });
    }

    return { ...result, grouped };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining, variant_id), variants:product_variants(*)',
      )
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Product with ID ${id} not found`);
    const product = this.mapProduct(data);
    const recommendations = await this.getRecommendations(product);
    return { ...product, recommendations };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    storeId?: string,
  ) {
    // First verify the product exists (scoped to store if provided)
    let findQuery = this.supabaseService
      .getClient()
      .from('products')
      .select('id')
      .eq('id', id);
    if (storeId) findQuery = findQuery.eq('store_id', storeId);

    const { data: existing, error: findError } = await findQuery.maybeSingle();

    if (findError || !existing) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateData: any = {
      ...updateProductDto,
      updated_at: new Date().toISOString(),
    };

    if (updateData.category_id === '') updateData.category_id = null;
    if (updateData.brand_id === '') updateData.brand_id = null;
    if (updateData.uom_id === '') updateData.uom_id = null;

    const { variants, ...updateDtoWithoutVariants } = updateData;

    let updateQuery = this.supabaseService
      .getClient()
      .from('products')
      .update(updateDtoWithoutVariants)
      .eq('id', id);
    if (storeId) updateQuery = updateQuery.eq('store_id', storeId);

    const { data: product, error: productError } = await updateQuery
      .select(
        '*, category:categories(*), brand:brands(*), uom:uom(*), stock:stock_batches(quantity_remaining), variants:product_variants(*)',
      )
      .single();

    if (productError) {
      throw new InternalServerErrorException(
        `Failed to update product: ${productError.message}`,
      );
    }

    if (variants) {
      await this.supabaseService
        .getClient()
        .from('product_variants')
        .delete()
        .eq('product_id', id);
      if (variants.length > 0) {
        const variantsWithProductId = variants.map((v: any) => ({
          ...v,
          product_id: id,
        }));
        const { error: variantsError } = await this.supabaseService
          .getClient()
          .from('product_variants')
          .insert(variantsWithProductId);
        if (variantsError) throw variantsError;
      }
      return this.findOne(id);
    }

    return this.mapProduct(product);
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Product deleted successfully' };
  }

  async getProductCount() {
    const { count, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return { count };
  }
}
