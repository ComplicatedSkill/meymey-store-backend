import { SupabaseService } from '../supabase/supabase.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
export declare class AssetsService {
    private supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createAssetDto: CreateAssetDto): Promise<any>;
    findAll(status?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateAssetDto: UpdateAssetDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getTotalValue(): Promise<{
        totalPurchaseValue: number;
        totalCurrentValue: number;
        totalDepreciation: number;
        activeCount: number;
    }>;
}
