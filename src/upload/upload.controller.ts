import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    try {
      const publicUrl = await this.supabaseService.uploadFile(
        'stores',
        filePath,
        file.buffer,
        file.mimetype,
      );

      return { url: publicUrl };
    } catch (error) {
      throw new BadRequestException('Failed to upload logo: ' + error.message);
    }
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    try {
      const publicUrl = await this.supabaseService.uploadFile(
        'stores',
        filePath,
        file.buffer,
        file.mimetype,
      );

      return { url: publicUrl };
    } catch (error) {
      throw new BadRequestException(
        'Failed to upload product image: ' + error.message,
      );
    }
  }

  @Post('category')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    try {
      const publicUrl = await this.supabaseService.uploadFile(
        'stores',
        filePath,
        file.buffer,
        file.mimetype,
      );

      return { url: publicUrl };
    } catch (error) {
      throw new BadRequestException(
        'Failed to upload category image: ' + error.message,
      );
    }
  }

  @Post('brand')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBrandImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    try {
      const publicUrl = await this.supabaseService.uploadFile(
        'stores',
        filePath,
        file.buffer,
        file.mimetype,
      );

      return { url: publicUrl };
    } catch (error) {
      throw new BadRequestException(
        'Failed to upload brand image: ' + error.message,
      );
    }
  }
}
