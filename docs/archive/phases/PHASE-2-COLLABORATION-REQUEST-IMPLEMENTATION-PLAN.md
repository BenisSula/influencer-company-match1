# Phase 2: Collaboration Request System - Implementation Plan

## 🎯 Objective

Replace the campaign application system with a direct collaboration request system. This transforms the platform from "post job → receive bids" to "discover partner → request collaboration instantly."

---

## 📊 Current State Analysis

### What Already Exists ✅

**Connection System**:
- `Connection` entity with status (pending, connected, accepted, rejected)
- `createConnection()` method in matching service
- `getConnectionStatus()` method
- Connection context for state management
- MatchCard with Connect/Message flow

**UI Components**:
- MatchCard with action buttons
- MatchActionBar for button layout
- ShareModal as modal pattern reference
- ApplicationModal (campaign-based, to be replaced)
- Button component with variants
- Card components
- Avatar components

**Backend Infrastructure**:
- Matching module
- Messaging module
- Notification system
- WebSocket support

### What Needs to Be Built 🔨

**New Components**:
1. `CollaborationRequestModal` - Request form
2. `CollaborationRequestCard` - Display incoming requests
3. `CollaborationStatusBadge` - Status indicator

**Database Extensions**:
1. Add `collaborationRequestData` JSON column to connections
2. Add `collaborationStatus` column to connections

**Backend Enhancements**:
1. Extend matching service with collaboration methods
2. Add collaboration request endpoints
3. Add collaboration notifications

**Frontend Pages**:
1. Collaboration Requests page (or integrate into existing pages)
2. Update ProfileView with "Request Collaboration" button
3. Update MatchCard with collaboration request flow

---

## 🏗️ Implementation Strategy

### Design Principles

1. **DRY (Don't Repeat Yourself)**
   - Reuse existing modal patterns (ShareModal)
   - Reuse existing form components
   - Reuse existing button styles
   - Reuse existing card layouts

2. **UI/UX Consistency**
   - Follow ShareModal design pattern
   - Use existing Button variants
   - Use existing Card components
   - Maintain responsive design
   - Follow global CSS variables

3. **Data Structure**
   - Extend existing Connection entity
   - No new tables needed
   - Use JSON column for flexibility
   - Backward compatible

4. **User Flow**
   - Simple and direct
   - No multi-step wizards
   - Instant feedback
   - Clear status indicators

---

## 📝 Step-by-Step Implementation

### Step 1: Database Schema Extension

#### 1.1 Create Migration for Collaboration Data

**File**: `backend/src/database/migrations/1707587000000-AddCollaborationDataToConnections.ts` (NEW)

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCollaborationDataToConnections1707587000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add collaboration_request_data JSON column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_request_data',
        type: 'jsonb',
        isNullable: true,
        comment: 'Stores collaboration request details (budget, timeline, deliverables, etc.)',
      }),
    );

    // Add collaboration_status column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_status',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: null,
        comment: 'Status of collaboration (requested, negotiating, agreed, active, completed, cancelled)',
      }),
    );

    // Add collaboration_type column
    await queryRunner.addColumn(
      'connections',
      new TableColumn({
        name: 'collaboration_type',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: null,
        comment: 'Type of collaboration (one-time, ongoing, project-based)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('connections', 'collaboration_type');
    await queryRunner.dropColumn('connections', 'collaboration_status');
    await queryRunner.dropColumn('connections', 'collaboration_request_data');
  }
}
```

**Design Rationale**:
- Uses JSONB for flexibility
- No breaking changes to existing connections
- Backward compatible
- Easy to query and update

---

#### 1.2 Update Connection Entity

**File**: `backend/src/modules/matching/entities/connection.entity.ts` (MODIFY)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ConnectionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export enum CollaborationStatus {
  REQUESTED = 'requested',
  NEGOTIATING = 'negotiating',
  AGREED = 'agreed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CollaborationType {
  ONE_TIME = 'one-time',
  ONGOING = 'ongoing',
  PROJECT_BASED = 'project-based'
}

export interface CollaborationRequestData {
  message?: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline?: string;
  deliverables?: string[];
  platforms?: string[];
  collaborationType?: CollaborationType;
  startDate?: string;
  endDate?: string;
  additionalNotes?: string;
}

@Entity('connections')
export class Connection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requesterId: string;

  @Column()
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requesterId' })
  requester: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.PENDING
  })
  status: ConnectionStatus;

  // New collaboration fields
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  collaborationRequestData?: CollaborationRequestData;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  collaborationStatus?: CollaborationStatus;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  collaborationType?: CollaborationType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Design Rationale**:
- Extends existing entity
- Type-safe with TypeScript
- Flexible JSON data structure
- Clear enum values

---

### Step 2: Backend Service Layer

#### 2.1 Create Collaboration DTOs

**File**: `backend/src/modules/matching/dto/create-collaboration-request.dto.ts` (NEW)

```typescript
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { CollaborationType } from '../entities/connection.entity';

export class CreateCollaborationRequestDto {
  @IsString()
  recipientId: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  timeline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  platforms?: string[];

  @IsOptional()
  @IsEnum(CollaborationType)
  collaborationType?: CollaborationType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
```

**File**: `backend/src/modules/matching/dto/update-collaboration-request.dto.ts` (NEW)

```typescript
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { CollaborationStatus } from '../entities/connection.entity';

export class UpdateCollaborationRequestDto {
  @IsEnum(CollaborationStatus)
  status: CollaborationStatus;

  @IsOptional()
  @IsString()
  responseMessage?: string;
}
```

**Design Rationale**:
- Validation with class-validator
- Type-safe
- Clear field requirements
- Flexible for future additions

---

#### 2.2 Extend Matching Service

**File**: `backend/src/modules/matching/matching.service.ts` (ADD METHODS)

Add these methods to the existing MatchingService class:

```typescript
  /**
   * Create a collaboration request
   */
  async createCollaborationRequest(
    userId: string,
    dto: CreateCollaborationRequestDto,
  ) {
    const { recipientId, ...collaborationData } = dto;

    // Check if connection already exists
    const existingConnection = await this.connectionRepository.findOne({
      where: [
        { requesterId: userId, recipientId },
        { requesterId: recipientId, recipientId: userId },
      ],
    });

    if (existingConnection) {
      // Update existing connection with collaboration request
      existingConnection.collaborationRequestData = collaborationData;
      existingConnection.collaborationStatus = CollaborationStatus.REQUESTED;
      existingConnection.collaborationType = dto.collaborationType;
      
      return this.connectionRepository.save(existingConnection);
    }

    // Create new connection with collaboration request
    const connection = this.connectionRepository.create({
      requesterId: userId,
      recipientId,
      status: ConnectionStatus.PENDING,
      collaborationRequestData: collaborationData,
      collaborationStatus: CollaborationStatus.REQUESTED,
      collaborationType: dto.collaborationType,
    });

    return this.connectionRepository.save(connection);
  }

  /**
   * Get collaboration requests received by user
   */
  async getReceivedCollaborationRequests(userId: string) {
    const requests = await this.connectionRepository.find({
      where: {
        recipientId: userId,
        collaborationStatus: CollaborationStatus.REQUESTED,
      },
      relations: ['requester'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Load requester profiles
    return Promise.all(
      requests.map(async (request) => {
        const profile = await this.loadUserProfile(request.requester);
        return {
          ...request,
          requester: {
            ...request.requester,
            profile,
          },
        };
      }),
    );
  }

  /**
   * Get collaboration requests sent by user
   */
  async getSentCollaborationRequests(userId: string) {
    const requests = await this.connectionRepository.find({
      where: {
        requesterId: userId,
        collaborationStatus: CollaborationStatus.REQUESTED,
      },
      relations: ['recipient'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Load recipient profiles
    return Promise.all(
      requests.map(async (request) => {
        const profile = await this.loadUserProfile(request.recipient);
        return {
          ...request,
          recipient: {
            ...request.recipient,
            profile,
          },
        };
      }),
    );
  }

  /**
   * Update collaboration request status
   */
  async updateCollaborationRequest(
    userId: string,
    connectionId: string,
    dto: UpdateCollaborationRequestDto,
  ) {
    const connection = await this.connectionRepository.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Collaboration request not found');
    }

    // Only recipient can update status
    if (connection.recipientId !== userId) {
      throw new BadRequestException('Not authorized to update this request');
    }

    connection.collaborationStatus = dto.status;
    
    // If accepted, also update connection status
    if (dto.status === CollaborationStatus.AGREED) {
      connection.status = ConnectionStatus.CONNECTED;
    }

    return this.connectionRepository.save(connection);
  }

  /**
   * Helper method to load user profile
   */
  private async loadUserProfile(user: User) {
    if (user.role === UserRole.INFLUENCER) {
      const profile = await this.influencerProfileRepository.findOne({
        where: { userId: user.id },
      });
      return profile ? {
        name: profile.name || profile.niche,
        bio: profile.bio,
        niche: profile.niche,
        audienceSize: profile.audienceSize,
        engagementRate: profile.engagementRate,
        location: profile.location,
        platforms: profile.platforms,
        avatarUrl: profile.avatarUrl,
      } : null;
    } else if (user.role === UserRole.COMPANY) {
      const profile = await this.companyProfileRepository.findOne({
        where: { userId: user.id },
      });
      return profile ? {
        name: profile.companyName,
        bio: profile.bio,
        industry: profile.industry,
        budget: profile.budget,
        location: profile.location,
        platforms: profile.platforms,
        avatarUrl: profile.avatarUrl,
      } : null;
    }
    return null;
  }
```

**Design Rationale**:
- Extends existing service
- Reuses existing patterns
- Type-safe
- Handles both new and existing connections

---

#### 2.3 Add Controller Endpoints

**File**: `backend/src/modules/matching/matching.controller.ts` (ADD ENDPOINTS)

Add these endpoints to the existing MatchingController class:

```typescript
  @Post('collaboration-requests')
  createCollaborationRequest(
    @Request() req: any,
    @Body() dto: CreateCollaborationRequestDto,
  ) {
    return this.matchingService.createCollaborationRequest(req.user.userId, dto);
  }

  @Get('collaboration-requests/received')
  getReceivedCollaborationRequests(@Request() req: any) {
    return this.matchingService.getReceivedCollaborationRequests(req.user.userId);
  }

  @Get('collaboration-requests/sent')
  getSentCollaborationRequests(@Request() req: any) {
    return this.matchingService.getSentCollaborationRequests(req.user.userId);
  }

  @Put('collaboration-requests/:id')
  updateCollaborationRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCollaborationRequestDto,
  ) {
    return this.matchingService.updateCollaborationRequest(req.user.userId, id, dto);
  }
```

**Design Rationale**:
- RESTful endpoints
- Consistent with existing patterns
- Protected by JWT guard
- Clear naming

---

### Step 3: Frontend Components

#### 3.1 Create Collaboration Request Modal

**File**: `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.tsx` (NEW)

This will be a comprehensive modal following the ShareModal pattern but with form fields.

```typescript
import React, { useState } from 'react';
import { HiX, HiCurrencyDollar, HiCalendar, HiClipboardList, HiChat } from 'react-icons/hi';
import { Button } from '../Button/Button';
import { useToast } from '../../contexts/ToastContext';
import { matchingService } from '../../services/matching.service';
import './CollaborationRequestModal.css';

export interface CollaborationRequestModalProps {
  recipientId: string;
  recipientName: string;
  recipientType: 'influencer' | 'company';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CollaborationRequestModal: React.FC<CollaborationRequestModalProps> = ({
  recipientId,
  recipientName,
  recipientType,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '1-3 months',
    collaborationType: 'one-time',
    platforms: [] as string[],
    deliverables: '',
    startDate: '',
    additionalNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      showToast('Please add a message', 'error');
      return;
    }

    try {
      setLoading(true);
      
      await matchingService.createCollaborationRequest({
        recipientId,
        message: formData.message,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
        timeline: formData.timeline,
        collaborationType: formData.collaborationType as any,
        platforms: formData.platforms.length > 0 ? formData.platforms : undefined,
        deliverables: formData.deliverables ? formData.deliverables.split(',').map(d => d.trim()) : undefined,
        startDate: formData.startDate || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      });

      showToast(`Collaboration request sent to ${recipientName}!`, 'success');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to send collaboration request:', error);
      showToast(error.message || 'Failed to send request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="collaboration-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Request Collaboration</h3>
            <p className="modal-subtitle">with {recipientName}</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <HiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="collaboration-form">
          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">
              <HiChat size={18} />
              Message *
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder={`Tell ${recipientName} about your collaboration idea...`}
              rows={4}
              required
            />
          </div>

          {/* Budget Range */}
          <div className="form-group">
            <label>
              <HiCurrencyDollar size={18} />
              Budget Range (Optional)
            </label>
            <div className="budget-inputs">
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="form-group">
            <label htmlFor="timeline">
              <HiCalendar size={18} />
              Timeline
            </label>
            <select
              id="timeline"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
            >
              <option value="immediate">Immediate (within 1 month)</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6+ months">6+ months</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Collaboration Type */}
          <div className="form-group">
            <label htmlFor="collaborationType">
              <HiClipboardList size={18} />
              Collaboration Type
            </label>
            <select
              id="collaborationType"
              value={formData.collaborationType}
              onChange={(e) => setFormData(prev => ({ ...prev, collaborationType: e.target.value }))}
            >
              <option value="one-time">One-Time Project</option>
              <option value="ongoing">Ongoing Partnership</option>
              <option value="project-based">Project-Based</option>
            </select>
          </div>

          {/* Platforms */}
          <div className="form-group">
            <label>Preferred Platforms (Optional)</label>
            <div className="platform-checkboxes">
              {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'].map(platform => (
                <label key={platform} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => togglePlatform(platform)}
                  />
                  {platform}
                </label>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="form-group">
            <label htmlFor="deliverables">
              Expected Deliverables (Optional)
            </label>
            <input
              id="deliverables"
              type="text"
              value={formData.deliverables}
              onChange={(e) => setFormData(prev => ({ ...prev, deliverables: e.target.value }))}
              placeholder="e.g., 3 Instagram posts, 1 YouTube video (comma-separated)"
            />
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label htmlFor="startDate">
              Preferred Start Date (Optional)
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label htmlFor="additionalNotes">
              Additional Notes (Optional)
            </label>
            <textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any other details you'd like to share..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

**Design Rationale**:
- Follows ShareModal pattern
- Clean form layout
- Optional fields for flexibility
- Clear validation
- Loading states
- Responsive design

---

**File**: `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.css` (NEW)

```css
.collaboration-request-modal {
  background: white;
  border-radius: var(--radius-lg);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
}

.collaboration-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="date"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-primary);
  transition: border-color var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.budget-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.budget-inputs input {
  flex: 1;
}

.budget-inputs span {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.platform-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .collaboration-request-modal {
    width: 95%;
    max-height: 95vh;
  }

  .collaboration-form {
    padding: 1rem;
  }

  .budget-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .budget-inputs span {
    text-align: center;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .platform-checkboxes {
    flex-direction: column;
  }
}
```

**Design Rationale**:
- Follows global CSS patterns
- Responsive breakpoints
- Smooth animations
- Accessible form elements
- Mobile-friendly layout

---

Due to length constraints, I'll create the complete plan document now with all remaining components and steps:



#### 3.2 Create Collaboration Request Card Component

**File**: `src/renderer/components/CollaborationRequestCard/CollaborationRequestCard.tsx` (NEW)

```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Avatar, Button } from '../';
import { HiCurrencyDollar, HiCalendar, HiClipboardList, HiCheck, HiX, HiMail } from 'react-icons/hi';
import { useToast } from '../../contexts/ToastContext';
import { matchingService } from '../../services/matching.service';
import './CollaborationRequestCard.css';

export interface CollaborationRequest {
  id: string;
  requester: {
    id: string;
    name: string;
    avatarUrl?: string;
    niche?: string;
    industry?: string;
  };
  collaborationRequestData: {
    message: string;
    budgetMin?: number;
    budgetMax?: number;
    timeline?: string;
    collaborationType?: string;
    platforms?: string[];
    deliverables?: string[];
    startDate?: string;
  };
  createdAt: string;
}

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  onUpdate?: () => void;
}

export const CollaborationRequestCard: React.FC<CollaborationRequestCardProps> = ({
  request,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      await matchingService.updateCollaborationRequest(request.id, {
        status: 'agreed',
      });
      showToast('Collaboration request accepted!', 'success');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to accept request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      setLoading(true);
      await matchingService.updateCollaborationRequest(request.id, {
        status: 'cancelled',
      });
      showToast('Collaboration request declined', 'info');
      onUpdate?.();
    } catch (error: any) {
      showToast(error.message || 'Failed to decline request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/messages', {
      state: {
        recipientId: request.requester.id,
        recipientName: request.requester.name,
        context: 'collaboration-request',
      },
    });
  };

  const formatBudget = () => {
    const { budgetMin, budgetMax } = request.collaborationRequestData;
    if (!budgetMin && !budgetMax) return null;
    if (budgetMin && budgetMax) return `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`;
    if (budgetMin) return `From $${budgetMin.toLocaleString()}`;
    if (budgetMax) return `Up to $${budgetMax.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="collaboration-request-card">
      <CardBody>
        <div className="request-header">
          <Avatar
            src={request.requester.avatarUrl}
            name={request.requester.name}
            size="md"
          />
          <div className="request-info">
            <h4>{request.requester.name}</h4>
            <p>{request.requester.niche || request.requester.industry}</p>
            <span className="request-time">{formatDate(request.createdAt)}</span>
          </div>
        </div>

        <div className="request-message">
          <p>{request.collaborationRequestData.message}</p>
        </div>

        <div className="request-details">
          {formatBudget() && (
            <div className="detail-item">
              <HiCurrencyDollar size={18} />
              <span>{formatBudget()}</span>
            </div>
          )}
          {request.collaborationRequestData.timeline && (
            <div className="detail-item">
              <HiCalendar size={18} />
              <span>{request.collaborationRequestData.timeline}</span>
            </div>
          )}
          {request.collaborationRequestData.collaborationType && (
            <div className="detail-item">
              <HiClipboardList size={18} />
              <span>{request.collaborationRequestData.collaborationType.replace('-', ' ')}</span>
            </div>
          )}
        </div>

        {request.collaborationRequestData.platforms && request.collaborationRequestData.platforms.length > 0 && (
          <div className="request-platforms">
            {request.collaborationRequestData.platforms.map(platform => (
              <span key={platform} className="platform-tag">{platform}</span>
            ))}
          </div>
        )}

        <div className="request-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMessage}
            disabled={loading}
          >
            <HiMail size={18} />
            Message
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDecline}
            disabled={loading}
          >
            <HiX size={18} />
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAccept}
            disabled={loading}
            loading={loading}
          >
            <HiCheck size={18} />
            Accept
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
```

**File**: `src/renderer/components/CollaborationRequestCard/CollaborationRequestCard.css` (NEW)

```css
.collaboration-request-card {
  margin-bottom: 1rem;
}

.request-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.request-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem 0;
}

.request-info p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.25rem 0;
}

.request-time {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.request-message {
  padding: 1rem;
  background-color: var(--color-neutral-light);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}

.request-message p {
  margin: 0;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.request-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.detail-item svg {
  color: var(--color-secondary);
}

.request-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.platform-tag {
  padding: 0.25rem 0.75rem;
  background-color: var(--color-neutral-light);
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  font-weight: 500;
  border-radius: var(--radius-full);
}

.request-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 768px) {
  .request-actions {
    flex-direction: column;
  }

  .request-actions button {
    width: 100%;
  }
}
```

---

### Step 4: Frontend Service Layer

#### 4.1 Extend Matching Service

**File**: `src/renderer/services/matching.service.ts` (ADD METHODS)

```typescript
  /**
   * Create a collaboration request
   */
  async createCollaborationRequest(data: {
    recipientId: string;
    message: string;
    budgetMin?: number;
    budgetMax?: number;
    timeline?: string;
    collaborationType?: string;
    platforms?: string[];
    deliverables?: string[];
    startDate?: string;
    additionalNotes?: string;
  }) {
    const response = await apiClient.post('/matching/collaboration-requests', data);
    return response;
  }

  /**
   * Get received collaboration requests
   */
  async getReceivedCollaborationRequests() {
    const response = await apiClient.get('/matching/collaboration-requests/received');
    return response;
  }

  /**
   * Get sent collaboration requests
   */
  async getSentCollaborationRequests() {
    const response = await apiClient.get('/matching/collaboration-requests/sent');
    return response;
  }

  /**
   * Update collaboration request status
   */
  async updateCollaborationRequest(requestId: string, data: {
    status: string;
    responseMessage?: string;
  }) {
    const response = await apiClient.put(`/matching/collaboration-requests/${requestId}`, data);
    return response;
  }
```

---

### Step 5: Update Existing Components

#### 5.1 Update MatchCard Component

**File**: `src/renderer/components/MatchCard/MatchCard.tsx` (MODIFY)

Replace the `handleConnect` function with collaboration request flow:

```typescript
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  const handleRequestCollaboration = () => {
    setShowCollaborationModal(true);
  };

  const handleCollaborationSuccess = () => {
    setShowCollaborationModal(false);
    showToast(`Collaboration request sent to ${profile.name}!`, 'success');
    // Refresh connection status
    refreshConnectionStatus(currentUserId, profile.id);
  };

  const getActionItems = (): MatchActionItem[] => {
    const hasConnection = connectionStatus === 'connected' || connectionStatus === 'pending';

    if (hasConnection) {
      return [
        {
          id: 'message',
          icon: <HiMail />,
          label: 'Message',
          variant: 'primary',
          onClick: handleMessage,
        },
        {
          id: 'profile',
          icon: <HiUser />,
          label: 'Profile',
          onClick: handleViewProfile,
        },
      ];
    }

    return [
      {
        id: 'collaborate',
        icon: <HiUserAdd />,
        label: 'Request Collaboration',
        variant: 'primary',
        onClick: handleRequestCollaboration,
      },
      {
        id: 'profile',
        icon: <HiUser />,
        label: 'Profile',
        onClick: handleViewProfile,
      },
    ];
  };

  // Add modal at the end of return statement
  return (
    <>
      <Card className="match-card">
        {/* ... existing card content ... */}
      </Card>

      {showCollaborationModal && (
        <CollaborationRequestModal
          recipientId={profile.id}
          recipientName={profile.name}
          recipientType={profile.type}
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          onSuccess={handleCollaborationSuccess}
        />
      )}
    </>
  );
```

---

#### 5.2 Update ProfileView Component

**File**: `src/renderer/pages/ProfileView.tsx` (MODIFY)

Add collaboration request button:

```typescript
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // In the action buttons section
  {!isOwnProfile && (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <HiArrowLeft size={20} />
        Back
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setShowCollaborationModal(true)}
      >
        <HiUserAdd size={20} />
        Request Collaboration
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleSendMessage}
      >
        <HiMail size={20} />
        Message
      </Button>
    </div>
  )}

  {/* Add modal */}
  {showCollaborationModal && profile && (
    <CollaborationRequestModal
      recipientId={id!}
      recipientName={profile.name}
      recipientType={profile.type}
      isOpen={showCollaborationModal}
      onClose={() => setShowCollaborationModal(false)}
      onSuccess={() => {
        setShowCollaborationModal(false);
        showToast('Collaboration request sent!', 'success');
      }}
    />
  )}
```

---

### Step 6: Create Collaboration Requests Page

**File**: `src/renderer/pages/CollaborationRequests.tsx` (NEW)

```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Button } from '../components';
import { CollaborationRequestCard } from '../components/CollaborationRequestCard/CollaborationRequestCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { matchingService } from '../services/matching.service';
import { HiInbox, HiPaperAirplane } from 'react-icons/hi';
import './CollaborationRequests.css';

type TabType = 'received' | 'sent';

export const CollaborationRequests: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = activeTab === 'received'
        ? await matchingService.getReceivedCollaborationRequests()
        : await matchingService.getSentCollaborationRequests();
      setRequests(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="collaboration-requests-page">
      <Card style={{ marginBottom: '1rem' }}>
        <CardHeader>
          <h2>Collaboration Requests</h2>
        </CardHeader>
        <CardBody>
          <div className="requests-tabs">
            <button
              className={`tab ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              <HiInbox size={20} />
              Received
            </button>
            <button
              className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <HiPaperAirplane size={20} />
              Sent
            </button>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody>
            <p>Loading requests...</p>
          </CardBody>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <p>No {activeTab} requests</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        requests.map(request => (
          <CollaborationRequestCard
            key={request.id}
            request={request}
            onUpdate={loadRequests}
          />
        ))
      )}
    </div>
  );
};
```

---

### Step 7: Update Component Exports

**File**: `src/renderer/components/index.ts` (ADD)

```typescript
export * from './CollaborationRequestModal/CollaborationRequestModal';
export * from './CollaborationRequestCard/CollaborationRequestCard';
```

---

### Step 8: Update Routes (Optional)

**File**: `src/renderer/AppComponent.tsx` (ADD ROUTE)

```typescript
<Route
  path="/collaboration-requests"
  element={
    <ProtectedRoute>
      <AppLayout>
        <CollaborationRequests />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

---

## 📋 Implementation Checklist

### Phase 2A: Database & Backend (2 hours)

- [ ] Create migration for collaboration data
- [ ] Update Connection entity
- [ ] Create collaboration DTOs
- [ ] Extend matching service with collaboration methods
- [ ] Add collaboration endpoints to controller
- [ ] Test backend endpoints with Postman/curl

### Phase 2B: Frontend Components (3 hours)

- [ ] Create CollaborationRequestModal component
- [ ] Create CollaborationRequestModal CSS
- [ ] Create CollaborationRequestCard component
- [ ] Create CollaborationRequestCard CSS
- [ ] Extend matching service (frontend)
- [ ] Update component exports

### Phase 2C: Integration (2 hours)

- [ ] Update MatchCard with collaboration flow
- [ ] Update ProfileView with collaboration button
- [ ] Create CollaborationRequests page
- [ ] Add route for collaboration requests
- [ ] Test end-to-end flow

### Phase 2D: Testing (1 hour)

- [ ] Test collaboration request creation
- [ ] Test request acceptance/decline
- [ ] Test messaging from requests
- [ ] Test responsive design
- [ ] Test error handling

---

## 🎨 UI/UX Design Specifications

### Color Scheme

- **Primary Action**: `var(--color-secondary)` - For "Request Collaboration" button
- **Success**: `var(--color-success)` - For accept actions
- **Danger**: `var(--color-error)` - For decline actions
- **Info**: `var(--color-info)` - For informational elements

### Typography

- **Modal Title**: 1.25rem, font-weight 600
- **Form Labels**: 0.9375rem, font-weight 600
- **Input Text**: 0.9375rem
- **Helper Text**: 0.8125rem

### Spacing

- **Modal Padding**: 1.5rem
- **Form Group Margin**: 1.5rem
- **Button Gap**: 0.75rem

### Responsive Breakpoints

- **Desktop**: > 768px
- **Tablet**: 768px
- **Mobile**: < 480px

---

## 🚀 Success Criteria

### Functional Requirements

- ✅ Users can send collaboration requests
- ✅ Users can view received requests
- ✅ Users can accept/decline requests
- ✅ Users can message from requests
- ✅ Requests include budget, timeline, deliverables
- ✅ No breaking changes to existing features

### Non-Functional Requirements

- ✅ Modal loads in < 300ms
- ✅ Form validation works
- ✅ Responsive on all devices
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Consistent with design system

---

## 📝 Next Steps (Phase 3)

After Phase 2 is complete:

1. **Profile Enhancements**
   - Add compatibility score display
   - Add collaboration history section
   - Add portfolio/highlights
   - Add analytics dashboard

2. **Dashboard Transformation**
   - Redesign as intelligence hub
   - Add smart recommendations
   - Add trending insights
   - Add activity feed

3. **Advanced Features**
   - Contract management
   - Milestone tracking
   - Payment integration
   - Video calls

---

**Document Version**: 1.0  
**Last Updated**: Current Session  
**Status**: Ready for Implementation  
**Estimated Time**: 8 hours
