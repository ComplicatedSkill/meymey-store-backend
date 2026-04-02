import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class WebhooksService {
    private supabaseService;
    private notificationsService;
    constructor(supabaseService: SupabaseService, notificationsService: NotificationsService);
    handleExternalOrder(orderData: any): Promise<{
        success: boolean;
        order_id: any;
    }>;
}
