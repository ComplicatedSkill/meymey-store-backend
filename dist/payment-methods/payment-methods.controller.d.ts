import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
export declare class PaymentMethodsController {
    private readonly paymentMethodsService;
    constructor(paymentMethodsService: PaymentMethodsService);
    create(createDto: CreatePaymentMethodDto, req: any): Promise<any>;
    findAll(): Promise<any[]>;
    findActive(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePaymentMethodDto): Promise<any>;
    setDefault(id: string): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
