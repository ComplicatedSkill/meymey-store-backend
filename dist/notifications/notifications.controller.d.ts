import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(unread?: string): Promise<any[]>;
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
    testPush(): Promise<any>;
}
