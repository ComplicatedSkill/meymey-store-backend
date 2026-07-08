import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthorizationLettersService } from './authorization-letters.service';
import { CreateAuthorizationLetterDto } from './dto/create-authorization-letter.dto';
import { UpdateAuthorizationLetterDto } from './dto/update-authorization-letter.dto';
import { UpdateAuthorizationDefaultsDto } from './dto/update-defaults.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('authorization-letters')
@UseGuards(SupabaseAuthGuard)
export class AuthorizationLettersController {
  constructor(private readonly service: AuthorizationLettersService) {}

  // ── Defaults (declared before :id so the path is not captured by it) ──
  @Get('defaults')
  getDefaults(@Request() req: any) {
    return this.service.getDefaults(req.user?.store?.id);
  }

  @Put('defaults')
  updateDefaults(
    @Body() dto: UpdateAuthorizationDefaultsDto,
    @Request() req: any,
  ) {
    return this.service.updateDefaults(dto, req.user?.store?.id);
  }

  // ── Letters ──────────────────────────────────────────────────────────
  @Post()
  create(@Body() dto: CreateAuthorizationLetterDto, @Request() req: any) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAuthorizationLetterDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
