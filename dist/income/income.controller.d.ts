import { IncomeService } from './income.service';
export declare class IncomeController {
    private readonly incomeService;
    constructor(incomeService: IncomeService);
    findAll(startDate?: string, endDate?: string): Promise<{
        id: any;
        order_number: any;
        date: any;
        customer: {
            id: any;
            name: any;
        }[];
        revenue: number;
        cogs: number;
        profit: number;
        profit_margin: number;
        discount: number;
        tax: number;
        total_amount: number;
    }[]>;
    getMonthlySummary(year: string, month: string): Promise<{
        year: number;
        month: number;
        startDate: string;
        endDate: string;
        totalRevenue: number;
        totalCogs: number;
        totalProfit: number;
        profitMargin: number;
        orderCount: number;
    }>;
    findOne(id: string): Promise<{
        id: any;
        order_number: any;
        date: any;
        customer: {
            id: any;
            name: any;
        }[];
        revenue: number;
        cogs: number;
        profit: number;
        profit_margin: number;
        discount: number;
        tax: number;
        total_amount: number;
        items: {
            id: any;
            product: any;
            quantity: any;
            unit_price: any;
            total: any;
            cogs: any;
            profit: number;
        }[];
    }>;
}
