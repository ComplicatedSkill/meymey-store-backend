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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('payment-methods')
@UseGuards(SupabaseAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(@Body() createDto: CreatePaymentMethodDto, @Request() req: any) {
    const storeId = req.user?.store?.id;
    return this.paymentMethodsService.create(createDto, storeId);
  }

  @Get()
  findAll() {
    return this.paymentMethodsService.findAll();
  }

  @Get('active')
  findActive() {
    return this.paymentMethodsService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePaymentMethodDto) {
    return this.paymentMethodsService.update(id, updateDto);
  }

  @Post(':id/set-default')
  setDefault(@Param('id') id: string) {
    return this.paymentMethodsService.setDefault(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(id);
  }
}
