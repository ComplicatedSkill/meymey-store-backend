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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const notifications_service_1 = require("../notifications/notifications.service");
let WebhooksService = class WebhooksService {
    constructor(supabaseService, notificationsService) {
        this.supabaseService = supabaseService;
        this.notificationsService = notificationsService;
    }
    async handleExternalOrder(orderData) {
        const { data: store, error: sError } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .select('id')
            .limit(1)
            .single();
        if (sError || !store) {
            throw new common_1.BadRequestException('No store found');
        }
        const storeId = store.id;
        const { customer_name, customer_phone, customer_address, address, items, notes, source, } = orderData;
        const finalPhone = customer_phone || orderData.phone;
        const finalAddress = customer_address || address;
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new common_1.BadRequestException('Order must have at least one item');
        }
        let total = 0;
        const orderItems = [];
        const itemDetails = [];
        for (const item of items) {
            const resolvedId = item.package_id || item.product_id;
            if (!resolvedId) {
                throw new common_1.BadRequestException('Each item must have a product_id or package_id');
            }
            const { data: product } = await this.supabaseService
                .getAdminClient()
                .from('products')
                .select('price, name')
                .eq('id', resolvedId)
                .maybeSingle();
            if (product) {
                const price = item.unit_price || product.price || 0;
                total += price * item.quantity;
                orderItems.push({
                    product_id: resolvedId,
                    package_id: null,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                    unit_price: price,
                    total: price * item.quantity,
                });
                itemDetails.push({ name: product.name, quantity: item.quantity, price });
                continue;
            }
            const { data: pkg } = await this.supabaseService
                .getAdminClient()
                .from('product_packages')
                .select('name, price')
                .eq('id', resolvedId)
                .maybeSingle();
            if (pkg) {
                const price = item.unit_price || pkg.price || 0;
                total += price * item.quantity;
                orderItems.push({
                    package_id: resolvedId,
                    product_id: null,
                    variant_id: null,
                    quantity: item.quantity,
                    unit_price: price,
                    total: price * item.quantity,
                });
                itemDetails.push({ name: pkg.name, quantity: item.quantity, price });
                continue;
            }
            throw new common_1.BadRequestException(`No product or package found with ID ${resolvedId}`);
        }
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderNumber = `SO-EXT-${timestamp}-${random}`;
        const { data: order, error: orderError } = await this.supabaseService
            .getAdminClient()
            .from('sales_orders')
            .insert({
            store_id: storeId,
            order_number: orderNumber,
            customer_name,
            customer_phone: finalPhone,
            customer_address: finalAddress,
            notes,
            subtotal: total,
            total_amount: total,
            tax: 0,
            discount: 0,
            status: 'PENDING',
            source: source || 'external_webhook',
            order_date: new Date().toISOString().split('T')[0],
        })
            .select()
            .single();
        if (orderError) {
            console.error('Failed to insert external order:', orderError);
            throw orderError;
        }
        const itemsWithOrderId = orderItems.map((i) => ({
            ...i,
            sales_order_id: order.id,
        }));
        const { error: itemsError } = await this.supabaseService
            .getAdminClient()
            .from('sales_order_items')
            .insert(itemsWithOrderId);
        if (itemsError) {
            console.error('Failed to insert items for external order:', itemsError);
        }
        try {
            await this.notificationsService.create({
                type: 'new_order',
                title: `New Order from ${customer_name || 'Customer'}`,
                message: `A new order has been placed by ${customer_name || 'Customer'} for ${total}`,
                data: {
                    order_id: order.id,
                    order_number: orderNumber,
                    customer_name,
                    customer_phone: finalPhone,
                    customer_address: finalAddress,
                    items: itemDetails,
                    total_amount: total,
                    source: source || 'external_webhook',
                },
            }, storeId);
        }
        catch (e) {
            console.error('Failed to trigger notification for external order:', e);
        }
        return { success: true, order_id: order.id };
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        notifications_service_1.NotificationsService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map