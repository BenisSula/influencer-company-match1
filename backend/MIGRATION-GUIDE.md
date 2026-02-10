# Database Migration Guide

## Quick Start

### First Time Setup

1. **Ensure PostgreSQL is running:**
   ```bash
   # Check if PostgreSQL is running
   docker ps  # If using Docker
   # OR
   pg_isready  # If installed locally
   ```

2. **Configure environment variables:**
   ```bash
   # Create .env file in backend directory
   cp .env.example .env
   
   # Edit .env with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=influencer_matching
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npm run migration:run
   ```

### Common Commands

```bash
# Show migration status
npm run migration:show

# Run pending migrations
npm run migration:run

# Rollback last migration
npm run migration:revert

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create blank migration
npm run migration:create -- src/database/migrations/MigrationName
```

## Development Workflow

### Option 1: Auto-Sync (Development Only)

The project is configured with `synchronize: true` in development mode. This means:
- Entity changes are automatically applied to the database
- No need to run migrations manually
- Faster development iteration

**Pros:**
- Quick and easy
- No migration files needed during development

**Cons:**
- No version control of schema changes
- Can't rollback changes
- Not suitable for team collaboration

### Option 2: Migrations (Recommended)

Use migrations even in development for:
- Team collaboration
- Version control of schema changes
- Rollback capability
- Production-ready workflow

**Workflow:**
1. Update entity files
2. Generate migration: `npm run migration:generate -- src/database/migrations/DescriptiveName`
3. Review generated migration
4. Run migration: `npm run migration:run`
5. Commit migration file to version control

## Migration Best Practices

### 1. Descriptive Names
```bash
# Good
npm run migration:create -- src/database/migrations/AddUserEmailVerification

# Bad
npm run migration:create -- src/database/migrations/Update
```

### 2. Always Implement Down Method
```typescript
export class AddUserEmail1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'email',
      type: 'varchar',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove column
    await queryRunner.dropColumn('users', 'email');
  }
}
```

### 3. Test Before Committing
```bash
# Run migration
npm run migration:run

# Test application
npm run start:dev

# If issues, rollback
npm run migration:revert

# Fix and try again
```

### 4. Use Transactions
Migrations run in transactions by default. For complex migrations:
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.startTransaction();
  try {
    // Multiple operations
    await queryRunner.addColumn(...);
    await queryRunner.createIndex(...);
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  }
}
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All migrations tested in development
- [ ] Database backup created
- [ ] Migration files committed to version control
- [ ] Team notified of schema changes
- [ ] Rollback plan prepared

### Deployment Steps

1. **Backup database:**
   ```bash
   pg_dump -U postgres influencer_matching > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run migrations:**
   ```bash
   npm run migration:run
   ```

3. **Verify schema:**
   ```bash
   npm run migration:show
   ```

4. **Deploy application:**
   ```bash
   npm run build
   npm run start:prod
   ```

5. **Monitor for issues:**
   - Check application logs
   - Verify API endpoints
   - Test critical functionality

### Rollback Procedure

If issues occur after deployment:

1. **Rollback application code:**
   ```bash
   git checkout previous_version
   npm run build
   npm run start:prod
   ```

2. **Rollback database migration:**
   ```bash
   npm run migration:revert
   ```

3. **Restore from backup (if needed):**
   ```bash
   psql -U postgres influencer_matching < backup_20240101_120000.sql
   ```

## Troubleshooting

### Migration Already Exists

**Error:** `Migration "MigrationName" already exists`

**Solution:**
```bash
# Check migration status
npm run migration:show

# If already applied, no action needed
# If not applied, check for duplicate files
```

### Connection Refused

**Error:** `ECONNREFUSED` or `Connection refused`

**Solution:**
1. Check PostgreSQL is running
2. Verify connection details in `.env`
3. Check firewall settings
4. Test connection: `psql -U postgres -h localhost`

### Permission Denied

**Error:** `permission denied for table`

**Solution:**
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE influencer_matching TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Migration Out of Sync

**Error:** Schema doesn't match entity definitions

**Solution:**
```bash
# Option 1: Generate migration for differences
npm run migration:generate -- src/database/migrations/SyncSchema

# Option 2: Drop and recreate (development only!)
# WARNING: This deletes all data
dropdb influencer_matching
createdb influencer_matching
npm run migration:run
```

## Advanced Topics

### Custom Migration Logic

```typescript
export class CustomDataMigration1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn('users', new TableColumn({
      name: 'full_name',
      type: 'varchar',
      isNullable: true,
    }));

    // Migrate data
    await queryRunner.query(`
      UPDATE users 
      SET full_name = CONCAT(first_name, ' ', last_name)
      WHERE first_name IS NOT NULL AND last_name IS NOT NULL
    `);

    // Make non-nullable after data migration
    await queryRunner.changeColumn('users', 'full_name', new TableColumn({
      name: 'full_name',
      type: 'varchar',
      isNullable: false,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'full_name');
  }
}
```

### Conditional Migrations

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Check if column exists
  const table = await queryRunner.getTable('users');
  const hasColumn = table.findColumnByName('email');

  if (!hasColumn) {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'email',
      type: 'varchar',
    }));
  }
}
```

## References

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project-specific: `backend/src/database/migrations/README.md`
