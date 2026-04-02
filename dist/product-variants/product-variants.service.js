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
exports.ProductVariantsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ProductVariantsService = class ProductVariantsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .insert({ ...createDto, store_id: storeId })
            .select('*, product:products(*)')
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll(storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .select('*, product:products(*)')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByProduct(productId, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('store_id', storeId)
            .order('name', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    async findOne(id, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .select('*, product:products(*)')
            .eq('id', id)
            .eq('store_id', storeId)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Product variant with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .update(updateDto)
            .eq('id', id)
            .eq('store_id', storeId)
            .select('*, product:products(*)')
            .single();
        if (error)
            throw new common_1.NotFoundException(`Product variant with ID ${id} not found`);
        return data;
    }
    async remove(id, storeId) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('product_variants')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);
        if (error)
            throw error;
        return { message: 'Product variant deleted successfully' };
    }
};
exports.ProductVariantsService = ProductVariantsService;
exports.ProductVariantsService = ProductVariantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductVariantsService);
//# sourceMappingURL=product-variants.service.js.map