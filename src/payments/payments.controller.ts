import {
  Body,
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-qr')
  @UseGuards(SupabaseAuthGuard)
  async createPaymentQr(@Body() body: { invoiceId: string; amount: number }) {
    return this.paymentsService.createPaymentQr(body.invoiceId, body.amount);
  }

  @Get('check')
  @UseGuards(SupabaseAuthGuard)
  async checkStatus(@Query('tranId') tranId: string) {
    return this.paymentsService.checkTransaction(tranId);
  }

  // Public endpoints for website checkout
  @Post('generate-qr')
  async generateWebsiteQr(@Body() body: { amount: number; customerInfo: any }) {
    return this.paymentsService.generateWebsiteQr(
      body.amount,
      body.customerInfo,
    );
  }

  @Get('check-status/:tranId')
  async checkWebsiteStatus(@Param('tranId') tranId: string) {
    return this.paymentsService.checkTransaction(tranId);
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }

  @Post('manual')
  @UseGuards(SupabaseAuthGuard)
  async recordManualPayment(
    @Body()
    body: {
      invoiceId?: string;
      salesOrderId?: string;
      amount: number;
      paymentMethodId: string;
      notes?: string;
    },
  ) {
    return this.paymentsService.recordManualPayment(body);
  }

  @Get('invoice/:invoiceId')
  @UseGuards(SupabaseAuthGuard)
  async getPaymentsByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentsService.findByInvoice(invoiceId);
  }
}
