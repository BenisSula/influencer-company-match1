# Notification System & Button Styling Fix Plan

## 🎯 Objectives

1. **Collaboration notifications** → Bell icon (🔔)
2. **Message notifications** → Message icon (💬) ONLY
3. **Rate button** → Same styling as Accept Collaboration button

---

## 📊 Current Issues

### Issue 1: No Collaboration Notifications
- When collaboration request is sent/accepted/rejected, no notification appears in bell icon
- Currently no backend notification system for collaboration events

### Issue 2: Rate Button Styling
- Rate Partner button has pink/red gradient
- Should match Accept Collaboration button (blue gradient)

---

## 🔧 Implementation Plan

### Phase 1: Backend - Notification System for Collaborations

#### 1.1 Create Notification Entity

**File**: `backend/src/modules/notifications/entities/notification.entity.ts` (NEW)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum NotificationType {
  COLLABORATION_REQUEST = 'collaboration_request',
  COLLABORATION_ACCEPTED = 'collaboration_accepted',
  COLLABORATION_REJECTED = 'collaboration_rejected',
  CONNECTION_REQUEST = 'connection_request',
  CONNECTION_ACCEPTED = 'connection_accepted',
  PROFILE_VIEW = 'profile_view',
  MATCH_FOUND = 'match_found',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### 1.2 Create Migration

**File**: `backend/src/database/migrations/1707601000000-CreateNotificationsTable.ts` (NEW)

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1707601000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type
    await queryRunner.query(`
      CREATE TYPE notification_type_enum AS ENUM (
        'collaboration_request',
        'collaboration_accepted',
        'collaboration_rejected',
        'connection_request',
        'connection_accepted',
        'profile_view',
        'match_found'
      );
    `);

    // Create table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'recipientId',
            type: 'uuid',
          },
          {
            name: 'senderId',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'notification_type_enum',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['recipientId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            name: 'senderId',
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            columnNames: ['recipientId', 'isRead'],
          },
          {
            columnNames: ['createdAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE notification_type_enum;`);
  }
}
```

#### 1.3 Create Notification Service

**File**: `backend/src/modules/notifications/notifications.service.ts` (NEW)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async createNotification(data: {
    recipientId: string;
    senderId: string;
    type: NotificationType;
    content: string;
    metadata?: any;
  }) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async getNotifications(userId: string, limit = 20) {
    return this.notificationRepository.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationRepository.update(
      { id: notificationId, recipientId: userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true },
    );
  }
}
```

#### 1.4 Update Matching Service to Send Notifications

**File**: `backend/src/modules/matching/matching.service.ts`

Add to `acceptCollaborationRequest`:

```typescript
// After saving connection
await this.notificationsService.createNotification({
  recipientId: connection.requesterId,
  senderId: userId,
  type: NotificationType.COLLABORATION_ACCEPTED,
  content: 'accepted your collaboration request',
  metadata: {
    connectionId: connection.id,
    collaborationType: connection.collaborationRequestData?.collaborationType,
  },
});
```

Add to `rejectCollaborationRequest`:

```typescript
// After saving connection
await this.notificationsService.createNotification({
  recipientId: connection.requesterId,
  senderId: userId,
  type: NotificationType.COLLABORATION_REJECTED,
  content: 'declined your collaboration request',
  metadata: {
    connectionId: connection.id,
  },
});
```

Add to `createCollaborationRequest`:

```typescript
// After creating request
await this.notificationsService.createNotification({
  recipientId: dto.recipientId,
  senderId: userId,
  type: NotificationType.COLLABORATION_REQUEST,
  content: 'sent you a collaboration request',
  metadata: {
    connectionId: connection.id,
    collaborationType: dto.collaborationType,
    budgetRange: `$${dto.budgetMin}-$${dto.budgetMax}`,
  },
});
```

---

### Phase 2: Frontend - Display Notifications in Bell Icon

#### 2.1 Add Notification Service

**File**: `src/renderer/services/notification.service.ts` (NEW)

```typescript
import { apiClient } from './api-client';

export interface Notification {
  id: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  type: string;
  content: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

class NotificationService {
  async getNotifications(limit = 20): Promise<Notification[]> {
    const response = await apiClient.get(`/notifications?limit=${limit}`);
    return response;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');
    return response.count || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  }
}

export const notificationService = new NotificationService();
```

#### 2.2 Update NotificationContext

**File**: `src/renderer/contexts/NotificationContext.tsx`

Add state for general notifications:

```typescript
const [generalNotifications, setGeneralNotifications] = useState<Notification[]>([]);
const [generalUnreadCount, setGeneralUnreadCount] = useState(0);

// Load notifications from backend
const loadNotifications = async () => {
  if (!user) return;
  
  try {
    const notifications = await notificationService.getNotifications();
    setGeneralNotifications(notifications);
    
    const count = await notificationService.getUnreadCount();
    setGeneralUnreadCount(count);
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }
};

useEffect(() => {
  if (user) {
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }
}, [user]);
```

#### 2.3 Update NotificationDropdown

**File**: `src/renderer/components/NotificationDropdown/NotificationDropdown.tsx`

Update to show backend notifications instead of local state:

```typescript
const { generalNotifications, generalUnreadCount, loadNotifications } = useNotifications();

// Display notifications from backend
{generalNotifications.map(notification => (
  <div key={notification.id} className="notification-item">
    <Avatar src={notification.sender.avatarUrl} name={notification.sender.name} size="sm" />
    <div>
      <strong>{notification.sender.name}</strong> {notification.content}
      <div className="notification-time">
        {formatTimeAgo(notification.createdAt)}
      </div>
    </div>
  </div>
))}
```

---

### Phase 3: Fix Rate Button Styling

#### 3.1 Update Connections Page

**File**: `src/renderer/pages/Connections.tsx`

Change Rate Partner button styling from pink/red gradient to match Accept button:

```typescript
// OLD (Pink/Red)
<Button
  variant="secondary"
  size="sm"
  onClick={() => handleRateConnection(request)}
  style={{ 
    background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    color: '#FFFFFF',
    border: 'none'
  }}
>
  ⭐ Rate Partner
</Button>

// NEW (Blue like Accept button)
<Button
  variant="primary"
  size="sm"
  onClick={() => handleRateConnection(request)}
>
  ⭐ Rate Partner
</Button>
```

---

## 📊 Notification Flow

### Collaboration Request Sent

```
Company sends collaboration request
  ↓
Backend: matching.service.createCollaborationRequest()
  ↓
Backend: notificationsService.createNotification({
  type: 'collaboration_request',
  recipientId: influencerId,
  content: 'sent you a collaboration request'
})
  ↓
Database: INSERT into notifications table
  ↓
Frontend: Polls /notifications endpoint
  ↓
Frontend: Shows in bell icon (🔔)
  ↓
User clicks bell → sees "TechStartup Inc sent you a collaboration request"
```

### Collaboration Accepted

```
Influencer accepts collaboration
  ↓
Backend: matching.service.acceptCollaborationRequest()
  ↓
Backend: notificationsService.createNotification({
  type: 'collaboration_accepted',
  recipientId: companyId,
  content: 'accepted your collaboration request'
})
  ↓
Database: INSERT into notifications table
  ↓
Frontend: Polls /notifications endpoint
  ↓
Frontend: Shows in bell icon (🔔)
  ↓
Company sees "Mike Chen accepted your collaboration request"
```

---

## 🎨 Button Styling Comparison

### Before

**Accept Collaboration**: Blue gradient (primary variant)
**Rate Partner**: Pink/Red gradient (custom style)

### After

**Accept Collaboration**: Blue gradient (primary variant)
**Rate Partner**: Blue gradient (primary variant) ✅ MATCHING

---

## 📝 Files to Create/Modify

### Backend (NEW)
1. `backend/src/modules/notifications/entities/notification.entity.ts`
2. `backend/src/modules/notifications/notifications.service.ts`
3. `backend/src/modules/notifications/notifications.controller.ts`
4. `backend/src/modules/notifications/notifications.module.ts`
5. `backend/src/database/migrations/1707601000000-CreateNotificationsTable.ts`

### Backend (MODIFY)
6. `backend/src/modules/matching/matching.service.ts` - Add notification calls
7. `backend/src/app.module.ts` - Import NotificationsModule

### Frontend (NEW)
8. `src/renderer/services/notification.service.ts`

### Frontend (MODIFY)
9. `src/renderer/contexts/NotificationContext.tsx` - Add general notifications
10. `src/renderer/components/NotificationDropdown/NotificationDropdown.tsx` - Show backend notifications
11. `src/renderer/pages/Connections.tsx` - Fix Rate button styling

---

## ✅ Success Criteria

- [ ] Collaboration request notifications appear in bell icon
- [ ] Collaboration accepted notifications appear in bell icon
- [ ] Collaboration rejected notifications appear in bell icon
- [ ] Message notifications ONLY appear in message icon
- [ ] Rate Partner button has same blue styling as Accept button
- [ ] Bell icon shows unread count for general notifications
- [ ] Message icon shows unread count for messages only
- [ ] No TypeScript errors
- [ ] Backend migration runs successfully

---

**Status**: 📋 PLAN COMPLETE  
**Next**: Implement Phase 3 (Quick Fix), then Phase 1-2 (Full System)
