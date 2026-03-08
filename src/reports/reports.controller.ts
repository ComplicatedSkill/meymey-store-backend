import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('reports')
@UseGuards(SupabaseAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit')
  getProfitReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getProfitReport(startDate, endDate);
  }

  @Get('summary')
  getSummaryReport(@Request() req: any) {
    const storeId = req.user?.store?.id;
    return this.reportsService.getSummaryReport(storeId);
  }

  @Get('purchase')
  getPurchaseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPurchaseReport(startDate, endDate);
  }

  @Get('inventory')
  getInventoryReport() {
    return this.reportsService.getInventoryReport();
  }

  @Get('sales')
  getSalesReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesReport(startDate, endDate);
  }

  @Get('sales-by-customer')
  getSalesByCustomerReport() {
    return this.reportsService.getSalesByCustomerReport();
  }

  @Get('sales-by-product')
  getSalesByProductReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getSalesByProductReport(startDate, endDate);
  }

  @Get('product-suppliers')
  getProductSuppliersReport() {
    return this.reportsService.getProductSuppliersReport();
  }
}
