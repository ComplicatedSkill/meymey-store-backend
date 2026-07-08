import { Module } from '@nestjs/common';
import { AccountsPayableService } from './accounts-payable.service';
import { AccountsPayableController } from './accounts-payable.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AccountsPayableController],
  providers: [AccountsPayableService],
  exports: [AccountsPayableService],
})
export class AccountsPayableModule {}
