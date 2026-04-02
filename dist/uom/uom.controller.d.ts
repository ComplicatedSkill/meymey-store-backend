import { UomService } from './uom.service';
import { CreateUomDto } from './dto/create-uom.dto';
import { UpdateUomDto } from './dto/update-uom.dto';
export declare class UomController {
    private readonly uomService;
    constructor(uomService: UomService);
    create(createUomDto: CreateUomDto, req: any): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateUomDto: UpdateUomDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
