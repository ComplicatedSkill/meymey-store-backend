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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('stores')
@UseGuards(SupabaseAuthGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  create(@Body() createStoreDto: CreateStoreDto, @Request() req: any) {
    return this.storesService.create(createStoreDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.storesService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.storesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req: any,
  ) {
    return this.storesService.update(id, updateStoreDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.storesService.remove(id, req.user.userId);
  }
}
