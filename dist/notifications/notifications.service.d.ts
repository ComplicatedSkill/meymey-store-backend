import { SupabaseService } from '../supabase/supabase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PushNotificationsService } from './push-notifications.service';
export declare class NotificationsService {
    private supabaseService;
    private pushNotificationsService;
    constructor(supabaseService: SupabaseService, pushNotificationsService: PushNotificationsService);
    create(createDto: CreateNotificationDto, storeId?: string): Promise<any>;
    findAll(unreadOnly?: boolean): Promise<any[]>;
    getUnreadCount(): Promise<{
        unread_count: number | null;
    }>;
    markAsRead(id: string): Promise<any>;
    markAllAsRead(): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    createLowStockNotification(storeId: string | undefined, productName: string, currentStock: number, reorderLevel: number): Promise<any>;
    createOrderStatusNotification(storeId: string | undefined, orderId: string, orderNumber: string, oldStatus: string, newStatus: string): Promise<any>;
    createPaymentNotification(storeId: string | undefined, invoiceNumber: string, amount: number): Promise<any>;
}
