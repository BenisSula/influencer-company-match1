import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeatureFlagGuard } from '../../common/guards/feature-flag.guard';
import { Feature } from '../../common/decorators/feature.decorator';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ApplyCampaignDto } from './dto/apply-campaign.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CollaborationStatus } from './entities/collaboration.entity';
import { MilestoneStatus } from './entities/campaign-milestone.entity';

@Controller('campaigns')
@UseGuards(JwtAuthGuard, FeatureFlagGuard)
@Feature('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Campaign Management
  @Post()
  createCampaign(@Request() req: any, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(req.user.userId, dto);
  }

  @Get()
  getCampaigns(@Query() filters: any) {
    return this.campaignsService.getCampaigns(filters);
  }

  @Get('my-campaigns')
  getMyCampaigns(@Request() req: any) {
    return this.campaignsService.getMyCampaigns(req.user.userId);
  }

  @Get(':id')
  getCampaignById(@Param('id') id: string) {
    return this.campaignsService.getCampaignById(id);
  }

  @Put(':id')
  updateCampaign(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.updateCampaign(id, req.user.userId, dto);
  }

  @Delete(':id')
  deleteCampaign(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.deleteCampaign(id, req.user.userId);
  }

  // Application Management
  @Post(':id/apply')
  applyCampaign(@Param('id') id: string, @Request() req: any, @Body() dto: ApplyCampaignDto) {
    return this.campaignsService.applyCampaign(id, req.user.userId, dto);
  }

  @Get('my-applications/list')
  getMyApplications(@Request() req: any) {
    return this.campaignsService.getMyApplications(req.user.userId);
  }

  @Get('applications/received')
  getReceivedApplications(@Request() req: any) {
    return this.campaignsService.getReceivedApplications(req.user.userId);
  }

  @Delete('applications/:id')
  withdrawApplication(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.withdrawApplication(id, req.user.userId);
  }

  @Get(':id/applications')
  getCampaignApplications(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.getCampaignApplications(id, req.user.userId);
  }

  @Put('applications/:id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.campaignsService.updateApplicationStatus(id, req.user.userId, dto);
  }
}

@Controller('collaborations')
@UseGuards(JwtAuthGuard)
export class CollaborationsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  getMyCollaborations(@Request() req: any) {
    return this.campaignsService.getMyCollaborations(req.user.userId);
  }

  @Get(':id')
  getCollaborationById(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.getCollaborationById(id, req.user.userId);
  }

  @Put(':id/status')
  updateCollaborationStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body('status') status: CollaborationStatus,
  ) {
    return this.campaignsService.updateCollaborationStatus(id, req.user.userId, status);
  }

  @Post(':id/milestones')
  createMilestone(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.campaignsService.createMilestone(id, req.user.userId, dto);
  }

  @Put('milestones/:id')
  updateMilestone(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updates: { status?: MilestoneStatus; title?: string; description?: string; dueDate?: Date },
  ) {
    return this.campaignsService.updateMilestone(id, req.user.userId, updates);
  }
}
