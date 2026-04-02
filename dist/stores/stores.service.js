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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let StoresService = class StoresService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createStoreDto, userId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .insert({ ...createStoreDto, user_id: userId })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll(userId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error)
            throw error;
        return data;
    }
    async findOne(id, userId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Store with ID ${id} not found`);
        return data;
    }
    async update(id, updateStoreDto, userId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .update({ ...updateStoreDto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Store with ID ${id} not found`);
        return data;
    }
    async remove(id, userId) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw error;
        return { message: 'Store deleted successfully' };
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StoresService);
//# sourceMappingURL=stores.service.js.map