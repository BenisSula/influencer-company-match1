# Chatbot API Reference

## WebSocket API

### Connection
**Namespace**: `/chatbot`
**URL**: `ws://localhost:3000/chatbot`

**Authentication**: JWT token required in handshake
```typescript
const socket = io('http://localhost:3000/chatbot', {
  auth: { token: 'your-jwt-token' }
});
```

### Events

#### Client → Server

##### `send_message`
Send a chat message to the bot.

**Payload**:
```typescript
{
  content: string;          // Message content
  conversationId?: string;  // Optional conversation ID
}
```

**Example**:
```typescript
socket.emit('send_message', {
  content: 'Hello, I need help finding matches',
  conversationId: 'uuid-here' // optional
});
```

##### `get_history`
Load conversation history.

**Payload**:
```typescript
{
  conversationId: string;  // Conversation ID
  limit?: number;          // Max messages (default: 50)
}
```

**Example**:
```typescript
socket.emit('get_history', {
  conversationId: 'uuid-here',
  limit: 20
});
```

##### `close_conversation`
Close an active conversation.

**Payload**:
```typescript
{
  conversationId: string;  // Conversation ID to close
}
```

**Example**:
```typescript
socket.emit('close_conversation', {
  conversationId: 'uuid-here'
});
```

#### Server → Client

##### `connected`
Emitted when client successfully connects.

**Payload**:
```typescript
{
  message: string;  // "Connected to chatbot"
  userId: string;   // Authenticated user ID
}
```

##### `message_received`
Emitted when bot responds to a message.

**Payload**:
```typescript
{
  userMessage: {
    id: string;
    content: string;
    senderType: 'user';
    createdAt: string;
  };
  botMessage: {
    id: string;
    content: string;
    senderType: 'bot';
    intent: string;
    createdAt: string;
  };
}
```

##### `bot_typing`
Emitted when bot is processing a response.

**Payload**:
```typescript
{
  isTyping: boolean;  // true when typing, false when done
}
```

##### `history_loaded`
Emitted when conversation history is loaded.

**Payload**:
```typescript
{
  messages: Array<{
    id: string;
    content: string;
    senderType: 'user' | 'bot';
    intent?: string;
    createdAt: string;
  }>;
}
```

##### `conversation_closed`
Emitted when conversation is closed.

**Payload**:
```typescript
{
  conversationId: string;
}
```

##### `error`
Emitted when an error occurs.

**Payload**:
```typescript
{
  message: string;  // Error description
}
```

## REST API (ML Service)

### Base URL
`http://localhost:8000`

### Endpoints

#### `GET /`
Root endpoint with service info.

**Response**:
```json
{
  "service": "AI Chatbot ML Service",
  "status": "running",
  "version": "1.0.0"
}
```

#### `GET /health`
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

#### `POST /chat`
Main chat endpoint with full NLP processing.

**Request**:
```json
{
  "message": "Hello, I need help",
  "context": {},
  "user_id": "user-uuid"
}
```

**Response**:
```json
{
  "intent": "greeting",
  "confidence": 0.95,
  "response": "Hello! 👋 How can I help you today?",
  "entities": [],
  "sentiment": {
    "sentiment": "positive",
    "score": 0.8
  },
  "suggestions": [
    "Find matches for me",
    "Show my performance",
    "Help me collaborate"
  ]
}
```

#### `POST /classify-intent`
Intent classification only.

**Request**:
```json
{
  "message": "find me some matches"
}
```

**Response**:
```json
{
  "intent": "find_matches",
  "confidence": 0.92
}
```

#### `POST /extract-entities`
Entity extraction only.

**Request**:
```json
{
  "message": "I want to collaborate with tech companies in New York"
}
```

**Response**:
```json
{
  "entities": [
    {
      "text": "tech companies",
      "type": "INDUSTRY",
      "start": 25,
      "end": 39
    },
    {
      "text": "New York",
      "type": "LOCATION",
      "start": 43,
      "end": 51
    }
  ]
}
```

#### `POST /analyze-sentiment`
Sentiment analysis only.

**Request**:
```json
{
  "message": "I love this platform!"
}
```

**Response**:
```json
{
  "sentiment": "positive",
  "score": 0.95
}
```

## Frontend Hook API

### `useChatbot()`

React hook for chatbot functionality.

**Returns**:
```typescript
{
  sendMessage: (content: string) => Promise<ChatbotMessage | null>;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  messages: ChatbotMessage[];
  isTyping: boolean;
  clearMessages: () => void;
}
```

**Usage**:
```typescript
import { useChatbot } from './hooks/useChatbot';

function ChatComponent() {
  const { 
    sendMessage, 
    isConnected, 
    messages, 
    isTyping 
  } = useChatbot();

  const handleSend = async () => {
    await sendMessage('Hello!');
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      {isTyping && <div>Bot is typing...</div>}
    </div>
  );
}
```

## Data Types

### ChatbotMessage
```typescript
interface ChatbotMessage {
  id: string;
  content: string;
  senderType: 'user' | 'bot';
  intent?: string;
  createdAt: string;
}
```

### ChatbotConversation
```typescript
interface ChatbotConversation {
  id: string;
  userId: string;
  sessionId: string;
  status: 'active' | 'closed' | 'archived';
  context: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}
```

### Intent
```typescript
interface Intent {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  responses: string[];
  requiresAuth: boolean;
  category: string;
  priority: number;
  isActive: boolean;
}
```

## Error Codes

### WebSocket Errors
- `UNAUTHORIZED` - Invalid or missing JWT token
- `CONVERSATION_NOT_FOUND` - Conversation ID doesn't exist
- `MESSAGE_FAILED` - Failed to process message
- `TIMEOUT` - Request timed out

### HTTP Errors
- `400` - Bad Request (invalid payload)
- `500` - Internal Server Error
- `503` - Service Unavailable (ML service down)

## Rate Limiting

### WebSocket
- Max 60 messages per minute per user
- Max 5 concurrent connections per user

### REST API
- Max 100 requests per minute per IP
- Max 1000 requests per hour per IP

## Best Practices

### Frontend
1. Always check `isConnected` before sending messages
2. Handle `error` events gracefully
3. Clear messages when closing widget
4. Implement reconnection logic
5. Show typing indicators for better UX

### Backend
1. Validate all user input
2. Sanitize messages before storage
3. Implement PII redaction
4. Log errors for monitoring
5. Use fallback responses when ML service unavailable

### ML Service
1. Keep models lightweight for fast responses
2. Cache frequently used responses
3. Monitor model performance
4. Update intents based on user feedback
5. Implement graceful degradation

## Examples

### Complete Chat Flow
```typescript
// 1. Connect
const { connect, sendMessage, messages, isConnected } = useChatbot();
connect();

// 2. Wait for connection
await new Promise(resolve => {
  const interval = setInterval(() => {
    if (isConnected) {
      clearInterval(interval);
      resolve();
    }
  }, 100);
});

// 3. Send message
await sendMessage('Hello!');

// 4. Bot responds automatically
// messages array will update with bot response

// 5. Continue conversation
await sendMessage('Find me some matches');
```

### Error Handling
```typescript
socket.on('error', (error) => {
  console.error('Chatbot error:', error.message);
  
  // Show user-friendly message
  showNotification('Sorry, something went wrong. Please try again.');
  
  // Log for debugging
  logError('chatbot_error', error);
});
```

### Custom Intent Handling
```typescript
socket.on('message_received', (data) => {
  const { botMessage } = data;
  
  // Handle specific intents
  switch (botMessage.intent) {
    case 'find_matches':
      // Navigate to matches page
      router.push('/matches');
      break;
    case 'performance':
      // Open analytics modal
      openAnalyticsModal();
      break;
    default:
      // Show message normally
      break;
  }
});
```
