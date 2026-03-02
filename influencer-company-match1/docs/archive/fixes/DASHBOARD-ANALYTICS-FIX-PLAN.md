# Dashboard Analytics - Complete Fix Plan

## Overview

This plan implements a complete analytics tracking system to replace the current mock/calculated data with real user interaction tracking.

---

## Phase 1: Database Schema (Foundation)

### 1.1 Create Analytics Tables

**New Migration**: `1707602000000-CreateAnalyticsTables.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAnalyticsTables1707602000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Profile Views Table
    await queryRunner.createTable(
      new Table({
        name: 'profile_views',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'viewer_id',
            type: 'uuid',
            isNullable: true, // Allow anonymous views
          },
          {
            name: 'profile_id',
            type: 'uuid',
          },
          {
            name: 'view_duration',
            type: 'integer',
            isNullable: true,
            comment: 'Duration in seconds',
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'matches, search, feed, etc.',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Match Impressions Table
    await queryRunner.createTable(
      new Table({
        name: 'match_impressions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'match_user_id',
            type: 'uuid',
          },
          {
            name: 'match_score',
            type: 'integer',
          },
          {
            name: 'position',
            type: 'integer',
            comment: 'Position in match list',
          },
          {
            name: 'clicked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '50',
            comment: 'dashboard, matches_page, suggestions, etc.',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // User Analytics Summary Table (for fast queries)
    await queryRunner.createTable(
      new Table({
        name: 'user_analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'total_profile_views',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_match_impressions',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_profile_clicks',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_connections_sent',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_connections_received',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_messages_sent',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_messages_received',
            type: 'integer',
            default: 0,
          },
          {
            name: 'response_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'last_updated',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'profile_views',
      new TableForeignKey({
        columnNames: ['viewer_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_views',
      new TableForeignKey({
        columnNames: ['profile_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'match_impressions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'match_impressions',
      new TableForeignKey({
        columnNames: ['match_user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_analytics',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Indexes for Performance
    await queryRunner.createIndex(
      'profile_views',
      new TableIndex({
        name: 'idx_profile_views_profile_date',
        columnNames: ['profile_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'profile_views',
      new TableIndex({
        name: 'idx_profile_views_viewer',
        columnNames: ['viewer_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'match_impressions',
      new TableIndex({
        name: 'idx_match_impressions_user_date',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'match_impressions',
      new TableIndex({
        name: 'idx_match_impressions_match_user',
        columnNames: ['match_user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_analytics',
      new TableIndex({
        name: 'idx_user_analytics_user',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_analytics');
    await queryRunner.dropTable('match_impressions');
    await queryRunner.dropTable('profile_views');
  }
}
```

---

## Phase 2: Backend Entities

### 2.1 ProfileView Entity

**File**: `backend/src/modules/analytics/entities/profile-view.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('profile_views')
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'viewer_id', nullable: true })
  viewerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'viewer_id' })
  viewer: User;

  @Column({ type: 'uuid', name: 'profile_id' })
  profileId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'profile_id' })
  profile: User;

  @Column({ type: 'integer', name: 'view_duration', nullable: true })
  viewDuration: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 2.2 MatchImpression Entity

**File**: `backend/src/modules/analytics/entities/match-impression.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('match_impressions')
export class MatchImpression {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'match_user_id' })
  matchUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'match_user_id' })
  matchUser: User;

  @Column({ type: 'integer', name: 'match_score' })
  matchScore: number;

  @Column({ type: 'integer' })
  position: number;

  @Column({ type: 'boolean', default: false })
  clicked: boolean;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### 2.3 UserAnalytics Entity

**File**: `backend/src/modules/analytics/entities/user-analytics.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('user_analytics')
export class UserAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer', name: 'total_profile_views', default: 0 })
  totalProfileViews: number;

  @Column({ type: 'integer', name: 'total_match_impressions', default: 0 })
  totalMatchImpressions: number;

  @Column({ type: 'integer', name: 'total_profile_clicks', default: 0 })
  totalProfileClicks: number;

  @Column({ type: 'integer', name: 'total_connections_sent', default: 0 })
  totalConnectionsSent: number;

  @Column({ type: 'integer', name: 'total_connections_received', default: 0 })
  totalConnectionsReceived: number;

  @Column({ type: 'integer', name: 'total_messages_sent', default: 0 })
  totalMessagesSent: number;

  @Column({ type: 'integer', name: 'total_messages_received', default: 0 })
  totalMessagesReceived: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'response_rate', default: 0 })
  responseRate: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

## Phase 3: Backend Service

### 3.1 Analytics Tracking Service

**File**: `backend/src/modules/analytics/analytics-tracking.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileView } from './entities/profile-view.entity';
import { MatchImpression } from './entities/match-impression.entity';
import { UserAnalytics } from './entities/user-analytics.entity';

@Injectable()
export class AnalyticsTrackingService {
  private readonly logger = new Logger(AnalyticsTrackingService.name);

  constructor(
    @InjectRepository(ProfileView)
    private profileViewRepository: Repository<ProfileView>,
    @InjectRepository(MatchImpression)
    private matchImpressionRepository: Repository<MatchImpression>,
    @InjectRepository(UserAnalytics)
    private userAnalyticsRepository: Repository<UserAnalytics>,
  ) {}

  /**
   * Record a profile view
   */
  async recordProfileView(
    profileId: string,
    viewerId?: string,
    source?: string,
    viewDuration?: number,
  ): Promise<void> {
    try {
      const view = this.profileViewRepository.create({
        profileId,
        viewerId,
        source,
        viewDuration,
      });

      await this.profileViewRepository.save(view);

      // Update user analytics summary
      await this.incrementUserAnalytics(profileId, 'totalProfileViews');

      this.logger.log(`Recorded profile view: ${profileId} by ${viewerId || 'anonymous'}`);
    } catch (error) {
      this.logger.error(`Failed to record profile view: ${error.message}`);
    }
  }

  /**
   * Record match impressions (batch)
   */
  async recordMatchImpressions(
    userId: string,
    matches: Array<{ matchUserId: string; matchScore: number; position: number }>,
    source: string,
  ): Promise<void> {
    try {
      const impressions = matches.map((match, index) =>
        this.matchImpressionRepository.create({
          userId,
          matchUserId: match.matchUserId,
          matchScore: match.matchScore,
          position: match.position || index,
          source,
          clicked: false,
        }),
      );

      await this.matchImpressionRepository.save(impressions);

      // Update user analytics summary for each match user
      for (const match of matches) {
        await this.incrementUserAnalytics(match.matchUserId, 'totalMatchImpressions');
      }

      this.logger.log(`Recorded ${matches.length} match impressions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to record match impressions: ${error.message}`);
    }
  }

  /**
   * Record match click
   */
  async recordMatchClick(userId: string, matchUserId: string): Promise<void> {
    try {
      // Find the most recent impression and mark as clicked
      const impression = await this.matchImpressionRepository.findOne({
        where: { userId, matchUserId, clicked: false },
        order: { createdAt: 'DESC' },
      });

      if (impression) {
        impression.clicked = true;
        await this.matchImpressionRepository.save(impression);
      }

      // Update user analytics
      await this.incrementUserAnalytics(matchUserId, 'totalProfileClicks');

      this.logger.log(`Recorded match click: ${userId} -> ${matchUserId}`);
    } catch (error) {
      this.logger.error(`Failed to record match click: ${error.message}`);
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    let analytics = await this.userAnalyticsRepository.findOne({
      where: { userId },
    });

    if (!analytics) {
      // Create new analytics record
      analytics = this.userAnalyticsRepository.create({ userId });
      await this.userAnalyticsRepository.save(analytics);
    }

    return analytics;
  }

  /**
   * Get profile views count
   */
  async getProfileViewsCount(profileId: string, days?: number): Promise<number> {
    const query = this.profileViewRepository
      .createQueryBuilder('view')
      .where('view.profile_id = :profileId', { profileId });

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.andWhere('view.created_at >= :startDate', { startDate });
    }

    return query.getCount();
  }

  /**
   * Get match impressions count
   */
  async getMatchImpressionsCount(matchUserId: string, days?: number): Promise<number> {
    const query = this.matchImpressionRepository
      .createQueryBuilder('impression')
      .where('impression.match_user_id = :matchUserId', { matchUserId });

    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query.andWhere('impression.created_at >= :startDate', { startDate });
    }

    return query.getCount();
  }

  /**
   * Calculate response rate
   */
  async calculateResponseRate(userId: string): Promise<number> {
    const analytics = await this.getUserAnalytics(userId);
    
    const totalReceived = analytics.totalConnectionsReceived + analytics.totalMessagesReceived;
    const totalResponded = analytics.totalConnectionsSent + analytics.totalMessagesSent;

    if (totalReceived === 0) return 0;

    return Math.round((totalResponded / totalReceived) * 100 * 100) / 100;
  }

  /**
   * Increment user analytics counter
   */
  private async incrementUserAnalytics(
    userId: string,
    field: keyof UserAnalytics,
  ): Promise<void> {
    try {
      await this.userAnalyticsRepository
        .createQueryBuilder()
        .insert()
        .into(UserAnalytics)
        .values({ userId, [field]: 1 })
        .orUpdate([field], ['user_id'])
        .execute();
    } catch (error) {
      this.logger.error(`Failed to increment ${field} for user ${userId}: ${error.message}`);
    }
  }
}
```

---

## Phase 4: Backend Controller

### 4.1 Analytics Controller

**File**: `backend/src/modules/analytics/analytics.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsTrackingService } from './analytics-tracking.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsTrackingService: AnalyticsTrackingService,
  ) {}

  @Post('profile-view')
  async recordProfileView(
    @Request() req: any,
    @Body() body: { profileId: string; source?: string; viewDuration?: number },
  ) {
    await this.analyticsTrackingService.recordProfileView(
      body.profileId,
      req.user.sub,
      body.source,
      body.viewDuration,
    );
    return { success: true };
  }

  @Post('match-impressions')
  async recordMatchImpressions(
    @Request() req: any,
    @Body() body: {
      matches: Array<{ matchUserId: string; matchScore: number; position: number }>;
      source: string;
    },
  ) {
    await this.analyticsTrackingService.recordMatchImpressions(
      req.user.sub,
      body.matches,
      body.source,
    );
    return { success: true };
  }

  @Post('match-click')
  async recordMatchClick(
    @Request() req: any,
    @Body() body: { matchUserId: string },
  ) {
    await this.analyticsTrackingService.recordMatchClick(req.user.sub, body.matchUserId);
    return { success: true };
  }

  @Get('my-analytics')
  async getMyAnalytics(@Request() req: any) {
    const analytics = await this.analyticsTrackingService.getUserAnalytics(req.user.sub);
    const responseRate = await this.analyticsTrackingService.calculateResponseRate(req.user.sub);

    return {
      profileViews: analytics.totalProfileViews,
      matchImpressions: analytics.totalMatchImpressions,
      profileClicks: analytics.totalProfileClicks,
      connectionsSent: analytics.totalConnectionsSent,
      connectionsReceived: analytics.totalConnectionsReceived,
      messagesSent: analytics.totalMessagesSent,
      messagesReceived: analytics.totalMessagesReceived,
      responseRate,
      trend: responseRate >= 70 ? 'up' : responseRate >= 50 ? 'stable' : 'down',
    };
  }

  @Get('profile-views/:profileId')
  async getProfileViews(
    @Param('profileId') profileId: string,
  ) {
    const count = await this.analyticsTrackingService.getProfileViewsCount(profileId);
    return { count };
  }
}
```

---

## Phase 5: Frontend Integration

### 5.1 Update Analytics Service

**File**: `src/renderer/services/analytics.service.ts`

```typescript
import { apiClient } from './api-client';

export interface AnalyticsMetrics {
  profileViews: number;
  matchImpressions: number;
  responseRate: number;
  profileClicks: number;
  connectionsSent: number;
  connectionsReceived: number;
  messagesSent: number;
  messagesReceived: number;
  trend: 'up' | 'down' | 'stable';
}

class AnalyticsService {
  /**
   * Get user analytics metrics
   */
  async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      const response = await apiClient.get<AnalyticsMetrics>('/analytics/my-analytics');
      return response;
    } catch (error) {
      console.error('[AnalyticsService] Failed to fetch metrics:', error);
      return {
        profileViews: 0,
        matchImpressions: 0,
        responseRate: 0,
        profileClicks: 0,
        connectionsSent: 0,
        connectionsReceived: 0,
        messagesSent: 0,
        messagesReceived: 0,
        trend: 'stable',
      };
    }
  }

  /**
   * Record profile view
   */
  async recordProfileView(profileId: string, source: string, viewDuration?: number): Promise<void> {
    try {
      await apiClient.post('/analytics/profile-view', {
        profileId,
        source,
        viewDuration,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record profile view:', error);
    }
  }

  /**
   * Record match impressions
   */
  async recordMatchImpressions(
    matches: Array<{ matchUserId: string; matchScore: number; position: number }>,
    source: string,
  ): Promise<void> {
    try {
      await apiClient.post('/analytics/match-impressions', {
        matches,
        source,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record match impressions:', error);
    }
  }

  /**
   * Record match click
   */
  async recordMatchClick(matchUserId: string): Promise<void> {
    try {
      await apiClient.post('/analytics/match-click', {
        matchUserId,
      });
    } catch (error) {
      console.error('[AnalyticsService] Failed to record match click:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
```

### 5.2 Track Profile Views

**File**: `src/renderer/pages/ProfileView.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { analyticsService } from '../services/analytics.service';

export const ProfileView = () => {
  const { id } = useParams();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Record profile view on mount
    if (id) {
      analyticsService.recordProfileView(id, 'profile_page');
    }

    // Record view duration on unmount
    return () => {
      if (id) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        analyticsService.recordProfileView(id, 'profile_page', duration);
      }
    };
  }, [id]);

  // ... rest of component
};
```

### 5.3 Track Match Impressions

**File**: `src/renderer/pages/Dashboard.tsx`

```typescript
import { useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';

export const Dashboard = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (matches.length > 0) {
      // Record match impressions
      const impressions = matches.map((match, index) => ({
        matchUserId: match.profile.id,
        matchScore: match.score,
        position: index,
      }));

      analyticsService.recordMatchImpressions(impressions, 'dashboard');
    }
  }, [matches]);

  // ... rest of component
};
```

### 5.4 Track Match Clicks

**File**: `src/renderer/components/MatchCard/MatchCard.tsx`

```typescript
import { analyticsService } from '../../services/analytics.service';

export const MatchCard = ({ match }: MatchCardProps) => {
  const handleProfileClick = () => {
    // Record match click
    analyticsService.recordMatchClick(match.profile.id);
    
    // Navigate to profile
    navigate(`/profile/${match.profile.id}`);
  };

  // ... rest of component
};
```

---

## Phase 6: Module Setup

### 6.1 Analytics Module

**File**: `backend/src/modules/analytics/analytics.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileView } from './entities/profile-view.entity';
import { MatchImpression } from './entities/match-impression.entity';
import { UserAnalytics } from './entities/user-analytics.entity';
import { AnalyticsTrackingService } from './analytics-tracking.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProfileView,
      MatchImpression,
      UserAnalytics,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsTrackingService],
  exports: [AnalyticsTrackingService],
})
export class AnalyticsModule {}
```

### 6.2 Register in App Module

**File**: `backend/src/app.module.ts`

```typescript
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // ... other modules
    AnalyticsModule,
  ],
})
export class AppModule {}
```

---

## Implementation Timeline

### Week 1: Database & Backend
- Day 1-2: Create migration and entities
- Day 3-4: Implement tracking service
- Day 5: Create controller and test endpoints

### Week 2: Frontend Integration
- Day 1-2: Update analytics service
- Day 3-4: Add tracking to components
- Day 5: Testing and bug fixes

### Week 3: Testing & Optimization
- Day 1-2: End-to-end testing
- Day 3-4: Performance optimization
- Day 5: Documentation and deployment

---

## Testing Plan

### Backend Tests
```typescript
describe('AnalyticsTrackingService', () => {
  it('should record profile view', async () => {
    await service.recordProfileView('user-id', 'viewer-id', 'dashboard');
    const count = await service.getProfileViewsCount('user-id');
    expect(count).toBe(1);
  });

  it('should record match impressions', async () => {
    const matches = [
      { matchUserId: 'match-1', matchScore: 85, position: 0 },
      { matchUserId: 'match-2', matchScore: 90, position: 1 },
    ];
    await service.recordMatchImpressions('user-id', matches, 'dashboard');
    const count = await service.getMatchImpressionsCount('match-1');
    expect(count).toBe(1);
  });

  it('should calculate response rate', async () => {
    const rate = await service.calculateResponseRate('user-id');
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });
});
```

### Frontend Tests
```typescript
describe('Analytics Tracking', () => {
  it('should track profile view on mount', () => {
    const spy = jest.spyOn(analyticsService, 'recordProfileView');
    render(<ProfileView />);
    expect(spy).toHaveBeenCalledWith(expect.any(String), 'profile_page');
  });

  it('should track match impressions', () => {
    const spy = jest.spyOn(analyticsService, 'recordMatchImpressions');
    render(<Dashboard />);
    expect(spy).toHaveBeenCalled();
  });
});
```

---

## Success Criteria

- ✅ Profile views are tracked in real-time
- ✅ Match impressions are recorded when displayed
- ✅ Response rate is calculated from actual data
- ✅ Analytics dashboard shows real numbers
- ✅ No performance degradation
- ✅ All tests passing
- ✅ Documentation complete

---

## Rollout Plan

1. **Development**: Implement and test locally
2. **Staging**: Deploy to staging environment
3. **Testing**: Run comprehensive tests
4. **Production**: Gradual rollout with monitoring
5. **Monitoring**: Track performance and errors
6. **Optimization**: Fine-tune based on metrics

---

**Plan Version**: 1.0  
**Created**: February 15, 2026  
**Status**: Ready for Implementation
