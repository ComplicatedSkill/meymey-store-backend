import { Module } from '@nestjs/common';
import { TelegramOrdersController } from './telegram-orders.controller';
import { TelegramOrdersService } from './telegram-orders.service';

@Module({
  controllers: [TelegramOrdersController],
  providers: [TelegramOrdersService],
})
export class TelegramOrdersModule {}
