# Design Document: Complete Platform Features

## Overview

This design document specifies the technical implementation for the complete feature set of the Influencer-Company Matching Platform. The platform builds upon the existing MVP (authentication, basic profiles, matching algorithm, basic feed) to deliver a comprehensive B2B collaboration intelligence platform.

The implementation follows a modular architecture using NestJS for the backend and React with Electron for the frontend. The design is organized into 8 phases that can be implemented incrementally while maintaining backward compatibility with existing functionality.

### Design Goals

- Maintain backward compatibility with existing MVP features
- Follow established architectural patterns (NestJS modules, React components)
- Optimize for performance using Redis caching and database indexing
- Ensure real-time capabilities using WebSocket for messaging and notifications
- Support scalability through stateless backend design
- Maintain data integrity through comprehensive validation

### Technology Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, Socket.io
- **Frontend**: React, TypeScript, Electron, React Query
- **Real-time**: WebSocket (Socket.io)
- **Caching**: Redis
- **Testing**: Jest, React Testing Library, fast-check (property-based testing)

## Architecture

### System Architecture

The platform follows a three-tier architecture:

1. **Presentation Layer** (Electron + React)
   - Desktop application with React renderer
   - Component-based UI with feature modules
   - State management using React Query for server state
   - WebSocket client for real-time updates

2. **Application Layer** (NestJS)
   - RESTful API for CRUD operations
   - WebSocket gateway for real-time features
   - Service layer for business logic
   - Repository pattern for data access
   - JWT-based authentication with role guards

3. **Data Layer** (PostgreSQL + Redis)
   - PostgreSQL for persistent data storage
   - Redis for caching and session management
   - TypeORM for database abstraction
   - Indexed columns for query optimization

### Module Organization

The backend is organized into feature modules following NestJS conventions:

```
backend/src/modules/
├── auth/              # Existing - Authentication
├── users/             # Existing - User management
├── profiles/          # Enhanced - Profile management
├── matching/          # Existing - Matching algorithm
├── interactions/      # New - Bookmarks, requests, invites
├── feed/              # New - Posts, likes, comments
├── messaging/         # New - Real-time messaging
├── campaigns/         # New - Campaign management
├── collaborations/    # New - Collaboration tracking
└── analytics/         # New - Analytics and insights
```



## Components and Interfaces

### Phase 1: Enhanced Profile Fields

#### Backend Components

**Enhanced Entities**

```typescript
// InfluencerProfile Entity (Enhanced)
@Entity('influencer_profiles')
export class InfluencerProfile {
  // Existing fields...
  
  // New fields
  @Column('simple-array')
  contentType: string[]; // ['video', 'image', 'blog', 'podcast']
  
  @Column({ nullable: true })
  collaborationPreference: string; // 'one-time', 'long-term', 'flexible'
  
  @Column({ default: false })
  verificationStatus: boolean;
  
  @Column({ type: 'json', nullable: true })
  mediaGallery: MediaItem[];
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

// CompanyProfile Entity (Enhanced)
@Entity('company_profiles')
export class CompanyProfile {
  // Existing fields...
  
  // New fields
  @Column({ nullable: true })
  companySize: string; // 'startup', 'small', 'medium', 'large', 'enterprise'
  
  @Column('simple-array')
  campaignType: string[]; // ['product-launch', 'brand-awareness', 'event', 'sponsored-content']
  
  @Column('simple-array')
  preferredInfluencerNiches: string[];
  
  @Column({ nullable: true })
  collaborationDuration: string; // 'short-term', 'medium-term', 'long-term'
  
  @Column({ default: false })
  verificationStatus: boolean;
}
```

**DTOs**

```typescript
// Update Influencer Profile DTO
export class UpdateInfluencerProfileDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentType?: string[];
  
  @IsOptional()
  @IsString()
  @IsIn(['one-time', 'long-term', 'flexible'])
  collaborationPreference?: string;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  mediaGallery?: MediaItemDto[];
}

export class MediaItemDto {
  @IsString()
  url: string;
  
  @IsString()
  @IsIn(['image', 'video'])
  type: 'image' | 'video';
  
  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;
}

// Update Company Profile DTO
export class UpdateCompanyProfileDto {
  @IsOptional()
  @IsString()
  @IsIn(['startup', 'small', 'medium', 'large', 'enterprise'])
  companySize?: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignType?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredInfluencerNiches?: string[];
  
  @IsOptional()
  @IsString()
  @IsIn(['short-term', 'medium-term', 'long-term'])
  collaborationDuration?: string;
}
```

**API Endpoints**

```
PATCH /api/profiles/influencer/:id
  - Update influencer profile with new fields
  - Validate media gallery items
  - Return updated profile

PATCH /api/profiles/company/:id
  - Update company profile with new fields
  - Return updated profile

POST /api/profiles/influencer/:id/media
  - Upload media to gallery
  - Validate file type and size (max 10MB)
  - Return media item with URL

DELETE /api/profiles/influencer/:id/media/:mediaId
  - Remove media from gallery
  - Return success status
```

#### Frontend Components

**Enhanced Profile Forms**

```typescript
// InfluencerProfileForm Component
interface InfluencerProfileFormProps {
  profile: InfluencerProfile;
  onSave: (data: UpdateInfluencerProfileDto) => Promise<void>;
}

// Features:
// - Multi-select for content types
// - Radio buttons for collaboration preference
// - Media gallery upload with preview
// - Drag-and-drop file upload
// - Image/video preview with captions
// - Delete media functionality

// CompanyProfileForm Component
interface CompanyProfileFormProps {
  profile: CompanyProfile;
  onSave: (data: UpdateCompanyProfileDto) => Promise<void>;
}

// Features:
// - Dropdown for company size
// - Multi-select for campaign types
// - Multi-select for preferred niches
// - Radio buttons for collaboration duration
```



### Phase 2: Advanced Filtering System

#### Backend Components

**Filter DTOs**

```typescript
export class MatchFiltersDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niches?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  locations?: string[];
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  minBudget?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBudget?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAudienceSize?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAudienceSize?: number;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minEngagementRate?: number;
  
  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contentTypes?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collaborationPreferences?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignTypes?: string[];
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  companySizes?: string[];
  
  @IsOptional()
  @IsString()
  @IsIn(['score', 'audienceSize', 'engagementRate', 'recentActivity'])
  sortBy?: string;
  
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

**Filter Preset Entity**

```typescript
@Entity('filter_presets')
export class FilterPreset {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user: User;
  
  @Column()
  name: string;
  
  @Column({ type: 'json' })
  filters: MatchFiltersDto;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Enhanced Matching Service**

```typescript
@Injectable()
export class MatchingService {
  constructor(
    private readonly matchingRepository: MatchingRepository,
    private readonly cacheService: CacheService,
  ) {}
  
  async findMatchesWithFilters(
    userId: string,
    filters: MatchFiltersDto,
  ): Promise<PaginatedMatchResponse> {
    // Build query with filters
    const query = this.buildFilterQuery(userId, filters);
    
    // Apply sorting
    this.applySorting(query, filters.sortBy, filters.sortOrder);
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    
    const [matches, total] = await query.skip(skip).take(limit).getManyAndCount();
    
    return {
      data: matches,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  private buildFilterQuery(userId: string, filters: MatchFiltersDto): SelectQueryBuilder {
    // Implementation builds TypeORM query with all filter conditions
  }
  
  private applySorting(query: SelectQueryBuilder, sortBy: string, order: string): void {
    // Implementation applies sorting logic
  }
}
```

**Filter Preset Service**

```typescript
@Injectable()
export class FilterPresetService {
  constructor(
    @InjectRepository(FilterPreset)
    private readonly presetRepository: Repository<FilterPreset>,
  ) {}
  
  async createPreset(userId: string, dto: CreateFilterPresetDto): Promise<FilterPreset> {
    const count = await this.presetRepository.count({ where: { user: { id: userId } } });
    
    if (count >= 10) {
      throw new BadRequestException('Maximum of 10 filter presets allowed');
    }
    
    const preset = this.presetRepository.create({
      user: { id: userId },
      name: dto.name,
      filters: dto.filters,
    });
    
    return this.presetRepository.save(preset);
  }
  
  async getPresets(userId: string): Promise<FilterPreset[]> {
    return this.presetRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
  
  async deletePreset(userId: string, presetId: string): Promise<void> {
    await this.presetRepository.delete({
      id: presetId,
      user: { id: userId },
    });
  }
}
```

**API Endpoints**

```
GET /api/matches?filters=...&sortBy=...&page=...&limit=...
  - Get matches with advanced filters
  - Support all filter criteria
  - Return paginated results with metadata

POST /api/filter-presets
  - Create new filter preset
  - Validate max 10 presets per user
  - Return created preset

GET /api/filter-presets
  - Get all user's filter presets
  - Return array of presets

DELETE /api/filter-presets/:id
  - Delete filter preset
  - Return success status
```

#### Frontend Components

**Filter Panel Component**

```typescript
interface FilterPanelProps {
  filters: MatchFilters;
  onFiltersChange: (filters: MatchFilters) => void;
  onClearFilters: () => void;
  userRole: UserRole;
}

// Features:
// - Multi-select dropdowns for arrays (niches, platforms, etc.)
// - Range sliders for budget and audience size
// - Toggle for verified only
// - Sort dropdown
// - Clear all filters button
// - Save preset button
// - Load preset dropdown
```

**Custom Hooks**

```typescript
// useMatchFilters hook
export function useMatchFilters() {
  const [filters, setFilters] = useState<MatchFilters>(defaultFilters);
  const [debouncedFilters] = useDebounce(filters, 500);
  
  const { data, isLoading } = useQuery(
    ['matches', debouncedFilters],
    () => matchingService.getMatches(debouncedFilters),
  );
  
  const clearFilters = () => setFilters(defaultFilters);
  
  return { filters, setFilters, clearFilters, matches: data, isLoading };
}

// useFilterPresets hook
export function useFilterPresets() {
  const { data: presets } = useQuery('filter-presets', () =>
    filterPresetService.getPresets(),
  );
  
  const saveMutation = useMutation(
    (data: CreateFilterPresetDto) => filterPresetService.createPreset(data),
  );
  
  const deleteMutation = useMutation(
    (id: string) => filterPresetService.deletePreset(id),
  );
  
  return { presets, savePreset: saveMutation.mutate, deletePreset: deleteMutation.mutate };
}
```



### Phase 3: Interaction System

#### Backend Components

**Bookmark Entity**

```typescript
@Entity('bookmarks')
@Index(['user', 'bookmarkedProfile'])
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user: User;
  
  @ManyToOne(() => User)
  bookmarkedProfile: User;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Collaboration Request Entity**

```typescript
@Entity('collaboration_requests')
@Index(['sender', 'recipient', 'status'])
export class CollaborationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  sender: User;
  
  @ManyToOne(() => User)
  recipient: User;
  
  @Column({ type: 'text' })
  message: string;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Campaign Invite Entity**

```typescript
@Entity('campaign_invites')
@Index(['campaign', 'influencer', 'status'])
export class CampaignInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Campaign)
  campaign: Campaign;
  
  @ManyToOne(() => User)
  influencer: User;
  
  @Column({ type: 'text' })
  message: string;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Connection Entity**

```typescript
@Entity('connections')
@Index(['user1', 'user2'])
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user1: User;
  
  @ManyToOne(() => User)
  user2: User;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Interaction Services**

```typescript
@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}
  
  async createBookmark(userId: string, profileId: string): Promise<Bookmark> {
    const existing = await this.bookmarkRepository.findOne({
      where: { user: { id: userId }, bookmarkedProfile: { id: profileId } },
    });
    
    if (existing) {
      throw new ConflictException('Profile already bookmarked');
    }
    
    const bookmark = this.bookmarkRepository.create({
      user: { id: userId },
      bookmarkedProfile: { id: profileId },
    });
    
    return this.bookmarkRepository.save(bookmark);
  }
  
  async removeBookmark(userId: string, profileId: string): Promise<void> {
    await this.bookmarkRepository.delete({
      user: { id: userId },
      bookmarkedProfile: { id: profileId },
    });
  }
  
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: ['bookmarkedProfile'],
      order: { createdAt: 'DESC' },
    });
  }
}

@Injectable()
export class CollaborationRequestService {
  constructor(
    @InjectRepository(CollaborationRequest)
    private readonly requestRepository: Repository<CollaborationRequest>,
    private readonly connectionService: ConnectionService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async sendRequest(senderId: string, dto: SendCollaborationRequestDto): Promise<CollaborationRequest> {
    // Check for existing pending request
    const existing = await this.requestRepository.findOne({
      where: {
        sender: { id: senderId },
        recipient: { id: dto.recipientId },
        status: 'pending',
      },
    });
    
    if (existing) {
      throw new ConflictException('Pending request already exists');
    }
    
    const request = this.requestRepository.create({
      sender: { id: senderId },
      recipient: { id: dto.recipientId },
      message: dto.message,
    });
    
    const saved = await this.requestRepository.save(request);
    
    // Send notification
    await this.notificationService.sendNotification(dto.recipientId, {
      type: 'collaboration_request',
      data: { requestId: saved.id, senderId },
    });
    
    return saved;
  }
  
  async acceptRequest(userId: string, requestId: string): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId, recipient: { id: userId } },
      relations: ['sender', 'recipient'],
    });
    
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    
    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }
    
    // Update request status
    request.status = 'accepted';
    await this.requestRepository.save(request);
    
    // Create connection
    await this.connectionService.createConnection(request.sender.id, request.recipient.id);
    
    // Send notification
    await this.notificationService.sendNotification(request.sender.id, {
      type: 'request_accepted',
      data: { requestId, acceptedBy: userId },
    });
  }
  
  async rejectRequest(userId: string, requestId: string): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId, recipient: { id: userId } },
    });
    
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    
    request.status = 'rejected';
    await this.requestRepository.save(request);
  }
  
  async getInteractionHistory(userId: string, filters?: InteractionFilters): Promise<InteractionHistory> {
    const sentRequests = await this.requestRepository.find({
      where: { sender: { id: userId }, ...(filters?.status && { status: filters.status }) },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
    
    const receivedRequests = await this.requestRepository.find({
      where: { recipient: { id: userId }, ...(filters?.status && { status: filters.status }) },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
    
    return { sent: sentRequests, received: receivedRequests };
  }
}

@Injectable()
export class CampaignInviteService {
  constructor(
    @InjectRepository(CampaignInvite)
    private readonly inviteRepository: Repository<CampaignInvite>,
    private readonly notificationService: NotificationService,
  ) {}
  
  async sendInvite(campaignId: string, dto: SendCampaignInviteDto): Promise<CampaignInvite> {
    // Check for existing pending invite
    const existing = await this.inviteRepository.findOne({
      where: {
        campaign: { id: campaignId },
        influencer: { id: dto.influencerId },
        status: 'pending',
      },
    });
    
    if (existing) {
      throw new ConflictException('Pending invite already exists');
    }
    
    const invite = this.inviteRepository.create({
      campaign: { id: campaignId },
      influencer: { id: dto.influencerId },
      message: dto.message,
    });
    
    const saved = await this.inviteRepository.save(invite);
    
    // Send notification
    await this.notificationService.sendNotification(dto.influencerId, {
      type: 'campaign_invite',
      data: { inviteId: saved.id, campaignId },
    });
    
    return saved;
  }
  
  async acceptInvite(userId: string, inviteId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId, influencer: { id: userId } },
      relations: ['campaign'],
    });
    
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    
    if (invite.status !== 'pending') {
      throw new BadRequestException('Invite already processed');
    }
    
    invite.status = 'accepted';
    await this.inviteRepository.save(invite);
    
    // Add influencer to campaign participants (handled in campaigns module)
  }
  
  async rejectInvite(userId: string, inviteId: string): Promise<void> {
    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId, influencer: { id: userId } },
    });
    
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }
    
    invite.status = 'rejected';
    await this.inviteRepository.save(invite);
  }
}
```

**API Endpoints**

```
POST /api/bookmarks
  - Create bookmark
  - Body: { profileId: string }
  - Return bookmark

DELETE /api/bookmarks/:profileId
  - Remove bookmark
  - Return success status

GET /api/bookmarks
  - Get user's bookmarks
  - Return array of bookmarked profiles

POST /api/collaboration-requests
  - Send collaboration request
  - Body: { recipientId: string, message: string }
  - Return request

POST /api/collaboration-requests/:id/accept
  - Accept collaboration request
  - Return success status

POST /api/collaboration-requests/:id/reject
  - Reject collaboration request
  - Return success status

GET /api/collaboration-requests/history
  - Get interaction history
  - Query params: status, type
  - Return sent and received requests

POST /api/campaigns/:campaignId/invites
  - Send campaign invite
  - Body: { influencerId: string, message: string }
  - Return invite

POST /api/campaign-invites/:id/accept
  - Accept campaign invite
  - Return success status

POST /api/campaign-invites/:id/reject
  - Reject campaign invite
  - Return success status
```

#### Frontend Components

```typescript
// BookmarkButton Component
interface BookmarkButtonProps {
  profileId: string;
  isBookmarked: boolean;
  onToggle: () => void;
}

// CollaborationRequestModal Component
interface CollaborationRequestModalProps {
  recipientId: string;
  recipientName: string;
  onSend: (message: string) => Promise<void>;
  onClose: () => void;
}

// InteractionHistory Component
interface InteractionHistoryProps {
  userId: string;
}

// Features:
// - Tabs for sent/received
// - Filter by status
// - Display request details
// - Accept/Reject buttons
// - Pagination
```



### Phase 4: Feed & Content System

#### Backend Components

**Feed Post Entity**

```typescript
@Entity('feed_posts')
@Index(['author', 'createdAt'])
@Index(['postType'])
export class FeedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  author: User;
  
  @Column({ type: 'text' })
  content: string;
  
  @Column({
    type: 'enum',
    enum: ['collaboration_story', 'campaign_announcement', 'profile_update'],
  })
  postType: string;
  
  @Column({ type: 'json', nullable: true })
  media: MediaItem[];
  
  @Column({ type: 'int', default: 0 })
  likeCount: number;
  
  @Column({ type: 'int', default: 0 })
  commentCount: number;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Post Like Entity**

```typescript
@Entity('post_likes')
@Index(['user', 'post'], { unique: true })
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user: User;
  
  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  post: FeedPost;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Post Comment Entity**

```typescript
@Entity('post_comments')
@Index(['post', 'createdAt'])
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  author: User;
  
  @ManyToOne(() => FeedPost, { onDelete: 'CASCADE' })
  post: FeedPost;
  
  @Column({ type: 'text' })
  content: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Feed Service**

```typescript
@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPost)
    private readonly postRepository: Repository<FeedPost>,
    @InjectRepository(PostLike)
    private readonly likeRepository: Repository<PostLike>,
    @InjectRepository(PostComment)
    private readonly commentRepository: Repository<PostComment>,
    private readonly connectionService: ConnectionService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async createPost(userId: string, dto: CreateFeedPostDto): Promise<FeedPost> {
    if (dto.media && dto.media.length > 5) {
      throw new BadRequestException('Maximum 5 media items allowed');
    }
    
    const post = this.postRepository.create({
      author: { id: userId },
      content: dto.content,
      postType: dto.postType,
      media: dto.media,
    });
    
    return this.postRepository.save(post);
  }
  
  async getFeed(userId: string, filters: FeedFiltersDto): Promise<PaginatedFeedResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;
    
    // Get user's connections for prioritization
    const connections = await this.connectionService.getUserConnections(userId);
    const connectionIds = connections.map(c => c.id);
    
    // Build query
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC');
    
    // Apply post type filter
    if (filters.postType) {
      queryBuilder.andWhere('post.postType = :postType', { postType: filters.postType });
    }
    
    // Prioritize posts from connections (using CASE for ordering)
    if (connectionIds.length > 0) {
      queryBuilder.addOrderBy(
        `CASE WHEN author.id IN (:...connectionIds) THEN 0 ELSE 1 END`,
        'ASC',
      );
      queryBuilder.setParameter('connectionIds', connectionIds);
    }
    
    const [posts, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
    
    return {
      data: posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  async likePost(userId: string, postId: string): Promise<void> {
    const existing = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });
    
    if (existing) {
      throw new ConflictException('Post already liked');
    }
    
    const like = this.likeRepository.create({
      user: { id: userId },
      post: { id: postId },
    });
    
    await this.likeRepository.save(like);
    
    // Increment like count
    await this.postRepository.increment({ id: postId }, 'likeCount', 1);
    
    // Send notification to post author
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    
    if (post && post.author.id !== userId) {
      await this.notificationService.sendNotification(post.author.id, {
        type: 'post_liked',
        data: { postId, likedBy: userId },
      });
    }
  }
  
  async unlikePost(userId: string, postId: string): Promise<void> {
    const result = await this.likeRepository.delete({
      user: { id: userId },
      post: { id: postId },
    });
    
    if (result.affected > 0) {
      await this.postRepository.decrement({ id: postId }, 'likeCount', 1);
    }
  }
  
  async commentOnPost(userId: string, postId: string, dto: CreateCommentDto): Promise<PostComment> {
    const comment = this.commentRepository.create({
      author: { id: userId },
      post: { id: postId },
      content: dto.content,
    });
    
    const saved = await this.commentRepository.save(comment);
    
    // Increment comment count
    await this.postRepository.increment({ id: postId }, 'commentCount', 1);
    
    // Send notification to post author
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author'],
    });
    
    if (post && post.author.id !== userId) {
      await this.notificationService.sendNotification(post.author.id, {
        type: 'post_commented',
        data: { postId, commentedBy: userId },
      });
    }
    
    return saved;
  }
  
  async getPostComments(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedCommentsResponse> {
    const skip = (page - 1) * limit;
    
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { post: { id: postId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });
    
    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
```

**API Endpoints**

```
POST /api/feed/posts
  - Create feed post
  - Body: { content: string, postType: string, media?: MediaItem[] }
  - Return created post

GET /api/feed
  - Get feed posts
  - Query params: postType, page, limit
  - Return paginated posts

POST /api/feed/posts/:id/like
  - Like a post
  - Return success status

DELETE /api/feed/posts/:id/like
  - Unlike a post
  - Return success status

POST /api/feed/posts/:id/comments
  - Comment on a post
  - Body: { content: string }
  - Return created comment

GET /api/feed/posts/:id/comments
  - Get post comments
  - Query params: page, limit
  - Return paginated comments
```

#### Frontend Components

```typescript
// FeedPost Component
interface FeedPostProps {
  post: FeedPost;
  onLike: () => void;
  onComment: (content: string) => void;
  isLiked: boolean;
}

// CreatePostModal Component
interface CreatePostModalProps {
  onSubmit: (data: CreateFeedPostDto) => Promise<void>;
  onClose: () => void;
}

// Features:
// - Text area with character count
// - Post type selector
// - Media upload (up to 5 items)
// - Preview media
// - Submit button

// FeedPage Component
// Features:
// - Infinite scroll
// - Post type filter
// - Create post button
// - Display posts with likes/comments
// - Like/unlike functionality
// - Comment section
```



### Phase 5: Messaging System

#### Backend Components

**Message Entity**

```typescript
@Entity('messages')
@Index(['sender', 'recipient', 'createdAt'])
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  conversationId: string; // Deterministic ID based on user IDs
  
  @ManyToOne(() => User)
  sender: User;
  
  @ManyToOne(() => User)
  recipient: User;
  
  @Column({ type: 'text' })
  content: string;
  
  @Column({ type: 'json', nullable: true })
  attachment: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  
  @Column({ default: false })
  isRead: boolean;
  
  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Conversation Entity**

```typescript
@Entity('conversations')
@Index(['user1', 'user2'], { unique: true })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  user1: User;
  
  @ManyToOne(() => User)
  user2: User;
  
  @Column({ type: 'text', nullable: true })
  lastMessage: string;
  
  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;
  
  @Column({ type: 'int', default: 0 })
  unreadCountUser1: number;
  
  @Column({ type: 'int', default: 0 })
  unreadCountUser2: number;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Messaging Gateway (WebSocket)**

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'messaging',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private userSockets = new Map<string, string>(); // userId -> socketId
  
  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService,
  ) {}
  
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;
      
      // Join user's conversation rooms
      const conversations = await this.messagingService.getUserConversations(userId);
      conversations.forEach(conv => {
        client.join(`conversation:${conv.id}`);
      });
    } catch (error) {
      client.disconnect();
    }
  }
  
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
    }
  }
  
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const userId = client.data.userId;
    
    const message = await this.messagingService.sendMessage(userId, data);
    
    // Emit to recipient if online
    const recipientSocketId = this.userSockets.get(data.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('new_message', message);
    }
    
    // Emit to sender for confirmation
    client.emit('message_sent', message);
    
    return message;
  }
  
  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string },
  ) {
    const userId = client.data.userId;
    const recipientSocketId = this.userSockets.get(data.recipientId);
    
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('user_typing', { userId });
    }
  }
  
  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string },
  ) {
    const userId = client.data.userId;
    const recipientSocketId = this.userSockets.get(data.recipientId);
    
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('user_stopped_typing', { userId });
    }
  }
  
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    await this.messagingService.markConversationAsRead(userId, data.conversationId);
  }
}
```

**Messaging Service**

```typescript
@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}
  
  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Message> {
    const conversationId = this.generateConversationId(senderId, dto.recipientId);
    
    const message = this.messageRepository.create({
      conversationId,
      sender: { id: senderId },
      recipient: { id: dto.recipientId },
      content: dto.content,
      attachment: dto.attachment,
    });
    
    const saved = await this.messageRepository.save(message);
    
    // Update or create conversation
    await this.updateConversation(senderId, dto.recipientId, dto.content);
    
    return saved;
  }
  
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: [
        { user1: { id: userId } },
        { user2: { id: userId } },
      ],
      relations: ['user1', 'user2'],
      order: { lastMessageAt: 'DESC' },
    });
  }
  
  async getConversationMessages(
    userId: string,
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedMessagesResponse> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    
    return {
      data: messages.reverse(), // Reverse to show oldest first
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  async markConversationAsRead(userId: string, conversationId: string): Promise<void> {
    // Mark all unread messages as read
    await this.messageRepository.update(
      {
        conversationId,
        recipient: { id: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
    
    // Update conversation unread count
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2'],
    });
    
    if (conversation) {
      if (conversation.user1.id === userId) {
        conversation.unreadCountUser1 = 0;
      } else {
        conversation.unreadCountUser2 = 0;
      }
      await this.conversationRepository.save(conversation);
    }
  }
  
  private generateConversationId(userId1: string, userId2: string): string {
    // Generate deterministic conversation ID
    const sorted = [userId1, userId2].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }
  
  private async updateConversation(
    senderId: string,
    recipientId: string,
    lastMessage: string,
  ): Promise<void> {
    const conversationId = this.generateConversationId(senderId, recipientId);
    
    let conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2'],
    });
    
    if (!conversation) {
      conversation = this.conversationRepository.create({
        id: conversationId,
        user1: { id: senderId },
        user2: { id: recipientId },
      });
    }
    
    conversation.lastMessage = lastMessage;
    conversation.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    if (conversation.user1.id === recipientId) {
      conversation.unreadCountUser1++;
    } else {
      conversation.unreadCountUser2++;
    }
    
    await this.conversationRepository.save(conversation);
  }
}
```

**API Endpoints**

```
GET /api/conversations
  - Get user's conversations
  - Return array of conversations with unread counts

GET /api/conversations/:id/messages
  - Get conversation messages
  - Query params: page, limit
  - Return paginated messages

POST /api/messages
  - Send message (fallback for non-WebSocket)
  - Body: { recipientId: string, content: string, attachment?: object }
  - Return created message

WebSocket Events:
  - send_message: Send a message
  - new_message: Receive a message
  - typing_start: User started typing
  - typing_stop: User stopped typing
  - user_typing: Notification that other user is typing
  - user_stopped_typing: Notification that other user stopped typing
  - mark_read: Mark conversation as read
```

#### Frontend Components

```typescript
// MessagingPage Component
// Features:
// - Conversation list sidebar
// - Active conversation view
// - Message input with attachment support
// - Real-time message updates
// - Typing indicators
// - Read receipts
// - Unread message badges

// ConversationList Component
interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
}

// MessageThread Component
interface MessageThreadProps {
  conversationId: string;
  messages: Message[];
  onSendMessage: (content: string, attachment?: File) => void;
  isTyping: boolean;
}

// Custom Hooks
export function useMessaging() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const token = authService.getToken();
    const newSocket = io('ws://localhost:3000/messaging', {
      auth: { token },
    });
    
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    
    newSocket.on('user_typing', ({ userId }) => {
      setTypingUsers(prev => new Set(prev).add(userId));
    });
    
    newSocket.on('user_stopped_typing', ({ userId }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  const sendMessage = (recipientId: string, content: string) => {
    socket?.emit('send_message', { recipientId, content });
  };
  
  const startTyping = (recipientId: string) => {
    socket?.emit('typing_start', { recipientId });
  };
  
  const stopTyping = (recipientId: string) => {
    socket?.emit('typing_stop', { recipientId });
  };
  
  return { messages, sendMessage, startTyping, stopTyping, typingUsers };
}
```



### Phase 6: Campaigns Module

#### Backend Components

**Campaign Entity**

```typescript
@Entity('campaigns')
@Index(['company', 'status'])
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  company: User;
  
  @Column()
  title: string;
  
  @Column({ type: 'text' })
  description: string;
  
  @Column({ type: 'int' })
  budget: number;
  
  @Column()
  duration: string; // '1-month', '3-months', '6-months', '1-year'
  
  @Column({ type: 'text' })
  requirements: string;
  
  @Column({ type: 'text' })
  deliverables: string;
  
  @Column('simple-array')
  campaignTypes: string[];
  
  @Column('simple-array')
  requiredPlatforms: string[];
  
  @Column('simple-array', { nullable: true })
  targetNiches: string[];
  
  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Campaign Application Entity**

```typescript
@Entity('campaign_applications')
@Index(['campaign', 'influencer', 'status'])
export class CampaignApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Campaign)
  campaign: Campaign;
  
  @ManyToOne(() => User)
  influencer: User;
  
  @Column({ type: 'text' })
  message: string;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Campaign Participant Entity**

```typescript
@Entity('campaign_participants')
@Index(['campaign', 'influencer'], { unique: true })
export class CampaignParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Campaign)
  campaign: Campaign;
  
  @ManyToOne(() => User)
  influencer: User;
  
  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Campaign Service**

```typescript
@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignApplication)
    private readonly applicationRepository: Repository<CampaignApplication>,
    @InjectRepository(CampaignParticipant)
    private readonly participantRepository: Repository<CampaignParticipant>,
    private readonly matchingService: MatchingService,
    private readonly notificationService: NotificationService,
  ) {}
  
  async createCampaign(companyId: string, dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create({
      company: { id: companyId },
      ...dto,
      status: 'draft',
    });
    
    return this.campaignRepository.save(campaign);
  }
  
  async updateCampaign(companyId: string, campaignId: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, company: { id: companyId } },
    });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    // Prevent editing budget and duration if campaign is active
    if (campaign.status === 'active') {
      if (dto.budget || dto.duration) {
        throw new BadRequestException('Cannot edit budget or duration of active campaign');
      }
    }
    
    Object.assign(campaign, dto);
    return this.campaignRepository.save(campaign);
  }
  
  async publishCampaign(companyId: string, campaignId: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, company: { id: companyId } },
    });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    if (campaign.status !== 'draft') {
      throw new BadRequestException('Only draft campaigns can be published');
    }
    
    campaign.status = 'active';
    return this.campaignRepository.save(campaign);
  }
  
  async cancelCampaign(companyId: string, campaignId: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, company: { id: companyId } },
      relations: ['participants'],
    });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    campaign.status = 'cancelled';
    const saved = await this.campaignRepository.save(campaign);
    
    // Notify all participants
    const participants = await this.participantRepository.find({
      where: { campaign: { id: campaignId } },
      relations: ['influencer'],
    });
    
    for (const participant of participants) {
      await this.notificationService.sendNotification(participant.influencer.id, {
        type: 'campaign_cancelled',
        data: { campaignId },
      });
    }
    
    return saved;
  }
  
  async getCompanyCampaigns(companyId: string, status?: string): Promise<Campaign[]> {
    const where: any = { company: { id: companyId } };
    if (status) {
      where.status = status;
    }
    
    return this.campaignRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
  
  async discoverCampaigns(influencerId: string, filters?: CampaignFiltersDto): Promise<Campaign[]> {
    // Get influencer profile for relevance scoring
    const influencerProfile = await this.getInfluencerProfile(influencerId);
    
    // Build query
    const queryBuilder = this.campaignRepository
      .createQueryBuilder('campaign')
      .where('campaign.status = :status', { status: 'active' });
    
    // Apply filters
    if (filters?.minBudget) {
      queryBuilder.andWhere('campaign.budget >= :minBudget', { minBudget: filters.minBudget });
    }
    
    if (filters?.maxBudget) {
      queryBuilder.andWhere('campaign.budget <= :maxBudget', { maxBudget: filters.maxBudget });
    }
    
    if (filters?.campaignTypes?.length) {
      queryBuilder.andWhere('campaign.campaignTypes && :types', { types: filters.campaignTypes });
    }
    
    if (filters?.requiredPlatforms?.length) {
      queryBuilder.andWhere('campaign.requiredPlatforms && :platforms', { platforms: filters.requiredPlatforms });
    }
    
    const campaigns = await queryBuilder.getMany();
    
    // Calculate relevance score for each campaign
    const campaignsWithScore = campaigns.map(campaign => ({
      ...campaign,
      relevanceScore: this.calculateCampaignRelevance(campaign, influencerProfile),
    }));
    
    // Sort by relevance
    return campaignsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  async applyToCampaign(influencerId: string, dto: ApplyCampaignDto): Promise<CampaignApplication> {
    // Check for existing application
    const existing = await this.applicationRepository.findOne({
      where: {
        campaign: { id: dto.campaignId },
        influencer: { id: influencerId },
      },
    });
    
    if (existing) {
      throw new ConflictException('Already applied to this campaign');
    }
    
    const application = this.applicationRepository.create({
      campaign: { id: dto.campaignId },
      influencer: { id: influencerId },
      message: dto.message,
    });
    
    const saved = await this.applicationRepository.save(application);
    
    // Notify company
    const campaign = await this.campaignRepository.findOne({
      where: { id: dto.campaignId },
      relations: ['company'],
    });
    
    if (campaign) {
      await this.notificationService.sendNotification(campaign.company.id, {
        type: 'campaign_application',
        data: { applicationId: saved.id, campaignId: dto.campaignId, influencerId },
      });
    }
    
    return saved;
  }
  
  async getCampaignApplications(companyId: string, campaignId: string): Promise<CampaignApplication[]> {
    // Verify campaign belongs to company
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId, company: { id: companyId } },
    });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    return this.applicationRepository.find({
      where: { campaign: { id: campaignId } },
      relations: ['influencer'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async acceptApplication(companyId: string, applicationId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['campaign', 'campaign.company', 'influencer'],
    });
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    if (application.campaign.company.id !== companyId) {
      throw new ForbiddenException('Not authorized');
    }
    
    if (application.status !== 'pending') {
      throw new BadRequestException('Application already processed');
    }
    
    application.status = 'accepted';
    await this.applicationRepository.save(application);
    
    // Add influencer to campaign participants
    const participant = this.participantRepository.create({
      campaign: { id: application.campaign.id },
      influencer: { id: application.influencer.id },
      joinedAt: new Date(),
    });
    
    await this.participantRepository.save(participant);
    
    // Notify influencer
    await this.notificationService.sendNotification(application.influencer.id, {
      type: 'application_accepted',
      data: { applicationId, campaignId: application.campaign.id },
    });
  }
  
  async rejectApplication(companyId: string, applicationId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['campaign', 'campaign.company'],
    });
    
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    
    if (application.campaign.company.id !== companyId) {
      throw new ForbiddenException('Not authorized');
    }
    
    application.status = 'rejected';
    await this.applicationRepository.save(application);
  }
  
  private calculateCampaignRelevance(campaign: Campaign, influencerProfile: any): number {
    let score = 0;
    
    // Niche match (40%)
    if (campaign.targetNiches?.length) {
      const nicheMatch = campaign.targetNiches.includes(influencerProfile.niche);
      score += nicheMatch ? 40 : 0;
    } else {
      score += 20; // Partial score if no specific niches required
    }
    
    // Budget alignment (30%)
    if (influencerProfile.minBudget && influencerProfile.maxBudget) {
      if (campaign.budget >= influencerProfile.minBudget && campaign.budget <= influencerProfile.maxBudget) {
        score += 30;
      } else if (campaign.budget >= influencerProfile.minBudget * 0.8) {
        score += 15;
      }
    } else {
      score += 15;
    }
    
    // Platform overlap (30%)
    const platformOverlap = campaign.requiredPlatforms.filter(p =>
      influencerProfile.platforms.includes(p),
    ).length;
    const platformScore = (platformOverlap / campaign.requiredPlatforms.length) * 30;
    score += platformScore;
    
    return score;
  }
  
  private async getInfluencerProfile(influencerId: string): Promise<any> {
    // Implementation to fetch influencer profile
  }
}
```

**API Endpoints**

```
POST /api/campaigns
  - Create campaign
  - Body: CreateCampaignDto
  - Return created campaign

PATCH /api/campaigns/:id
  - Update campaign
  - Body: UpdateCampaignDto
  - Return updated campaign

POST /api/campaigns/:id/publish
  - Publish campaign (draft -> active)
  - Return updated campaign

POST /api/campaigns/:id/cancel
  - Cancel campaign
  - Return updated campaign

GET /api/campaigns
  - Get company's campaigns
  - Query params: status
  - Return array of campaigns

GET /api/campaigns/discover
  - Discover campaigns (for influencers)
  - Query params: minBudget, maxBudget, campaignTypes, platforms
  - Return array of campaigns sorted by relevance

POST /api/campaigns/:id/apply
  - Apply to campaign
  - Body: { message: string }
  - Return application

GET /api/campaigns/:id/applications
  - Get campaign applications (for companies)
  - Return array of applications

POST /api/campaign-applications/:id/accept
  - Accept application
  - Return success status

POST /api/campaign-applications/:id/reject
  - Reject application
  - Return success status
```

#### Frontend Components

```typescript
// CampaignForm Component
interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: CreateCampaignDto) => Promise<void>;
}

// CampaignList Component
interface CampaignListProps {
  campaigns: Campaign[];
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}

// CampaignDiscovery Component (for influencers)
interface CampaignDiscoveryProps {
  onApply: (campaignId: string, message: string) => Promise<void>;
}

// CampaignApplications Component (for companies)
interface CampaignApplicationsProps {
  campaignId: string;
  applications: CampaignApplication[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}
```



### Phase 7: Collaborations Module

#### Backend Components

**Collaboration Entity**

```typescript
@Entity('collaborations')
@Index(['influencer', 'company', 'status'])
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  influencer: User;
  
  @ManyToOne(() => User)
  company: User;
  
  @ManyToOne(() => Campaign, { nullable: true })
  campaign: Campaign;
  
  @Column({ type: 'date' })
  startDate: Date;
  
  @Column({ type: 'date', nullable: true })
  endDate: Date;
  
  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Milestone Entity**

```typescript
@Entity('milestones')
@Index(['collaboration', 'status'])
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Collaboration)
  collaboration: Collaboration;
  
  @Column()
  title: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column({ type: 'date' })
  dueDate: Date;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending',
  })
  status: string;
  
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Deliverable Entity**

```typescript
@Entity('deliverables')
@Index(['collaboration', 'status'])
export class Deliverable {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Collaboration)
  collaboration: Collaboration;
  
  @Column()
  title: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column({ type: 'date' })
  dueDate: Date;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;
  
  @Column({ type: 'text', nullable: true })
  submissionUrl: string;
  
  @Column({ type: 'text', nullable: true })
  feedback: string;
  
  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Payment Milestone Entity**

```typescript
@Entity('payment_milestones')
@Index(['collaboration', 'status'])
export class PaymentMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Collaboration)
  collaboration: Collaboration;
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
  
  @Column({ type: 'date' })
  dueDate: Date;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  })
  status: string;
  
  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Review Entity**

```typescript
@Entity('reviews')
@Index(['collaboration', 'reviewer'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => Collaboration)
  collaboration: Collaboration;
  
  @ManyToOne(() => User)
  reviewer: User;
  
  @ManyToOne(() => User)
  reviewee: User;
  
  @Column({ type: 'int' })
  rating: number; // 1-5
  
  @Column({ type: 'text' })
  feedback: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Collaboration Service**

```typescript
@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(Collaboration)
    private readonly collaborationRepository: Repository<Collaboration>,
    @InjectRepository(Milestone)
    private readonly milestoneRepository: Repository<Milestone>,
    @InjectRepository(Deliverable)
    private readonly deliverableRepository: Repository<Deliverable>,
    @InjectRepository(PaymentMilestone)
    private readonly paymentRepository: Repository<PaymentMilestone>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly notificationService: NotificationService,
  ) {}
  
  async createCollaboration(dto: CreateCollaborationDto): Promise<Collaboration> {
    const collaboration = this.collaborationRepository.create({
      influencer: { id: dto.influencerId },
      company: { id: dto.companyId },
      campaign: dto.campaignId ? { id: dto.campaignId } : null,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
    
    return this.collaborationRepository.save(collaboration);
  }
  
  async getUserCollaborations(userId: string, status?: string): Promise<Collaboration[]> {
    const where: any = [
      { influencer: { id: userId } },
      { company: { id: userId } },
    ];
    
    if (status) {
      where[0].status = status;
      where[1].status = status;
    }
    
    return this.collaborationRepository.find({
      where,
      relations: ['influencer', 'company', 'campaign'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async addMilestone(collaborationId: string, dto: CreateMilestoneDto): Promise<Milestone> {
    if (new Date(dto.dueDate) < new Date()) {
      throw new BadRequestException('Due date cannot be in the past');
    }
    
    const milestone = this.milestoneRepository.create({
      collaboration: { id: collaborationId },
      ...dto,
    });
    
    return this.milestoneRepository.save(milestone);
  }
  
  async completeMilestone(milestoneId: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
    });
    
    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }
    
    milestone.status = 'completed';
    milestone.completedAt = new Date();
    
    return this.milestoneRepository.save(milestone);
  }
  
  async addDeliverable(collaborationId: string, dto: CreateDeliverableDto): Promise<Deliverable> {
    if (new Date(dto.dueDate) < new Date()) {
      throw new BadRequestException('Due date cannot be in the past');
    }
    
    const deliverable = this.deliverableRepository.create({
      collaboration: { id: collaborationId },
      ...dto,
    });
    
    return this.deliverableRepository.save(deliverable);
  }
  
  async submitDeliverable(influencerId: string, deliverableId: string, submissionUrl: string): Promise<Deliverable> {
    const deliverable = await this.deliverableRepository.findOne({
      where: { id: deliverableId },
      relations: ['collaboration', 'collaboration.company'],
    });
    
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }
    
    if (deliverable.collaboration.influencer.id !== influencerId) {
      throw new ForbiddenException('Not authorized');
    }
    
    deliverable.status = 'submitted';
    deliverable.submissionUrl = submissionUrl;
    deliverable.submittedAt = new Date();
    
    const saved = await this.deliverableRepository.save(deliverable);
    
    // Notify company
    await this.notificationService.sendNotification(deliverable.collaboration.company.id, {
      type: 'deliverable_submitted',
      data: { deliverableId, collaborationId: deliverable.collaboration.id },
    });
    
    return saved;
  }
  
  async reviewDeliverable(
    companyId: string,
    deliverableId: string,
    dto: ReviewDeliverableDto,
  ): Promise<Deliverable> {
    const deliverable = await this.deliverableRepository.findOne({
      where: { id: deliverableId },
      relations: ['collaboration', 'collaboration.company', 'collaboration.influencer'],
    });
    
    if (!deliverable) {
      throw new NotFoundException('Deliverable not found');
    }
    
    if (deliverable.collaboration.company.id !== companyId) {
      throw new ForbiddenException('Not authorized');
    }
    
    deliverable.status = dto.approved ? 'approved' : 'rejected';
    deliverable.feedback = dto.feedback;
    deliverable.reviewedAt = new Date();
    
    const saved = await this.deliverableRepository.save(deliverable);
    
    // Notify influencer
    await this.notificationService.sendNotification(deliverable.collaboration.influencer.id, {
      type: dto.approved ? 'deliverable_approved' : 'deliverable_rejected',
      data: { deliverableId, collaborationId: deliverable.collaboration.id },
    });
    
    return saved;
  }
  
  async addPaymentMilestone(collaborationId: string, dto: CreatePaymentMilestoneDto): Promise<PaymentMilestone> {
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    
    const payment = this.paymentRepository.create({
      collaboration: { id: collaborationId },
      ...dto,
    });
    
    return this.paymentRepository.save(payment);
  }
  
  async markPaymentAsPaid(companyId: string, paymentId: string): Promise<PaymentMilestone> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['collaboration', 'collaboration.company', 'collaboration.influencer'],
    });
    
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    
    if (payment.collaboration.company.id !== companyId) {
      throw new ForbiddenException('Not authorized');
    }
    
    payment.status = 'paid';
    payment.paidAt = new Date();
    
    const saved = await this.paymentRepository.save(payment);
    
    // Notify influencer
    await this.notificationService.sendNotification(payment.collaboration.influencer.id, {
      type: 'payment_received',
      data: { paymentId, amount: payment.amount },
    });
    
    return saved;
  }
  
  async completeCollaboration(collaborationId: string): Promise<Collaboration> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId },
      relations: ['deliverables'],
    });
    
    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }
    
    // Check if all deliverables are approved
    const deliverables = await this.deliverableRepository.find({
      where: { collaboration: { id: collaborationId } },
    });
    
    const allApproved = deliverables.every(d => d.status === 'approved');
    
    if (!allApproved) {
      throw new BadRequestException('All deliverables must be approved before completing collaboration');
    }
    
    collaboration.status = 'completed';
    return this.collaborationRepository.save(collaboration);
  }
  
  async submitReview(userId: string, dto: SubmitReviewDto): Promise<Review> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: dto.collaborationId },
      relations: ['influencer', 'company'],
    });
    
    if (!collaboration) {
      throw new NotFoundException('Collaboration not found');
    }
    
    if (collaboration.status !== 'completed') {
      throw new BadRequestException('Can only review completed collaborations');
    }
    
    // Determine reviewee
    const revieweeId = collaboration.influencer.id === userId
      ? collaboration.company.id
      : collaboration.influencer.id;
    
    // Check for existing review
    const existing = await this.reviewRepository.findOne({
      where: {
        collaboration: { id: dto.collaborationId },
        reviewer: { id: userId },
      },
    });
    
    if (existing) {
      throw new ConflictException('Already reviewed this collaboration');
    }
    
    if (dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    
    const review = this.reviewRepository.create({
      collaboration: { id: dto.collaborationId },
      reviewer: { id: userId },
      reviewee: { id: revieweeId },
      rating: dto.rating,
      feedback: dto.feedback,
    });
    
    return this.reviewRepository.save(review);
  }
  
  async getUserReviews(userId: string): Promise<{ reviews: Review[]; averageRating: number }> {
    const reviews = await this.reviewRepository.find({
      where: { reviewee: { id: userId } },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    return { reviews, averageRating };
  }
}
```

**API Endpoints**

```
POST /api/collaborations
  - Create collaboration
  - Body: CreateCollaborationDto
  - Return created collaboration

GET /api/collaborations
  - Get user's collaborations
  - Query params: status
  - Return array of collaborations

POST /api/collaborations/:id/milestones
  - Add milestone
  - Body: CreateMilestoneDto
  - Return created milestone

PATCH /api/milestones/:id/complete
  - Mark milestone as completed
  - Return updated milestone

POST /api/collaborations/:id/deliverables
  - Add deliverable
  - Body: CreateDeliverableDto
  - Return created deliverable

POST /api/deliverables/:id/submit
  - Submit deliverable
  - Body: { submissionUrl: string }
  - Return updated deliverable

POST /api/deliverables/:id/review
  - Review deliverable
  - Body: { approved: boolean, feedback: string }
  - Return updated deliverable

POST /api/collaborations/:id/payments
  - Add payment milestone
  - Body: CreatePaymentMilestoneDto
  - Return created payment

POST /api/payments/:id/mark-paid
  - Mark payment as paid
  - Return updated payment

POST /api/collaborations/:id/complete
  - Complete collaboration
  - Return updated collaboration

POST /api/reviews
  - Submit review
  - Body: { collaborationId: string, rating: number, feedback: string }
  - Return created review

GET /api/users/:id/reviews
  - Get user's reviews
  - Return reviews and average rating
```

#### Frontend Components

```typescript
// CollaborationDashboard Component
interface CollaborationDashboardProps {
  collaborations: Collaboration[];
  onViewDetails: (id: string) => void;
}

// CollaborationDetails Component
interface CollaborationDetailsProps {
  collaboration: Collaboration;
  milestones: Milestone[];
  deliverables: Deliverable[];
  payments: PaymentMilestone[];
}

// DeliverableSubmission Component
interface DeliverableSubmissionProps {
  deliverable: Deliverable;
  onSubmit: (url: string) => Promise<void>;
}

// ReviewForm Component
interface ReviewFormProps {
  collaborationId: string;
  onSubmit: (rating: number, feedback: string) => Promise<void>;
}
```



### Phase 8: Analytics & Insights

#### Backend Components

**Profile View Entity**

```typescript
@Entity('profile_views')
@Index(['profile', 'viewedAt'])
@Index(['viewer', 'profile', 'viewedAt'])
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  profile: User;
  
  @ManyToOne(() => User, { nullable: true })
  viewer: User; // null for anonymous views
  
  @Column({
    type: 'enum',
    enum: ['search', 'feed', 'direct'],
  })
  source: string;
  
  @Column({ type: 'timestamp' })
  viewedAt: Date;
  
  @CreateDateColumn()
  createdAt: Date;
}
```

**Analytics Service**

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProfileView)
    private readonly profileViewRepository: Repository<ProfileView>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(CollaborationRequest)
    private readonly requestRepository: Repository<CollaborationRequest>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(FeedPost)
    private readonly postRepository: Repository<FeedPost>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(CampaignApplication)
    private readonly applicationRepository: Repository<CampaignApplication>,
    @InjectRepository(Collaboration)
    private readonly collaborationRepository: Repository<Collaboration>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly cacheService: CacheService,
  ) {}
  
  async trackProfileView(profileId: string, viewerId: string | null, source: string): Promise<void> {
    // Check if same viewer viewed within 24 hours
    if (viewerId) {
      const recentView = await this.profileViewRepository.findOne({
        where: {
          profile: { id: profileId },
          viewer: { id: viewerId },
          viewedAt: MoreThan(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      });
      
      if (recentView) {
        return; // Don't count duplicate views
      }
    }
    
    const view = this.profileViewRepository.create({
      profile: { id: profileId },
      viewer: viewerId ? { id: viewerId } : null,
      source,
      viewedAt: new Date(),
    });
    
    await this.profileViewRepository.save(view);
  }
  
  async getProfileAnalytics(userId: string): Promise<ProfileAnalytics> {
    const cacheKey = `analytics:profile:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Total views
    const totalViews = await this.profileViewRepository.count({
      where: { profile: { id: userId } },
    });
    
    // Unique visitors
    const uniqueVisitors = await this.profileViewRepository
      .createQueryBuilder('view')
      .select('COUNT(DISTINCT view.viewerId)', 'count')
      .where('view.profileId = :userId', { userId })
      .andWhere('view.viewerId IS NOT NULL')
      .getRawOne();
    
    // Views over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const viewsOverTime = await this.profileViewRepository
      .createQueryBuilder('view')
      .select('DATE(view.viewedAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('view.profileId = :userId', { userId })
      .andWhere('view.viewedAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('DATE(view.viewedAt)')
      .orderBy('date', 'ASC')
      .getRawMany();
    
    // View sources
    const viewSources = await this.profileViewRepository
      .createQueryBuilder('view')
      .select('view.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('view.profileId = :userId', { userId })
      .groupBy('view.source')
      .getRawMany();
    
    const analytics = {
      totalViews,
      uniqueVisitors: parseInt(uniqueVisitors.count),
      viewsOverTime,
      viewSources,
    };
    
    await this.cacheService.set(cacheKey, analytics, 3600); // Cache for 1 hour
    
    return analytics;
  }
  
  async getMatchAnalytics(userId: string): Promise<MatchAnalytics> {
    const cacheKey = `analytics:match:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Total matches
    const totalMatches = await this.matchRepository.count({
      where: [
        { influencer: { id: userId } },
        { company: { id: userId } },
      ],
    });
    
    // Average match score
    const avgScore = await this.matchRepository
      .createQueryBuilder('match')
      .select('AVG(match.score)', 'average')
      .where('match.influencerId = :userId OR match.companyId = :userId', { userId })
      .getRawOne();
    
    // Match score distribution
    const distribution = await this.matchRepository
      .createQueryBuilder('match')
      .select('match.tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .where('match.influencerId = :userId OR match.companyId = :userId', { userId })
      .groupBy('match.tier')
      .getRawMany();
    
    // Top matching niches
    const topNiches = await this.matchRepository
      .createQueryBuilder('match')
      .leftJoin('match.influencer', 'influencer')
      .leftJoin('influencer.profile', 'profile')
      .select('profile.niche', 'niche')
      .addSelect('COUNT(*)', 'count')
      .where('match.companyId = :userId', { userId })
      .groupBy('profile.niche')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
    
    const analytics = {
      totalMatches,
      averageScore: parseFloat(avgScore.average) || 0,
      distribution,
      topNiches,
    };
    
    await this.cacheService.set(cacheKey, analytics, 3600);
    
    return analytics;
  }
  
  async getEngagementAnalytics(userId: string): Promise<EngagementAnalytics> {
    const cacheKey = `analytics:engagement:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Collaboration requests sent
    const sentRequests = await this.requestRepository.count({
      where: { sender: { id: userId } },
    });
    
    // Collaboration requests accepted
    const acceptedRequests = await this.requestRepository.count({
      where: { sender: { id: userId }, status: 'accepted' },
    });
    
    const acceptanceRate = sentRequests > 0 ? (acceptedRequests / sentRequests) * 100 : 0;
    
    // Received requests
    const receivedRequests = await this.requestRepository.count({
      where: { recipient: { id: userId } },
    });
    
    // Responded to requests
    const respondedRequests = await this.requestRepository.count({
      where: {
        recipient: { id: userId },
        status: In(['accepted', 'rejected']),
      },
    });
    
    const responseRate = receivedRequests > 0 ? (respondedRequests / receivedRequests) * 100 : 0;
    
    // Bookmarks received
    const bookmarksReceived = await this.bookmarkRepository.count({
      where: { bookmarkedProfile: { id: userId } },
    });
    
    // Feed post engagement
    const postEngagement = await this.postRepository
      .createQueryBuilder('post')
      .select('SUM(post.likeCount)', 'totalLikes')
      .addSelect('SUM(post.commentCount)', 'totalComments')
      .where('post.authorId = :userId', { userId })
      .getRawOne();
    
    const analytics = {
      sentRequests,
      acceptanceRate,
      receivedRequests,
      responseRate,
      bookmarksReceived,
      totalLikes: parseInt(postEngagement.totalLikes) || 0,
      totalComments: parseInt(postEngagement.totalComments) || 0,
    };
    
    await this.cacheService.set(cacheKey, analytics, 3600);
    
    return analytics;
  }
  
  async getCampaignAnalytics(companyId: string, campaignId: string): Promise<CampaignAnalytics> {
    const cacheKey = `analytics:campaign:${campaignId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Total applications
    const totalApplications = await this.applicationRepository.count({
      where: { campaign: { id: campaignId } },
    });
    
    // Accepted applications
    const acceptedApplications = await this.applicationRepository.count({
      where: { campaign: { id: campaignId }, status: 'accepted' },
    });
    
    const acceptanceRate = totalApplications > 0
      ? (acceptedApplications / totalApplications) * 100
      : 0;
    
    // Campaign reach (total audience of participants)
    const participants = await this.applicationRepository.find({
      where: { campaign: { id: campaignId }, status: 'accepted' },
      relations: ['influencer', 'influencer.profile'],
    });
    
    const totalReach = participants.reduce((sum, p) => {
      return sum + (p.influencer.profile?.audienceSize || 0);
    }, 0);
    
    // Campaign engagement (from feed posts related to campaign)
    const campaignPosts = await this.postRepository.find({
      where: {
        postType: 'campaign_announcement',
        // Additional filtering by campaign reference would be needed
      },
    });
    
    const totalEngagement = campaignPosts.reduce((sum, post) => {
      return sum + post.likeCount + post.commentCount;
    }, 0);
    
    // ROI calculation
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
    });
    
    const reachValue = totalReach * 0.01; // Simplified: $0.01 per reach
    const roi = campaign ? ((reachValue - campaign.budget) / campaign.budget) * 100 : 0;
    
    const analytics = {
      totalApplications,
      acceptanceRate,
      totalReach,
      totalEngagement,
      roi,
    };
    
    await this.cacheService.set(cacheKey, analytics, 3600);
    
    return analytics;
  }
  
  async getCollaborationAnalytics(userId: string): Promise<CollaborationAnalytics> {
    const cacheKey = `analytics:collaboration:${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    // Active collaborations
    const activeCollaborations = await this.collaborationRepository.count({
      where: [
        { influencer: { id: userId }, status: 'active' },
        { company: { id: userId }, status: 'active' },
      ],
    });
    
    // Completed collaborations
    const completedCollaborations = await this.collaborationRepository.count({
      where: [
        { influencer: { id: userId }, status: 'completed' },
        { company: { id: userId }, status: 'completed' },
      ],
    });
    
    // Average collaboration duration
    const collaborations = await this.collaborationRepository.find({
      where: [
        { influencer: { id: userId }, status: 'completed' },
        { company: { id: userId }, status: 'completed' },
      ],
    });
    
    const avgDuration = collaborations.length > 0
      ? collaborations.reduce((sum, c) => {
          const duration = c.endDate
            ? (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24)
            : 0;
          return sum + duration;
        }, 0) / collaborations.length
      : 0;
    
    // On-time deliverable completion rate
    const allDeliverables = await this.deliverableRepository.find({
      where: {
        collaboration: {
          influencer: { id: userId },
        },
      },
    });
    
    const onTimeDeliverables = allDeliverables.filter(d => {
      if (d.status === 'approved' && d.submittedAt) {
        return new Date(d.submittedAt) <= new Date(d.dueDate);
      }
      return false;
    });
    
    const onTimeRate = allDeliverables.length > 0
      ? (onTimeDeliverables.length / allDeliverables.length) * 100
      : 0;
    
    // Average rating
    const { averageRating } = await this.getUserReviews(userId);
    
    // Total earnings/spent
    const payments = await this.paymentRepository.find({
      where: {
        collaboration: [
          { influencer: { id: userId } },
          { company: { id: userId } },
        ],
        status: 'paid',
      },
      relations: ['collaboration', 'collaboration.influencer', 'collaboration.company'],
    });
    
    const totalAmount = payments.reduce((sum, p) => {
      // If user is influencer, it's earnings; if company, it's spent
      const isInfluencer = p.collaboration.influencer.id === userId;
      return sum + parseFloat(p.amount.toString());
    }, 0);
    
    const analytics = {
      activeCollaborations,
      completedCollaborations,
      averageDuration: Math.round(avgDuration),
      onTimeRate,
      averageRating,
      totalAmount,
    };
    
    await this.cacheService.set(cacheKey, analytics, 3600);
    
    return analytics;
  }
  
  private async getUserReviews(userId: string): Promise<{ averageRating: number }> {
    const reviews = await this.reviewRepository.find({
      where: { reviewee: { id: userId } },
    });
    
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    return { averageRating };
  }
}
```

**API Endpoints**

```
POST /api/analytics/profile-views
  - Track profile view
  - Body: { profileId: string, source: string }
  - Return success status

GET /api/analytics/profile
  - Get profile analytics
  - Return ProfileAnalytics

GET /api/analytics/matches
  - Get match analytics
  - Return MatchAnalytics

GET /api/analytics/engagement
  - Get engagement analytics
  - Return EngagementAnalytics

GET /api/analytics/campaigns/:id
  - Get campaign analytics
  - Return CampaignAnalytics

GET /api/analytics/collaborations
  - Get collaboration analytics
  - Return CollaborationAnalytics
```

#### Frontend Components

```typescript
// AnalyticsDashboard Component
interface AnalyticsDashboardProps {
  userRole: UserRole;
}

// Features:
// - Profile analytics card
// - Match analytics card
// - Engagement analytics card
// - Campaign analytics (companies only)
// - Collaboration analytics
// - Charts and visualizations

// ProfileAnalyticsCard Component
interface ProfileAnalyticsCardProps {
  analytics: ProfileAnalytics;
}

// MatchAnalyticsCard Component
interface MatchAnalyticsCardProps {
  analytics: MatchAnalytics;
}

// CampaignAnalyticsCard Component
interface CampaignAnalyticsCardProps {
  campaignId: string;
  analytics: CampaignAnalytics;
}
```



## Data Models

### Database Schema

The platform uses PostgreSQL with TypeORM for data persistence. The schema extends the existing MVP schema with new entities for the complete feature set.

#### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o| InfluencerProfile : has
    User ||--o| CompanyProfile : has
    User ||--o{ Match : participates
    User ||--o{ Bookmark : creates
    User ||--o{ CollaborationRequest : sends
    User ||--o{ CollaborationRequest : receives
    User ||--o{ FeedPost : authors
    User ||--o{ PostLike : creates
    User ||--o{ PostComment : authors
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Campaign : creates
    User ||--o{ CampaignApplication : submits
    User ||--o{ Collaboration : participates
    User ||--o{ Review : writes
    User ||--o{ ProfileView : views
    
    Campaign ||--o{ CampaignInvite : has
    Campaign ||--o{ CampaignApplication : receives
    Campaign ||--o{ CampaignParticipant : has
    Campaign ||--o| Collaboration : spawns
    
    Collaboration ||--o{ Milestone : has
    Collaboration ||--o{ Deliverable : has
    Collaboration ||--o{ PaymentMilestone : has
    Collaboration ||--o{ Review : receives
    
    FeedPost ||--o{ PostLike : receives
    FeedPost ||--o{ PostComment : receives
```

#### Key Indexes

Performance-critical indexes for query optimization:

```typescript
// Matching and filtering
@Index(['niche'])
@Index(['location'])
@Index(['audienceSize'])
@Index(['platforms'])
@Index(['verificationStatus'])

// Interactions
@Index(['user', 'bookmarkedProfile'])
@Index(['sender', 'recipient', 'status'])
@Index(['campaign', 'influencer', 'status'])

// Feed
@Index(['author', 'createdAt'])
@Index(['postType'])
@Index(['user', 'post'], { unique: true }) // For likes

// Messaging
@Index(['conversationId', 'createdAt'])
@Index(['sender', 'recipient', 'createdAt'])

// Campaigns
@Index(['company', 'status'])
@Index(['campaign', 'influencer', 'status'])

// Collaborations
@Index(['influencer', 'company', 'status'])
@Index(['collaboration', 'status'])

// Analytics
@Index(['profile', 'viewedAt'])
@Index(['viewer', 'profile', 'viewedAt'])
```

#### Data Validation Rules

All entities enforce validation at the database and application layers:

- **String lengths**: Enforced via column definitions and DTOs
- **Numeric ranges**: Enforced via DTO validators (@Min, @Max)
- **Enum values**: Enforced via TypeORM enum columns
- **Required fields**: Enforced via nullable: false
- **Unique constraints**: Enforced via unique indexes
- **Foreign key constraints**: Enforced via TypeORM relations

### Shared Types

Types shared between backend and frontend for type safety:

```typescript
// shared/types/profile.types.ts
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  uploadedAt: Date;
  fileSize: number;
  mimeType: string;
}

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type CollaborationPreference = 'one-time' | 'long-term' | 'flexible';
export type CollaborationDuration = 'short-term' | 'medium-term' | 'long-term';

// shared/types/interaction.types.ts
export type RequestStatus = 'pending' | 'accepted' | 'rejected';
export type InviteStatus = 'pending' | 'accepted' | 'rejected';

// shared/types/feed.types.ts
export type PostType = 'collaboration_story' | 'campaign_announcement' | 'profile_update';

// shared/types/campaign.types.ts
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

// shared/types/collaboration.types.ts
export type CollaborationStatus = 'active' | 'completed' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed';
export type DeliverableStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

// shared/types/analytics.types.ts
export interface ProfileAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  viewsOverTime: Array<{ date: string; count: number }>;
  viewSources: Array<{ source: string; count: number }>;
}

export interface MatchAnalytics {
  totalMatches: number;
  averageScore: number;
  distribution: Array<{ tier: string; count: number }>;
  topNiches: Array<{ niche: string; count: number }>;
}

export interface EngagementAnalytics {
  sentRequests: number;
  acceptanceRate: number;
  receivedRequests: number;
  responseRate: number;
  bookmarksReceived: number;
  totalLikes: number;
  totalComments: number;
}

export interface CampaignAnalytics {
  totalApplications: number;
  acceptanceRate: number;
  totalReach: number;
  totalEngagement: number;
  roi: number;
}

export interface CollaborationAnalytics {
  activeCollaborations: number;
  completedCollaborations: number;
  averageDuration: number;
  onTimeRate: number;
  averageRating: number;
  totalAmount: number;
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidations:

**Redundancy Analysis:**

1. **Array Validation Properties (1.1.2, 1.2.2, 1.2.7)**: All three test non-empty array validation. These can be combined into a single property that validates any required array field is non-empty.

2. **Idempotence Properties (3.1.4, 3.2.7, 3.3.6, 4.2.3, 6.3.7, 7.4.5)**: All test preventing duplicates for different entity types. These share the same pattern and can be grouped conceptually, though each needs its own test for the specific entity.

3. **State Transition Properties (6.1.9, 7.1.8, 7.2.6)**: All test status updates. These follow the same pattern but for different entities, so each needs its own property.

4. **Persistence Properties (3.1.1, 3.2.1, 4.2.1, 4.2.4, 5.1.4, 7.4.2)**: All test round-trip persistence (create then retrieve). These follow the same pattern but for different entities.

5. **Filtering Properties (2.1.1-2.1.12)**: All test filtering with different criteria. These can be combined into a single comprehensive filtering property.

**Consolidated Properties:**

After reflection, I've consolidated 45+ testable criteria into 25 unique properties that provide comprehensive coverage without redundancy.

### Properties

**Property 1: Non-Empty Array Validation**
*For any* profile update with required array fields (contentType, campaignType, preferredNiches), submitting an empty array should be rejected with a validation error.
**Validates: Requirements 1.1.2, 1.2.2, 1.2.7**

**Property 2: File Upload Validation**
*For any* media file upload, only files with valid types (JPEG, PNG, WebP, MP4, WebM) and size ≤ 10MB should be accepted; all others should be rejected.
**Validates: Requirements 1.1.6, 1.1.8**

**Property 3: Multi-Criteria Filtering**
*For any* combination of filter criteria (niche, location, budget, audience size, platforms, engagement, verification, content type, collaboration preference, campaign type, company size), the returned matches should satisfy all applied filter conditions.
**Validates: Requirements 2.1.1-2.1.12**

**Property 4: Sort Order Consistency**
*For any* sort field (score, audienceSize, engagementRate, recentActivity) and order (asc, desc), the results should be ordered correctly according to the specified field and direction.
**Validates: Requirements 2.2.1-2.2.4**

**Property 5: Pagination Sort Preservation**
*For any* paginated query with sorting, consecutive pages should maintain the sort order without duplicates or gaps.
**Validates: Requirements 2.2.5**

**Property 6: Filter Preset Round Trip**
*For any* valid filter configuration, saving it as a preset and then loading that preset should restore the exact same filter configuration.
**Validates: Requirements 2.3.1, 2.3.2**

**Property 7: Bookmark Persistence**
*For any* user and profile, creating a bookmark should result in that bookmark appearing in the user's bookmark list.
**Validates: Requirements 3.1.1**

**Property 8: Bookmark Idempotence**
*For any* user and profile, attempting to bookmark the same profile multiple times should result in only one bookmark record.
**Validates: Requirements 3.1.4**

**Property 9: Collaboration Request Persistence**
*For any* valid collaboration request, sending the request should result in it being retrievable with all original fields intact (sender, recipient, message, timestamp).
**Validates: Requirements 3.2.1**

**Property 10: Request Acceptance Creates Connection**
*For any* pending collaboration request, when the recipient accepts it, a connection should be created between the sender and recipient.
**Validates: Requirements 3.2.5**

**Property 11: Collaboration Request Idempotence**
*For any* two users, attempting to send multiple collaboration requests from the same sender to the same recipient while a pending request exists should be rejected.
**Validates: Requirements 3.2.7**

**Property 12: Campaign Invite Acceptance**
*For any* pending campaign invite, when the influencer accepts it, the influencer should be added to the campaign's participant list.
**Validates: Requirements 3.3.4**

**Property 13: Campaign Invite Idempotence**
*For any* campaign and influencer, attempting to send multiple invites for the same campaign to the same influencer while a pending invite exists should be rejected.
**Validates: Requirements 3.3.6**

**Property 14: Post Like Persistence**
*For any* user and post, liking the post should result in the like being recorded and retrievable.
**Validates: Requirements 4.2.1**

**Property 15: Post Like Idempotence**
*For any* user and post, attempting to like the same post multiple times should result in only one like record.
**Validates: Requirements 4.2.3**

**Property 16: Comment Persistence**
*For any* valid comment, creating the comment should result in it being retrievable with all original fields intact (author, post, content, timestamp).
**Validates: Requirements 4.2.4**

**Property 17: Like Count Increment**
*For any* post, when a user likes it, the post's like count should increase by exactly 1.
**Validates: Requirements 4.2.8**

**Property 18: Feed Connection Prioritization**
*For any* user's feed, posts from connected users should appear before posts from non-connected users when sorted by the same timestamp.
**Validates: Requirements 4.3.2**

**Property 19: Message Real-Time Delivery**
*For any* message sent between two connected users, the message should be delivered to the recipient in real-time via WebSocket and be retrievable from the database.
**Validates: Requirements 5.1.1, 5.1.4**

**Property 20: Mark Conversation As Read**
*For any* conversation with unread messages, when a user opens the conversation, all messages in that conversation should be marked as read.
**Validates: Requirements 5.2.3**

**Property 21: Typing Indicator Broadcast**
*For any* two users in a conversation, when one user starts typing, the other user should receive a typing indicator event in real-time.
**Validates: Requirements 5.3.1**

**Property 22: Campaign Status Transition**
*For any* campaign in draft status, publishing it should change the status to active and prevent further status changes to draft.
**Validates: Requirements 6.1.9**

**Property 23: Active Campaign Edit Restrictions**
*For any* campaign in active status, attempts to edit the budget or duration fields should be rejected.
**Validates: Requirements 6.2.4**

**Property 24: Campaign Application Acceptance**
*For any* pending campaign application, when the company accepts it, the influencer should be added to the campaign's participant list.
**Validates: Requirements 6.2.8**

**Property 25: Campaign Application Idempotence**
*For any* campaign and influencer, attempting to apply to the same campaign multiple times should be rejected after the first application.
**Validates: Requirements 6.3.7**

**Property 26: Milestone Completion**
*For any* milestone in pending or in_progress status, marking it as completed should update the status to completed and set the completedAt timestamp.
**Validates: Requirements 7.1.8**

**Property 27: Deliverable Submission Notification**
*For any* deliverable, when an influencer submits it, the company should receive a notification about the submission.
**Validates: Requirements 7.2.5**

**Property 28: Deliverable Approval**
*For any* submitted deliverable, when the company approves it, the status should change to approved and the reviewedAt timestamp should be set.
**Validates: Requirements 7.2.6**

**Property 29: Collaboration Completion Precondition**
*For any* collaboration, it should only be markable as completed when all associated deliverables have status approved.
**Validates: Requirements 7.2.8**

**Property 30: Review Persistence**
*For any* completed collaboration, submitting a review should result in the review being retrievable with all original fields intact (rating, feedback, reviewer, reviewee).
**Validates: Requirements 7.4.2**

**Property 31: Review Idempotence**
*For any* collaboration and reviewer, attempting to submit multiple reviews for the same collaboration should be rejected after the first review.
**Validates: Requirements 7.4.5**

**Property 32: Profile View Deduplication**
*For any* profile and viewer, multiple views from the same viewer within 24 hours should count as only one view in the analytics.
**Validates: Requirements 8.1.6**

**Property 33: Match Statistics Calculation**
*For any* user, the match analytics (total matches, average score, distribution) should be calculated correctly from all matches involving that user.
**Validates: Requirements 8.2.6**

**Property 34: Campaign ROI Calculation**
*For any* campaign with known reach and budget, the ROI should be calculated as (total reach value - campaign budget) / campaign budget.
**Validates: Requirements 8.4.6**

**Property 35: XSS Input Sanitization**
*For any* text input containing HTML or script tags, the system should sanitize the input to prevent XSS attacks while preserving safe content.
**Validates: Requirements 9.1.6**

**Property 36: Event Notification Delivery**
*For any* system event that requires notification (collaboration request, campaign invite, message, post interaction, deliverable status change), a notification should be sent to the appropriate recipient.
**Validates: Requirements 9.2.1-9.2.6**



## Error Handling

### Backend Error Handling

The backend follows NestJS exception handling patterns with consistent error responses:

#### Exception Types

```typescript
// Standard NestJS exceptions
- BadRequestException (400): Invalid input data
- UnauthorizedException (401): Authentication failure
- ForbiddenException (403): Authorization failure
- NotFoundException (404): Resource not found
- ConflictException (409): Duplicate resource or constraint violation
- UnprocessableEntityException (422): Business logic violation
- InternalServerErrorException (500): Unexpected server error
```

#### Error Response Format

All errors return a consistent JSON structure:

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
```

#### Validation Errors

Class-validator provides detailed validation errors:

```typescript
{
  statusCode: 400,
  message: [
    "contentType should not be empty",
    "budget must be a positive number"
  ],
  error: "Bad Request"
}
```

#### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;
    
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';
    
    // Log error with context
    this.logger.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });
    
    // Don't expose internal errors to client
    const clientMessage = status === 500
      ? 'An unexpected error occurred'
      : message;
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: clientMessage,
    });
  }
}
```

#### Service-Level Error Handling

```typescript
@Injectable()
export class CollaborationService {
  async acceptRequest(userId: string, requestId: string): Promise<void> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId, recipient: { id: userId } },
    });
    
    if (!request) {
      throw new NotFoundException('Collaboration request not found');
    }
    
    if (request.status !== 'pending') {
      throw new BadRequestException('Request has already been processed');
    }
    
    try {
      // Business logic
      await this.processAcceptance(request);
    } catch (error) {
      this.logger.error('Failed to accept collaboration request', {
        requestId,
        userId,
        error: error.message,
      });
      throw new InternalServerErrorException('Failed to process request');
    }
  }
}
```

### Frontend Error Handling

#### Error Boundary

```typescript
export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please refresh the page or contact support if the problem persists.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### API Error Handling

```typescript
// API client with error handling
export class ApiClient {
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          const message = this.extractErrorMessage(error.response.data);
          throw new ApiError(message, error.response.status);
        } else if (error.request) {
          // Request made but no response
          throw new ApiError('Network error. Please check your connection.', 0);
        }
      }
      throw new ApiError('An unexpected error occurred', 500);
    }
  }
  
  private extractErrorMessage(data: any): string {
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    return 'An error occurred';
  }
}
```

#### React Query Error Handling

```typescript
export function useMatches(filters: MatchFilters) {
  return useQuery(
    ['matches', filters],
    () => matchingService.getMatches(filters),
    {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error: ApiError) => {
        if (error.status === 401) {
          // Redirect to login
          authService.logout();
        } else if (error.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(error.message);
        }
      },
    },
  );
}
```

#### Toast Notifications

```typescript
// User-friendly error messages
const errorMessages = {
  400: 'Invalid input. Please check your data.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  422: 'Unable to process your request.',
  500: 'Server error. Please try again later.',
};

export function showErrorToast(error: ApiError) {
  const message = errorMessages[error.status] || error.message;
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
}
```

### WebSocket Error Handling

```typescript
// WebSocket connection with reconnection logic
export function useMessaging() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  useEffect(() => {
    const token = authService.getToken();
    const newSocket = io('ws://localhost:3000/messaging', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError('Failed to connect to messaging service');
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setConnectionError(null);
      toast.success('Reconnected to messaging');
    });
    
    newSocket.on('reconnect_failed', () => {
      setConnectionError('Unable to reconnect. Please refresh the page.');
      toast.error('Connection lost. Please refresh the page.');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  return { socket, connectionError };
}
```



## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific examples and edge cases with property-based tests for universal properties. This ensures comprehensive coverage while avoiding redundant test cases.

### Testing Pyramid

```
        /\
       /  \
      / E2E \
     /--------\
    /Integration\
   /--------------\
  /  Unit + PBT   \
 /------------------\
```

- **Unit Tests + Property-Based Tests (70%)**: Core business logic, utilities, services
- **Integration Tests (20%)**: API endpoints, database operations, module interactions
- **E2E Tests (10%)**: Critical user flows, cross-module workflows

### Property-Based Testing

#### Configuration

- **Library**: fast-check (TypeScript/JavaScript)
- **Minimum iterations**: 100 per property test
- **Tag format**: `Feature: complete-platform-features, Property {number}: {property_text}`

#### Property Test Structure

```typescript
import fc from 'fast-check';

describe('Feature: complete-platform-features, Property 1: Non-Empty Array Validation', () => {
  it('should reject profile updates with empty required arrays', () => {
    fc.assert(
      fc.property(
        fc.record({
          contentType: fc.constant([]), // Empty array
          niche: fc.string(),
          audienceSize: fc.integer({ min: 1000, max: 10000000 }),
        }),
        async (profileUpdate) => {
          await expect(
            profileService.updateInfluencerProfile(userId, profileUpdate)
          ).rejects.toThrow('contentType should not be empty');
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: complete-platform-features, Property 3: Multi-Criteria Filtering', () => {
  it('should return only matches satisfying all filter criteria', () => {
    fc.assert(
      fc.property(
        fc.record({
          niches: fc.array(fc.constantFrom('fashion', 'tech', 'fitness'), { minLength: 1, maxLength: 3 }),
          minBudget: fc.integer({ min: 100, max: 5000 }),
          maxBudget: fc.integer({ min: 5000, max: 50000 }),
          platforms: fc.array(fc.constantFrom('instagram', 'youtube', 'tiktok'), { minLength: 1 }),
        }),
        async (filters) => {
          const matches = await matchingService.findMatchesWithFilters(userId, filters);
          
          // Verify all matches satisfy filter criteria
          matches.data.forEach(match => {
            expect(filters.niches).toContain(match.profile.niche);
            expect(match.profile.budget).toBeGreaterThanOrEqual(filters.minBudget);
            expect(match.profile.budget).toBeLessThanOrEqual(filters.maxBudget);
            expect(match.profile.platforms.some(p => filters.platforms.includes(p))).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: complete-platform-features, Property 6: Filter Preset Round Trip', () => {
  it('should preserve filter configuration through save and load', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          filters: fc.record({
            niches: fc.array(fc.string(), { maxLength: 5 }),
            minBudget: fc.integer({ min: 0, max: 100000 }),
            platforms: fc.array(fc.string(), { maxLength: 5 }),
          }),
        }),
        async (preset) => {
          // Save preset
          const saved = await filterPresetService.createPreset(userId, preset);
          
          // Load preset
          const loaded = await filterPresetService.getPreset(saved.id);
          
          // Verify round trip
          expect(loaded.filters).toEqual(preset.filters);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

#### Custom Generators

```typescript
// Generator for valid influencer profiles
const influencerProfileArb = fc.record({
  niche: fc.constantFrom('fashion', 'tech', 'fitness', 'food', 'travel'),
  audienceSize: fc.integer({ min: 1000, max: 10000000 }),
  engagementRate: fc.float({ min: 0.01, max: 0.15 }),
  platforms: fc.array(
    fc.constantFrom('instagram', 'youtube', 'tiktok', 'twitter'),
    { minLength: 1, maxLength: 4 }
  ),
  contentType: fc.array(
    fc.constantFrom('video', 'image', 'blog', 'podcast'),
    { minLength: 1, maxLength: 4 }
  ),
});

// Generator for valid messages
const messageArb = fc.record({
  content: fc.string({ minLength: 1, maxLength: 2000 }),
  recipientId: fc.uuid(),
});

// Generator for valid campaigns
const campaignArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 2000 }),
  budget: fc.integer({ min: 100, max: 100000 }),
  duration: fc.constantFrom('1-month', '3-months', '6-months', '1-year'),
  campaignTypes: fc.array(
    fc.constantFrom('product-launch', 'brand-awareness', 'event', 'sponsored-content'),
    { minLength: 1, maxLength: 4 }
  ),
});
```

### Unit Testing

#### Backend Unit Tests

```typescript
describe('CollaborationService', () => {
  let service: CollaborationService;
  let mockRepository: jest.Mocked<Repository<Collaboration>>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new CollaborationService(mockRepository, ...);
  });
  
  describe('acceptRequest', () => {
    it('should create connection when request is accepted', async () => {
      const request = createMockRequest({ status: 'pending' });
      mockRepository.findOne.mockResolvedValue(request);
      
      await service.acceptRequest(userId, requestId);
      
      expect(mockConnectionService.createConnection).toHaveBeenCalledWith(
        request.sender.id,
        request.recipient.id
      );
    });
    
    it('should throw error if request not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        service.acceptRequest(userId, requestId)
      ).rejects.toThrow(NotFoundException);
    });
    
    it('should throw error if request already processed', async () => {
      const request = createMockRequest({ status: 'accepted' });
      mockRepository.findOne.mockResolvedValue(request);
      
      await expect(
        service.acceptRequest(userId, requestId)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

#### Frontend Unit Tests

```typescript
describe('useMatchFilters', () => {
  it('should debounce filter changes', async () => {
    const { result } = renderHook(() => useMatchFilters());
    
    act(() => {
      result.current.setFilters({ niche: 'fashion' });
      result.current.setFilters({ niche: 'tech' });
      result.current.setFilters({ niche: 'fitness' });
    });
    
    // Should only trigger one API call after debounce
    await waitFor(() => {
      expect(mockMatchingService.getMatches).toHaveBeenCalledTimes(1);
      expect(mockMatchingService.getMatches).toHaveBeenCalledWith(
        expect.objectContaining({ niche: 'fitness' })
      );
    });
  });
  
  it('should clear all filters', () => {
    const { result } = renderHook(() => useMatchFilters());
    
    act(() => {
      result.current.setFilters({ niche: 'fashion', minBudget: 1000 });
    });
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.filters).toEqual(defaultFilters);
  });
});
```

### Integration Testing

#### API Integration Tests

```typescript
describe('Campaigns API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    authToken = await getAuthToken(app);
  });
  
  describe('POST /api/campaigns', () => {
    it('should create campaign with valid data', async () => {
      const campaign = {
        title: 'Summer Campaign',
        description: 'Promote summer collection',
        budget: 5000,
        duration: '3-months',
        campaignTypes: ['product-launch'],
        requiredPlatforms: ['instagram'],
      };
      
      const response = await request(app.getHttpServer())
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaign)
        .expect(201);
      
      expect(response.body).toMatchObject({
        ...campaign,
        status: 'draft',
      });
    });
    
    it('should reject campaign with negative budget', async () => {
      const campaign = {
        title: 'Invalid Campaign',
        budget: -1000,
      };
      
      await request(app.getHttpServer())
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaign)
        .expect(400);
    });
  });
});
```

#### Database Integration Tests

```typescript
describe('MatchingRepository', () => {
  let repository: MatchingRepository;
  let connection: Connection;
  
  beforeAll(async () => {
    connection = await createTestConnection();
    repository = connection.getCustomRepository(MatchingRepository);
  });
  
  afterAll(async () => {
    await connection.close();
  });
  
  it('should find matches with complex filters', async () => {
    // Seed test data
    await seedInfluencers(connection);
    await seedCompanies(connection);
    
    const filters = {
      niches: ['fashion', 'lifestyle'],
      minBudget: 1000,
      maxBudget: 5000,
      platforms: ['instagram'],
    };
    
    const matches = await repository.findWithFilters(userId, filters);
    
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach(match => {
      expect(['fashion', 'lifestyle']).toContain(match.profile.niche);
      expect(match.profile.budget).toBeGreaterThanOrEqual(1000);
      expect(match.profile.budget).toBeLessThanOrEqual(5000);
      expect(match.profile.platforms).toContain('instagram');
    });
  });
});
```

### E2E Testing

#### Critical User Flows

```typescript
describe('Collaboration Flow (e2e)', () => {
  let page: Page;
  
  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });
  
  it('should complete full collaboration workflow', async () => {
    // Login as influencer
    await loginAs(page, 'influencer@example.com');
    
    // Browse matches
    await page.click('[data-testid="matches-link"]');
    await page.waitForSelector('[data-testid="match-card"]');
    
    // Send collaboration request
    await page.click('[data-testid="match-card"]:first-child');
    await page.click('[data-testid="send-request-button"]');
    await page.fill('[data-testid="request-message"]', 'Interested in collaborating!');
    await page.click('[data-testid="submit-request"]');
    
    // Verify request sent
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
    
    // Login as company
    await loginAs(page, 'company@example.com');
    
    // Accept request
    await page.click('[data-testid="notifications-icon"]');
    await page.click('[data-testid="accept-request-button"]');
    
    // Verify connection created
    await page.click('[data-testid="connections-link"]');
    await expect(page.locator('[data-testid="connection-card"]')).toBeVisible();
  });
});
```

### Test Coverage Goals

- **Backend**: 80% code coverage minimum
- **Frontend**: 70% code coverage minimum
- **Property-based tests**: All 36 properties implemented
- **Integration tests**: All API endpoints covered
- **E2E tests**: All critical user flows covered

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run backend tests
        run: cd backend && npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Run frontend tests
        run: cd frontend && npm run test:cov
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

