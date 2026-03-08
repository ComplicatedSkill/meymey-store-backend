import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query('unread') unread?: string) {
    return this.notificationsService.findAll(unread === 'true');
  }

  @Get('unread-count')
  getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('read-all')
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }

  @Post('test-push')
  testPush() {
    return this.notificationsService.create(
      {
        type: 'system',
        title: 'Test Notification',
        message:
          'This is a manual test push notification to admin_notifications topic',
        data: { test: 'true' },
      },
      undefined,
    );
  }
}
