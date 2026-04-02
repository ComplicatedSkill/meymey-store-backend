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
exports.ExchangeRatesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ExchangeRatesService = class ExchangeRatesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createDto, storeId) {
        const payload = { ...createDto };
        if (storeId)
            payload.store_id = storeId;
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
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
            .from('exchange_rates')
            .select('*')
            .order('effective_date', { ascending: false });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Exchange rate with ID ${id} not found`);
        return data;
    }
    async getRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency)
            return { from_currency: fromCurrency, to_currency: toCurrency, rate: 1 };
        const { data: directRate } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
            .select('*')
            .eq('from_currency', fromCurrency)
            .eq('to_currency', toCurrency)
            .lte('effective_date', new Date().toISOString().split('T')[0])
            .order('effective_date', { ascending: false })
            .limit(1)
            .single();
        if (directRate)
            return directRate;
        const { data: inverseRate } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
            .select('*')
            .eq('from_currency', toCurrency)
            .eq('to_currency', fromCurrency)
            .lte('effective_date', new Date().toISOString().split('T')[0])
            .order('effective_date', { ascending: false })
            .limit(1)
            .single();
        if (inverseRate)
            return {
                from_currency: fromCurrency,
                to_currency: toCurrency,
                rate: 1 / inverseRate.rate,
                effective_date: inverseRate.effective_date,
            };
        throw new common_1.NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }
    async convert(amount, fromCurrency, toCurrency) {
        const rateData = await this.getRate(fromCurrency, toCurrency);
        return {
            original_amount: amount,
            original_currency: fromCurrency,
            converted_amount: Math.round(amount * Number(rateData.rate) * 100) / 100,
            target_currency: toCurrency,
            rate: rateData.rate,
            effective_date: rateData.effective_date,
        };
    }
    async update(id, updateDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Exchange rate with ID ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('exchange_rates')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Exchange rate deleted successfully' };
    }
};
exports.ExchangeRatesService = ExchangeRatesService;
exports.ExchangeRatesService = ExchangeRatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ExchangeRatesService);
//# sourceMappingURL=exchange-rates.service.js.map