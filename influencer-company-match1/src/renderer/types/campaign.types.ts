export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  COMPLETED = 'completed',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum CollaborationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
}

export interface Campaign {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements?: string;
  budgetMin?: number;
  budgetMax?: number;
  niche?: string;
  platforms?: string[];
  deliverables?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    email: string;
    role: string;
    companyProfile?: {
      companyName: string;
      industry: string;
      avatarUrl?: string;
    };
  };
  applications?: CampaignApplication[];
  collaborations?: Collaboration[];
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  proposal: string;
  proposedRate?: number;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  campaign?: Campaign;
  influencer?: {
    id: string;
    email: string;
    role: string;
    influencerProfile?: {
      displayName: string;
      niche: string;
      platforms: string[];
      avatarUrl?: string;
    };
  };
  collaboration?: Collaboration;
}

export interface Collaboration {
  id: string;
  campaignId: string;
  applicationId: string;
  companyId: string;
  influencerId: string;
  status: CollaborationStatus;
  agreedRate?: number;
  deliverablesStatus: Record<string, any>;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  campaign?: Campaign;
  application?: CampaignApplication;
  company?: {
    id: string;
    email: string;
    companyProfile?: {
      companyName: string;
      avatarUrl?: string;
    };
  };
  influencer?: {
    id: string;
    email: string;
    influencerProfile?: {
      displayName: string;
      avatarUrl?: string;
    };
  };
  milestones?: CampaignMilestone[];
}

export interface CampaignMilestone {
  id: string;
  collaborationId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: MilestoneStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  collaboration?: Collaboration;
}

export interface CampaignFilters {
  niche?: string;
  budgetMin?: number;
  budgetMax?: number;
  platforms?: string[];
  status?: CampaignStatus;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  requirements?: string;
  budgetMin?: number;
  budgetMax?: number;
  niche?: string;
  platforms?: string[];
  deliverables?: string;
  status?: CampaignStatus;
  startDate?: string;
  endDate?: string;
  applicationDeadline?: string;
}

export interface ApplyCampaignData {
  proposal: string;
  proposedRate?: number;
}

export interface CreateMilestoneData {
  title: string;
  description?: string;
  dueDate?: string;
}
