import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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
}
