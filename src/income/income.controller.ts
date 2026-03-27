import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { IncomeService } from './income.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('income')
@UseGuards(SupabaseAuthGuard)
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.incomeService.findAll(startDate, endDate);
  }

  @Get('summary')
  getMonthlySummary(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    return this.incomeService.getMonthlySummary(
      Number(year) || now.getFullYear(),
      Number(month) || now.getMonth() + 1,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeService.findOne(id);
  }
}
