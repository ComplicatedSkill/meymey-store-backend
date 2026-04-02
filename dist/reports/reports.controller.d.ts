import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getProfitReport(startDate?: string, endDate?: string): Promise<{
        summary: {
            totalRevenue: number;
            totalCOGS: number;
            netProfit: number;
            profitMargin: number;
            orderCount: number;
        };
        orders: {
            id: any;
            order_date: any;
            revenue: any;
            cogs: number;
            profit: number;
        }[];
    }>;
    getSummaryReport(req: any): Promise<{
        totalSales: number;
        totalPurchases: number;
        totalInventoryValue: number;
        lowStockCount: number;
        productCount: number;
    }>;
    getPurchaseReport(startDate?: string, endDate?: string): Promise<any[]>;
    getInventoryReport(): Promise<{
        stock_level: any;
        is_low_stock: boolean;
        id: any;
        name: any;
        sku: any;
        reorder_level: any;
        category: {
            name: any;
        }[];
        uom: {
            abbreviation: any;
        }[];
        stock: {
            quantity_remaining: any;
        }[];
    }[]>;
    getSalesReport(startDate?: string, endDate?: string): Promise<{
        id: any;
        order_number: any;
        date: any;
        customer: {
            id: any;
            name: any;
        } | null;
        revenue: number;
        cogs: number;
        profit: number;
        profit_margin: number;
        discount: number;
        tax: number;
        total_amount: number;
    }[]>;
    getSalesByCustomerReport(): Promise<{
        name: string;
        total: number;
    }[]>;
    getSalesByProductReport(startDate?: string, endDate?: string): Promise<{
        name: string;
        sku: string;
        quantity: number;
        revenue: number;
        id: string;
    }[]>;
    getProductSuppliersReport(): Promise<{
        id: string;
        name: string;
        sku: string;
        suppliers: {
            id: string;
            name: string;
        }[];
    }[]>;
    getYearlyProfitLoss(req: any, year?: string): Promise<{
        month: number;
        monthName: string;
        revenue: number;
        cogs: number;
        expenses: number;
        grossProfit: number;
        netProfit: number;
    }[]>;
    getMonthlyProfitLoss(req: any, year?: string, month?: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        profitMargin: number;
        incomeByCategory: {};
        expenseByCategory: {};
        year?: undefined;
        month?: undefined;
        startDate?: undefined;
        endDate?: undefined;
    } | {
        year: number;
        month: number;
        startDate: string;
        endDate: string;
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        profitMargin: number;
        incomeByCategory: Record<string, number>;
        expenseByCategory: Record<string, number>;
    }>;
}
