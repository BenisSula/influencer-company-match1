# Chatbot Quick Start Guide

## Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL running
- Backend and frontend already set up

## 1. Install ML Service Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

## 2. Configure Environment

**Backend `.env`**
```env
ML_SERVICE_URL=http://localhost:8000
```

**ML Service `.env`** (create if not exists)
```env
PORT=8000
LOG_LEVEL=INFO
```

## 3. Start ML Service

```bash
cd ml-service
python -m app.main
```

Or use the startup script:
```bash
# Windows
start-ml-service.bat

# Linux/Mac
./start-ml-service.sh
```

Verify it's running:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": false
}
```

## 4. Run Database Migration

The chatbot tables should already be created. Verify:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'chatbot_%';
```

Expected tables:
- `chatbot_conversations`
- `chatbot_messages`
- `chatbot_intents`

## 5. Seed Intent Data (Optional)

Insert default intents:

```sql
INSERT INTO chatbot_intents (id, name, description, patterns, responses, is_active, priority)
VALUES 
  (gen_random_uuid(), 'greeting', 'Greeting messages', 
   ARRAY['hi', 'hello', 'hey'], 
   ARRAY['Hello! 👋 How can I help you today?'], 
   true, 10),
  (gen_random_uuid(), 'find_matches', 'Finding matches', 
   ARRAY['find matches', 'show matches'], 
   ARRAY['I can help you find perfect matches!'], 
   true, 20),
  (gen_random_uuid(), 'help', 'Help requests', 
   ARRAY['help', 'what can you do'], 
   ARRAY['I''m here to help! I can assist with matches, collaborations, and analytics.'], 
   true, 5);
```

## 6. Start Backend

```bash
cd backend
npm run start:dev
```

Backend should connect to ML service automatically.

## 7. Start Frontend

```bash
cd influencer-company-match1
npm run dev
```

## 8. Test the Chatbot

1. Open the app: `http://localhost:5173`
2. Log in with any user account
3. Look for the floating chat button (bottom-right)
4. Click to open the chatbot
5. Type "hello" and press Enter

Expected behavior:
- Message appears immediately
- Bot shows typing indicator
- Bot responds within 1-2 seconds

## 9. Verify Everything Works

### Test Messages
Try these messages to test different intents:

```
"hi" → Should greet you
"find matches" → Should offer to find matches
"help" → Should show help menu
"show my stats" → Should offer analytics
"collaborate" → Should explain collaboration
```

### Check Logs

**Backend logs should show:**
```
[ChatbotGateway] Chatbot client connected: <user-id>
[ChatbotService] Message sent successfully
```

**ML Service logs should show:**
```
INFO: Received chat request
INFO: Intent classified: greeting (confidence: 0.95)
```

## Troubleshooting

### Chatbot button not appearing
- Check if user is logged in
- Verify `ChatbotWidget` is imported in `AppComponent.tsx`
- Check browser console for errors

### "Connecting..." never changes to "Online"
- Verify backend WebSocket is running
- Check JWT token is valid
- Confirm WebSocket URL in `useChatbot.ts`

### Bot doesn't respond
- Check ML service is running: `curl http://localhost:8000/health`
- Review backend logs for errors
- Verify database connection

### Slow responses
- First request loads ML models (can take 2-3 seconds)
- Subsequent requests should be fast (<1 second)
- Check network latency

### Intent not recognized
- ML service falls back to "unknown" intent
- Add more patterns to `ml-service/data/intents.json`
- Restart ML service after changes

## Quick Commands

```bash
# Check if ML service is running
curl http://localhost:8000/health

# Test intent classification
curl -X POST http://localhost:8000/classify-intent \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'

# View chatbot conversations in database
psql -d your_database -c "SELECT * FROM chatbot_conversations LIMIT 5;"

# View recent messages
psql -d your_database -c "SELECT * FROM chatbot_messages ORDER BY created_at DESC LIMIT 10;"

# Restart ML service
# Windows: Ctrl+C then start-ml-service.bat
# Linux/Mac: Ctrl+C then ./start-ml-service.sh
```

## Next Steps

- Customize intents in `ml-service/data/intents.json`
- Add more response templates
- Integrate with platform features (matches, analytics, etc.)
- Monitor conversation metrics
- Train ML models with real conversation data

## Success Criteria

✅ ML service health check returns "healthy"
✅ Chatbot widget appears when logged in
✅ Can send and receive messages
✅ Different intents are recognized
✅ Typing indicator works
✅ Conversation history persists
✅ No errors in browser console or backend logs

You're all set! The chatbot is now ready to assist users.
