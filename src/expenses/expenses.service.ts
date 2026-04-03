import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private supabaseService: SupabaseService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    if (createExpenseDto.type === 'monthly') {
      return this.createMonthlyExpenses(createExpenseDto);
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .insert({ ...createExpenseDto, type: createExpenseDto.type ?? 'one-time' })
      .select()
      .single();

    if (error) {
      this.logger.error('Create expense error', error);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  private async createMonthlyExpenses(dto: CreateExpenseDto) {
    const refDate = new Date(dto.date);
    const year = refDate.getUTCFullYear();
    const month = refDate.getUTCMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyAmount = Math.round((dto.amount / daysInMonth) * 100) / 100;

    const rows = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const monthStr = String(month + 1).padStart(2, '0');
      return {
        title: dto.title,
        amount: dailyAmount,
        category: dto.category,
        description: dto.description,
        date: `${year}-${monthStr}-${day}`,
        type: 'monthly',
      };
    });

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .insert(rows)
      .select();

    if (error) {
      this.logger.error('Create monthly expense error', error);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async findAll(startDate?: string, endDate?: string) {
    let query = this.supabaseService
      .getAdminClient()
      .from('expenses')
      .select('*');

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new NotFoundException(`Expense with ID ${id} not found`);
    return data;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .update(updateExpenseDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundException(`Expense with ID ${id} not found`);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'Expense deleted successfully' };
  }

  async getMonthlySummary(year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('expenses')
      .select('amount, category')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw new InternalServerErrorException(error.message);

    const total = data?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0;

    const categoryMap: Record<string, { total: number; count: number }> = {};
    data?.forEach((r) => {
      const cat = r.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
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
}
