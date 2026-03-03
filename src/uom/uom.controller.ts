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
import { UomService } from './uom.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('uom')
@UseGuards(SupabaseAuthGuard)
export class UomController {
  constructor(private readonly uomService: UomService) {}

  @Post()
  create(@Body() createUomDto: CreateUomDto, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.uomService.create(createUomDto, storeId);
  }

  @Get()
  findAll(@Request() req: any) {
    const storeId = req.user.store?.id;
    return this.uomService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.uomService.findOne(id, storeId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUomDto: UpdateUomDto,
    @Request() req: any,
  ) {
    const storeId = req.user.store?.id;
    return this.uomService.update(id, updateUomDto, storeId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const storeId = req.user.store?.id;
    return this.uomService.remove(id, storeId);
  }
}
