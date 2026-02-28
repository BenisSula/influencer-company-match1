# Phase 4 AI/ML - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### What You're Building
An AI system that learns from collaboration outcomes to predict which influencer-brand partnerships will succeed.

### Current Status
- ✅ Basic AI infrastructure exists
- ✅ Database tables created
- ✅ API endpoints ready
- ❌ No real learning yet
- ❌ No outcome tracking

---

## 📋 Prerequisites

### Required
- Node.js 18+
- PostgreSQL 14+
- TypeScript knowledge
- Basic ML understanding

### Optional (for Phase 4.2)
- Python 3.9+
- Docker
- FastAPI knowledge

---

## 🎯 Phase 4.1: Start Here (Week 1-2)

### Step 1: Create Collaboration Outcome Entity

```typescript
// backend/src/modules/ai-matching/entities/collaboration-outcome.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Connection } from '../../matching/entities/connection.entity';

@Entity('collaboration_outcomes')
export class CollaborationOutcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'connection_id' })
  connectionId: string;

  @ManyToOne(() => Connection)
  @JoinColumn({ name: 'connection_id' })
  connection: Connection;

  @Column({ type: 'integer', name: 'success_rating' })
  successRating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 50, name: 'completion_status' })
  completionStatus: string; // completed, cancelled, ongoing

  @Column({ type: 'text', nullable: true, name: 'user_feedback' })
  userFeedback?: string;

  @Column({ type: 'jsonb', name: 'factors_at_match' })
  factorsAtMatch: any;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  roiAchieved?: number;

  @Column({ type: 'boolean', name: 'would_collaborate_again' })
  wouldCollaborateAgain: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Step 2: Create Migration

```bash
cd backend
npm run migration:create -- CreateCollaborationOutcomes
```

```typescript
// backend/src/database/migrations/[timestamp]-CreateCollaborationOutcomes.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCollaborationOutcomes[timestamp] implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'collaboration_outcomes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'connection_id',
            type: 'uuid',
          },
          {
            name: 'success_rating',
            type: 'integer',
          },
          {
            name: 'completion_status',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'user_feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'factors_at_match',
            type: 'jsonb',
          },
          {
            name: 'roi_achieved',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'would_collaborate_again',
            type: 'boolean',
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

    await queryRunner.createForeignKey(
      'collaboration_outcomes',
      new TableForeignKey({
        columnNames: ['connection_id'],
        referencedTableName: 'connections',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_connection ON collaboration_outcomes(connection_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_collaboration_outcomes_rating ON collaboration_outcomes(success_rating)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('collaboration_outcomes');
  }
}
```

### Step 3: Run Migration

```bash
npm run migration:run
```

### Step 4: Create Outcome Service

```typescript
// backend/src/modules/ai-matching/collaboration-outcome.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollaborationOutcome } from './entities/collaboration-outcome.entity';
import { Connection } from '../matching/entities/connection.entity';

@Injectable()
export class CollaborationOutcomeService {
  constructor(
    @InjectRepository(CollaborationOutcome)
    private outcomeRepository: Repository<CollaborationOutcome>,
    @InjectRepository(Connection)
    private connectionRepository: Repository<Connection>,
  ) {}

  async recordOutcome(
    connectionId: string,
    data: {
      successRating: number;
      completionStatus: string;
      userFeedback?: string;
      roiAchieved?: number;
      wouldCollaborateAgain: boolean;
    },
  ): Promise<CollaborationOutcome> {
    // Get connection to extract match factors
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    // Extract factors at time of match
    const factorsAtMatch = {
      // Store original match factors here
      // This will be used for training
    };

    const outcome = this.outcomeRepository.create({
      connectionId,
      successRating: data.successRating,
      completionStatus: data.completionStatus,
      userFeedback: data.userFeedback,
      factorsAtMatch,
      roiAchieved: data.roiAchieved,
      wouldCollaborateAgain: data.wouldCollaborateAgain,
    });

    return this.outcomeRepository.save(outcome);
  }

  async getOutcomesByUser(userId: string): Promise<CollaborationOutcome[]> {
    return this.outcomeRepository
      .createQueryBuilder('outcome')
      .innerJoin('outcome.connection', 'connection')
      .where('connection.requesterId = :userId OR connection.recipientId = :userId', { userId })
      .orderBy('outcome.createdAt', 'DESC')
      .getMany();
  }

  async getSuccessRate(userId: string): Promise<number> {
    const outcomes = await this.getOutcomesByUser(userId);
    
    if (outcomes.length === 0) return 0;
    
    const successfulOutcomes = outcomes.filter(o => o.successRating >= 4);
    return (successfulOutcomes.length / outcomes.length) * 100;
  }
}
```

### Step 5: Add API Endpoints

```typescript
// backend/src/modules/ai-matching/ai-matching.controller.ts (add these)
@Post('outcomes')
async recordCollaborationOutcome(
  @Request() req,
  @Body() body: {
    connectionId: string;
    successRating: number;
    completionStatus: string;
    userFeedback?: string;
    roiAchieved?: number;
    wouldCollaborateAgain: boolean;
  },
) {
  return this.collaborationOutcomeService.recordOutcome(body.connectionId, body);
}

@Get('outcomes/my')
async getMyOutcomes(@Request() req) {
  return this.collaborationOutcomeService.getOutcomesByUser(req.user.userId);
}

@Get('outcomes/success-rate')
async getMySuccessRate(@Request() req) {
  const rate = await this.collaborationOutcomeService.getSuccessRate(req.user.userId);
  return { successRate: rate };
}
```

---

## 🎨 Frontend Implementation

### Step 6: Create Feedback Modal Component

```typescript
// src/renderer/components/CollaborationFeedbackModal/CollaborationFeedbackModal.tsx
import React, { useState } from 'react';
import './CollaborationFeedbackModal.css';

interface CollaborationFeedbackModalProps {
  connectionId: string;
  partnerName: string;
  onClose: () => void;
  onSubmit: (feedback: any) => void;
}

export const CollaborationFeedbackModal: React.FC<CollaborationFeedbackModalProps> = ({
  connectionId,
  partnerName,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('completed');
  const [feedback, setFeedback] = useState('');
  const [roi, setRoi] = useState('');
  const [wouldCollaborate, setWouldCollaborate] = useState(true);

  const handleSubmit = () => {
    onSubmit({
      connectionId,
      successRating: rating,
      completionStatus: status,
      userFeedback: feedback,
      roiAchieved: roi ? parseFloat(roi) : undefined,
      wouldCollaborateAgain: wouldCollaborate,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Rate Your Collaboration</h2>
        <p>How was your experience with {partnerName}?</p>

        <div className="rating-section">
          <label>Overall Rating</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${rating >= star ? 'filled' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="completed">Completed Successfully</option>
            <option value="ongoing">Still Ongoing</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-group">
          <label>Feedback (Optional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>ROI Achieved (Optional)</label>
          <input
            type="number"
            value={roi}
            onChange={(e) => setRoi(e.target.value)}
            placeholder="e.g., 250 (for 250%)"
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={wouldCollaborate}
              onChange={(e) => setWouldCollaborate(e.target.checked)}
            />
            I would collaborate with them again
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Backend

```bash
# Start backend
cd backend
npm run start:dev

# Test with curl
curl -X POST http://localhost:3000/ai-matching/outcomes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "connectionId": "connection-uuid",
    "successRating": 5,
    "completionStatus": "completed",
    "userFeedback": "Great collaboration!",
    "roiAchieved": 250,
    "wouldCollaborateAgain": true
  }'
```

### Test Frontend

```bash
# Start frontend
cd ..
npm run dev

# Navigate to a connection
# Click "Rate Collaboration" button
# Fill out form and submit
```

---

## 📊 Verify Data Collection

```sql
-- Check outcomes table
SELECT * FROM collaboration_outcomes ORDER BY created_at DESC LIMIT 10;

-- Check success rate
SELECT 
  AVG(success_rating) as avg_rating,
  COUNT(*) as total_outcomes,
  COUNT(CASE WHEN success_rating >= 4 THEN 1 END) as successful
FROM collaboration_outcomes;
```

---

## 🎯 Next Steps

Once you have 50+ outcomes collected:

1. **Implement Advanced Features** (Week 3)
   - Add temporal features
   - Add behavioral features
   - Add network features

2. **Improve ML Algorithm** (Week 4)
   - Implement logistic regression
   - Add gradient descent
   - Test predictions

3. **Monitor Performance**
   - Track prediction accuracy
   - Measure user satisfaction
   - Analyze feature importance

---

## 🆘 Troubleshooting

### Migration Fails
```bash
# Check database connection
npm run migration:show

# Revert if needed
npm run migration:revert

# Try again
npm run migration:run
```

### API Returns 401
- Check JWT token
- Verify authentication
- Check user permissions

### Frontend Not Connecting
- Check API URL in config
- Verify CORS settings
- Check network tab in DevTools

---

## 📚 Resources

- [Full Implementation Plan](./PHASE-4-AI-ML-IMPLEMENTATION-PLAN.md)
- [AI Matching System Explained](./AI-MATCHING-SYSTEM-EXPLAINED.md)
- [TypeORM Documentation](https://typeorm.io)
- [NestJS Documentation](https://nestjs.com)

---

**Status:** Ready to implement
**Time to Complete:** 2-3 weeks
**Difficulty:** Medium

