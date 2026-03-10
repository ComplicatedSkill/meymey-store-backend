import { Module } from '@nestjs/common';
import { ProductPackagesService } from './product-packages.service';
import { ProductPackagesController } from './product-packages.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProductPackagesController],
  providers: [ProductPackagesService],
  exports: [ProductPackagesService],
})
export class ProductPackagesModule {}
