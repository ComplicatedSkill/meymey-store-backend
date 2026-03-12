import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductPackageDto } from './dto/create-product-package.dto';
import { UpdateProductPackageDto } from './dto/update-product-package.dto';

@Injectable()
export class ProductPackagesService {
  constructor(private supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.getClient();
  }

  private readonly PACKAGE_SELECT =
    '*, items:product_package_items(*, product:products(*), variant:product_variants(*))';

  /**
   * Fetch stock_batches for a set of product IDs and compute how many
   * complete packages can be assembled.
   * stock_level = min over all component items of floor(component_stock / item.quantity)
   */
  private async attachStockLevel(packages: any[]): Promise<any[]> {
    // Collect every unique product_id across all packages
    const productIds = [
      ...new Set(
        packages.flatMap((pkg: any) =>
          (pkg.items ?? []).map((i: any) => i.product_id).filter(Boolean),
        ),
      ),
    ];

    if (productIds.length === 0) return packages;

    // Single query for all relevant stock batches
    const { data: batches, error } = await this.client
      .from('stock_batches')
      .select('product_id, variant_id, quantity_remaining')
      .in('product_id', productIds)
      .gt('quantity_remaining', 0);

    if (error) {
      console.error('Failed to fetch stock batches for packages:', error);
      return packages;
    }

    // Build a lookup: product_id → variant_id|'base' → total quantity_remaining
    const stockMap = new Map<string, number>();
    for (const b of batches ?? []) {
      const key = `${b.product_id}::${b.variant_id ?? 'base'}`;
      stockMap.set(key, (stockMap.get(key) ?? 0) + (b.quantity_remaining || 0));
    }

    const getStock = (productId: string, variantId?: string | null) =>
      stockMap.get(`${productId}::${variantId ?? 'base'}`) ?? 0;

    return packages.map((pkg: any) => {
      if (!pkg.items || pkg.items.length === 0) {
        return { ...pkg, stock_level: 0, cost: 0 };
      }

      let min = Infinity;
      let totalCost = 0;
      for (const item of pkg.items) {
        const available = getStock(item.product_id, item.variant_id);
        min = Math.min(min, Math.floor(available / (item.quantity || 1)));
        const unitCost = item.variant?.cost ?? item.product?.cost ?? 0;
        totalCost += unitCost * (item.quantity || 1);
      }

      return { ...pkg, stock_level: min === Infinity ? 0 : min, cost: totalCost };
    });
  }

  async create(dto: CreateProductPackageDto, storeId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'A package must have at least one component item',
      );
    }

    // Check for duplicate SKU
    const { data: existing } = await this.client
      .from('product_packages')
      .select('id')
      .eq('sku', dto.sku)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(
        `Package with SKU "${dto.sku}" already exists`,
      );
    }

    const { items, ...packageData } = dto;

    const payload: any = {
      ...packageData,
      is_active: dto.is_active ?? true,
    };
    if (storeId) payload.store_id = storeId;

    const { data: pkg, error: pkgError } = await this.client
      .from('product_packages')
      .insert(payload)
      .select()
      .single();

    if (pkgError) {
      throw new InternalServerErrorException(
        `Failed to create package: ${pkgError.message}`,
      );
    }

    const itemRows = items.map((item) => ({
      package_id: pkg.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await this.client
      .from('product_package_items')
      .insert(itemRows);

    if (itemsError) {
      // Rollback the package header
      await this.client.from('product_packages').delete().eq('id', pkg.id);
      throw new InternalServerErrorException(
        `Failed to create package items: ${itemsError.message}`,
      );
    }

    return this.findOne(pkg.id);
  }

  async findAll() {
    const { data, error } = await this.client
      .from('product_packages')
      .select(this.PACKAGE_SELECT)
      .order('name', { ascending: true });

    if (error) throw error;
    return this.attachStockLevel(data ?? []);
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('product_packages')
      .select(this.PACKAGE_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    const [result] = await this.attachStockLevel([data]);
    return result;
  }

  async update(id: string, dto: UpdateProductPackageDto) {
    await this.findOne(id); // ensures it exists

    const { items, ...packageData } = dto;

    const updatePayload: any = {
      ...packageData,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await this.client
      .from('product_packages')
      .update(updatePayload)
      .eq('id', id);

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to update package: ${updateError.message}`,
      );
    }

    // Replace items if provided
    if (items && items.length > 0) {
      await this.client
        .from('product_package_items')
        .delete()
        .eq('package_id', id);

      const itemRows = items.map((item) => ({
        package_id: id,
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await this.client
        .from('product_package_items')
        .insert(itemRows);

      if (itemsError) {
        throw new InternalServerErrorException(
          `Failed to update package items: ${itemsError.message}`,
        );
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id); // ensures it exists

    // Items cascade-delete via FK. Delete header.
    const { error } = await this.client
      .from('product_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Package deleted successfully' };
  }

  /** Fetch the component items for a package (used by sales-orders service) */
  async getPackageItems(packageId: string) {
    const { data, error } = await this.client
      .from('product_package_items')
      .select('product_id, variant_id, quantity')
      .eq('package_id', packageId);

    if (error) throw error;
    return data || [];
  }
}
