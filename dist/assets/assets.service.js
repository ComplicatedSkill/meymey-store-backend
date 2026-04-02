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
var AssetsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(AssetsService_1.name);
    }
    async create(createAssetDto) {
        const payload = {
            ...createAssetDto,
            current_value: createAssetDto.current_value ?? createAssetDto.purchase_price,
            status: createAssetDto.status ?? 'active',
        };
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('assets')
            .insert(payload)
            .select()
            .single();
        if (error) {
            this.logger.error('Create asset error', error);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data;
    }
    async findAll(status) {
        let query = this.supabaseService
            .getAdminClient()
            .from('assets')
            .select('*');
        if (status)
            query = query.eq('status', status);
        const { data, error } = await query.order('purchase_date', { ascending: false });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('assets')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
        return data;
    }
    async update(id, updateAssetDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('assets')
            .update(updateAssetDto)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('assets')
            .delete()
            .eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: 'Asset deleted successfully' };
    }
    async getTotalValue() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('assets')
            .select('purchase_price, current_value')
            .eq('status', 'active');
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        const totalPurchaseValue = data?.reduce((sum, a) => sum + Number(a.purchase_price || 0), 0) || 0;
        const totalCurrentValue = data?.reduce((sum, a) => sum + Number(a.current_value || 0), 0) || 0;
        return {
            totalPurchaseValue,
            totalCurrentValue,
            totalDepreciation: totalPurchaseValue - totalCurrentValue,
            activeCount: data?.length || 0,
        };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map