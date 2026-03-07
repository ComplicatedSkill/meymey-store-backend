import { Controller, Post, Body, Param, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('orders')
  async handleExternalOrder(@Body() body: any) {
    return this.webhooksService.handleExternalOrder(body);
  }
}
