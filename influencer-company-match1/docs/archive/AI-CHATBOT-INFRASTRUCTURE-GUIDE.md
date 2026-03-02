# AI Chatbot Infrastructure Guide

## 🏗️ Architecture Overview

The AI chatbot is built as a **self-hosted, microservices-based system** with three main layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ChatbotWidget.tsx (React Component)                  │  │
│  │  - UI/UX for chat interface                           │  │
│  │  - Message formatting & display                       │  │
│  │  - WebSocket connection management                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useChatbot.ts (React Hook)                           │  │
│  │  - Socket.IO client connection                        │  │
│  │  - Message state management                           │  │
│  │  - Real-time event handling                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ WebSocket (Socket.IO)
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER (Node.js/NestJS)           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  chatbot.gateway.ts (WebSocket Gateway)               │  │
│  │  - Real-time bidirectional communication              │  │
│  │  - Connection management & authentication             │  │
│  │  - Event routing (send_message, get_history, etc.)   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  chatbot.service.ts (Business Logic)                  │  │
│  │  - Conversation management                            │  │
│  │  - Message persistence (PostgreSQL)                   │  │
│  │  - PII detection & redaction                          │  │
│  │  - Context tracking                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  chatbot-ai.service.ts (AI Orchestrator)              │  │
│  │  - ML service health checking                         │  │
│  │  - Request routing to ML service                      │  │
│  │  - Fallback response generation                       │  │
│  │  - Single source of truth for AI responses           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  chatbot.controller.ts (REST API)                     │  │
│  │  - HTTP endpoints for conversation management         │  │
│  │  - Alternative to WebSocket for simple operations    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│                ML SERVICE LAYER (Python/FastAPI)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  main.py (FastAPI Application)                        │  │
│  │  - /chat endpoint (main AI processing)                │  │
│  │  - /health endpoint (service status)                  │  │
│  │  - /classify-intent, /extract-entities, etc.         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  intent_classifier.py                                 │  │
│  │  - Pattern-based intent recognition                   │  │
│  │  - Loads intents from intents.json                    │  │
│  │  - Returns intent + confidence score                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  response_generator.py                                │  │
│  │  - Template-based response generation                 │  │
│  │  - Context-aware personalization                      │  │
│  │  - Follow-up suggestions                              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  entity_extractor.py                                  │  │
│  │  - Regex-based entity extraction                      │  │
│  │  - Detects emails, phones, URLs, money, dates        │  │
│  │  - Keyword-based entity recognition                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  sentiment_analyzer.py                                │  │
│  │  - Rule-based sentiment analysis                      │  │
│  │  - Positive/negative/neutral classification           │  │
│  │  - Sentiment score calculation                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER (PostgreSQL)                  │
│  - chatbot_conversations (session tracking)                 │
│  - chatbot_messages (message history)                       │
│  - chatbot_intents (intent definitions)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

### Backend (Node.js/NestJS)
```
backend/src/modules/chatbot/
├── chatbot.module.ts              # Module definition
├── chatbot.controller.ts          # REST API endpoints
├── chatbot.gateway.ts             # WebSocket gateway
├── chatbot.service.ts             # Core business logic
├── chatbot-ai.service.ts          # AI orchestration (MAIN AI FILE)
├── entities/
│   ├── chatbot-conversation.entity.ts
│   ├── chatbot-message.entity.ts
│   └── chatbot-intent.entity.ts
└── dto/
    └── (data transfer objects)
```

### ML Service (Python/FastAPI)
```
ml-service/
├── app/
│   ├── main.py                    # FastAPI application (MAIN ENTRY POINT)
│   ├── __init__.py
│   └── models/
│       ├── intent_classifier.py   # Intent recognition (CORE AI)
│       ├── response_generator.py  # Response generation (CORE AI)
│       ├── entity_extractor.py    # Entity extraction
│       ├── sentiment_analyzer.py  # Sentiment analysis
│       └── model_manager.py       # Model lifecycle management
├── data/
│   └── intents.json               # Intent definitions & responses
├── Dockerfile                     # Container configuration
├── requirements.txt               # Python dependencies
└── README.md                      # ML service documentation
```

### Frontend (React/TypeScript)
```
src/renderer/
├── components/
│   └── ChatbotWidget/
│       ├── ChatbotWidget.tsx      # Main chat UI component
│       └── ChatbotWidget.css      # Styling
└── hooks/
    └── useChatbot.ts              # WebSocket connection hook
```

---

## 🧠 Core AI Components

### 1. **chatbot-ai.service.ts** (Backend - AI Orchestrator)

**Location:** `backend/src/modules/chatbot/chatbot-ai.service.ts`

**Purpose:** Single source of truth for AI response generation

**Key Features:**
- ML service health monitoring
- Automatic fallback to simple responses if ML service unavailable
- Request routing to Python ML service
- Response caching and optimization

**Main Method:**
```typescript
async generateResponse(
  userMessage: string,
  context: {
    userId: string;
    conversationId: string;
    intent?: string;
    context?: Record<string, any>;
  }
): Promise<AIResponse>
```

**How it works:**
1. Checks ML service availability
2. If available: sends request to Python ML service
3. If unavailable: uses fallback pattern matching
4. Returns structured response with intent and confidence

---

### 2. **main.py** (ML Service - FastAPI Application)

**Location:** `ml-service/app/main.py`

**Purpose:** Main entry point for AI processing

**Key Endpoints:**
- `POST /chat` - Main chat endpoint (full AI processing)
- `GET /health` - Service health check
- `POST /classify-intent` - Intent classification only
- `POST /extract-entities` - Entity extraction only
- `POST /analyze-sentiment` - Sentiment analysis only

**Request Flow:**
```python
1. Receive message from backend
2. Classify intent (intent_classifier.py)
3. Extract entities (entity_extractor.py)
4. Analyze sentiment (sentiment_analyzer.py)
5. Generate response (response_generator.py)
6. Return structured JSON response
```

---

### 3. **intent_classifier.py** (ML Service - Intent Recognition)

**Location:** `ml-service/app/models/intent_classifier.py`

**Purpose:** Determines user intent from message

**Algorithm:**
- Pattern-based matching using intents.json
- Exact match (score: 1.0)
- Contains match (score: 0.8)
- Word overlap (score: proportional)

**Example:**
```python
Input: "How do I find matches?"
Output: {
  'intent': 'find_matches',
  'confidence': 0.95
}
```

---

### 4. **response_generator.py** (ML Service - Response Generation)

**Location:** `ml-service/app/models/response_generator.py`

**Purpose:** Generates contextual responses based on intent

**Features:**
- Template-based responses from intents.json
- Random selection for variety
- Context personalization
- Follow-up suggestions

**Example:**
```python
Input: intent='greeting', confidence=0.9
Output: "Hello! 👋 How can I help you today?"
```

---

### 5. **intents.json** (ML Service - Knowledge Base)

**Location:** `ml-service/data/intents.json`

**Purpose:** Defines all intents, patterns, and responses

**Structure:**
```json
{
  "intents": [
    {
      "tag": "greeting",
      "patterns": ["hi", "hello", "hey"],
      "responses": ["Hello! 👋 How can I help?"]
    }
  ]
}
```

**Current Intents (30+):**
- greeting, goodbye, thanks
- find_matches, matching_algorithm
- collaboration, collaboration_status
- performance, analytics
- profile, messages, budget_pricing
- platform_features, account_settings
- search, notifications, success_tips
- industries, connections, campaigns
- reviews_ratings, technical_issues
- getting_started, safety_security
- verification, portfolio, response_time
- contract_agreement, payment_methods
- dispute_resolution, mobile_app
- data_export, delete_account
- referral_program, language_support
- api_integration, unknown

---

## 🔄 Message Flow

### Complete Request-Response Cycle:

```
1. USER TYPES MESSAGE
   ↓
2. ChatbotWidget.tsx captures input
   ↓
3. useChatbot.ts sends via WebSocket
   ↓
4. chatbot.gateway.ts receives event
   ↓
5. chatbot.service.ts processes message
   ├─ Saves user message to database
   ├─ Calls chatbot-ai.service.ts
   │  ↓
   │  6. chatbot-ai.service.ts routes to ML service
   │     ↓
   │     7. ML Service (main.py) processes:
   │        ├─ intent_classifier.py → intent
   │        ├─ entity_extractor.py → entities
   │        ├─ sentiment_analyzer.py → sentiment
   │        └─ response_generator.py → response
   │     ↓
   │     8. Returns AI response to backend
   │  ↓
   ├─ Saves bot message to database
   └─ Updates conversation context
   ↓
9. chatbot.gateway.ts emits response
   ↓
10. useChatbot.ts receives response
    ↓
11. ChatbotWidget.tsx displays message
```

---

## 🛡️ Security Features

### 1. **PII Detection & Redaction**
**File:** `chatbot.service.ts`

Automatically detects and redacts:
- Email addresses → `[EMAIL_REDACTED]`
- Phone numbers → `[PHONE_REDACTED]`
- Credit cards → `[CARD_REDACTED]`
- SSN → `[SSN_REDACTED]`

### 2. **Authentication**
- JWT token validation on WebSocket connection
- User ID verification for all operations
- Conversation ownership validation

### 3. **Rate Limiting**
- Health check throttling (30-second intervals)
- Request timeout (5 seconds for ML service)
- Connection retry limits

---

## 🚀 Deployment

### Prerequisites:
```bash
# Backend
Node.js 18+
PostgreSQL 14+
npm or yarn

# ML Service
Python 3.9+
pip
```

### 1. Start ML Service:
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Start Backend:
```bash
cd backend
npm install
npm run start:dev
```

### 3. Environment Variables:
```env
# Backend (.env)
ML_SERVICE_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key

# ML Service (optional)
FASTMCP_LOG_LEVEL=INFO
```

---

## 📊 Database Schema

### chatbot_conversations
```sql
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  session_id VARCHAR UNIQUE NOT NULL,
  status VARCHAR DEFAULT 'active',
  context JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### chatbot_messages
```sql
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES chatbot_conversations(id),
  sender_type VARCHAR NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  intent VARCHAR,
  confidence FLOAT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Customization Guide

### Adding New Intents:

1. **Edit intents.json:**
```json
{
  "tag": "new_feature",
  "patterns": ["pattern1", "pattern2"],
  "responses": ["Response 1", "Response 2"]
}
```

2. **Restart ML service** (auto-loads new intents)

3. **Test:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "pattern1"}'
```

### Modifying Fallback Responses:

**File:** `chatbot-ai.service.ts`

Edit the `getFallbackResponse()` method to add new patterns.

---

## 📈 Performance Optimization

### Current Optimizations:
1. **Lazy model loading** - Models load on first request
2. **Health check caching** - 30-second intervals
3. **Connection pooling** - WebSocket reuse
4. **Message batching** - Efficient database writes
5. **Response caching** - Common queries cached

### Monitoring:
- ML service health: `GET /health`
- Backend status: `chatbot-ai.service.getServiceStatus()`
- WebSocket connections: Gateway logs

---

## 🐛 Troubleshooting

### ML Service Not Connecting:
```bash
# Check if ML service is running
curl http://localhost:8000/health

# Check backend logs
# Look for: "ML Service is available" or "ML Service health check failed"
```

### WebSocket Connection Issues:
```typescript
// Frontend console logs
[Chatbot] Connecting to: http://localhost:3000/chatbot
[Chatbot] Connected successfully
```

### Database Connection:
```bash
# Check PostgreSQL
psql -U user -d database -c "SELECT COUNT(*) FROM chatbot_conversations;"
```

---

## 📚 API Reference

### WebSocket Events (chatbot.gateway.ts)

**Client → Server:**
- `send_message` - Send user message
- `get_history` - Load conversation history
- `close_conversation` - End conversation

**Server → Client:**
- `connected` - Connection established
- `message_received` - New message from bot
- `bot_typing` - Bot is typing indicator
- `history_loaded` - Conversation history
- `error` - Error occurred

### REST API (chatbot.controller.ts)

- `POST /chatbot/conversations` - Create conversation
- `GET /chatbot/conversations/active` - Get active conversation
- `GET /chatbot/conversations/:id/messages` - Get messages
- `POST /chatbot/conversations/:id/close` - Close conversation

---

## 🎯 Key Takeaways

1. **Self-Hosted:** No external AI APIs (OpenAI, etc.) - fully controlled
2. **Microservices:** Backend (Node.js) + ML Service (Python) separation
3. **Real-Time:** WebSocket for instant responses
4. **Fallback:** Works even if ML service is down
5. **Secure:** PII redaction, authentication, rate limiting
6. **Extensible:** Easy to add new intents via JSON
7. **Scalable:** Can deploy ML service separately

---

## 📞 Support

For questions or issues:
- Check logs: Backend console + ML service console
- Review documentation: `SELF-HOSTED-AI-CHATBOT-IMPLEMENTATION-PLAN.md`
- Test endpoints: Use Postman or curl
- Debug WebSocket: Browser DevTools → Network → WS

---

**Last Updated:** February 2026
**Version:** 1.0.0
