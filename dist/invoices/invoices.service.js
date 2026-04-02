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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let InvoicesService = class InvoicesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    generateInvoiceNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `INV-${timestamp}-${random}`;
    }
    async create(createDto, storeId) {
        const invoiceData = {
            ...createDto,
            store_id: storeId,
            invoice_number: this.generateInvoiceNumber(),
            status: 'unpaid',
        };
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async createFromSalesOrder(salesOrderId, storeId) {
        const { data: salesOrder, error: orderError } = await this.supabaseService
            .getAdminClient()
            .from('sales_orders')
            .select('*, items:sales_order_items(*, product:products(name))')
            .eq('id', salesOrderId)
            .eq('store_id', storeId)
            .single();
        if (orderError) {
            throw new common_1.NotFoundException(`Sales order with ID ${salesOrderId} not found`);
        }
        if (salesOrder.status?.toLowerCase() !== 'completed') {
            throw new common_1.BadRequestException('Can only create invoice from completed orders');
        }
        const { data: existingInvoice } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .select('id')
            .eq('sales_order_id', salesOrderId)
            .single();
        if (existingInvoice) {
            throw new common_1.BadRequestException('Invoice already exists for this sales order');
        }
        const { data: invoice, error: invoiceError } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .insert({
            store_id: storeId,
            invoice_number: this.generateInvoiceNumber(),
            sales_order_id: salesOrderId,
            customer_id: salesOrder.customer_id,
            subtotal: salesOrder.subtotal,
            tax: salesOrder.tax,
            discount: salesOrder.discount,
            total_amount: salesOrder.total_amount,
            status: 'unpaid',
        })
            .select()
            .single();
        if (invoiceError)
            throw invoiceError;
        const invoiceItems = salesOrder.items.map((item) => ({
            invoice_id: invoice.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            description: item.product?.name || 'Product',
            quantity: item.quantity,
            unit_price: item.unit_price,
            discount: item.discount,
            total: item.total,
        }));
        if (invoiceItems.length > 0) {
            const { error: itemsError } = await this.supabaseService
                .getAdminClient()
                .from('invoice_items')
                .insert(invoiceItems);
            if (itemsError)
                throw itemsError;
        }
        return this.findOne(invoice.id, storeId);
    }
    async findAll(storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .select('*, customer:customers(*), sales_order:sales_orders(order_number)')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .select('*, customer:customers(*), sales_order:sales_orders(order_number), items:invoice_items(*, product:products(*), variant:product_variants(*))')
            .eq('id', id)
            .eq('store_id', storeId)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .update({ ...updateDto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        return data;
    }
    async recordPayment(id, paymentDto, storeId) {
        const invoice = await this.findOne(id, storeId);
        if (invoice.status === 'paid') {
            throw new common_1.BadRequestException('Invoice is already fully paid');
        }
        if (invoice.status === 'cancelled') {
            throw new common_1.BadRequestException('Cannot record payment on cancelled invoice');
        }
        const newAmountPaid = Number(invoice.amount_paid) + Number(paymentDto.amount);
        const totalAmount = Number(invoice.total_amount);
        let newStatus;
        if (newAmountPaid >= totalAmount) {
            newStatus = 'paid';
        }
        else if (newAmountPaid > 0) {
            newStatus = 'partial';
        }
        else {
            newStatus = 'unpaid';
        }
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .update({
            amount_paid: newAmountPaid,
            status: newStatus,
            updated_at: new Date().toISOString(),
        })
            .eq('id', id)
            .eq('store_id', storeId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async remove(id, storeId) {
        const invoice = await this.findOne(id, storeId);
        if (invoice.status === 'paid' || invoice.status === 'partial') {
            throw new common_1.BadRequestException('Cannot delete invoice with payments');
        }
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('store_id', storeId);
        if (error)
            throw error;
        return { message: 'Invoice deleted successfully' };
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map