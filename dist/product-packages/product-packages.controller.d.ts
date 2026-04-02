import { ProductPackagesService } from './product-packages.service';
import { CreateProductPackageDto } from './dto/create-product-package.dto';
import { UpdateProductPackageDto } from './dto/update-product-package.dto';
export declare class ProductPackagesController {
    private readonly productPackagesService;
    constructor(productPackagesService: ProductPackagesService);
    create(createDto: CreateProductPackageDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateProductPackageDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
