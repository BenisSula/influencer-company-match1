# Phase 5: Enhanced Interactions - Implementation Plan 🎯

## Executive Summary

**Goal:** Implement advanced engagement features (Reactions, Save/Bookmark, Share, Mentions & Hashtags)
**Timeline:** 2 weeks (4 sub-phases)
**Priority:** MEDIUM (Engagement & User Retention)
**Current State:** Basic like/save exists, NO reactions/mentions/hashtags/share
**Target:** Full Facebook-style interaction system with rich engagement features

---

## Current State Analysis

### ✅ What We Have (Foundation)

#### Existing Functionality:
1. **Basic Like System**
   - ✅ Like/unlike posts
   - ✅ Like count tracking
   - ✅ User like status check
   - ✅ Backend endpoints: POST/DELETE `/feed/posts/:id/like`

2. **Basic Save System**
   - ✅ Save/unsave posts
   - ✅ Saved posts list
   - ✅ User save status check
   - ✅ Backend endpoints: POST/DELETE `/feed/posts/:id/save`
   - ✅ Entity: `post-save.entity.ts`

3. **ReactionPicker Component**
   - ✅ Component exists: `src/renderer/components/ReactionPicker/ReactionPicker.tsx`
   - ✅ 6 reaction types: like, love, wow, haha, sad, angry
   - ✅ Animated picker with hover effects
   - ✅ Already integrated in FeedPost component

4. **Comment System**
   - ✅ Create/delete comments
   - ✅ Comment count tracking
   - ✅ Comment section component

5. **Feed Infrastructure**
   - ✅ Feed posts with media
   - ✅ Post types (update, collaboration_story, campaign, portfolio)
   - ✅ Rich text support via RichText component

### ❌ What We're Missing (To Build)

#### 1. Reaction System (Backend)
- ❌ Reactions database table
- ❌ Reaction entity
- ❌ Reaction endpoints (POST/DELETE/GET)
- ❌ Reaction counts by type
- ❌ Who reacted modal data
- ❌ Replace simple like with reactions

#### 2. Enhanced Save/Bookmark System
- ❌ Collections/folders for saved items
- ❌ Save campaigns
- ❌ Save matches
- ❌ Saved items page
- ❌ Collection management

#### 3. Share Functionality
- ❌ Share modal component
- ❌ Share to feed
- ❌ Share via message
- ❌ Copy link functionality (basic exists)
- ❌ External share (Twitter, LinkedIn, Facebook)
- ❌ Share tracking
- ❌ Share count display

#### 4. Mention System
- ❌ @ mention parsing
- ❌ User search autocomplete
- ❌ Mention highlighting
- ❌ Mention notifications
- ❌ Mention entity
- ❌ Clickable mentions

#### 5. Hashtag System
- ❌ # hashtag parsing
- ❌ Hashtag entity
- ❌ Hashtag suggestions
- ❌ Trending hashtags
- ❌ Hashtag page
- ❌ Clickable hashtags
- ❌ Hashtag search


---

## Implementation Strategy

### 🎭 Phase 5A: Reaction System (Days 1-3)

#### Step 1: Backend - Reaction Entity & Migration

**Create Migration:** `backend/src/database/migrations/1707580000000-CreateReactionsTable.ts`

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateReactionsTable1707580000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reactions',
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
            name: 'target_type',
            type: 'varchar',
            length: '50',
            comment: 'post, comment, match',
          },
          {
            name: 'target_id',
            type: 'uuid',
          },
          {
            name: 'reaction_type',
            type: 'varchar',
            length: '20',
            comment: 'like, love, wow, haha, sad, angry',
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

    // Create indexes
    await queryRunner.createIndex(
      'reactions',
      new TableIndex({
        name: 'IDX_reactions_user_target',
        columnNames: ['user_id', 'target_type', 'target_id'],
      }),
    );

    await queryRunner.createIndex(
      'reactions',
      new TableIndex({
        name: 'IDX_reactions_target',
        columnNames: ['target_type', 'target_id'],
      }),
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'reactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add unique constraint (one reaction per user per target)
    await queryRunner.query(`
      ALTER TABLE reactions 
      ADD CONSTRAINT UQ_user_target 
      UNIQUE (user_id, target_type, target_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('reactions');
  }
}
```

#### Step 2: Backend - Reaction Entity

**Create:** `backend/src/modules/feed/entities/reaction.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  WOW = 'wow',
  HAHA = 'haha',
  SAD = 'sad',
  ANGRY = 'angry',
}

export enum TargetType {
  POST = 'post',
  COMMENT = 'comment',
  MATCH = 'match',
}

@Entity('reactions')
@Index(['userId', 'targetType', 'targetId'])
@Index(['targetType', 'targetId'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'target_type',
    type: 'varchar',
    length: 50,
  })
  targetType: TargetType;

  @Column({ name: 'target_id' })
  targetId: string;

  @Column({
    name: 'reaction_type',
    type: 'varchar',
    length: 20,
  })
  reactionType: ReactionType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```


#### Step 3: Backend - Reaction Service Methods

**Update:** `backend/src/modules/feed/feed.service.ts`

Add these methods:

```typescript
// Reaction methods
async reactToPost(postId: string, userId: string, reactionType: ReactionType): Promise<void> {
  // Check if post exists
  const post = await this.postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new NotFoundException('Post not found');
  }

  // Check if user already reacted
  const existingReaction = await this.reactionRepository.findOne({
    where: {
      userId,
      targetType: TargetType.POST,
      targetId: postId,
    },
  });

  if (existingReaction) {
    // Update reaction type
    existingReaction.reactionType = reactionType;
    await this.reactionRepository.save(existingReaction);
  } else {
    // Create new reaction
    const reaction = this.reactionRepository.create({
      userId,
      targetType: TargetType.POST,
      targetId: postId,
      reactionType,
    });
    await this.reactionRepository.save(reaction);
    
    // Increment like count (for backward compatibility)
    post.likeCount += 1;
    await this.postRepository.save(post);
  }
}

async removeReaction(postId: string, userId: string): Promise<void> {
  const reaction = await this.reactionRepository.findOne({
    where: {
      userId,
      targetType: TargetType.POST,
      targetId: postId,
    },
  });

  if (reaction) {
    await this.reactionRepository.remove(reaction);
    
    // Decrement like count
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (post && post.likeCount > 0) {
      post.likeCount -= 1;
      await this.postRepository.save(post);
    }
  }
}

async getPostReactions(postId: string): Promise<{
  total: number;
  byType: Record<ReactionType, number>;
  userReaction: ReactionType | null;
  recentReactors: any[];
}> {
  const reactions = await this.reactionRepository.find({
    where: {
      targetType: TargetType.POST,
      targetId: postId,
    },
    relations: ['user'],
    order: { createdAt: 'DESC' },
  });

  const byType: Record<ReactionType, number> = {
    [ReactionType.LIKE]: 0,
    [ReactionType.LOVE]: 0,
    [ReactionType.WOW]: 0,
    [ReactionType.HAHA]: 0,
    [ReactionType.SAD]: 0,
    [ReactionType.ANGRY]: 0,
  };

  reactions.forEach((reaction) => {
    byType[reaction.reactionType]++;
  });

  const recentReactors = reactions.slice(0, 10).map((r) => ({
    userId: r.userId,
    userName: r.user.email.split('@')[0],
    avatarUrl: r.user.avatarUrl,
    reactionType: r.reactionType,
  }));

  return {
    total: reactions.length,
    byType,
    userReaction: null, // Will be set by controller
    recentReactors,
  };
}

async getUserReaction(postId: string, userId: string): Promise<ReactionType | null> {
  const reaction = await this.reactionRepository.findOne({
    where: {
      userId,
      targetType: TargetType.POST,
      targetId: postId,
    },
  });

  return reaction ? reaction.reactionType : null;
}
```

#### Step 4: Backend - Reaction Endpoints

**Update:** `backend/src/modules/feed/feed.controller.ts`

Add these endpoints:

```typescript
// Replace old like endpoints with reactions
@Post('posts/:id/react')
async reactToPost(
  @Param('id') id: string,
  @CurrentUser() user: any,
  @Body() body: { reactionType: ReactionType },
) {
  await this.feedService.reactToPost(id, user.sub, body.reactionType);
  return { message: 'Reaction added successfully' };
}

@Delete('posts/:id/react')
async removeReaction(@Param('id') id: string, @CurrentUser() user: any) {
  await this.feedService.removeReaction(id, user.sub);
  return { message: 'Reaction removed successfully' };
}

@Get('posts/:id/reactions')
async getPostReactions(@Param('id') id: string, @CurrentUser() user: any) {
  const reactions = await this.feedService.getPostReactions(id);
  const userReaction = await this.feedService.getUserReaction(id, user.sub);
  return { ...reactions, userReaction };
}

// Keep old like endpoints for backward compatibility
// They will internally use reactions with type 'like'
```


#### Step 5: Frontend - Update Feed Service

**Update:** `src/renderer/services/feed.service.ts`

Add reaction methods:

```typescript
async reactToPost(postId: string, reactionType: string): Promise<void> {
  await apiClient.post(`/feed/posts/${postId}/react`, { reactionType });
}

async removeReaction(postId: string): Promise<void> {
  await apiClient.delete(`/feed/posts/${postId}/react`);
}

async getPostReactions(postId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  userReaction: string | null;
  recentReactors: any[];
}> {
  return apiClient.get(`/feed/posts/${postId}/reactions`);
}
```

#### Step 6: Frontend - Update FeedPost Component

**Update:** `src/renderer/components/FeedPost/FeedPost.tsx`

Replace like logic with reactions:

```typescript
const handleReaction = async (reactionType: ReactionType) => {
  try {
    if (reaction === reactionType) {
      // Remove reaction
      await feedService.removeReaction(post.id);
      setReaction(null);
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      // Add or change reaction
      await feedService.reactToPost(post.id, reactionType);
      if (!reaction) {
        setLikeCount(prev => prev + 1);
      }
      setReaction(reactionType);
      setLiked(true);
    }
    onLikeChange?.();
  } catch (error: any) {
    showToast(error.message || 'Failed to update reaction', 'error');
  }
};
```

#### Step 7: Frontend - Who Reacted Modal

**Create:** `src/renderer/components/WhoReactedModal/WhoReactedModal.tsx`

```typescript
interface WhoReactedModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhoReactedModal: React.FC<WhoReactedModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [reactions, setReactions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadReactions();
    }
  }, [isOpen, postId]);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const data = await feedService.getPostReactions(postId);
      setReactions(data);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reactions</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="reaction-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All {reactions?.total || 0}
          </button>
          {Object.entries(reactions?.byType || {}).map(([type, count]) => (
            count > 0 && (
              <button
                key={type}
                className={filter === type ? 'active' : ''}
                onClick={() => setFilter(type)}
              >
                {REACTIONS.find(r => r.type === type)?.emoji} {count}
              </button>
            )
          ))}
        </div>

        <div className="reactors-list">
          {loading ? (
            <div>Loading...</div>
          ) : (
            reactions?.recentReactors
              .filter(r => filter === 'all' || r.reactionType === filter)
              .map((reactor) => (
                <div key={reactor.userId} className="reactor-item">
                  <Avatar src={reactor.avatarUrl} name={reactor.userName} size="sm" />
                  <span>{reactor.userName}</span>
                  <span className="reactor-reaction">
                    {REACTIONS.find(r => r.type === reactor.reactionType)?.emoji}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
```


---

### 📚 Phase 5B: Enhanced Save/Bookmark System (Days 4-6)

#### Step 1: Backend - Collections Entity & Migration

**Create Migration:** `backend/src/database/migrations/1707581000000-CreateCollectionsTable.ts`

```typescript
await queryRunner.createTable(
  new Table({
    name: 'collections',
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
        name: 'name',
        type: 'varchar',
        length: '100',
      },
      {
        name: 'description',
        type: 'text',
        isNullable: true,
      },
      {
        name: 'is_public',
        type: 'boolean',
        default: false,
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      },
    ],
  }),
  true,
);
```

**Update post_saves table:**

```typescript
await queryRunner.addColumn(
  'post_saves',
  new TableColumn({
    name: 'collection_id',
    type: 'uuid',
    isNullable: true,
  }),
);
```

#### Step 2: Backend - Collection Entity

**Create:** `backend/src/modules/feed/entities/collection.entity.ts`

```typescript
@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @OneToMany(() => PostSave, (save) => save.collection)
  savedItems: PostSave[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Update:** `backend/src/modules/feed/entities/post-save.entity.ts`

```typescript
@Column({ name: 'collection_id', nullable: true })
collectionId: string;

@ManyToOne(() => Collection, (collection) => collection.savedItems, {
  onDelete: 'SET NULL',
})
@JoinColumn({ name: 'collection_id' })
collection: Collection;
```

#### Step 3: Backend - Collection Service Methods

**Update:** `backend/src/modules/feed/feed.service.ts`

```typescript
// Collection management
async createCollection(userId: string, data: CreateCollectionDto): Promise<Collection> {
  const collection = this.collectionRepository.create({
    userId,
    ...data,
  });
  return this.collectionRepository.save(collection);
}

async getCollections(userId: string): Promise<Collection[]> {
  return this.collectionRepository.find({
    where: { userId },
    relations: ['savedItems'],
    order: { createdAt: 'DESC' },
  });
}

async updateCollection(id: string, userId: string, data: UpdateCollectionDto): Promise<Collection> {
  const collection = await this.collectionRepository.findOne({
    where: { id, userId },
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  Object.assign(collection, data);
  return this.collectionRepository.save(collection);
}

async deleteCollection(id: string, userId: string): Promise<void> {
  const collection = await this.collectionRepository.findOne({
    where: { id, userId },
  });

  if (!collection) {
    throw new NotFoundException('Collection not found');
  }

  await this.collectionRepository.remove(collection);
}

// Update savePost to support collections
async savePost(postId: string, userId: string, collectionId?: string): Promise<void> {
  const post = await this.postRepository.findOne({ where: { id: postId } });
  if (!post) {
    throw new NotFoundException('Post not found');
  }

  const existingSave = await this.postSaveRepository.findOne({
    where: { postId, userId },
  });

  if (existingSave) {
    // Update collection if provided
    if (collectionId) {
      existingSave.collectionId = collectionId;
      await this.postSaveRepository.save(existingSave);
    }
    return;
  }

  const save = this.postSaveRepository.create({
    postId,
    userId,
    collectionId,
  });

  await this.postSaveRepository.save(save);
}

async getSavedPostsByCollection(userId: string, collectionId?: string): Promise<FeedPost[]> {
  const query = this.postSaveRepository
    .createQueryBuilder('save')
    .leftJoinAndSelect('save.post', 'post')
    .leftJoinAndSelect('post.author', 'author')
    .where('save.user_id = :userId', { userId });

  if (collectionId) {
    query.andWhere('save.collection_id = :collectionId', { collectionId });
  } else {
    query.andWhere('save.collection_id IS NULL');
  }

  query.orderBy('save.created_at', 'DESC');

  const saves = await query.getMany();
  return saves.map((save) => save.post);
}
```


#### Step 4: Frontend - Saved Items Page

**Create:** `src/renderer/pages/SavedItems.tsx`

```typescript
export const SavedItems: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<FeedPost[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCollection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [posts, cols] = await Promise.all([
        feedService.getSavedPostsByCollection(selectedCollection),
        feedService.getCollections(),
      ]);
      setSavedPosts(posts);
      setCollections(cols);
    } catch (error) {
      console.error('Failed to load saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saved-items-page">
      <div className="saved-items-header">
        <h1>Saved Items</h1>
        <Button onClick={() => setShowCreateCollection(true)}>
          New Collection
        </Button>
      </div>

      <div className="saved-items-layout">
        {/* Sidebar with collections */}
        <aside className="collections-sidebar">
          <button
            className={`collection-item ${!selectedCollection ? 'active' : ''}`}
            onClick={() => setSelectedCollection(null)}
          >
            <HiBookmark />
            <span>All Saved</span>
            <span className="count">{savedPosts.length}</span>
          </button>

          <div className="collections-divider" />

          <h3>Collections</h3>
          {collections.map((collection) => (
            <button
              key={collection.id}
              className={`collection-item ${selectedCollection === collection.id ? 'active' : ''}`}
              onClick={() => setSelectedCollection(collection.id)}
            >
              <HiFolder />
              <span>{collection.name}</span>
              <span className="count">{collection.savedItems?.length || 0}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="saved-items-content">
          {loading ? (
            <div>Loading...</div>
          ) : savedPosts.length === 0 ? (
            <div className="empty-state">
              <HiBookmark size={64} />
              <h3>No saved items</h3>
              <p>Save posts to view them here later</p>
            </div>
          ) : (
            <div className="saved-posts-grid">
              {savedPosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  onDelete={loadData}
                  onLikeChange={() => {}}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateCollection && (
        <CreateCollectionModal
          onClose={() => setShowCreateCollection(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
};
```

#### Step 5: Frontend - Save to Collection Modal

**Create:** `src/renderer/components/SaveToCollectionModal/SaveToCollectionModal.tsx`

```typescript
interface SaveToCollectionModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SaveToCollectionModal: React.FC<SaveToCollectionModalProps> = ({
  postId,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    try {
      const cols = await feedService.getCollections();
      setCollections(cols);
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCollection = async (collectionId?: string) => {
    try {
      await feedService.savePost(postId, collectionId);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Save to Collection</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="collections-list">
          <button
            className="collection-option"
            onClick={() => handleSaveToCollection()}
          >
            <HiBookmark />
            <span>Saved Items</span>
          </button>

          {collections.map((collection) => (
            <button
              key={collection.id}
              className="collection-option"
              onClick={() => handleSaveToCollection(collection.id)}
            >
              <HiFolder />
              <span>{collection.name}</span>
            </button>
          ))}

          <button className="collection-option create-new">
            <HiPlus />
            <span>Create New Collection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```


---

### 🔗 Phase 5C: Share Functionality (Days 7-9)

#### Step 1: Backend - Share Tracking

**Create Migration:** `backend/src/database/migrations/1707582000000-CreateSharesTable.ts`

```typescript
await queryRunner.createTable(
  new Table({
    name: 'shares',
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
        name: 'item_type',
        type: 'varchar',
        length: '50',
        comment: 'post, campaign, match',
      },
      {
        name: 'item_id',
        type: 'uuid',
      },
      {
        name: 'share_type',
        type: 'varchar',
        length: '50',
        comment: 'feed, message, link, twitter, linkedin, facebook',
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
```

**Create Entity:** `backend/src/modules/feed/entities/share.entity.ts`

```typescript
@Entity('shares')
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'item_type', length: 50 })
  itemType: string;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({ name: 'share_type', length: 50 })
  shareType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

#### Step 2: Backend - Share Endpoints

**Update:** `backend/src/modules/feed/feed.controller.ts`

```typescript
@Post('posts/:id/share')
async sharePost(
  @Param('id') id: string,
  @CurrentUser() user: any,
  @Body() body: { shareType: string },
) {
  await this.feedService.trackShare(id, user.sub, 'post', body.shareType);
  return { message: 'Share tracked successfully' };
}

@Get('posts/:id/share-count')
async getShareCount(@Param('id') id: string) {
  const count = await this.feedService.getShareCount(id, 'post');
  return { count };
}
```

#### Step 3: Frontend - Share Modal Component

**Create:** `src/renderer/components/ShareModal/ShareModal.tsx`

```typescript
interface ShareModalProps {
  itemType: 'post' | 'campaign' | 'match';
  itemId: string;
  itemTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  itemType,
  itemId,
  itemTitle,
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadShareCount();
    }
  }, [isOpen, itemId]);

  const loadShareCount = async () => {
    try {
      const { count } = await feedService.getShareCount(itemId);
      setShareCount(count);
    } catch (error) {
      console.error('Failed to load share count:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/#/${itemType}/${itemId}`;
      await navigator.clipboard.writeText(url);
      await feedService.trackShare(itemId, itemType, 'link');
      showToast('Link copied to clipboard!', 'success');
      setShareCount(prev => prev + 1);
    } catch (error) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleShareToFeed = async () => {
    // Navigate to create post with shared content
    navigate('/feed', {
      state: {
        sharedItem: { type: itemType, id: itemId, title: itemTitle },
      },
    });
    await feedService.trackShare(itemId, itemType, 'feed');
    onClose();
  };

  const handleShareViaMessage = () => {
    navigate('/messages', {
      state: {
        sharedItem: { type: itemType, id: itemId, title: itemTitle },
      },
    });
    onClose();
  };

  const handleExternalShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const url = `${window.location.origin}/#/${itemType}/${itemId}`;
    const text = itemTitle || `Check out this ${itemType}`;

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    await feedService.trackShare(itemId, itemType, platform);
    setShareCount(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="share-options">
          <button className="share-option" onClick={handleShareToFeed}>
            <HiNewspaper size={24} />
            <span>Share to Feed</span>
          </button>

          <button className="share-option" onClick={handleShareViaMessage}>
            <HiMail size={24} />
            <span>Send via Message</span>
          </button>

          <button className="share-option" onClick={handleCopyLink}>
            <HiLink size={24} />
            <span>Copy Link</span>
          </button>

          <div className="share-divider" />

          <button className="share-option" onClick={() => handleExternalShare('twitter')}>
            <FaTwitter size={24} />
            <span>Share on Twitter</span>
          </button>

          <button className="share-option" onClick={() => handleExternalShare('linkedin')}>
            <FaLinkedin size={24} />
            <span>Share on LinkedIn</span>
          </button>

          <button className="share-option" onClick={() => handleExternalShare('facebook')}>
            <FaFacebook size={24} />
            <span>Share on Facebook</span>
          </button>
        </div>

        {shareCount > 0 && (
          <div className="share-count">
            Shared {shareCount} {shareCount === 1 ? 'time' : 'times'}
          </div>
        )}
      </div>
    </div>
  );
};
```


---

### 🏷️ Phase 5D: Mention & Hashtag System (Days 10-14)

#### Step 1: Backend - Mention & Hashtag Entities

**Create Migration:** `backend/src/database/migrations/1707583000000-CreateMentionsHashtagsTables.ts`

```typescript
// Mentions table
await queryRunner.createTable(
  new Table({
    name: 'mentions',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'content_type',
        type: 'varchar',
        length: '50',
        comment: 'post, comment',
      },
      {
        name: 'content_id',
        type: 'uuid',
      },
      {
        name: 'mentioned_user_id',
        type: 'uuid',
      },
      {
        name: 'mentioned_by_user_id',
        type: 'uuid',
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

// Hashtags table
await queryRunner.createTable(
  new Table({
    name: 'hashtags',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'tag',
        type: 'varchar',
        length: '100',
        isUnique: true,
      },
      {
        name: 'post_count',
        type: 'int',
        default: 0,
      },
      {
        name: 'trending_score',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
      },
    ],
  }),
  true,
);

// Post-Hashtag junction table
await queryRunner.createTable(
  new Table({
    name: 'post_hashtags',
    columns: [
      {
        name: 'post_id',
        type: 'uuid',
      },
      {
        name: 'hashtag_id',
        type: 'uuid',
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
```

**Create Entities:**

```typescript
// backend/src/modules/feed/entities/mention.entity.ts
@Entity('mentions')
export class Mention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'content_type', length: 50 })
  contentType: string;

  @Column({ name: 'content_id' })
  contentId: string;

  @Column({ name: 'mentioned_user_id' })
  mentionedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioned_user_id' })
  mentionedUser: User;

  @Column({ name: 'mentioned_by_user_id' })
  mentionedByUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentioned_by_user_id' })
  mentionedByUser: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// backend/src/modules/feed/entities/hashtag.entity.ts
@Entity('hashtags')
export class Hashtag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  tag: string;

  @Column({ name: 'post_count', default: 0 })
  postCount: number;

  @Column({ name: 'trending_score', type: 'decimal', precision: 10, scale: 2, default: 0 })
  trendingScore: number;

  @ManyToMany(() => FeedPost, (post) => post.hashtags)
  posts: FeedPost[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**Update FeedPost Entity:**

```typescript
@ManyToMany(() => Hashtag, (hashtag) => hashtag.posts)
@JoinTable({
  name: 'post_hashtags',
  joinColumn: { name: 'post_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'hashtag_id', referencedColumnName: 'id' },
})
hashtags: Hashtag[];
```

#### Step 2: Backend - Mention & Hashtag Parsing

**Update:** `backend/src/modules/feed/feed.service.ts`

```typescript
private parseMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

private parseHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }

  return [...new Set(hashtags)]; // Remove duplicates
}

async createPost(userId: string, dto: CreatePostDto): Promise<FeedPost> {
  // Parse mentions and hashtags
  const mentionUsernames = this.parseMentions(dto.content);
  const hashtagNames = this.parseHashtags(dto.content);

  // Create post
  const post = this.postRepository.create({
    authorId: userId,
    ...dto,
  });

  const savedPost = await this.postRepository.save(post);

  // Handle mentions
  if (mentionUsernames.length > 0) {
    await this.processMentions(savedPost.id, userId, mentionUsernames);
  }

  // Handle hashtags
  if (hashtagNames.length > 0) {
    await this.processHashtags(savedPost.id, hashtagNames);
  }

  return savedPost;
}

private async processMentions(postId: string, authorId: string, usernames: string[]): Promise<void> {
  for (const username of usernames) {
    // Find user by username (email prefix)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :username', { username: `${username}%` })
      .getOne();

    if (user && user.id !== authorId) {
      // Create mention
      const mention = this.mentionRepository.create({
        contentType: 'post',
        contentId: postId,
        mentionedUserId: user.id,
        mentionedByUserId: authorId,
      });

      await this.mentionRepository.save(mention);

      // TODO: Create notification for mentioned user
    }
  }
}

private async processHashtags(postId: string, tagNames: string[]): Promise<void> {
  const hashtags: Hashtag[] = [];

  for (const tagName of tagNames) {
    let hashtag = await this.hashtagRepository.findOne({
      where: { tag: tagName },
    });

    if (!hashtag) {
      // Create new hashtag
      hashtag = this.hashtagRepository.create({
        tag: tagName,
        postCount: 1,
      });
    } else {
      // Increment post count
      hashtag.postCount += 1;
    }

    hashtag = await this.hashtagRepository.save(hashtag);
    hashtags.push(hashtag);
  }

  // Associate hashtags with post
  const post = await this.postRepository.findOne({
    where: { id: postId },
    relations: ['hashtags'],
  });

  if (post) {
    post.hashtags = hashtags;
    await this.postRepository.save(post);
  }
}

// Hashtag endpoints
async getTrendingHashtags(limit: number = 10): Promise<Hashtag[]> {
  return this.hashtagRepository.find({
    order: { trendingScore: 'DESC', postCount: 'DESC' },
    take: limit,
  });
}

async getPostsByHashtag(tag: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<FeedPost>> {
  const hashtag = await this.hashtagRepository.findOne({
    where: { tag: tag.toLowerCase() },
    relations: ['posts', 'posts.author'],
  });

  if (!hashtag) {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const total = hashtag.posts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    data: hashtag.posts.slice(startIndex, endIndex),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async searchUsers(query: string, limit: number = 10): Promise<User[]> {
  return this.userRepository
    .createQueryBuilder('user')
    .where('user.email LIKE :query', { query: `${query}%` })
    .take(limit)
    .getMany();
}
```


#### Step 3: Frontend - Mention Input Component

**Create:** `src/renderer/components/MentionInput/MentionInput.tsx`

```typescript
interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowSuggestions(true);
      searchUsers(query);
    } else {
      setShowSuggestions(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const users = await feedService.searchUsers(query);
      setSuggestions(users);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const handleSelectMention = (user: User) => {
    const username = user.email.split('@')[0];
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);

    // Replace @query with @username
    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${username} `);
    const newValue = newTextBefore + textAfterCursor;

    onChange(newValue);
    setShowSuggestions(false);

    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = newTextBefore.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="mention-input-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="mention-textarea"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="mention-suggestions">
          {suggestions.map((user) => (
            <button
              key={user.id}
              className="mention-suggestion-item"
              onClick={() => handleSelectMention(user)}
            >
              <Avatar
                src={user.avatarUrl}
                name={user.email.split('@')[0]}
                size="sm"
              />
              <span>{user.email.split('@')[0]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### Step 4: Frontend - Hashtag Page

**Create:** `src/renderer/pages/Hashtag.tsx`

```typescript
export const Hashtag: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [tag, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, trending] = await Promise.all([
        feedService.getPostsByHashtag(tag || '', page),
        feedService.getTrendingHashtags(),
      ]);
      setPosts(postsData.data);
      setTrendingHashtags(trending);
    } catch (error) {
      console.error('Failed to load hashtag data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hashtag-page">
      <div className="hashtag-header">
        <h1>#{tag}</h1>
        <p>{posts.length} posts</p>
      </div>

      <div className="hashtag-layout">
        <main className="hashtag-posts">
          {loading ? (
            <div>Loading...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <HiHashtag size={64} />
              <h3>No posts found</h3>
              <p>Be the first to post with #{tag}</p>
            </div>
          ) : (
            posts.map((post) => (
              <FeedPost
                key={post.id}
                post={post}
                onDelete={loadData}
                onLikeChange={() => {}}
              />
            ))
          )}
        </main>

        <aside className="trending-sidebar">
          <h3>Trending Hashtags</h3>
          <div className="trending-list">
            {trendingHashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                to={`/hashtag/${hashtag.tag}`}
                className={`trending-item ${hashtag.tag === tag ? 'active' : ''}`}
              >
                <span className="hashtag-name">#{hashtag.tag}</span>
                <span className="hashtag-count">{hashtag.postCount} posts</span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
```

#### Step 5: Frontend - Update RichText Component

**Update:** `src/renderer/components/RichText/RichText.tsx`

Add mention and hashtag highlighting:

```typescript
const renderContent = (text: string) => {
  // Split by mentions and hashtags
  const parts = text.split(/(@\w+|#\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      // Mention
      const username = part.substring(1);
      return (
        <span key={index} className="mention" onClick={() => navigate(`/profile/${username}`)}>
          {part}
        </span>
      );
    } else if (part.startsWith('#')) {
      // Hashtag
      const tag = part.substring(1);
      return (
        <Link key={index} to={`/hashtag/${tag}`} className="hashtag">
          {part}
        </Link>
      );
    } else {
      // Regular text
      return <span key={index}>{part}</span>;
    }
  });
};
```


---

## Integration Points

### 1. Update CreatePost Component

**Update:** `src/renderer/components/CreatePost/CreatePost.tsx`

Replace textarea with MentionInput:

```typescript
<MentionInput
  value={content}
  onChange={setContent}
  placeholder="What's on your mind?"
/>
```

### 2. Update FeedPost Component

**Update:** `src/renderer/components/FeedPost/FeedPost.tsx`

Add share button and modal:

```typescript
const [showShareModal, setShowShareModal] = useState(false);

// Add to action bar
{
  id: 'share',
  icon: <HiShare />,
  label: 'Share',
  onClick: () => setShowShareModal(true),
}

// Add modal
{showShareModal && (
  <ShareModal
    itemType="post"
    itemId={post.id}
    itemTitle={post.content.substring(0, 100)}
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
  />
)}
```

### 3. Add Routes

**Update:** `src/renderer/AppComponent.tsx`

```typescript
<Route path="/saved" element={<SavedItems />} />
<Route path="/hashtag/:tag" element={<Hashtag />} />
```

### 4. Update Navigation

**Update:** `src/renderer/layouts/AppLayout/AppLayout.tsx`

Add saved items to navigation:

```typescript
<NavLink
  to="/saved"
  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
  onClick={closeSidebar}
>
  <HiBookmark className="sidebar-icon" aria-hidden="true" />
  <span>Saved</span>
</NavLink>
```

### 5. Update Feed Module

**Update:** `backend/src/modules/feed/feed.module.ts`

Add new entities to TypeORM:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedPost,
      PostLike,
      PostComment,
      PostSave,
      Reaction,
      Collection,
      Share,
      Mention,
      Hashtag,
      User,
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
```

---

## File Structure

### Backend Files to Create/Update:

```
backend/src/modules/feed/
├── entities/
│   ├── reaction.entity.ts (NEW)
│   ├── collection.entity.ts (NEW)
│   ├── share.entity.ts (NEW)
│   ├── mention.entity.ts (NEW)
│   ├── hashtag.entity.ts (NEW)
│   └── post-save.entity.ts (UPDATE - add collection relation)
├── dto/
│   ├── create-collection.dto.ts (NEW)
│   ├── update-collection.dto.ts (NEW)
│   └── react-to-post.dto.ts (NEW)
├── feed.service.ts (UPDATE - add all new methods)
├── feed.controller.ts (UPDATE - add all new endpoints)
└── feed.module.ts (UPDATE - add new entities)

backend/src/database/migrations/
├── 1707580000000-CreateReactionsTable.ts (NEW)
├── 1707581000000-CreateCollectionsTable.ts (NEW)
├── 1707582000000-CreateSharesTable.ts (NEW)
└── 1707583000000-CreateMentionsHashtagsTables.ts (NEW)
```

### Frontend Files to Create/Update:

```
src/renderer/
├── pages/
│   ├── SavedItems.tsx (NEW)
│   ├── SavedItems.css (NEW)
│   ├── Hashtag.tsx (NEW)
│   └── Hashtag.css (NEW)
├── components/
│   ├── WhoReactedModal/
│   │   ├── WhoReactedModal.tsx (NEW)
│   │   └── WhoReactedModal.css (NEW)
│   ├── SaveToCollectionModal/
│   │   ├── SaveToCollectionModal.tsx (NEW)
│   │   └── SaveToCollectionModal.css (NEW)
│   ├── CreateCollectionModal/
│   │   ├── CreateCollectionModal.tsx (NEW)
│   │   └── CreateCollectionModal.css (NEW)
│   ├── ShareModal/
│   │   ├── ShareModal.tsx (NEW)
│   │   └── ShareModal.css (NEW)
│   ├── MentionInput/
│   │   ├── MentionInput.tsx (NEW)
│   │   └── MentionInput.css (NEW)
│   ├── FeedPost/
│   │   └── FeedPost.tsx (UPDATE - integrate reactions, share)
│   ├── CreatePost/
│   │   └── CreatePost.tsx (UPDATE - use MentionInput)
│   └── RichText/
│       └── RichText.tsx (UPDATE - highlight mentions/hashtags)
├── services/
│   └── feed.service.ts (UPDATE - add all new methods)
└── types/
    └── feed.types.ts (UPDATE - add new types)
```

---

## Implementation Timeline

### Week 1: Reactions & Collections

**Days 1-3: Reaction System**
- [ ] Create reactions migration
- [ ] Create reaction entity
- [ ] Add reaction service methods
- [ ] Add reaction endpoints
- [ ] Update frontend feed service
- [ ] Update FeedPost component
- [ ] Create WhoReactedModal
- [ ] Test reactions

**Days 4-6: Enhanced Save/Bookmark**
- [ ] Create collections migration
- [ ] Create collection entity
- [ ] Update post-save entity
- [ ] Add collection service methods
- [ ] Add collection endpoints
- [ ] Create SavedItems page
- [ ] Create SaveToCollectionModal
- [ ] Create CreateCollectionModal
- [ ] Test collections

### Week 2: Share & Mentions/Hashtags

**Days 7-9: Share Functionality**
- [ ] Create shares migration
- [ ] Create share entity
- [ ] Add share tracking methods
- [ ] Add share endpoints
- [ ] Create ShareModal component
- [ ] Update FeedPost with share button
- [ ] Test share functionality

**Days 10-14: Mentions & Hashtags**
- [ ] Create mentions/hashtags migrations
- [ ] Create mention/hashtag entities
- [ ] Add parsing logic
- [ ] Add mention/hashtag endpoints
- [ ] Create MentionInput component
- [ ] Create Hashtag page
- [ ] Update RichText component
- [ ] Update CreatePost component
- [ ] Test mentions and hashtags
- [ ] Create mention notifications

---

## Success Metrics

### Technical
- [ ] All migrations run successfully
- [ ] All endpoints working
- [ ] No console errors
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Mobile responsive

### User Experience
- [ ] Reactions animate smoothly
- [ ] Mention autocomplete works
- [ ] Hashtags are clickable
- [ ] Share modal opens quickly
- [ ] Collections organize saved items
- [ ] Trending hashtags update

### Performance
- [ ] Reaction updates < 200ms
- [ ] Mention search < 300ms
- [ ] Hashtag page loads < 1s
- [ ] Share tracking async
- [ ] No UI blocking

---

## Testing Checklist

### Reactions
- [ ] Can add reaction to post
- [ ] Can change reaction type
- [ ] Can remove reaction
- [ ] Reaction counts update
- [ ] Who reacted modal shows users
- [ ] Reactions work on comments

### Collections
- [ ] Can create collection
- [ ] Can save to collection
- [ ] Can view saved items
- [ ] Can move between collections
- [ ] Can delete collection
- [ ] Can rename collection

### Share
- [ ] Copy link works
- [ ] Share to feed works
- [ ] Share via message works
- [ ] External share opens correctly
- [ ] Share count increments
- [ ] Share tracking works

### Mentions & Hashtags
- [ ] @ triggers user search
- [ ] Mentions are clickable
- [ ] Mention notifications sent
- [ ] # creates hashtag
- [ ] Hashtags are clickable
- [ ] Hashtag page shows posts
- [ ] Trending hashtags display
- [ ] Hashtag counts update

---

## Conclusion

Phase 5 transforms the platform from basic interactions to a rich, engaging social experience. The reaction system provides nuanced feedback, collections organize content, sharing amplifies reach, and mentions/hashtags create discoverability and community.

**Ready to begin implementation!** 🚀

