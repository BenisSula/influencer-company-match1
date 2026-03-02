# Phase 4.3: A/B Testing Framework - Investigation & Implementation Plan

**Date:** February 12, 2026  
**Status:** 🔍 INVESTIGATION COMPLETE → 🚀 READY FOR IMPLEMENTATION  
**Previous Phases:** ✅ Phase 4.1 Complete | ✅ Phase 4.2 Complete  
**Current Phase:** Phase 4.3 - A/B Testing Framework

---

## 📊 Investigation Summary

### What's Been Completed ✅

**Phase 4.1: Collaboration Feedback System**
- ✅ 19 advanced features
- ✅ Collaboration outcome tracking
- ✅ Auto-retraining every 50 outcomes
- ✅ 7 pages integrated
- ✅ 80-85% prediction accuracy

**Phase 4.2: Python ML Service**
- ✅ Random Forest & Gradient Boosting
- ✅ Model versioning
- ✅ FastAPI microservice
- ✅ NestJS integration with fallback
- ✅ 85-90% prediction accuracy
- ✅ Docker containerization

### What's Missing (Phase 4.3) ❌

**A/B Testing Infrastructure:**
- ❌ No experiment management system
- ❌ No variant assignment logic
- ❌ No statistical significance testing
- ❌ No gradual rollout mechanism
- ❌ No experiment tracking/analytics
- ❌ No automatic rollback on failures

**Current Limitations:**
- Can't safely test new ML models
- Can't compare algorithm performance
- Can't gradually roll out changes
- Can't measure impact scientifically
- Risk of breaking production with changes

---

## 🎯 Phase 4.3 Goals

### Primary Objectives

1. **Safe Experimentation**
   - Test new ML models without risk
   - Compare algorithms (Random Forest vs Gradient Boosting)
   - Test feature combinations
   - Validate improvements before full rollout

2. **Data-Driven Decisions**
   - Statistical significance testing
   - Confidence intervals
   - A/B test results dashboard
   - Automated winner selection

3. **Gradual Rollout**
   - Start with 5% traffic
   - Increase to 25%, 50%, 75%, 100%
   - Automatic rollback on errors
   - Monitor metrics at each stage

4. **Continuous Optimization**
   - Always be testing
   - Iterative improvements
   - Learn what works
   - Minimize risk

---

## 🏗️ Architecture Design

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  - No changes needed (transparent to users)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  NestJS Backend                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Experiment Service                                   │  │
│  │  - Create/manage experiments                          │  │
│  │  - Assign users to variants                           │  │
│  │  - Track events                                       │  │
│  │  - Calculate results                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Rollout Service                                      │  │
│  │  - Gradual traffic increase                           │  │
│  │  - Health monitoring                                  │  │
│  │  - Automatic rollback                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ML Model Service (Enhanced)                          │  │
│  │  - Route to correct model variant                     │  │
│  │  - Track which model used                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL                                │
│  - experiments table                                         │
│  - experiment_assignments table                              │
│  - experiment_events table                                   │
│  - rollouts table                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Plan

### Feature 4.3.1: Experiment Management (16-20 hours)

#### Database Schema

```sql
-- Experiments table
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  variants JSONB NOT NULL,
  traffic_allocation JSONB NOT NULL,
  success_metric VARCHAR(50) NOT NULL,
  minimum_sample_size INTEGER DEFAULT 100,
  confidence_level DECIMAL(3,2) DEFAULT 0.95,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User assignments to experiment variants
CREATE TABLE experiment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  variant VARCHAR(50) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(experiment_id, user_id)
);

-- Events tracked during experiments
CREATE TABLE experiment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  variant VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiment_assignments_user ON experiment_assignments(user_id);
CREATE INDEX idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX idx_experiment_events_experiment ON experiment_events(experiment_id);
CREATE INDEX idx_experiment_events_created ON experiment_events(created_at);
```

#### Backend Implementation

**1. Experiment Entity**
```typescript
// backend/src/modules/experiments/entities/experiment.entity.ts
@Entity('experiments')
export class Experiment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'draft' })
  status: 'draft' | 'running' | 'paused' | 'completed';

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb' })
  variants: Record<string, any>;

  @Column({ type: 'jsonb' })
  trafficAllocation: Record<string, number>;

  @Column()
  successMetric: string;

  @Column({ default: 100 })
  minimumSampleSize: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.95 })
  confidenceLevel: number;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**2. Experiment Service**
```typescript
// backend/src/modules/experiments/experiment.service.ts
@Injectable()
export class ExperimentService {
  constructor(
    @InjectRepository(Experiment)
    private experimentRepository: Repository<Experiment>,
    @InjectRepository(ExperimentAssignment)
    private assignmentRepository: Repository<ExperimentAssignment>,
    @InjectRepository(ExperimentEvent)
    private eventRepository: Repository<ExperimentEvent>,
  ) {}

  // Create new experiment
  async createExperiment(dto: CreateExperimentDto): Promise<Experiment> {
    // Validate traffic allocation sums to 1.0
    const totalAllocation = Object.values(dto.trafficAllocation)
      .reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalAllocation - 1.0) > 0.01) {
      throw new BadRequestException('Traffic allocation must sum to 1.0');
    }

    const experiment = this.experimentRepository.create(dto);
    return this.experimentRepository.save(experiment);
  }

  // Start experiment
  async startExperiment(experimentId: string): Promise<Experiment> {
    const experiment = await this.experimentRepository.findOne({
      where: { id: experimentId },
    });

    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    
    return this.experimentRepository.save(experiment);
  }

  // Assign user to variant
  async assignVariant(experimentId: string, userId: string): Promise<string> {
    // Check existing assignment
    const existing = await this.assignmentRepository.findOne({
      where: { experimentId, userId },
    });

    if (existing) {
      return existing.variant;
    }

    // Get experiment
    const experiment = await this.experimentRepository.findOne({
      where: { id: experimentId, status: 'running' },
    });

    if (!experiment) {
      return 'control'; // Default to control if no active experiment
    }

    // Assign variant using consistent hashing
    const variant = this.selectVariant(
      userId,
      experiment.trafficAllocation
    );

    // Save assignment
    await this.assignmentRepository.save({
      experimentId,
      userId,
      variant,
    });

    return variant;
  }

  // Select variant using consistent hashing
  private selectVariant(
    userId: string,
    allocation: Record<string, number>
  ): string {
    // Hash user ID to get consistent 0-1 value
    const hash = this.hashUserId(userId);
    
    // Select variant based on allocation
    let cumulative = 0;
    for (const [variant, percentage] of Object.entries(allocation)) {
      cumulative += percentage;
      if (hash <= cumulative) {
        return variant;
      }
    }

    // Fallback to first variant
    return Object.keys(allocation)[0];
  }

  // Simple hash function
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 10000) / 10000; // 0-1 range
  }

  // Track event
  async trackEvent(
    experimentId: string,
    userId: string,
    eventType: string,
    eventData?: any,
  ): Promise<void> {
    const assignment = await this.assignmentRepository.findOne({
      where: { experimentId, userId },
    });

    if (!assignment) {
      return; // User not in experiment
    }

    await this.eventRepository.save({
      experimentId,
      userId,
      variant: assignment.variant,
      eventType,
      eventData,
    });
  }

  // Get experiment results
  async getResults(experimentId: string): Promise<ExperimentResults> {
    const events = await this.eventRepository.find({
      where: { experimentId },
    });

    // Group by variant
    const variantStats = new Map<string, VariantStats>();

    events.forEach(event => {
      if (!variantStats.has(event.variant)) {
        variantStats.set(event.variant, {
          variant: event.variant,
          users: new Set(),
          successCount: 0,
          totalEvents: 0,
        });
      }

      const stats = variantStats.get(event.variant);
      stats.users.add(event.userId);
      stats.totalEvents++;

      if (event.eventType === 'success') {
        stats.successCount++;
      }
    });

    // Calculate metrics
    const results = Array.from(variantStats.values()).map(stats => ({
      variant: stats.variant,
      users: stats.users.size,
      successRate: stats.successCount / stats.totalEvents,
      successCount: stats.successCount,
      totalEvents: stats.totalEvents,
    }));

    // Statistical significance
    const significance = this.calculateSignificance(results);
    const winner = this.determineWinner(results, significance);

    return {
      experimentId,
      results,
      significance,
      winner,
      isSignificant: significance >= 0.95,
    };
  }

  // Calculate statistical significance (Chi-square test)
  private calculateSignificance(results: VariantResult[]): number {
    if (results.length < 2) return 0;

    const [control, treatment] = results;
    
    // Sample sizes
    const n1 = control.totalEvents;
    const n2 = treatment.totalEvents;
    
    // Success rates
    const p1 = control.successRate;
    const p2 = treatment.successRate;
    
    // Pooled proportion
    const pooled = (n1 * p1 + n2 * p2) / (n1 + n2);
    
    // Standard error
    const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2));
    
    // Z-score
    const z = Math.abs(p2 - p1) / se;
    
    // Convert to confidence level (simplified)
    const confidence = 1 - (2 * (1 - this.normalCDF(z)));
    
    return Math.max(0, Math.min(1, confidence));
  }

  // Standard normal CDF
  private normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  // Error function approximation
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // Determine winner
  private determineWinner(
    results: VariantResult[],
    significance: number
  ): string | null {
    if (significance < 0.95) {
      return null; // Not statistically significant
    }

    // Return variant with highest success rate
    return results.reduce((best, current) =>
      current.successRate > best.successRate ? current : best
    ).variant;
  }
}
```

**Time Estimate:** 16-20 hours

---

### Feature 4.3.2: Gradual Rollout System (8-12 hours)

#### Database Schema

```sql
-- Rollouts table
CREATE TABLE rollouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  model_version VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  current_percentage INTEGER DEFAULT 0,
  target_percentage INTEGER DEFAULT 100,
  schedule JSONB NOT NULL,
  health_metrics JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rollouts_status ON rollouts(status);
```

#### Backend Implementation

```typescript
// backend/src/modules/experiments/rollout.service.ts
@Injectable()
export class RolloutService {
  constructor(
    @InjectRepository(Rollout)
    private rolloutRepository: Repository<Rollout>,
  ) {}

  // Create rollout
  async createRollout(dto: CreateRolloutDto): Promise<Rollout> {
    const rollout = this.rolloutRepository.create({
      name: dto.name,
      description: dto.description,
      modelVersion: dto.modelVersion,
      schedule: dto.schedule,
      currentPercentage: 0,
      targetPercentage: 100,
      status: 'pending',
    });

    return this.rolloutRepository.save(rollout);
  }

  // Update rollout percentage
  async updateRolloutPercentage(rolloutId: string): Promise<void> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId },
    });

    if (!rollout || rollout.status !== 'in_progress') {
      return;
    }

    const now = new Date();
    const targetPercentage = this.calculateTargetPercentage(
      rollout.schedule,
      now
    );

    if (targetPercentage > rollout.currentPercentage) {
      // Check health metrics before increasing
      const isHealthy = await this.checkHealthMetrics(rollout);

      if (isHealthy) {
        rollout.currentPercentage = targetPercentage;
        
        if (targetPercentage >= 100) {
          rollout.status = 'completed';
        }

        await this.rolloutRepository.save(rollout);
      } else {
        // Rollback if unhealthy
        await this.rollbackRollout(rolloutId);
      }
    }
  }

  // Calculate target percentage based on schedule
  private calculateTargetPercentage(
    schedule: RolloutSchedule,
    now: Date
  ): number {
    const startTime = new Date(schedule.startTime);
    const elapsed = now.getTime() - startTime.getTime();
    const elapsedHours = elapsed / (1000 * 60 * 60);

    // Find current stage
    let cumulativeHours = 0;
    for (const stage of schedule.stages) {
      cumulativeHours += stage.durationHours;
      
      if (elapsedHours < cumulativeHours) {
        return stage.percentage;
      }
    }

    return 100; // All stages complete
  }

  // Check health metrics
  private async checkHealthMetrics(rollout: Rollout): Promise<boolean> {
    // Get recent metrics for this model version
    const metrics = await this.getModelMetrics(rollout.modelVersion);

    // Define health thresholds
    const thresholds = {
      errorRate: 0.05, // Max 5% error rate
      latency: 200, // Max 200ms
      accuracy: 0.75, // Min 75% accuracy
    };

    return (
      metrics.errorRate < thresholds.errorRate &&
      metrics.latency < thresholds.latency &&
      metrics.accuracy > thresholds.accuracy
    );
  }

  // Rollback rollout
  async rollbackRollout(rolloutId: string): Promise<void> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId },
    });

    if (!rollout) {
      return;
    }

    rollout.status = 'rolled_back';
    rollout.currentPercentage = 0;
    
    await this.rolloutRepository.save(rollout);

    // Log rollback
    this.logger.warn(`Rollout ${rollout.name} rolled back due to health issues`);
  }

  // Check if user should use new model
  async shouldUseNewModel(userId: string, rolloutId: string): Promise<boolean> {
    const rollout = await this.rolloutRepository.findOne({
      where: { id: rolloutId, status: 'in_progress' },
    });

    if (!rollout) {
      return false;
    }

    // Consistent hashing
    const hash = this.hashUserId(userId);
    return hash < rollout.currentPercentage;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }
}
```

**Time Estimate:** 8-12 hours

---

## 📊 Implementation Timeline

### Week 1: Experiment Management (16-20 hours)
- Day 1-2: Database schema & migrations
- Day 3-4: Experiment service implementation
- Day 5: Testing & integration

### Week 2: Gradual Rollout (8-12 hours)
- Day 1-2: Rollout service implementation
- Day 3: Health monitoring
- Day 4: Testing & documentation

### Total: 24-32 hours (2 weeks)

---

## 🎯 Success Criteria

### Technical Metrics
- ✅ Experiments can be created and managed
- ✅ Users consistently assigned to variants
- ✅ Events tracked accurately
- ✅ Statistical significance calculated correctly
- ✅ Gradual rollout works smoothly
- ✅ Automatic rollback on failures

### Business Metrics
- ✅ Can safely test new ML models
- ✅ Can compare algorithm performance
- ✅ Can measure impact scientifically
- ✅ Zero production incidents from experiments

---

## 🚀 Next Steps

1. **Review this plan** - Approve architecture and approach
2. **Start implementation** - Begin with database schema
3. **Implement services** - Build experiment and rollout services
4. **Add API endpoints** - Create REST API for management
5. **Test thoroughly** - Unit, integration, and E2E tests
6. **Document** - API docs and user guides
7. **Deploy** - Roll out to production

---

**Status:** 🔍 INVESTIGATION COMPLETE  
**Ready:** ✅ YES - Ready to implement  
**Estimated Time:** 24-32 hours (2 weeks)  
**Impact:** HIGH - Safe experimentation and optimization

