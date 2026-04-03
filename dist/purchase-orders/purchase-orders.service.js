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
var PurchaseOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const product_uom_conversions_service_1 = require("../product-uom-conversions/product-uom-conversions.service");
let PurchaseOrdersService = PurchaseOrdersService_1 = class PurchaseOrdersService {
    supabaseService;
    uomConversionsService;
    logger = new common_1.Logger(PurchaseOrdersService_1.name);
    constructor(supabaseService, uomConversionsService) {
        this.supabaseService = supabaseService;
        this.uomConversionsService = uomConversionsService;
    }
    async create(createDto) {
        const { items, ...orderData } = createDto;
        if (!orderData.status)
            orderData.status = 'pending';
        const { data: order, error: orderError } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .insert(orderData)
            .select()
            .single();
        if (orderError) {
            this.logger.error('Create purchase order error', { code: orderError.code, message: orderError.message, details: orderError.details });
            throw new common_1.InternalServerErrorException(orderError.message);
        }
        if (items && items.length > 0) {
            const inventoryItems = items.map((item) => ({
                ...item,
                purchase_order_id: order.id,
            }));
            const { error: itemError } = await this.supabaseService
                .getAdminClient()
                .from('purchase_inventory')
                .insert(inventoryItems);
            if (itemError)
                console.error('Error creating PO items:', itemError);
        }
        return order;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .select('*, supplier:suppliers(*), items:purchase_inventory(*, product:products(*), variant:product_variants(*))')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .select('*, supplier:suppliers(*), items:purchase_inventory(*, product:products(*), variant:product_variants(*))')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .update({ ...updateDto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        return data;
    }
    async updateStatus(id, status) {
        const validStatuses = ['pending', 'approved', 'received', 'cancelled'];
        if (!validStatuses.includes(status.toLowerCase())) {
            throw new common_1.BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        if (status.toLowerCase() === 'received') {
            await this.receiveOrder(id);
        }
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .update({
            status: status.toLowerCase(),
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Purchase order with ID ${id} not found`);
        return data;
    }
    async receiveOrder(orderId) {
        const order = await this.findOne(orderId);
        if (!order.items || order.items.length === 0)
            return;
        const stockBatches = [];
        const stockMovements = [];
        for (const item of order.items) {
            const factor = await this.uomConversionsService.getConversionFactor(item.product_id, item.purchase_uom_id ?? null);
            const baseQty = item.quantity * factor;
            const baseUnitCost = factor > 1 ? item.unit_price / factor : item.unit_price;
            stockBatches.push({
                product_id: item.product_id,
                variant_id: item.variant_id,
                batch_number: `PO-${order.order_number}-${Date.now().toString(36).toUpperCase()}`,
                quantity_received: baseQty,
                quantity_remaining: baseQty,
                unit_cost: baseUnitCost,
                purchase_order_id: orderId,
                received_date: new Date().toISOString().split('T')[0],
            });
            stockMovements.push({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: baseQty,
                type: 'in',
                reference: `Purchase Order: ${order.order_number}`,
                notes: `Stock received from purchase order${factor > 1 ? ` (${item.quantity} × ${factor} base units)` : ''}`,
            });
        }
        const { error: batchError } = await this.supabaseService
            .getAdminClient()
            .from('stock_batches')
            .insert(stockBatches);
        if (batchError)
            throw batchError;
        await this.supabaseService
            .getAdminClient()
            .from('stock_movements')
            .insert(stockMovements);
        for (const item of order.items) {
            await this.supabaseService
                .getAdminClient()
                .from('purchase_inventory')
                .update({ received_quantity: item.quantity })
                .eq('id', item.id);
        }
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('purchase_orders')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Purchase order deleted successfully' };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = PurchaseOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        product_uom_conversions_service_1.ProductUomConversionsService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map