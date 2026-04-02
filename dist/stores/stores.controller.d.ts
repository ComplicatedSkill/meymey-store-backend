import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    create(createStoreDto: CreateStoreDto, req: any): Promise<any>;
    findAll(req: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateStoreDto: UpdateStoreDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
