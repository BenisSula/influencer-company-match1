import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { ModerationService } from '../services/moderation.service';

@Controller('admin/moderation')
@UseGuards(AdminAuthGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('flagged-content')
  async getFlaggedContent(
    @Query('status') status?: string,
    @Query('contentType') contentType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.getFlaggedContent({
      status,
      contentType,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Post('review/:id')
  async reviewFlag(
    @Param('id') flagId: string,
    @Body()
    body: {
      decision: 'APPROVED' | 'REJECTED' | 'REMOVED';
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.moderationService.reviewFlag(
      flagId,
      req.user.id,
      body.decision,
      body.notes,
    );
  }

  @Get('reported-users')
  async getReportedUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.getReportedUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post('ban-user/:userId')
  async banUser(
    @Param('userId') userId: string,
    @Body()
    body: {
      reason: string;
      type: 'TEMPORARY' | 'PERMANENT';
      expiresAt?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.moderationService.banUser(
      userId,
      req.user.id,
      body.reason,
      body.type,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
      body.notes,
    );
  }

  @Post('unban-user/:userId')
  async unbanUser(@Param('userId') userId: string) {
    return this.moderationService.unbanUser(userId);
  }

  @Get('banned-users')
  async getBannedUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.moderationService.getBannedUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('stats')
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }

  @Post('flag')
  async createFlag(
    @Body()
    body: {
      contentType: string;
      contentId: string;
      reporterId: string;
      reason: string;
      description?: string;
    },
  ) {
    return this.moderationService.createFlag(body);
  }
}
