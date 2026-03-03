import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { SupabaseAuthGuard } from './supabase-auth.guard';

@Module({
  imports: [PassportModule, SupabaseModule],
  providers: [AuthService, JwtStrategy, SupabaseAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
