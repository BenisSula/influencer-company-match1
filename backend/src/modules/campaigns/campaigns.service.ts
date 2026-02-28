import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { CampaignApplication, ApplicationStatus } from './entities/campaign-application.entity';
import { Collaboration, CollaborationStatus } from './entities/collaboration.entity';
import { CampaignMilestone, MilestoneStatus } from './entities/campaign-milestone.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { ApplyCampaignDto } from './dto/apply-campaign.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignApplication)
    private applicationRepository: Repository<CampaignApplication>,
    @InjectRepository(Collaboration)
    private collaborationRepository: Repository<Collaboration>,
    @InjectRepository(CampaignMilestone)
    private milestoneRepository: Repository<CampaignMilestone>,
    private paymentsService: PaymentsService,
  ) {}

  // Campaign Management
  async createCampaign(companyId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      ...dto,
      companyId,
      status: dto.status as CampaignStatus || CampaignStatus.DRAFT,
    });

    return this.campaignRepository.save(campaign);
  }

  async updateCampaign(id: string, companyId: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.companyId !== companyId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    Object.assign(campaign, dto);
    return this.campaignRepository.save(campaign);
  }

  async deleteCampaign(id: string, companyId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.companyId !== companyId) {
      throw new ForbiddenException('You can only delete your own campaigns');
    }

    await this.campaignRepository.remove(campaign);
  }

  async getCampaigns(filters?: any): Promise<Campaign[]> {
    const query = this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.company', 'company')
      .where('campaign.status = :status', { status: CampaignStatus.ACTIVE });

    if (filters?.niche) {
      query.andWhere('campaign.niche = :niche', { niche: filters.niche });
    }

    if (filters?.budgetMin) {
      query.andWhere('campaign.budget_max >= :budgetMin', {
        budgetMin: filters.budgetMin,
      });
    }

    if (filters?.budgetMax) {
      query.andWhere('campaign.budget_min <= :budgetMax', {
        budgetMax: filters.budgetMax,
      });
    }

    if (filters?.platforms && filters.platforms.length > 0) {
      query.andWhere('campaign.platforms && :platforms', {
        platforms: filters.platforms,
      });
    }

    query.orderBy('campaign.created_at', 'DESC');

    const campaigns = await query.getMany();

    // Manually attach company profile data
    const campaignsWithProfiles = await Promise.all(
      campaigns.map(async (campaign) => {
        const profileData = await this.campaignRepository.query(
          'SELECT company_name, industry, avatar_url FROM company_profiles WHERE user_id = $1',
          [campaign.companyId],
        );

        if (profileData && profileData[0]) {
          campaign.company = {
            ...campaign.company,
            companyProfile: {
              companyName: profileData[0].company_name,
              industry: profileData[0].industry,
              avatarUrl: profileData[0].avatar_url,
            },
          } as any;
        }

        return campaign;
      }),
    );

    return campaignsWithProfiles;
  }

  async getCampaignById(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['company', 'applications'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Manually fetch company profile
    const profileData = await this.campaignRepository.query(
      'SELECT company_name, industry, avatar_url, website, description FROM company_profiles WHERE user_id = $1',
      [campaign.companyId]
    );
    
    if (profileData && profileData[0]) {
      campaign.company = {
        ...campaign.company,
        companyProfile: {
          companyName: profileData[0].company_name,
          industry: profileData[0].industry,
          avatarUrl: profileData[0].avatar_url,
          website: profileData[0].website,
          description: profileData[0].description
        }
      } as any;
    }

    return campaign;
  }

  async getMyCampaigns(companyId: string): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { companyId },
      relations: ['applications'],
      order: { createdAt: 'DESC' },
    });
  }

  // Application Management
  async applyCampaign(campaignId: string, influencerId: string, dto: ApplyCampaignDto): Promise<CampaignApplication> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not accepting applications');
    }

    // Check if already applied
    const existingApplication = await this.applicationRepository.findOne({
      where: { campaignId, influencerId },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied to this campaign');
    }

    const application = this.applicationRepository.create({
      campaignId,
      influencerId,
      ...dto,
      status: ApplicationStatus.PENDING,
    });

    return this.applicationRepository.save(application);
  }

  async getMyApplications(influencerId: string): Promise<CampaignApplication[]> {
    return this.applicationRepository.find({
      where: { influencerId },
      relations: ['campaign', 'campaign.company'],
      order: { appliedAt: 'DESC' },
    });
  }

  async getReceivedApplications(companyId: string): Promise<CampaignApplication[]> {
    // Get all campaigns by this company
    const campaigns = await this.campaignRepository.find({
      where: { companyId },
      select: ['id'],
    });

    if (campaigns.length === 0) {
      return [];
    }

    const campaignIds = campaigns.map((c) => c.id);

    // Get all applications for these campaigns
    return this.applicationRepository.find({
      where: campaignIds.map((id) => ({ campaignId: id })),
      relations: ['campaign', 'influencer', 'influencer.influencerProfile'],
      order: { appliedAt: 'DESC' },
    });
  }

  async withdrawApplication(id: string, influencerId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({ where: { id } });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.influencerId !== influencerId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Can only withdraw pending applications');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await this.applicationRepository.save(application);
  }

  async getCampaignApplications(campaignId: string, companyId: string): Promise<CampaignApplication[]> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId } });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.companyId !== companyId) {
      throw new ForbiddenException('You can only view applications for your own campaigns');
    }

    return this.applicationRepository.find({
      where: { campaignId },
      relations: ['influencer', 'influencer.influencerProfile'],
      order: { appliedAt: 'DESC' },
    });
  }

  async updateApplicationStatus(
    id: string,
    companyId: string,
    dto: UpdateApplicationDto,
  ): Promise<CampaignApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['campaign'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.campaign.companyId !== companyId) {
      throw new ForbiddenException('You can only review applications for your own campaigns');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    application.status = dto.status;
    application.reviewedAt = new Date();

    const updatedApplication = await this.applicationRepository.save(application);

    // If accepted, create collaboration
    if (dto.status === ApplicationStatus.ACCEPTED) {
      await this.createCollaboration(application);
    }

    return updatedApplication;
  }

  // Collaboration Management
  private async createCollaboration(application: CampaignApplication): Promise<Collaboration> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: application.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const collaboration = this.collaborationRepository.create({
      campaignId: application.campaignId,
      applicationId: application.id,
      companyId: campaign.companyId,
      influencerId: application.influencerId,
      agreedRate: application.proposedRate,
      status: CollaborationStatus.ACTIVE,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    });

    const savedCollaboration = await this.collaborationRepository.save(collaboration);

    // Create payment for this collaboration
    try {
      await this.paymentsService.createCollaborationPayment(
        savedCollaboration.id,
        campaign.companyId,
        application.influencerId,
        application.proposedRate || campaign.budgetMax,
      );
    } catch (error) {
      // Log error but don't block collaboration creation
      console.error('Failed to create payment for collaboration:', error);
    }

    return savedCollaboration;
  }

  async getMyCollaborations(userId: string): Promise<Collaboration[]> {
    return this.collaborationRepository.find({
      where: [{ companyId: userId }, { influencerId: userId }],
      relations: ['campaign', 'company', 'influencer', 'milestones'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCollaborationById(id: string, userId: string): Promise<Collaboration> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id },
      relations: ['campaign', 'company', 'influencer', 'application', 'milestones'],
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.companyId !== userId && collaboration.influencerId !== userId) {
      throw new ForbiddenException('You can only view your own collaborations');
    }

    return collaboration;
  }

  async updateCollaborationStatus(
    id: string,
    userId: string,
    status: CollaborationStatus,
  ): Promise<Collaboration> {
    const collaboration = await this.collaborationRepository.findOne({ where: { id } });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.companyId !== userId && collaboration.influencerId !== userId) {
      throw new ForbiddenException('You can only update your own collaborations');
    }

    collaboration.status = status;
    return this.collaborationRepository.save(collaboration);
  }

  // Milestone Management
  async createMilestone(collaborationId: string, userId: string, dto: CreateMilestoneDto): Promise<CampaignMilestone> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId },
    });

    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }

    if (collaboration.companyId !== userId && collaboration.influencerId !== userId) {
      throw new ForbiddenException('You can only add milestones to your own collaborations');
    }

    const milestone = this.milestoneRepository.create({
      collaborationId,
      ...dto,
      status: MilestoneStatus.PENDING,
    });

    return this.milestoneRepository.save(milestone);
  }

  async updateMilestone(
    id: string,
    userId: string,
    updates: Partial<CampaignMilestone>,
  ): Promise<CampaignMilestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['collaboration'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    if (
      milestone.collaboration.companyId !== userId &&
      milestone.collaboration.influencerId !== userId
    ) {
      throw new ForbiddenException('You can only update milestones for your own collaborations');
    }

    Object.assign(milestone, updates);

    if (updates.status === MilestoneStatus.COMPLETED && !milestone.completedAt) {
      milestone.completedAt = new Date();
    }

    return this.milestoneRepository.save(milestone);
  }
}
