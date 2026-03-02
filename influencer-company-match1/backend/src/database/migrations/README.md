# Database Migrations

This directory contains TypeORM migrations for the Influencer-Company Matching Platform.

## Overview

Migrations provide a version-controlled way to manage database schema changes. Each migration file represents a specific change to the database schema and can be applied or reverted.

## Migration Files

### 1704067200000-EnhanceProfileFields.ts
**Phase 1: Enhanced Profile Fields**

Adds new columns to support enhanced profile information:

**Influencer Profiles:**
- `contentType`: Array of content types (video, image, blog, podcast)
- `collaborationPreference`: Preference for collaboration type (one-time, long-term, flexible)
- `verificationStatus`: Boolean indicating if profile is verified
- `mediaGallery`: JSON array of media items with metadata

**Company Profiles:**
- `companySize`: Company size category (startup, small, medium, large, enterprise)
- `campaignType`: Array of campaign types (product-launch, brand-awareness, event, sponsored-content)
- `preferredInfluencerNiches`: Array of preferred influencer niches
- `collaborationDuration`: Preferred collaboration duration (short-term, medium-term, long-term)
- `verificationStatus`: Boolean indicating if profile is verified

**Requirements:** 1.1.1-1.1.9, 1.2.1-1.2.7

## Running Migrations

### Prerequisites
- PostgreSQL database running
- Environment variables configured in `.env` file
- Database connection details set correctly

### Commands

**Run all pending migrations:**
```bash
npm run migration:run
```

**Revert the last migration:**
```bash
npm run migration:revert
```

**Show migration status:**
```bash
npm run migration:show
```

**Generate a new migration (auto-detect changes):**
```bash
npm run migration:generate -- src/database/migrations/MigrationName
```

**Create a blank migration:**
```bash
npm run migration:create -- src/database/migrations/MigrationName
```

## Development vs Production

### Development Mode
In development, TypeORM is configured with `synchronize: true`, which automatically syncs the schema with entity definitions. However, for production-ready code and team collaboration, migrations are recommended.

### Production Mode
In production, `synchronize` should always be `false`, and all schema changes must be applied through migrations.

## Migration Best Practices

1. **Always test migrations** in a development environment before applying to production
2. **Write reversible migrations** - always implement the `down()` method
3. **Use transactions** - migrations run in transactions by default
4. **Backup before migrating** - always backup production data before running migrations
5. **Version control** - commit migration files to version control
6. **Sequential naming** - use timestamps to ensure proper ordering
7. **Document changes** - add comments explaining what each migration does

## Backward Compatibility

All migrations in this project maintain backward compatibility:
- New columns are nullable or have default values
- Existing data is preserved
- No breaking changes to existing functionality

## Troubleshooting

### Migration fails to run
- Check database connection settings in `.env`
- Ensure PostgreSQL is running
- Verify database user has necessary permissions

### Migration already applied
- Check migration status with `npm run migration:show`
- If needed, revert with `npm run migration:revert`

### Schema out of sync
- In development, you can drop the database and re-run migrations
- In production, create a new migration to fix the discrepancy

## Related Files

- `backend/ormconfig.ts` - TypeORM configuration for migrations
- `backend/src/config/database.config.ts` - NestJS TypeORM configuration
- `backend/src/modules/profiles/entities/` - Entity definitions
