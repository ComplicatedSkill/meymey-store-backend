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
import { AccountsPayableService } from './accounts-payable.service';
import { CreateAccountsPayableDto } from './dto/create-accounts-payable.dto';
import { UpdateAccountsPayableDto } from './dto/update-accounts-payable.dto';
import { RecordApPaymentDto } from './dto/record-ap-payment.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('accounts-payable')
@UseGuards(SupabaseAuthGuard)
export class AccountsPayableController {
  constructor(private readonly service: AccountsPayableService) {}

  @Post()
  create(@Body() dto: CreateAccountsPayableDto, @Request() req: any) {
    return this.service.create(dto, req.user?.store?.id);
  }

  @Post('from-purchase-order/:purchaseOrderId')
  createFromPurchaseOrder(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Request() req: any,
  ) {
    return this.service.createFromPurchaseOrder(
      purchaseOrderId,
      req.user?.store?.id,
    );
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
  recordPayment(@Param('id') id: string, @Body() dto: RecordApPaymentDto) {
    return this.service.recordPayment(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAccountsPayableDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
