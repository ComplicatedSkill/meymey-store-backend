import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { StorefrontService } from './storefront.service';

@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  @Get('stores')
  getStores() {
    return this.storefrontService.getStores();
  }

  @Get(':storeId')
  getStore(@Param('storeId') storeId: string) {
    return this.storefrontService.getStore(storeId);
  }

  @Get(':storeId/products')
  getProducts(@Param('storeId') storeId: string) {
    return this.storefrontService.getProducts(storeId);
  }

  @Get(':storeId/products/:productId')
  getProduct(
    @Param('storeId') storeId: string,
    @Param('productId') productId: string,
  ) {
    return this.storefrontService.getProduct(storeId, productId);
  }

  @Get(':storeId/categories')
  getCategories(@Param('storeId') storeId: string) {
    return this.storefrontService.getCategories(storeId);
  }

  @Post(':storeId/orders')
  placeOrder(@Param('storeId') storeId: string, @Body() body: any) {
    return this.storefrontService.placeOrder(storeId, body);
  }
}
