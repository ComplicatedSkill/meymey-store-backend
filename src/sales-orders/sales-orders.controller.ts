import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('sales-orders')
@UseGuards(SupabaseAuthGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  create(
    @Body() createSalesOrderDto: CreateSalesOrderDto,
    @Request() req: any,
  ) {
    const storeId = req.user?.store?.id;
    return this.salesOrdersService.create(createSalesOrderDto, storeId);
  }

  @Get()
  findAll() {
    return this.salesOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesOrdersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalesOrderDto: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(id, updateSalesOrderDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.salesOrdersService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesOrdersService.remove(id);
  }
}
