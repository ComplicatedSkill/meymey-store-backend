import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PurchaseInventoryService } from './purchase-inventory.service';
import { CreatePurchaseInventoryDto } from './dto/create-purchase-inventory.dto';
import { UpdatePurchaseInventoryDto } from './dto/update-purchase-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase-inventory')
@UseGuards(JwtAuthGuard)
export class PurchaseInventoryController {
  constructor(private readonly service: PurchaseInventoryService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseInventoryDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query('purchase_order_id') purchaseOrderId?: string) {
    if (purchaseOrderId) {
      return this.service.findByPurchaseOrder(purchaseOrderId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseInventoryDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
