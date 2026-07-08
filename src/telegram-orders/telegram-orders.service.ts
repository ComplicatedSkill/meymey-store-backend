import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { renderReceiptImage } from './receipt-image';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface CheckoutPayload {
  items: OrderItem[];
  total: number;
  user: TelegramUser | null;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  unit_price: number;
  total?: number;
  discount?: number;
}

export interface ReceiptCharge {
  label: string;
  amount: number;
}

export interface ReceiptPayload {
  order_number: string;
  customer_name?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount?: number;
  tax?: number;
  additional_charges?: ReceiptCharge[];
  total: number;
  payment_type?: string;
  status?: string;
}

@Injectable()
export class TelegramOrdersService {
  private readonly logger = new Logger(TelegramOrdersService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOrderToGroup(payload: CheckoutPayload): Promise<void> {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_GROUP_CHAT_ID');

    if (!botToken || !chatId) {
      this.logger.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID not set');
      throw new Error('Telegram bot not configured');
    }

    const { items, total, user } = payload;

    const userName = user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : 'Unknown';
    const userHandle = user?.username ? ` (@${user.username})` : '';
    const userId = user ? `\n🆔 <b>Telegram ID:</b> <code>${user.id}</code>` : '';

    const itemLines = items
      .map((i) => `• ${i.qty}x ${i.name} — <b>$${(i.price * i.qty).toFixed(2)}</b>`)
      .join('\n');

    const now = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const text = [
      `🛍 <b>New Order!</b>`,
      ``,
      `👤 <b>Customer:</b> ${userName}${userHandle}${userId}`,
      ``,
      `📦 <b>Items:</b>`,
      itemLines,
      ``,
      `💰 <b>Total: $${total.toFixed(2)}</b>`,
      ``,
      `🕐 ${now}`,
    ].join('\n');

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      { chat_id: chatId, text, parse_mode: 'HTML' },
    );
  }

  /** Sends a POS sale receipt to the group as a designed receipt image. */
  async sendReceipt(payload: ReceiptPayload): Promise<void> {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_GROUP_CHAT_ID');

    if (!botToken || !chatId) {
      this.logger.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_GROUP_CHAT_ID not set');
      throw new Error('Telegram bot not configured');
    }

    const png = await renderReceiptImage(payload);

    const isAr = (payload.payment_type ?? '').toUpperCase() === 'AR';
    const isDraft = (payload.status ?? '').toUpperCase() === 'DRAFT';
    const captionStatus = isAr ? '⏳ AR' : isDraft ? '📝 Quotation' : '✅ Completed';
    const caption = `🧾 ${payload.order_number} · $${payload.total.toFixed(2)} · ${captionStatus}`;

    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('photo', png, { filename: 'receipt.png', contentType: 'image/png' });

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      form,
      { headers: form.getHeaders() },
    );
  }
}
