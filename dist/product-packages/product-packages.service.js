"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPackagesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ProductPackagesService = class ProductPackagesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.PACKAGE_SELECT = '*, items:product_package_items(*, product:products(*), variant:product_variants(*))';
    }
    get client() {
        return this.supabaseService.getAdminClient();
    }
    async attachStockLevel(packages) {
        const productIds = [
            ...new Set(packages.flatMap((pkg) => (pkg.items ?? []).map((i) => i.product_id).filter(Boolean))),
        ];
        if (productIds.length === 0)
            return packages;
        const { data: batches, error } = await this.client
            .from('stock_batches')
            .select('product_id, variant_id, quantity_remaining')
            .in('product_id', productIds)
            .gt('quantity_remaining', 0);
        if (error) {
            console.error('Failed to fetch stock batches for packages:', error);
            return packages;
        }
        const stockMap = new Map();
        for (const b of batches ?? []) {
            const key = `${b.product_id}::${b.variant_id ?? 'base'}`;
            stockMap.set(key, (stockMap.get(key) ?? 0) + (b.quantity_remaining || 0));
        }
        const getStock = (productId, variantId) => stockMap.get(`${productId}::${variantId ?? 'base'}`) ?? 0;
        return packages.map((pkg) => {
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
    async create(dto, storeId) {
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('A package must have at least one component item');
        }
        const { data: existing } = await this.client
            .from('product_packages')
            .select('id')
            .eq('sku', dto.sku)
            .maybeSingle();
        if (existing) {
            throw new common_1.BadRequestException(`Package with SKU "${dto.sku}" already exists`);
        }
        const { items, ...packageData } = dto;
        const payload = {
            ...packageData,
            is_active: dto.is_active ?? true,
        };
        if (storeId)
            payload.store_id = storeId;
        const { data: pkg, error: pkgError } = await this.client
            .from('product_packages')
            .insert(payload)
            .select()
            .single();
        if (pkgError) {
            throw new common_1.InternalServerErrorException(`Failed to create package: ${pkgError.message}`);
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
            await this.client.from('product_packages').delete().eq('id', pkg.id);
            throw new common_1.InternalServerErrorException(`Failed to create package items: ${itemsError.message}`);
        }
        return this.findOne(pkg.id);
    }
    async findAll() {
        const { data, error } = await this.client
            .from('product_packages')
            .select(this.PACKAGE_SELECT)
            .order('name', { ascending: true });
        if (error)
            throw error;
        return this.attachStockLevel(data ?? []);
    }
    async findOne(id) {
        const { data, error } = await this.client
            .from('product_packages')
            .select(this.PACKAGE_SELECT)
            .eq('id', id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException(`Package with ID ${id} not found`);
        }
        const [result] = await this.attachStockLevel([data]);
        return result;
    }
    async update(id, dto) {
        await this.findOne(id);
        const { items, ...packageData } = dto;
        const updatePayload = {
            ...packageData,
            updated_at: new Date().toISOString(),
        };
        const { error: updateError } = await this.client
            .from('product_packages')
            .update(updatePayload)
            .eq('id', id);
        if (updateError) {
            throw new common_1.InternalServerErrorException(`Failed to update package: ${updateError.message}`);
        }
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
                throw new common_1.InternalServerErrorException(`Failed to update package items: ${itemsError.message}`);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        const { error } = await this.client
            .from('product_packages')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Package deleted successfully' };
    }
    async getPackageItems(packageId) {
        const { data, error } = await this.client
            .from('product_package_items')
            .select('product_id, variant_id, quantity')
            .eq('package_id', packageId);
        if (error)
            throw error;
        return data || [];
    }
};
exports.ProductPackagesService = ProductPackagesService;
exports.ProductPackagesService = ProductPackagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductPackagesService);
//# sourceMappingURL=product-packages.service.js.map