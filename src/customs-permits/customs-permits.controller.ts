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
import { CustomsPermitsService } from './customs-permits.service';
import { CreateCustomsPermitDto } from './dto/create-customs-permit.dto';
import { UpdateCustomsPermitDto } from './dto/update-customs-permit.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('customs-permits')
@UseGuards(SupabaseAuthGuard)
export class CustomsPermitsController {
  constructor(private readonly service: CustomsPermitsService) {}

  @Post()
  create(@Body() dto: CreateCustomsPermitDto, @Request() req: any) {
    return this.service.create(dto, req.user?.store?.id);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user?.store?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomsPermitDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
