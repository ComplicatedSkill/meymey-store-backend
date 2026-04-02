import { SupabaseService } from '../supabase/supabase.service';
export declare class UploadController {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    uploadLogo(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadProductImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadCategoryImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadPackageImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadBrandImage(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
