import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto): Promise<any>;
    findAll(startDate?: string, endDate?: string): Promise<any[]>;
    getMonthlySummary(year: string, month: string): Promise<{
        total: number;
        byCategory: {
            category: string;
            total: number;
            count: number;
        }[];
        count: number;
        startDate: string;
        endDate: string;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
