import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductPackageDto } from './dto/create-product-package.dto';
import { UpdateProductPackageDto } from './dto/update-product-package.dto';
export declare class ProductPackagesService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    private get client();
    private readonly PACKAGE_SELECT;
    private attachStockLevel;
    create(dto: CreateProductPackageDto, storeId?: string): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateProductPackageDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getPackageItems(packageId: string): Promise<{
        product_id: any;
        variant_id: any;
        quantity: any;
    }[]>;
}
