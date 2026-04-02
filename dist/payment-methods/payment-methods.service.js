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
exports.PaymentMethodsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let PaymentMethodsService = class PaymentMethodsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, storeId) {
        if (createDto.is_default)
            await this.unsetAllDefaults();
        const payload = { ...createDto };
        if (storeId)
            payload.store_id = storeId;
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .insert(payload)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findActive() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('is_default', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Payment method with ID ${id} not found`);
        return data;
    }
    async update(id, updateDto) {
        if (updateDto.is_default)
            await this.unsetAllDefaults();
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Payment method with ID ${id} not found`);
        return data;
    }
    async setDefault(id) {
        await this.unsetAllDefaults();
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Payment method with ID ${id} not found`);
        return data;
    }
    async unsetAllDefaults() {
        await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .update({ is_default: false })
            .eq('is_default', true);
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('payment_methods')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Payment method deleted successfully' };
    }
};
exports.PaymentMethodsService = PaymentMethodsService;
exports.PaymentMethodsService = PaymentMethodsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], PaymentMethodsService);
//# sourceMappingURL=payment-methods.service.js.map