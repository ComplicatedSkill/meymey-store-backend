import { SupabaseService } from '../supabase/supabase.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
export declare class ExpensesService {
    private supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createExpenseDto: CreateExpenseDto): Promise<any>;
    findAll(startDate?: string, endDate?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getMonthlySummary(year: number, month: number): Promise<{
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
}
