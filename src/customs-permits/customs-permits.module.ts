import { Module } from '@nestjs/common';
import { CustomsPermitsService } from './customs-permits.service';
import { CustomsPermitsController } from './customs-permits.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CustomsPermitsController],
  providers: [CustomsPermitsService],
  exports: [CustomsPermitsService],
})
export class CustomsPermitsModule {}
