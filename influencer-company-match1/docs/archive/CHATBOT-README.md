# AI Chatbot System

## Overview
Self-hosted AI chatbot assistant for the Influencer-Company Match platform. Provides intelligent help with finding matches, collaboration requests, analytics, and platform navigation.

## Architecture

### Components
1. **Frontend Widget** (`ChatbotWidget.tsx`) - React component with WebSocket connection
2. **Backend Service** (NestJS) - WebSocket gateway, conversation management, PII protection
3. **ML Service** (Python/FastAPI) - Intent classification, response generation, NLP

### Data Flow
```
User Message → Frontend Widget → WebSocket → Backend Gateway 
→ ChatbotService → ChatbotAIService → ML Service 
→ Response Generation → Backend → Frontend → User
```

## Features

### Core Capabilities
- ✅ Real-time chat via WebSocket
- ✅ Intent classification (greeting, find_matches, collaboration, performance, help)
- ✅ Context-aware responses
- ✅ Conversation history
- ✅ PII detection and redaction
- ✅ Fallback responses when ML service unavailable
- ✅ Typing indicators
- ✅ Quick action buttons

### Security
- JWT authentication required
- PII automatic redaction (email, phone, credit card, SSN)
- Sensitive message flagging
- User-scoped conversations

## Database Schema

### chatbot_conversations
- `id` (UUID, PK)
- `user_id` (FK to users)
- `session_id` (unique)
- `status` (active/closed/archived)
- `context` (JSONB)
- `last_message_at`
- `created_at`, `updated_at`

### chatbot_messages
- `id` (UUID, PK)
- `conversation_id` (FK)
- `sender_type` (user/bot)
- `content` (text)
- `intent` (string)
- `confidence` (decimal)
- `is_sensitive` (boolean)
- `created_at`

### chatbot_intents
- `id` (UUID, PK)
- `name` (unique)
- `description`
- `patterns` (text[])
- `responses` (text[])
- `requires_auth` (boolean)
- `category`, `priority`
- `is_active` (boolean)

## Configuration

### Environment Variables

**Backend (.env)**
```env
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

**ML Service (.env)**
```env
PORT=8000
LOG_LEVEL=INFO
```

## Usage

### Frontend Integration
```typescript
import { ChatbotWidget } from './components/ChatbotWidget/ChatbotWidget';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatbotWidget />
    </div>
  );
}
```

### Sending Messages
The widget handles all interactions automatically. Users can:
1. Click the floating button to open
2. Type messages
3. Use quick action buttons
4. View conversation history

### Backend API

**WebSocket Events (Namespace: `/chatbot`)**

Client → Server:
- `send_message` - Send a chat message
- `get_history` - Load conversation history
- `close_conversation` - End conversation

Server → Client:
- `connected` - Connection established
- `message_received` - New message from bot
- `bot_typing` - Typing indicator
- `history_loaded` - History data
- `error` - Error occurred

## Intents

### Supported Intents
1. **greeting** - Hello, hi, hey
2. **find_matches** - Find matches, show matches, who can I work with
3. **collaboration** - Send collaboration, work together, start project
4. **performance** - Show stats, my performance, analytics
5. **help** - Help, how does this work, what can you do

### Adding New Intents
Edit `ml-service/data/intents.json`:
```json
{
  "intents": [
    {
      "tag": "new_intent",
      "patterns": ["pattern1", "pattern2"],
      "responses": ["response1", "response2"]
    }
  ]
}
```

## Maintenance

### Monitoring
- Check ML service health: `GET http://localhost:8000/health`
- View WebSocket connections in backend logs
- Monitor conversation metrics in database

### Common Issues

**Chatbot not connecting**
- Verify ML service is running
- Check JWT token is valid
- Confirm WebSocket URL is correct

**Responses are slow**
- ML service may be starting up (first request)
- Check network latency
- Review backend logs for errors

**Intent not recognized**
- Add more patterns to `intents.json`
- Check pattern matching logic
- Review confidence threshold

## Performance

### Optimization
- ML models lazy-loaded on first request
- WebSocket connection pooling
- Message history limited to 50 messages
- PII redaction cached

### Scaling
- ML service can be horizontally scaled
- Backend supports multiple WebSocket instances
- Database indexed on user_id and conversation_id

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# ML Service
cd ml-service
pytest

# Frontend
cd influencer-company-match1
npm test
```

### Debugging
Enable debug logs:
```typescript
// Frontend
localStorage.setItem('debug', 'chatbot:*');

// Backend
LOG_LEVEL=debug npm run start:dev

// ML Service
LOG_LEVEL=DEBUG python -m app.main
```

## Roadmap

### Planned Features
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Rich media responses (images, cards)
- [ ] Conversation analytics dashboard
- [ ] A/B testing for responses
- [ ] Machine learning model training from conversations
- [ ] Integration with external AI services (OpenAI, etc.)

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Test ML service health endpoint
4. Check WebSocket connection status
