import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    create(createBrandDto: CreateBrandDto): Promise<any>;
    update(id: string, updateBrandDto: UpdateBrandDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
