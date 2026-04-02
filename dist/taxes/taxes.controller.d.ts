import { TaxesService } from './taxes.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
export declare class TaxesController {
    private readonly taxesService;
    constructor(taxesService: TaxesService);
    create(createDto: CreateTaxDto, req: any): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    update(id: string, updateDto: UpdateTaxDto, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
