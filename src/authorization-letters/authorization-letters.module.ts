import { Module } from '@nestjs/common';
import { AuthorizationLettersService } from './authorization-letters.service';
import { AuthorizationLettersController } from './authorization-letters.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthorizationLettersController],
  providers: [AuthorizationLettersService],
  exports: [AuthorizationLettersService],
})
export class AuthorizationLettersModule {}
