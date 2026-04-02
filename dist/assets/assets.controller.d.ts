import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsController {
    private readonly assetsService;
    constructor(assetsService: AssetsService);
    create(createAssetDto: CreateAssetDto): Promise<any>;
    findAll(status?: string): Promise<any[]>;
    getTotalValue(): Promise<{
        totalPurchaseValue: number;
        totalCurrentValue: number;
        totalDepreciation: number;
        activeCount: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateAssetDto: UpdateAssetDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
