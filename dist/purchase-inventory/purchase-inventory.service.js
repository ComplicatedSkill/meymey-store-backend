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
exports.PurchaseInventoryService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let PurchaseInventoryService = class PurchaseInventoryService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .insert(createDto)
            .select('*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)')
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .select('*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByPurchaseOrder(purchaseOrderId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .select('*, product:products(*), variant:product_variants(*)')
            .eq('purchase_order_id', purchaseOrderId)
            .order('created_at', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .select('*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Purchase inventory item with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .update(updateDto)
            .eq('id', id)
            .select('*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(*)')
            .single();
        if (error)
            throw new common_1.NotFoundException(`Purchase inventory item with ID ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_inventory')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Purchase inventory item deleted successfully' };
    }
};
exports.PurchaseInventoryService = PurchaseInventoryService;
exports.PurchaseInventoryService = PurchaseInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], PurchaseInventoryService);
//# sourceMappingURL=purchase-inventory.service.js.map