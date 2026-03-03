import { Module } from '@nestjs/common';
import { StockAdjustmentsService } from './stock-adjustments.service';
import { StockAdjustmentsController } from './stock-adjustments.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { StockBatchesModule } from '../stock-batches/stock-batches.module';

@Module({
  imports: [SupabaseModule, StockBatchesModule],
  controllers: [StockAdjustmentsController],
  providers: [StockAdjustmentsService],
})
export class StockAdjustmentsModule {}
