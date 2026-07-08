import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TelegramOrdersService,
  TelegramUser,
  OrderItem,
  ReceiptItem,
  ReceiptCharge,
} from './telegram-orders.service';

class OrderItemDto implements OrderItem {
  @IsString() name: string;
  @IsNumber() qty: number;
  @IsNumber() price: number;
}

class TelegramUserDto implements TelegramUser {
  @IsNumber() id: number;
  @IsString() firstName: string;
  @IsString() @IsOptional() lastName?: string;
  @IsString() @IsOptional() username?: string;
}

class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber() total: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  user: TelegramUserDto | null;
}

class ReceiptItemDto implements ReceiptItem {
  @IsString() name: string;
  @IsNumber() qty: number;
  @IsNumber() unit_price: number;
  @IsOptional() @IsNumber() total?: number;
  @IsOptional() @IsNumber() @Min(0) discount?: number;
}

class ReceiptChargeDto implements ReceiptCharge {
  @IsString() label: string;
  @IsNumber() amount: number;
}

class SendReceiptDto {
  @IsString() order_number: string;

  @IsOptional() @IsString() customer_name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsNumber() subtotal: number;

  @IsOptional() @IsNumber() @Min(0) discount?: number;

  @IsOptional() @IsNumber() @Min(0) tax?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptChargeDto)
  additional_charges?: ReceiptChargeDto[];

  @IsNumber() total: number;

  @IsOptional() @IsString() payment_type?: string;

  @IsOptional() @IsString() status?: string;
}

@Controller('telegram-orders')
export class TelegramOrdersController {
  constructor(private readonly service: TelegramOrdersService) {}

  @Post('checkout')
  @HttpCode(200)
  async checkout(@Body() body: CheckoutDto) {
    await this.service.sendOrderToGroup(body);
    return { ok: true };
  }

  @Post('receipt')
  @HttpCode(200)
  async receipt(@Body() body: SendReceiptDto) {
    await this.service.sendReceipt(body);
    return { ok: true };
  }
}
