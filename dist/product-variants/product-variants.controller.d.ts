import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
export declare class ProductVariantsController {
    private readonly service;
    constructor(service: ProductVariantsService);
    create(createDto: CreateProductVariantDto, req: any): Promise<any>;
    findAll(req: any, productId?: string): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateDto: UpdateProductVariantDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
