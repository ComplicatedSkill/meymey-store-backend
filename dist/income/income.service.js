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
var IncomeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let IncomeService = IncomeService_1 = class IncomeService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.logger = new common_1.Logger(IncomeService_1.name);
    }
    computeOrderProfit(order) {
        const revenue = Number(order.subtotal || 0);
        let cogs = 0;
        order.items?.forEach((item) => {
            item.costs?.forEach((cost) => {
                cogs += Number(cost.quantity) * Number(cost.unit_cost);
            });
        });
        const profit = revenue - cogs;
        const profitMargin = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;
        return { revenue, cogs, profit, profitMargin };
    }
    async findAll(startDate, endDate) {
        let query = this.supabaseService
            .getAdminClient()
            .from('sales_orders')
            .select(`id, order_number, subtotal, total_amount, discount, tax, order_date, created_at,
         customer:customers(id, name),
         items:sales_order_items(id, quantity, unit_price, total, costs:sales_order_item_costs(quantity, unit_cost))`)
            .filter('status', 'ilike', 'completed');
        if (startDate)
            query = query.gte('order_date', startDate);
        if (endDate)
            query = query.lte('order_date', endDate);
        const { data, error } = await query.order('order_date', { ascending: false });
        if (error) {
            this.logger.error('Find all income error', error);
            throw new common_1.InternalServerErrorException(error.message);
        }
        return data?.map((order) => {
            const { revenue, cogs, profit, profitMargin } = this.computeOrderProfit(order);
            return {
                id: order.id,
                order_number: order.order_number,
                date: order.order_date || order.created_at,
                customer: order.customer,
                revenue,
                cogs,
                profit,
                profit_margin: profitMargin,
                discount: Number(order.discount || 0),
                tax: Number(order.tax || 0),
                total_amount: Number(order.total_amount || 0),
            };
        });
    }
    async findOne(id) {
        const { data: order, error } = await this.supabaseService
            .getAdminClient()
            .from('sales_orders')
            .select(`id, order_number, subtotal, total_amount, discount, tax, order_date, created_at,
         customer:customers(id, name),
         items:sales_order_items(id, quantity, unit_price, total, product:products(id, name, sku), costs:sales_order_item_costs(quantity, unit_cost))`)
            .filter('status', 'ilike', 'completed')
            .eq('id', id)
            .single();
        if (error)
            throw new common_1.NotFoundException(`Completed sales order with ID ${id} not found`);
        const { revenue, cogs, profit, profitMargin } = this.computeOrderProfit(order);
        const items = order.items?.map((item) => {
            const itemCogs = item.costs?.reduce((sum, c) => sum + Number(c.quantity) * Number(c.unit_cost), 0) || 0;
            return {
                id: item.id,
                product: item.product,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.total,
                cogs: itemCogs,
                profit: Number(item.total) - itemCogs,
            };
        });
        return {
            id: order.id,
            order_number: order.order_number,
            date: order.order_date || order.created_at,
            customer: order.customer,
            revenue,
            cogs,
            profit,
            profit_margin: profitMargin,
            discount: Number(order.discount || 0),
            tax: Number(order.tax || 0),
            total_amount: Number(order.total_amount || 0),
            items,
        };
    }
    async getMonthlySummary(year, month) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('sales_orders')
            .select(`subtotal, order_date, items:sales_order_items(costs:sales_order_item_costs(quantity, unit_cost))`)
            .filter('status', 'ilike', 'completed')
            .gte('order_date', startDate)
            .lte('order_date', endDate);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        let totalRevenue = 0;
        let totalCogs = 0;
        data?.forEach((order) => {
            totalRevenue += Number(order.subtotal || 0);
            order.items?.forEach((item) => {
                item.costs?.forEach((cost) => {
                    totalCogs += Number(cost.quantity) * Number(cost.unit_cost);
                });
            });
        });
        const totalProfit = totalRevenue - totalCogs;
        return {
            year,
            month,
            startDate,
            endDate,
            totalRevenue,
            totalCogs,
            totalProfit,
            profitMargin: totalRevenue > 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(2)) : 0,
            orderCount: data?.length || 0,
        };
    }
};
exports.IncomeService = IncomeService;
exports.IncomeService = IncomeService = IncomeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], IncomeService);
//# sourceMappingURL=income.service.js.map