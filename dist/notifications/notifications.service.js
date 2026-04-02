"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const push_notifications_service_1 = require("./push-notifications.service");
let NotificationsService = class NotificationsService {
    constructor(supabaseService, pushNotificationsService) {
        this.supabaseService = supabaseService;
        this.pushNotificationsService = pushNotificationsService;
    }
    async create(createDto, storeId) {
        const payload = { ...createDto };
        if (storeId)
            payload.store_id = storeId;
        const { data: notification, error } = await this.supabaseService
            .getAdminClient()
            .from('notifications')
            .insert(payload)
            .select()
            .single();
        if (error)
            throw error;
        try {
            await this.pushNotificationsService.sendToTopic('admin_notifications', notification.title, notification.message, notification.data);
        }
        catch (e) {
            console.error('Failed to send push notification to global topic:', e);
        }
        return notification;
    }
    async findAll(unreadOnly = false) {
        let query = this.supabaseService
            .getAdminClient()
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (unreadOnly)
            query = query.eq('is_read', false);
        const { data, error } = await query.limit(100);
        if (error)
            throw error;
        return data;
    }
    async getUnreadCount() {
        const { count, error } = await this.supabaseService
            .getAdminClient()
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
        if (error)
            throw error;
        return { unread_count: count };
    }
    async markAsRead(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    async markAllAsRead() {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false);
        if (error)
            throw error;
        return { message: 'All notifications marked as read' };
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .from('notifications')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        return { message: 'Notification deleted successfully' };
    }
    async createLowStockNotification(storeId, productName, currentStock, reorderLevel) {
        return this.create({
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: `${productName} is running low. Current stock: ${currentStock}, Reorder level: ${reorderLevel}`,
            data: {
                product_name: productName,
                current_stock: currentStock,
                reorder_level: reorderLevel,
            },
        }, storeId);
    }
    async createOrderStatusNotification(storeId, orderId, orderNumber, oldStatus, newStatus) {
        return this.create({
            type: 'order_status',
            title: 'Order Status Updated',
            message: `Order ${orderNumber} status changed from ${oldStatus} to ${newStatus}`,
            data: {
                order_id: orderId,
                order_number: orderNumber,
                old_status: oldStatus,
                new_status: newStatus,
            },
        }, storeId);
    }
    async createPaymentNotification(storeId, invoiceNumber, amount) {
        return this.create({
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of ${amount} received for invoice ${invoiceNumber}`,
            data: { invoice_number: invoiceNumber, amount },
        }, storeId);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        push_notifications_service_1.PushNotificationsService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map