import { Module } from '@nestjs/common';
import { ProductUomConversionsService } from './product-uom-conversions.service';
import { ProductUomConversionsController } from './product-uom-conversions.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProductUomConversionsController],
  providers: [ProductUomConversionsService],
  exports: [ProductUomConversionsService],
})
export class ProductUomConversionsModule {}
