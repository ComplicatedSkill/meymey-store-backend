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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let CategoriesService = class CategoriesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createCategoryDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('categories')
            .insert({ ...createCategoryDto })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        const virtualCategories = [{ id: 'package', name: 'Package' }];
        return [...(data || []), ...virtualCategories];
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        return data;
    }
    async update(id, updateCategoryDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('categories')
            .update({ ...updateCategoryDto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                throw new common_1.NotFoundException(`Category with ID ${id} not found`);
            }
            throw error;
        }
        if (!data)
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('categories')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Category deleted successfully' };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map