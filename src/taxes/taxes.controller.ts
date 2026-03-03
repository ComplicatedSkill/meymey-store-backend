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
import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('taxes')
@UseGuards(SupabaseAuthGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Post()
  create(@Body() createDto: CreateTaxDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.taxesService.create(createDto, storeId);
  }

  @Get()
  findAll(@Request() req: any) {
    const storeId = req.user.store?.id;
    return this.taxesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.taxesService.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaxDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.taxesService.update(id, updateDto, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.taxesService.remove(id, storeId);
  }
}
