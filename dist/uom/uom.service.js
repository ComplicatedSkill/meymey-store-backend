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
exports.UomService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let UomService = class UomService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createUomDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('uom')
            .insert({ ...createUomDto })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll(storeId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('uom')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    async findOne(id, storeId) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('uom')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`UOM with ID ${id} not found`);
        return data;
    }
    async update(id, updateUomDto, storeId) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('uom')
            .update(updateUomDto)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException(`UOM with ID ${id} not found`);
            }
            throw error;
        }
        if (!data)
            throw new common_1.NotFoundException(`UOM with ID ${id} not found`);
        return data;
    }
    async remove(id, storeId) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('uom')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'UOM deleted successfully' };
    }
};
exports.UomService = UomService;
exports.UomService = UomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UomService);
//# sourceMappingURL=uom.service.js.map