---
inclusion: fileMatch
fileMatchPattern: "**/entities/**,**/migrations/**,**/*.entity.ts"
---

# Database Schema Guidelines

This steering file is automatically included when working with database entities and migrations.

## Core Entities

### User Entity
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  @Index()
  email: string;
  
  @Column()
  passwordHash: string;
  
  @Column({
    type: 'enum',
    enum: UserRole
  })
  @Index()
  role: UserRole;
  
  @Column({ default: false })
  isVerified: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;
}
```

### Influencer Profile Entity
```typescript
@Entity('influencer_profiles')
export class InfluencerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
  
  @Column('simple-array')
  @Index()
  niches: string[];
  
  @Column()
  @Index()
  location: string;
  
  @Column('simple-array')
  platforms: string[]; // Instagram, TikTok, YouTube, etc.
  
  @Column({ type: 'bigint' })
  @Index()
  audienceSize: number;
  
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Index()
  engagementRate: number; // 0.00 - 100.00
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ratePerPost: number;
  
  @Column('simple-array', { nullable: true })
  portfolioUrls: string[];
  
  @Column({ type: 'text', nullable: true })
  bio: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Company Profile Entity
```typescript
@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @OneToOne(() => User)
  @JoinColumn()
  user: User;
  
  @Column()
  companyName: string;
  
  @Column()
  @Index()
  industry: string;
  
  @Column('simple-array')
  @Index()
  targetNiches: string[];
  
  @Column()
  @Index()
  targetLocation: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budgetMin: number;
  
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budgetMax: number;
  
  @Column('simple-array')
  preferredPlatforms: string[];
  
  @Column()
  companySize: string; // Startup, Small, Medium, Large, Enterprise
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Match Entity
```typescript
@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => InfluencerProfile)
  @Index()
  influencer: InfluencerProfile;
  
  @ManyToOne(() => CompanyProfile)
  @Index()
  company: CompanyProfile;
  
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  @Index()
  compatibilityScore: number; // 0.00 - 100.00
  
  @Column()
  compatibilityTier: string; // Low, Medium, High
  
  @Column({ type: 'jsonb' })
  scoreBreakdown: {
    niche: number;
    location: number;
    budget: number;
    platform: number;
    audienceSize: number;
    engagement: number;
  };
  
  @Column({ default: false })
  isViewed: boolean;
  
  @Column({ default: false })
  isFavorited: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
  
  @Index(['influencer', 'company'], { unique: true })
  uniqueMatch: any;
}
```

### Message Entity
```typescript
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => User)
  @Index()
  sender: User;
  
  @ManyToOne(() => User)
  @Index()
  recipient: User;
  
  @Column({ type: 'text' })
  content: string;
  
  @Column({ default: false })
  isRead: boolean;
  
  @Column({ nullable: true })
  conversationId: string;
  
  @CreateDateColumn()
  @Index()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Collaboration Entity
```typescript
@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ManyToOne(() => InfluencerProfile)
  @Index()
  influencer: InfluencerProfile;
  
  @ManyToOne(() => CompanyProfile)
  @Index()
  company: CompanyProfile;
  
  @Column()
  campaignName: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;
  
  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled']
  })
  @Index()
  status: string;
  
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  agreedRate: number;
  
  @Column({ type: 'date', nullable: true })
  startDate: Date;
  
  @Column({ type: 'date', nullable: true })
  endDate: Date;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Indexing Strategy

### Primary Indexes
- All primary keys (automatic)
- Foreign keys for relationships
- Email (unique, for login)
- Role (for filtering by user type)

### Query Optimization Indexes
- `niches` (for matching queries)
- `location` (for location-based filtering)
- `audienceSize` (for range queries)
- `engagementRate` (for filtering)
- `compatibilityScore` (for sorting matches)
- `createdAt` (for chronological queries)

### Composite Indexes
```typescript
@Index(['influencer', 'company'], { unique: true }) // Prevent duplicate matches
@Index(['sender', 'recipient', 'createdAt']) // Message queries
@Index(['status', 'createdAt']) // Collaboration filtering
```

## Migration Best Practices

### Creating Migrations
```bash
npm run migration:generate -- -n CreateUsersTable
```

### Migration Structure
```typescript
export class CreateUsersTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          // ... other columns
        ]
      })
    );
    
    // Create indexes
    await queryRunner.createIndex('users', new Index({
      name: 'IDX_USERS_EMAIL',
      columnNames: ['email']
    }));
  }
  
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### Migration Rules
- Always provide `down` method for rollback
- Test migrations on development database first
- Never modify existing migrations (create new ones)
- Keep migrations small and focused
- Add indexes in the same migration as table creation

## Data Seeding

### Seed Structure
```typescript
export class SeedUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          email: 'admin@example.com',
          passwordHash: await bcrypt.hash('admin123', 12),
          role: UserRole.ADMIN,
          isVerified: true
        }
      ])
      .execute();
  }
}
```

### Seed Data Requirements
- Admin user for testing
- Sample influencers (various niches, audience sizes)
- Sample companies (various industries, budgets)
- Sample matches for testing algorithm

## Relationships

### One-to-One
- User ↔ Profile (each user has one profile)

### One-to-Many
- User → Messages (user sends many messages)
- InfluencerProfile → Matches (influencer has many matches)
- CompanyProfile → Matches (company has many matches)

### Many-to-Many
- Influencer ↔ Company (through Matches and Collaborations)

## Performance Considerations

### Query Optimization
- Use `select` to fetch only needed columns
- Use `leftJoinAndSelect` for eager loading
- Implement pagination (LIMIT/OFFSET)
- Use query builder for complex queries

### Caching Strategy
- Cache match results in Redis (24 hours)
- Cache user profiles (1 hour)
- Invalidate cache on profile updates

### Connection Pooling
```typescript
{
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  extra: {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    idleTimeoutMillis: 30000
  }
}
```

## Data Validation

### Entity-Level Validation
```typescript
@Entity()
export class InfluencerProfile {
  @Column()
  @Min(0)
  @Max(10000000)
  audienceSize: number;
  
  @Column()
  @Min(0)
  @Max(100)
  engagementRate: number;
}
```

### Database Constraints
- NOT NULL for required fields
- UNIQUE for email, match pairs
- CHECK constraints for valid ranges
- Foreign key constraints for relationships