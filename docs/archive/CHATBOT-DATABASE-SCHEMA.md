# Chatbot Database Schema

## Tables Overview

### 1. chatbot_conversations

Stores conversation sessions between users and the chatbot.

```sql
CREATE TABLE chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active', -- active, closed, archived
  context JSONB DEFAULT '{}', -- Conversation context
  metadata JSONB DEFAULT '{}', -- Additional data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_status (status),
  INDEX idx_last_message_at (last_message_at)
);
```

### 2. chatbot_messages

Stores individual messages in conversations.

```sql
CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  intent VARCHAR(100), -- Detected intent
  confidence DECIMAL(5,4), -- AI confidence score
  metadata JSONB DEFAULT '{}',
  is_sensitive BOOLEAN DEFAULT FALSE, -- Contains PII
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_type (sender_type),
  INDEX idx_intent (intent),
  INDEX idx_created_at (created_at)
);
```

### 3. chatbot_intents

Predefined intents and responses.

```sql
CREATE TABLE chatbot_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  patterns TEXT[], -- Matching patterns
  responses TEXT[], -- Possible responses
  requires_auth BOOLEAN DEFAULT FALSE,
  category VARCHAR(50), -- FAQ, support, matching, etc.
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_is_active (is_active)
);
```

### 4. chatbot_analytics

Tracks chatbot performance and usage.

```sql
CREATE TABLE chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- message_sent, intent_detected, etc.
  event_data JSONB DEFAULT '{}',
  session_duration INTEGER, -- in seconds
  messages_count INTEGER DEFAULT 0,
  satisfaction_score INTEGER, -- 1-5 rating
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
```

### 5. chatbot_email_queue

Manages email notifications triggered by chatbot.

```sql
CREATE TABLE chatbot_email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL, -- match_alert, collab_request, etc.
  recipient_email VARCHAR(255) NOT NULL, -- Masked email
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template_data JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_email_type (email_type),
  INDEX idx_created_at (created_at)
);
```

### 6. chatbot_faq

Frequently asked questions and answers.

```sql
CREATE TABLE chatbot_faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50),
  keywords TEXT[],
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_category (category),
  INDEX idx_is_active (is_active),
  INDEX idx_view_count (view_count)
);
```

---

## Relationships

```
users (1) ──────── (N) chatbot_conversations
chatbot_conversations (1) ──────── (N) chatbot_messages
chatbot_conversations (1) ──────── (N) chatbot_analytics
users (1) ──────── (N) chatbot_email_queue
```

---

## Indexes Strategy

- Primary keys: UUID with default generation
- Foreign keys: Indexed for join performance
- Timestamp fields: Indexed for time-based queries
- Status fields: Indexed for filtering
- JSONB fields: GIN indexes for complex queries (optional)

---

## Data Retention Policy

- Active conversations: Keep indefinitely
- Closed conversations: Archive after 90 days
- Analytics data: Aggregate and archive after 1 year
- Email queue: Delete after 30 days (sent emails)
- Failed emails: Keep for 7 days for retry

