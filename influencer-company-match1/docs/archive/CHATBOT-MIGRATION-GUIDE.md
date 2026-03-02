# Chatbot Consolidation Migration Guide

## Overview
This guide helps you migrate from the old chatbot implementation to the consolidated version.

## Changes Summary

### Documentation
- **Before**: 38 scattered markdown files
- **After**: 3 consolidated files
  - `CHATBOT-README.md` - Main documentation
  - `CHATBOT-QUICK-START.md` - Setup guide
  - `CHATBOT-API-REFERENCE.md` - API docs

### Code Structure
- **Before**: Duplicate logic in multiple files
- **After**: Single source of truth for each concern

### Entities
- **Removed**: `ChatbotAnalytics`, `ChatbotEmailQueue`, `ChatbotFaq`
- **Kept**: `ChatbotConversation`, `ChatbotMessage`, `ChatbotIntent`

## Migration Steps

### Step 1: Backup Current Implementation
```bash
# Create backup directory
mkdir -p backup/chatbot-old

# Backup current files
cp backend/src/modules/chatbot/*.ts backup/chatbot-old/
cp src/renderer/components/ChatbotWidget/* backup/chatbot-old/
```

### Step 2: Replace Backend Files

```bash
# Replace service files
cp backend/src/modules/chatbot/chatbot.service.consolidated.ts \
   backend/src/modules/chatbot/chatbot.service.ts

cp backend/src/modules/chatbot/chatbot-ai.service.consolidated.ts \
   backend/src/modules/chatbot/chatbot-ai.service.ts

cp backend/src/modules/chatbot/chatbot.module.consolidated.ts \
   backend/src/modules/chatbot/chatbot.module.ts
```

### Step 3: Remove Unused Entity Files

```bash
# Remove unused entities
rm backend/src/modules/chatbot/entities/chatbot-analytics.entity.ts
rm backend/src/modules/chatbot/entities/chatbot-email-queue.entity.ts
rm backend/src/modules/chatbot/entities/chatbot-faq.entity.ts
```

### Step 4: Update Database (if needed)

If you had migrations for the removed entities, you can optionally drop those tables:

```sql
-- Optional: Drop unused tables
DROP TABLE IF EXISTS chatbot_analytics CASCADE;
DROP TABLE IF EXISTS chatbot_email_queue CASCADE;
DROP TABLE IF EXISTS chatbot_faq CASCADE;
```

**Note**: Only do this if you're sure you don't need the data.

### Step 5: Archive Old Documentation

```bash
# Create archive directory
mkdir -p docs/archive/chatbot

# Move old docs (keep the 3 new ones)
mv AI-CHATBOT-*.md docs/archive/chatbot/
mv CHATBOT-*.md docs/archive/chatbot/
mv SELF-HOSTED-*.md docs/archive/chatbot/
mv INSTALL-CHATBOT.md docs/archive/chatbot/

# Move back the new consolidated docs
mv docs/archive/chatbot/CHATBOT-README.md ./
mv docs/archive/chatbot/CHATBOT-QUICK-START.md ./
mv docs/archive/chatbot/CHATBOT-API-REFERENCE.md ./
```

### Step 6: Test the Changes

```bash
# 1. Start ML service
cd ml-service
python -m app.main

# 2. Start backend
cd backend
npm run start:dev

# 3. Start frontend
cd influencer-company-match1
npm run dev

# 4. Test chatbot
# - Open app in browser
# - Log in
# - Click chatbot button
# - Send test messages
```

### Step 7: Verify Functionality

Test these scenarios:

- [ ] Chatbot widget opens and closes
- [ ] Can send messages
- [ ] Bot responds correctly
- [ ] Different intents recognized (greeting, find_matches, help, etc.)
- [ ] Typing indicator works
- [ ] Conversation history persists
- [ ] Fallback responses work when ML service is down
- [ ] PII redaction works
- [ ] No console errors

## Breaking Changes

### None!
The consolidation maintains backward compatibility. All existing functionality works the same way.

### API Changes
No API changes. WebSocket events and REST endpoints remain identical.

### Database Changes
No schema changes for core tables. Only unused tables can be optionally removed.

## Rollback Plan

If you need to rollback:

```bash
# 1. Stop services
# Ctrl+C on all running processes

# 2. Restore from backup
cp backup/chatbot-old/*.ts backend/src/modules/chatbot/

# 3. Restart services
# Follow normal startup procedure
```

## Benefits After Migration

1. **Cleaner Codebase**: 92% reduction in documentation files
2. **Easier Maintenance**: Single source of truth for each concern
3. **Better Performance**: Removed duplicate processing
4. **Clearer Architecture**: Well-defined separation of concerns
5. **Improved Reliability**: Consolidated error handling

## Troubleshooting

### Issue: Import errors after migration
**Solution**: Update imports in files that reference chatbot services
```typescript
// Old (if you had custom imports)
import { ChatbotAnalytics } from './entities/chatbot-analytics.entity';

// New (remove unused imports)
// Just remove the line
```

### Issue: TypeORM errors about missing entities
**Solution**: Clear TypeORM cache
```bash
rm -rf backend/dist
npm run build
```

### Issue: ML service not connecting
**Solution**: Check ML service is running
```bash
curl http://localhost:8000/health
```

### Issue: Messages not saving
**Solution**: Verify database tables exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'chatbot_%';
```

## Post-Migration Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Chatbot functionality verified
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Old files archived
- [ ] Backup created
- [ ] Rollback plan tested

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review `CHATBOT-README.md` for architecture details
3. Check backend logs for errors
4. Verify ML service health endpoint
5. Test with fallback responses (stop ML service temporarily)

## Next Steps

After successful migration:
1. Monitor chatbot usage and errors
2. Collect user feedback
3. Update intents based on common queries
4. Consider adding new features from roadmap
5. Train ML models with real conversation data
