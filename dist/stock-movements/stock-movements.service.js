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
exports.StockMovementsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let StockMovementsService = class StockMovementsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .insert({ ...createDto })
            .select('*, product:products(*), variant:product_variants(*)')
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll(storeId) {
        const { data: products } = await this.supabaseService
            .getAdminClient()
            .from('products')
            .select('id')
            .eq('store_id', storeId);
        const productIds = products?.map((p) => p.id) || [];
        if (productIds.length === 0) {
            return [];
        }
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .select('*, product:products(*), variant:product_variants(*)')
            .in('product_id', productIds)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByProduct(productId, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .select('*, product:products(*), variant:product_variants(*)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .select('*, product:products(*), variant:product_variants(*)')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Stock movement with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .update(updateDto)
            .eq('id', id)
            .select('*, product:products(*), variant:product_variants(*)')
            .single();
        if (error)
            throw new common_1.NotFoundException(`Stock movement with ID ${id} not found`);
        return data;
    }
    async remove(id, storeId) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Stock movement deleted successfully' };
    }
    async getStockLevel(productId, storeId, variantId) {
        let query = this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .select('quantity, type')
            .eq('product_id', productId);
        if (variantId) {
            query = query.eq('variant_id', variantId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        const stockLevel = data.reduce((total, movement) => {
            if (movement.type === 'in')
                return total + movement.quantity;
            if (movement.type === 'out')
                return total - movement.quantity;
            return total + movement.quantity;
        }, 0);
        return {
            product_id: productId,
            variant_id: variantId,
            stock_level: stockLevel,
        };
    }
};
exports.StockMovementsService = StockMovementsService;
exports.StockMovementsService = StockMovementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StockMovementsService);
//# sourceMappingURL=stock-movements.service.js.map