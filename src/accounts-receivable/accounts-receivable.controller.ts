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
import { AccountsReceivableService } from './accounts-receivable.service';
import { CreateAccountsReceivableDto } from './dto/create-accounts-receivable.dto';
import { UpdateAccountsReceivableDto } from './dto/update-accounts-receivable.dto';
import { RecordArPaymentDto } from './dto/record-ar-payment.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('accounts-receivable')
@UseGuards(SupabaseAuthGuard)
export class AccountsReceivableController {
  constructor(private readonly service: AccountsReceivableService) {}

  @Post()
  create(@Body() dto: CreateAccountsReceivableDto, @Request() req: any) {
    return this.service.create(dto, req.user?.store?.id);
  }

  @Post('from-sales-order/:salesOrderId')
  createFromSalesOrder(
    @Param('salesOrderId') salesOrderId: string,
    @Request() req: any,
  ) {
    return this.service.createFromSalesOrder(salesOrderId, req.user?.store?.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.store?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/payments')
  findPayments(@Param('id') id: string) {
    return this.service.findPayments(id);
  }

  @Post(':id/payments')
  recordPayment(@Param('id') id: string, @Body() dto: RecordArPaymentDto) {
    return this.service.recordPayment(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountsReceivableDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
