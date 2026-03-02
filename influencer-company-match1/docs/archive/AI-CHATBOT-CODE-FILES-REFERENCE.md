# AI Chatbot Code Files Reference

## 🎯 Main AI Response Generation File

### **PRIMARY FILE: `chatbot-ai.service.ts`**

**Location:** `backend/src/modules/chatbot/chatbot-ai.service.ts`

**Purpose:** This is the SINGLE SOURCE OF TRUTH for all AI responses in the chatbot.

**Key Responsibilities:**
1. Routes requests to Python ML service
2. Handles ML service health checking
3. Provides fallback responses when ML service is unavailable
4. Returns structured AI responses with intent and confidence

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

**How It Works:**
- Checks if ML service is available
- If YES: Sends request to Python ML service at `http://localhost:8000/chat`
- If NO: Uses built-in fallback pattern matching
- Returns: `{ response: string, intent: string, confidence: number }`

---

## 🐍 Python ML Service Files (AI Brain)

### 1. **main.py** - FastAPI Application

**Location:** `ml-service/app/main.py`

**Purpose:** Main entry point for AI processing

**Key Endpoints:**
```python
POST /chat              # Main AI endpoint (full processing)
GET /health             # Service health check
POST /classify-intent   # Intent classification only
POST /extract-entities  # Entity extraction only
POST /analyze-sentiment # Sentiment analysis only
```

**Request Example:**
```json
{
  "message": "How do I find matches?",
  "context": {},
  "user_id": "user123"
}
```

**Response Example:**
```json
{
  "intent": "find_matches",
  "confidence": 0.95,
  "response": "I can help you find perfect matches! 🎯...",
  "entities": [],
  "sentiment": {"sentiment": "neutral", "score": 0.5},
  "suggestions": ["Show me top matches", "Filter by industry"]
}
```

---

### 2. **intent_classifier.py** - Intent Recognition

**Location:** `ml-service/app/models/intent_classifier.py`

**Purpose:** Determines what the user wants (intent) from their message

**Algorithm:**
1. Loads intents from `intents.json`
2. Compares user message against patterns
3. Scores matches (exact, contains, word overlap)
4. Returns best matching intent + confidence

**Example:**
```python
classifier = IntentClassifier()
result = classifier.predict("show me my stats")
# Returns: {'intent': 'performance', 'confidence': 0.85}
```

---

### 3. **response_generator.py** - Response Generation

**Location:** `ml-service/app/models/response_generator.py`

**Purpose:** Generates appropriate responses based on detected intent

**Features:**
- Template-based responses from intents.json
- Random selection for variety
- Context personalization (uses user name if available)
- Follow-up suggestions

**Example:**
```python
generator = ResponseGenerator()
response = generator.generate(
    intent='greeting',
    message='hi',
    context={'user_name': 'John'},
    confidence=0.9
)
# Returns: "John, Hello! 👋 How can I help you today?"
```

---

### 4. **entity_extractor.py** - Entity Extraction

**Location:** `ml-service/app/models/entity_extractor.py`

**Purpose:** Extracts structured information from messages

**Detects:**
- Emails: `user@example.com`
- Phone numbers: `555-123-4567`
- URLs: `https://example.com`
- Money: `$1,000.00`
- Dates: `12/31/2024`
- Keywords: industries, platforms, budget terms

**Example:**
```python
extractor = EntityExtractor()
entities = extractor.extract("Contact me at john@example.com")
# Returns: [{'text': 'john@example.com', 'label': 'email', 'start': 14, 'end': 31}]
```

---

### 5. **sentiment_analyzer.py** - Sentiment Analysis

**Location:** `ml-service/app/models/sentiment_analyzer.py`

**Purpose:** Determines emotional tone of messages

**Algorithm:**
- Rule-based word matching
- Positive words: good, great, love, happy, etc.
- Negative words: bad, terrible, hate, problem, etc.
- Calculates sentiment score (0.0 to 1.0)

**Example:**
```python
analyzer = SentimentAnalyzer()
sentiment = analyzer.analyze("This is great!")
# Returns: {'sentiment': 'positive', 'score': 0.75, 'positive_words': 1, 'negative_words': 0}
```

---

## 📋 Knowledge Base File

### **intents.json** - Intent Definitions

**Location:** `ml-service/data/intents.json`

**Purpose:** Defines all possible user intents, patterns, and responses

**Structure:**
```json
{
  "intents": [
    {
      "tag": "greeting",
      "patterns": ["hi", "hello", "hey", "good morning"],
      "responses": [
        "Hello! 👋 How can I help you today?",
        "Hi there! What can I do for you?"
      ]
    },
    {
      "tag": "find_matches",
      "patterns": ["find matches", "show matches", "who can i work with"],
      "responses": [
        "I can help you find perfect matches! 🎯\n\nTo get started:\n1. Go to the 'Matches' page..."
      ]
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
- verification, portfolio
- and more...

---

## 🔄 Backend Integration Files

### 1. **chatbot.service.ts** - Business Logic

**Location:** `backend/src/modules/chatbot/chatbot.service.ts`

**Purpose:** Manages conversations, messages, and database operations

**Key Methods:**
```typescript
// Create or get conversation
async getOrCreateConversation(userId: string): Promise<ChatbotConversation>

// Process message and generate response
async sendMessage(
  userId: string,
  content: string,
  conversationId?: string
): Promise<{ userMessage: ChatbotMessage; botMessage: ChatbotMessage }>

// Get conversation history
async getConversationHistory(
  conversationId: string,
  userId: string,
  limit: number = 50
): Promise<ChatbotMessage[]>
```

**PII Protection:**
- Detects sensitive information (emails, phones, credit cards, SSN)
- Automatically redacts PII before saving to database
- Marks messages as sensitive for audit purposes

---

### 2. **chatbot.gateway.ts** - WebSocket Gateway

**Location:** `backend/src/modules/chatbot/chatbot.gateway.ts`

**Purpose:** Real-time bidirectional communication with frontend

**WebSocket Events:**

**Client → Server:**
```typescript
'send_message'       // User sends a message
'get_history'        // Load conversation history
'close_conversation' // End conversation
```

**Server → Client:**
```typescript
'connected'          // Connection established
'message_received'   // Bot response ready
'bot_typing'         // Bot is typing indicator
'history_loaded'     // History retrieved
'error'              // Error occurred
```

**Authentication:**
- Validates JWT token on connection
- Associates socket with user ID
- Ensures user can only access their own conversations

---

### 3. **chatbot.controller.ts** - REST API

**Location:** `backend/src/modules/chatbot/chatbot.controller.ts`

**Purpose:** HTTP endpoints for conversation management

**Endpoints:**
```typescript
POST   /chatbot/conversations              // Create new conversation
GET    /chatbot/conversations/active       // Get active conversation
GET    /chatbot/conversations/:id/messages // Get message history
POST   /chatbot/conversations/:id/close    // Close conversation
```

---

## 🎨 Frontend Files

### 1. **ChatbotWidget.tsx** - UI Component

**Location:** `src/renderer/components/ChatbotWidget/ChatbotWidget.tsx`

**Purpose:** Chat interface and user interaction

**Features:**
- Floating chat widget (bottom-right corner)
- Message formatting (bold, lists, line breaks)
- Typing indicators
- Auto-scroll to latest message
- Click-outside to minimize
- Fallback responses when offline

**Message Formatting:**
- `**text**` → Bold text
- `• item` → Bullet list
- `1. item` → Numbered list
- `\n` → Line breaks

---

### 2. **useChatbot.ts** - WebSocket Hook

**Location:** `src/renderer/hooks/useChatbot.ts`

**Purpose:** Manages WebSocket connection and state

**Provides:**
```typescript
{
  sendMessage: (content: string) => Promise<ChatbotMessage | null>,
  isConnected: boolean,
  connect: () => void,
  disconnect: () => void,
  messages: ChatbotMessage[],
  isTyping: boolean,
  clearMessages: () => void
}
```

**Connection Management:**
- Auto-reconnection on disconnect
- Token-based authentication
- Connection status tracking
- Error handling and recovery

---

## 🗄️ Database Entities

### 1. **chatbot-conversation.entity.ts**

**Location:** `backend/src/modules/chatbot/entities/chatbot-conversation.entity.ts`

**Purpose:** Stores conversation sessions

**Fields:**
- `id` - Unique conversation ID
- `userId` - Owner of conversation
- `sessionId` - Session identifier
- `status` - active/closed
- `context` - Conversation context (JSON)
- `lastMessageAt` - Last activity timestamp
- `createdAt`, `updatedAt` - Timestamps

---

### 2. **chatbot-message.entity.ts**

**Location:** `backend/src/modules/chatbot/entities/chatbot-message.entity.ts`

**Purpose:** Stores individual messages

**Fields:**
- `id` - Unique message ID
- `conversationId` - Parent conversation
- `senderType` - 'user' or 'bot'
- `content` - Message text
- `intent` - Detected intent
- `confidence` - Confidence score
- `isSensitive` - PII flag
- `metadata` - Additional data (JSON)
- `createdAt` - Timestamp

---

## 🚀 Quick Start Commands

### Start ML Service:
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Test ML Service:
```bash
# Health check
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "user_id": "test"}'
```

### Start Backend:
```bash
cd backend
npm install
npm run start:dev
```

### Test WebSocket:
Open browser console and run:
```javascript
const socket = io('http://localhost:3000/chatbot', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
socket.on('connected', (data) => console.log('Connected:', data));
socket.emit('send_message', { content: 'hello' });
```

---

## 📊 Data Flow Summary

```
User types "find matches"
    ↓
ChatbotWidget.tsx captures input
    ↓
useChatbot.ts sends via WebSocket
    ↓
chatbot.gateway.ts receives event
    ↓
chatbot.service.ts processes
    ├─ Saves user message to DB
    ├─ Calls chatbot-ai.service.ts
    │   ↓
    │   Calls ML Service (main.py)
    │       ├─ intent_classifier.py → "find_matches" (0.95)
    │       ├─ entity_extractor.py → []
    │       ├─ sentiment_analyzer.py → neutral
    │       └─ response_generator.py → "I can help you find..."
    │   ↓
    │   Returns AI response
    ├─ Saves bot message to DB
    └─ Updates conversation context
    ↓
chatbot.gateway.ts emits response
    ↓
useChatbot.ts receives response
    ↓
ChatbotWidget.tsx displays message
```

---

## 🔑 Key Files Summary

| File | Purpose | Language | Priority |
|------|---------|----------|----------|
| `chatbot-ai.service.ts` | AI orchestration | TypeScript | ⭐⭐⭐⭐⭐ |
| `main.py` | ML service entry | Python | ⭐⭐⭐⭐⭐ |
| `intent_classifier.py` | Intent detection | Python | ⭐⭐⭐⭐⭐ |
| `response_generator.py` | Response generation | Python | ⭐⭐⭐⭐⭐ |
| `intents.json` | Knowledge base | JSON | ⭐⭐⭐⭐⭐ |
| `chatbot.service.ts` | Business logic | TypeScript | ⭐⭐⭐⭐ |
| `chatbot.gateway.ts` | WebSocket | TypeScript | ⭐⭐⭐⭐ |
| `ChatbotWidget.tsx` | UI component | React | ⭐⭐⭐⭐ |
| `useChatbot.ts` | WebSocket hook | TypeScript | ⭐⭐⭐⭐ |
| `entity_extractor.py` | Entity extraction | Python | ⭐⭐⭐ |
| `sentiment_analyzer.py` | Sentiment analysis | Python | ⭐⭐⭐ |

---

## 📝 Customization Examples

### Add New Intent:

1. Edit `ml-service/data/intents.json`:
```json
{
  "tag": "pricing_info",
  "patterns": ["pricing", "how much", "cost", "fees"],
  "responses": [
    "Our pricing is simple: 5% for companies, 10% for influencers on successful collaborations only!"
  ]
}
```

2. Restart ML service (auto-loads new intents)

3. Test:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "what are your fees?"}'
```

### Add Fallback Pattern:

Edit `backend/src/modules/chatbot/chatbot-ai.service.ts`:
```typescript
private getFallbackResponse(message: string): AIResponse {
  const lowerMessage = message.toLowerCase();
  
  // Add your pattern
  if (lowerMessage.includes('pricing') || lowerMessage.includes('fees')) {
    return {
      response: 'Our pricing is simple: 5% for companies, 10% for influencers!',
      intent: 'pricing_info',
      confidence: 0.7,
    };
  }
  
  // ... existing patterns
}
```

---

**Last Updated:** February 2026
**Version:** 1.0.0
