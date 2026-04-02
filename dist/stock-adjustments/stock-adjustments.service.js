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
exports.StockAdjustmentsService = exports.CreateStockAdjustmentDto = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const stock_batches_service_1 = require("../stock-batches/stock-batches.service");
const create_stock_adjustment_dto_1 = require("./dto/create-stock-adjustment.dto");
Object.defineProperty(exports, "CreateStockAdjustmentDto", { enumerable: true, get: function () { return create_stock_adjustment_dto_1.CreateStockAdjustmentDto; } });
let StockAdjustmentsService = class StockAdjustmentsService {
    constructor(supabaseService, stockBatchesService) {
        this.supabaseService = supabaseService;
        this.stockBatchesService = stockBatchesService;
    }
    async create(createDto) {
        const { store_id, ...adjustmentData } = createDto;
        const { data: adjustment, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_adjustments')
            .insert({ ...adjustmentData })
            .select()
            .single();
        if (error)
            throw error;
        try {
            if (createDto.adjustment_type === 'increase') {
                await this.stockBatchesService.returnStock(createDto.product_id, createDto.variant_id || null, createDto.quantity, store_id || '');
            }
            else if (createDto.adjustment_type === 'decrease') {
                await this.stockBatchesService.allocateFIFO(createDto.product_id, createDto.variant_id || null, createDto.quantity, store_id || '');
            }
        }
        catch (stockError) {
            console.error('Failed to update stock for adjustment:', stockError);
            throw stockError;
        }
        return adjustment;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_adjustments')
            .select('*, products(name, sku)')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_adjustments')
            .select('*, products(name, sku)')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        return data;
    }
    async findByProduct(productId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_adjustments')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
};
exports.StockAdjustmentsService = StockAdjustmentsService;
exports.StockAdjustmentsService = StockAdjustmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        stock_batches_service_1.StockBatchesService])
], StockAdjustmentsService);
//# sourceMappingURL=stock-adjustments.service.js.map