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
exports.SuppliersService = exports.UpdateSupplierDto = exports.CreateSupplierDto = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const create_supplier_dto_1 = require("./dto/create-supplier.dto");
Object.defineProperty(exports, "CreateSupplierDto", { enumerable: true, get: function () { return create_supplier_dto_1.CreateSupplierDto; } });
const update_supplier_dto_1 = require("./dto/update-supplier.dto");
Object.defineProperty(exports, "UpdateSupplierDto", { enumerable: true, get: function () { return update_supplier_dto_1.UpdateSupplierDto; } });
let SuppliersService = class SuppliersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async create(createSupplierDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('suppliers')
            .insert({ ...createSupplierDto })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('suppliers')
            .select('*')
            .order('name', { ascending: true });
        if (error)
            throw error;
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('suppliers')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Supplier with ID ${id} not found`);
        return data;
    }
    async update(id, updateSupplierDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('suppliers')
            .update(updateSupplierDto)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new common_1.NotFoundException(`Supplier with ID ${id} not found`);
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('suppliers')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Supplier deleted' };
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map