import { Module } from '@nestjs/common';
import { StockBatchesService } from './stock-batches.service';
import { StockBatchesController } from './stock-batches.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [StockBatchesController],
  providers: [StockBatchesService],
  exports: [StockBatchesService],
})
export class StockBatchesModule {}
