# Phase 1: Enhanced Profile Fields - Schema Changes

## Overview

This document describes the database schema enhancements implemented in Phase 1 of the Complete Platform Features specification. These changes add new fields to both influencer and company profiles to support richer profile information and better matching capabilities.

## Changes Summary

### Influencer Profile Enhancements

**New Fields:**

1. **contentType** (string array, nullable)
   - Stores types of content the influencer creates
   - Valid values: 'video', 'image', 'blog', 'podcast'
   - Allows multiple selections
   - Requirements: 1.1.1, 1.1.2

2. **collaborationPreference** (string, nullable)
   - Indicates preferred collaboration style
   - Valid values: 'one-time', 'long-term', 'flexible'
   - Single selection
   - Requirements: 1.1.3

3. **verificationStatus** (boolean, default: false)
   - Indicates if profile has been verified by admins
   - Non-nullable with default value for backward compatibility
   - Requirements: 1.1.4

4. **mediaGallery** (JSON array, nullable)
   - Stores portfolio media items with metadata
   - Each item contains: id, url, type, caption, uploadedAt, fileSize, mimeType
   - Supports images (JPEG, PNG, WebP) and videos (MP4, WebM)
   - Maximum file size: 10MB per item
   - Requirements: 1.1.5, 1.1.6, 1.1.7, 1.1.8, 1.1.9

### Company Profile Enhancements

**New Fields:**

1. **companySize** (string, nullable)
   - Indicates company size category
   - Valid values: 'startup', 'small', 'medium', 'large', 'enterprise'
   - Single selection
   - Requirements: 1.2.1

2. **campaignType** (string array, nullable)
   - Stores types of campaigns the company runs
   - Valid values: 'product-launch', 'brand-awareness', 'event', 'sponsored-content'
   - Allows multiple selections
   - At least one type must be selected when provided
   - Requirements: 1.2.2, 1.2.6

3. **preferredInfluencerNiches** (string array, nullable)
   - Stores preferred influencer niches for matching
   - Allows multiple selections
   - At least one niche must be selected when provided
   - Requirements: 1.2.3, 1.2.7

4. **collaborationDuration** (string, nullable)
   - Indicates preferred collaboration duration
   - Valid values: 'short-term', 'medium-term', 'long-term'
   - Single selection
   - Requirements: 1.2.4

5. **verificationStatus** (boolean, default: false)
   - Indicates if profile has been verified by admins
   - Non-nullable with default value for backward compatibility
   - Requirements: 1.2.5

## Implementation Details

### Entity Updates

**File:** `backend/src/modules/profiles/entities/influencer-profile.entity.ts`
- Added 4 new columns with TypeORM decorators
- Exported MediaItem interface for type safety
- All new fields are nullable or have defaults for backward compatibility

**File:** `backend/src/modules/profiles/entities/company-profile.entity.ts`
- Added 5 new columns with TypeORM decorators
- All new fields are nullable or have defaults for backward compatibility

### Migration

**File:** `backend/src/database/migrations/1704067200000-EnhanceProfileFields.ts`
- Adds all new columns to both tables
- Includes descriptive comments for each column
- Implements reversible down() method
- Uses proper TypeORM TableColumn definitions

### Configuration

**File:** `backend/ormconfig.ts`
- TypeORM DataSource configuration for migrations
- Separate from NestJS configuration for CLI usage
- Points to migrations directory

**File:** `backend/package.json`
- Added migration scripts:
  - `migration:run` - Apply pending migrations
  - `migration:revert` - Rollback last migration
  - `migration:show` - Show migration status
  - `migration:generate` - Auto-generate migrations
  - `migration:create` - Create blank migration

## Backward Compatibility

All changes maintain backward compatibility:

1. **Nullable Fields**: All new fields are nullable, so existing records remain valid
2. **Default Values**: Boolean fields have default values (false)
3. **No Breaking Changes**: Existing API endpoints continue to work
4. **Optional Updates**: Profiles can be updated incrementally
5. **Data Preservation**: No existing data is modified or deleted

## Database Schema

### influencer_profiles Table

```sql
-- Existing columns remain unchanged
-- New columns added:

ALTER TABLE influencer_profiles 
  ADD COLUMN "contentType" text NULL,
  ADD COLUMN "collaborationPreference" varchar(50) NULL,
  ADD COLUMN "verificationStatus" boolean NOT NULL DEFAULT false,
  ADD COLUMN "mediaGallery" json NULL;
```

### company_profiles Table

```sql
-- Existing columns remain unchanged
-- New columns added:

ALTER TABLE company_profiles 
  ADD COLUMN "companySize" varchar(50) NULL,
  ADD COLUMN "campaignType" text NULL,
  ADD COLUMN "preferredInfluencerNiches" text NULL,
  ADD COLUMN "collaborationDuration" varchar(50) NULL,
  ADD COLUMN "verificationStatus" boolean NOT NULL DEFAULT false;
```

## MediaItem Interface

```typescript
interface MediaItem {
  id: string;              // Unique identifier
  url: string;             // Media file URL
  type: 'image' | 'video'; // Media type
  caption?: string;        // Optional caption (max 200 chars)
  uploadedAt: Date;        // Upload timestamp
  fileSize: number;        // File size in bytes (max 10MB)
  mimeType: string;        // MIME type (image/jpeg, video/mp4, etc.)
}
```

## Usage Examples

### Running Migrations

```bash
# Apply all pending migrations
cd backend
npm run migration:run

# Check migration status
npm run migration:show

# Rollback last migration (if needed)
npm run migration:revert
```

### Development Mode

In development, TypeORM synchronize is enabled, so schema changes are automatically applied. However, migrations are still recommended for:
- Team collaboration
- Production deployments
- Version control of schema changes
- Rollback capability

### Production Deployment

1. Backup database
2. Run migrations: `npm run migration:run`
3. Verify schema changes
4. Deploy application code
5. Test new functionality

## Next Steps

After applying these schema changes, the following tasks should be completed:

1. **Task 2**: Implement profile DTOs and validation
2. **Task 3**: Implement media upload functionality
3. **Task 4**: Update profile service and controller
4. **Task 5**: Update frontend profile forms

## Testing

To verify the migration:

1. Start PostgreSQL database
2. Run migration: `npm run migration:run`
3. Check database schema:
   ```sql
   \d influencer_profiles
   \d company_profiles
   ```
4. Verify new columns exist with correct types
5. Test backward compatibility with existing data

## Rollback

If issues occur, rollback the migration:

```bash
npm run migration:revert
```

This will remove all new columns and restore the previous schema.

## References

- Requirements: `.kiro/specs/complete-platform-features/requirements.md`
- Design: `.kiro/specs/complete-platform-features/design.md`
- Tasks: `.kiro/specs/complete-platform-features/tasks.md`
- Migration README: `backend/src/database/migrations/README.md`
