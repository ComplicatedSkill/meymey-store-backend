import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TelegramOrdersService, TelegramUser, OrderItem } from './telegram-orders.service';

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

@Controller('telegram-orders')
export class TelegramOrdersController {
  constructor(private readonly service: TelegramOrdersService) {}

  @Post('checkout')
  @HttpCode(200)
  async checkout(@Body() body: CheckoutDto) {
    await this.service.sendOrderToGroup(body);
    return { ok: true };
  }
}
