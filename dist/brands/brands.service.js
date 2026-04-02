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
var BrandsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let BrandsService = BrandsService_1 = class BrandsService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(BrandsService_1.name);
    }
    async create(createBrandDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('brands')
            .insert({ ...createBrandDto })
            .select()
            .single();
        if (error) {
            this.logger.error('Create brand error', { code: error.code, message: error.message, details: error.details, hint: error.hint });
            if (error.code === '23505')
                throw new common_1.ConflictException('A brand with that name already exists');
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('brands')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('brands')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Brand with ID ${id} not found`);
        return data;
    }
    async update(id, updateBrandDto) {
        const updatePayload = { ...updateBrandDto };
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('brands')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException(`Brand with ID ${id} not found`);
            }
            throw error;
        }
        if (!data)
            throw new common_1.NotFoundException(`Brand with ID ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('brands')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Brand deleted successfully' };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = BrandsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map