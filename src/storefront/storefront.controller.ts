import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('homepage')
  getHomepage() {
    return this.storefrontService.getHomepage();
  }

  @Get('products')
  getProducts(@Query('brandId') brandId?: string) {
    return this.storefrontService.getProducts({ brandId });
  }

  @Get('products/:productId')
  getProduct(@Param('productId') productId: string) {
    return this.storefrontService.getProduct(productId);
  }

  @Get('categories')
  getCategories() {
    return this.storefrontService.getCategories();
  }

  @Post('orders')
  placeOrder(@Body() body: any) {
    return this.storefrontService.placeOrder(body);
  }
}
