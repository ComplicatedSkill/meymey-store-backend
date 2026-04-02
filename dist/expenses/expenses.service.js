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
var ExpensesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let ExpensesService = ExpensesService_1 = class ExpensesService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(ExpensesService_1.name);
    }
    async create(createExpenseDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('expenses')
            .insert({ ...createExpenseDto })
            .select()
            .single();
        if (error) {
            this.logger.error('Create expense error', error);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data;
    }
    async findAll(startDate, endDate) {
        let query = this.supabaseService
            .getAdminClient()
            .from('expenses')
            .select('*');
        if (startDate)
            query = query.gte('date', startDate);
        if (endDate)
            query = query.lte('date', endDate);
        const { data, error } = await query.order('date', { ascending: false });
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
        return data;
    }
    async update(id, updateExpenseDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('expenses')
            .update(updateExpenseDto)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                throw new common_1.NotFoundException(`Expense with ID ${id} not found`);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data;
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('expenses')
            .delete()
            .eq('id', id);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: 'Expense deleted successfully' };
    }
    async getMonthlySummary(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('expenses')
            .select('amount, category')
            .gte('date', startDate)
            .lte('date', endDate);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        const total = data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;
        const categoryMap = {};
        data?.forEach((r) => {
            const cat = r.category || 'Uncategorized';
            if (!categoryMap[cat])
                categoryMap[cat] = { total: 0, count: 0 };
            categoryMap[cat].total += Number(r.amount || 0);
            categoryMap[cat].count += 1;
        });
        const byCategory = Object.entries(categoryMap).map(([category, v]) => ({
            category,
            total: v.total,
            count: v.count,
        }));
        return { total, byCategory, count: data?.length || 0, startDate, endDate };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = ExpensesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map