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
exports.StockBatchesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let StockBatchesService = class StockBatchesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    generateBatchNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `BATCH-${timestamp}-${random}`;
    }
    async create(createDto, storeId) {
        const batchData = {
            ...createDto,
            batch_number: createDto.batch_number || this.generateBatchNumber(),
            quantity_remaining: createDto.quantity_received,
        };
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .insert(batchData)
            .select('*, product:products(*), variant:product_variants(*)')
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll(storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .select('*, product:products(*), variant:product_variants(*), purchase_order:purchase_orders(order_number)')
            .order('received_date', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findByProduct(productId, storeId, variantId) {
        let query = this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .select('*, product:products(*), variant:product_variants(*)')
            .eq('product_id', productId)
            .gt('quantity_remaining', 0)
            .order('received_date', { ascending: true });
        if (variantId) {
            query = query.eq('variant_id', variantId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data;
    }
    async findOne(id, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .select('*, product:products(*), variant:product_variants(*)')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Stock batch with ID ${id} not found`);
        return data;
    }
    async getAvailableStock(productId, storeId, variantId) {
        let query = this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .select('quantity_remaining')
            .eq('product_id', productId)
            .gt('quantity_remaining', 0);
        if (variantId) {
            query = query.eq('variant_id', variantId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        const totalAvailable = data.reduce((sum, batch) => sum + batch.quantity_remaining, 0);
        return {
            product_id: productId,
            variant_id: variantId,
            available_stock: totalAvailable,
        };
    }
    async allocateFIFO(productId, variantId, quantity, storeId) {
        const batches = await this.findByProduct(productId, storeId, variantId || undefined);
        let remaining = quantity;
        const allocations = [];
        for (const batch of batches) {
            if (remaining <= 0)
                break;
            const allocateQty = Math.min(batch.quantity_remaining, remaining);
            allocations.push({
                batch_id: batch.id,
                quantity: allocateQty,
                unit_cost: Number(batch.unit_cost),
            });
            const newRemaining = batch.quantity_remaining - allocateQty;
            await this.supabaseService
                .getAdminClient()
                .from('stock_batches')
                .update({ quantity_remaining: newRemaining })
                .eq('id', batch.id);
            remaining -= allocateQty;
        }
        if (remaining > 0) {
            throw new common_1.BadRequestException(`Insufficient stock. Requested: ${quantity}, Available: ${quantity - remaining}`);
        }
        return allocations;
    }
    async returnStock(productId, variantId, quantity, storeId, unitCost) {
        if (unitCost !== undefined) {
            return this.create({
                product_id: productId,
                variant_id: variantId || undefined,
                quantity_received: quantity,
                unit_cost: unitCost,
            }, storeId);
        }
        const { data: latestBatch } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .select('*')
            .eq('product_id', productId)
            .order('received_date', { ascending: false })
            .limit(1)
            .single();
        if (latestBatch) {
            const { data, error } = await this.supabaseService
                .getAdminClient()
                .from('stock_batches')
                .update({
                quantity_remaining: latestBatch.quantity_remaining + quantity,
            })
                .eq('id', latestBatch.id)
                .select()
                .single();
            if (error)
                throw error;
            return data;
        }
        throw new common_1.BadRequestException('No batch found to return stock to');
    }
    async remove(id, storeId) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Stock batch deleted successfully' };
    }
};
exports.StockBatchesService = StockBatchesService;
exports.StockBatchesService = StockBatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StockBatchesService);
//# sourceMappingURL=stock-batches.service.js.map