import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PushNotificationsService } from './push-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    private supabaseService: SupabaseService,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async create(createDto: CreateNotificationDto, storeId?: string) {
    const payload: any = { ...createDto };
    if (storeId) payload.store_id = storeId;
    const { data: notification, error } = await this.supabaseService
      .getClient()
      .from('notifications')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    // Trigger push notification to a global admin topic
    // This allows administrators to receive alerts regardless of their current store context
    try {
      await this.pushNotificationsService.sendToTopic(
        'admin_notifications',
        notification.title,
        notification.message,
        notification.data,
      );
    } catch (e) {
      console.error('Failed to send push notification to global topic:', e);
    }

    return notification;
  }

  async findAll(unreadOnly: boolean = false) {
    let query = this.supabaseService
      .getClient()
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (unreadOnly) query = query.eq('is_read', false);
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data;
  }

  async getUnreadCount() {
    const { count, error } = await this.supabaseService
      .getClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    if (error) throw error;
    return { unread_count: count };
  }

  async markAsRead(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markAllAsRead() {
    const { error } = await this.supabaseService
      .getClient()
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    if (error) throw error;
    return { message: 'All notifications marked as read' };
  }

  async remove(id: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Notification deleted successfully' };
  }

  async createLowStockNotification(
    storeId: string | undefined,
    productName: string,
    currentStock: number,
    reorderLevel: number,
  ) {
    return this.create(
      {
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${productName} is running low. Current stock: ${currentStock}, Reorder level: ${reorderLevel}`,
        data: {
          product_name: productName,
          current_stock: currentStock,
          reorder_level: reorderLevel,
        },
      },
      storeId,
    );
  }

  async createOrderStatusNotification(
    storeId: string | undefined,
    orderId: string,
    orderNumber: string,
    oldStatus: string,
    newStatus: string,
  ) {
    return this.create(
      {
        type: 'order_status',
        title: 'Order Status Updated',
        message: `Order ${orderNumber} status changed from ${oldStatus} to ${newStatus}`,
        data: {
          order_id: orderId,
          order_number: orderNumber,
          old_status: oldStatus,
          new_status: newStatus,
        },
      },
      storeId,
    );
  }

  async createPaymentNotification(
    storeId: string | undefined,
    invoiceNumber: string,
    amount: number,
  ) {
    return this.create(
      {
        type: 'payment_received',
        title: 'Payment Received',
        message: `Payment of ${amount} received for invoice ${invoiceNumber}`,
        data: { invoice_number: invoiceNumber, amount },
      },
      storeId,
    );
  }
}
