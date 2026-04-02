import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    handleExternalOrder(body: any): Promise<{
        success: boolean;
        order_id: any;
    }>;
}
