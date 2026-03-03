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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('invoices')
@UseGuards(SupabaseAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.invoicesService.create(createInvoiceDto, storeId);
  }

  @Post('from-order/:orderId')
  createFromSalesOrder(@Param('orderId') orderId: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.invoicesService.createFromSalesOrder(orderId, storeId);
  }

  @Get()
  findAll(@Request() req: any) {
    const storeId = req.user.store?.id;
    return this.invoicesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.invoicesService.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.invoicesService.update(id, updateInvoiceDto, storeId);
  }

  @Post(':id/payment')
  recordPayment(
    @Param('id') id: string,
    @Body() recordPaymentDto: RecordPaymentDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.invoicesService.recordPayment(id, recordPaymentDto, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.invoicesService.remove(id, storeId);
  }
}
