import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req, @Query('limit') limit?: string) {
    const userId = req.user.sub || req.user.userId;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.notificationsService.getNotifications(userId, limitNum);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Put(':id/read')
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.sub || req.user.userId;
    await this.notificationsService.markAsRead(notificationId, userId);
    return { success: true };
  }

  @Put('read-all')
  async markAllAsRead(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}
