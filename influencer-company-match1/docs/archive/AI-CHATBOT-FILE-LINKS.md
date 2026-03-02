# AI Chatbot - Clickable File Links

## 🎯 Core AI Files (Self-Powered AI)

### **Backend AI Orchestration (Node.js/TypeScript)**

#### ⭐ Main AI Response Generator
- **[backend/src/modules/chatbot/chatbot-ai.service.ts](backend/src/modules/chatbot/chatbot-ai.service.ts)** 
  - **PRIMARY AI FILE** - Single source of truth for AI responses
  - Routes requests to ML service
  - Provides fallback responses when ML service unavailable
  - Health monitoring and service availability checks

#### Core Business Logic
- **[backend/src/modules/chatbot/chatbot.service.ts](backend/src/modules/chatbot/chatbot.service.ts)**
  - Conversation management
  - Message persistence
  - PII detection and redaction
  - Context tracking

#### WebSocket Gateway
- **[backend/src/modules/chatbot/chatbot.gateway.ts](backend/src/modules/chatbot/chatbot.gateway.ts)**
  - Real-time bidirectional communication
  - Connection management
  - Event routing (send_message, get_history, etc.)

#### REST API Controller
- **[backend/src/modules/chatbot/chatbot.controller.ts](backend/src/modules/chatbot/chatbot.controller.ts)**
  - HTTP endpoints for conversation management
  - Alternative to WebSocket

#### Module Configuration
- **[backend/src/modules/chatbot/chatbot.module.ts](backend/src/modules/chatbot/chatbot.module.ts)**
  - NestJS module definition
  - Dependency injection setup

---

### **ML Service (Python/FastAPI) - Self-Hosted AI Brain**

#### ⭐ Main ML Service Entry Point
- **[ml-service/app/main.py](ml-service/app/main.py)**
  - **MAIN AI PROCESSING FILE**
  - FastAPI application
  - POST /chat - Main AI endpoint
  - GET /health - Service health check
  - Coordinates all AI models

#### ⭐ Intent Classification (AI Core)
- **[ml-service/app/models/intent_classifier.py](ml-service/app/models/intent_classifier.py)**
  - **INTENT DETECTION ENGINE**
  - Pattern-based intent recognition
  - Loads intents from intents.json
  - Returns intent + confidence score

#### ⭐ Response Generation (AI Core)
- **[ml-service/app/models/response_generator.py](ml-service/app/models/response_generator.py)**
  - **RESPONSE GENERATION ENGINE**
  - Template-based response generation
  - Context-aware personalization
  - Follow-up suggestions

#### Entity Extraction
- **[ml-service/app/models/entity_extractor.py](ml-service/app/models/entity_extractor.py)**
  - Regex-based entity extraction
  - Detects emails, phones, URLs, money, dates
  - Keyword-based entity recognition

#### Sentiment Analysis
- **[ml-service/app/models/sentiment_analyzer.py](ml-service/app/models/sentiment_analyzer.py)**
  - Rule-based sentiment analysis
  - Positive/negative/neutral classification
  - Sentiment score calculation

#### Model Management
- **[ml-service/app/models/model_manager.py](ml-service/app/models/model_manager.py)**
  - Model lifecycle management
  - Lazy loading optimization

#### Match Prediction (AI Matching)
- **[ml-service/app/models/match_predictor.py](ml-service/app/models/match_predictor.py)**
  - AI-powered match scoring
  - Compatibility prediction

#### Module Init
- **[ml-service/app/__init__.py](ml-service/app/__init__.py)**
  - Python package initialization

---

### **Knowledge Base & Configuration**

#### ⭐ Intent Definitions (AI Knowledge)
- **[ml-service/data/intents.json](ml-service/data/intents.json)**
  - **KNOWLEDGE BASE** - 30+ intents
  - Patterns for intent matching
  - Response templates
  - Easily customizable

#### ML Service Configuration
- **[ml-service/requirements.txt](ml-service/requirements.txt)**
  - Python dependencies
  - FastAPI, transformers, torch, spacy, etc.

#### Docker Configuration
- **[ml-service/Dockerfile](ml-service/Dockerfile)**
  - Container configuration for deployment

#### ML Service Documentation
- **[ml-service/README.md](ml-service/README.md)**
  - ML service setup and usage guide

#### Git Ignore
- **[ml-service/.gitignore](ml-service/.gitignore)**
  - Excluded files for version control

---

## 🎨 Frontend Files (React/TypeScript)

### Chat UI Component
- **[src/renderer/components/ChatbotWidget/ChatbotWidget.tsx](src/renderer/components/ChatbotWidget/ChatbotWidget.tsx)**
  - Main chat interface
  - Message display and formatting
  - User interaction handling

### Chat UI Styles
- **[src/renderer/components/ChatbotWidget/ChatbotWidget.css](src/renderer/components/ChatbotWidget/ChatbotWidget.css)**
  - Chatbot widget styling
  - Responsive design

### WebSocket Hook
- **[src/renderer/hooks/useChatbot.ts](src/renderer/hooks/useChatbot.ts)**
  - Socket.IO client connection
  - Message state management
  - Real-time event handling

---

## 🗄️ Database Entities

### Conversation Entity
- **[backend/src/modules/chatbot/entities/chatbot-conversation.entity.ts](backend/src/modules/chatbot/entities/chatbot-conversation.entity.ts)**
  - Conversation session tracking
  - Context storage

### Message Entity
- **[backend/src/modules/chatbot/entities/chatbot-message.entity.ts](backend/src/modules/chatbot/entities/chatbot-message.entity.ts)**
  - Individual message storage
  - Intent and confidence tracking

### Intent Entity
- **[backend/src/modules/chatbot/entities/chatbot-intent.entity.ts](backend/src/modules/chatbot/entities/chatbot-intent.entity.ts)**
  - Intent definitions in database

### Database Migration
- **[backend/src/database/migrations/1708010000000-CreateChatbotTables.ts](backend/src/database/migrations/1708010000000-CreateChatbotTables.ts)**
  - Creates chatbot database tables
  - Schema definition

---

## 🧪 Testing & Documentation

### Test Scripts
- **[test-chatbot-connection.js](test-chatbot-connection.js)** - WebSocket connection test
- **[test-chatbot-integration.js](test-chatbot-integration.js)** - Integration test
- **[test-ml-service.js](test-ml-service.js)** - ML service test

### Documentation Files
- **[AI-CHATBOT-INFRASTRUCTURE-GUIDE.md](AI-CHATBOT-INFRASTRUCTURE-GUIDE.md)** - Complete infrastructure guide
- **[AI-CHATBOT-CODE-FILES-REFERENCE.md](AI-CHATBOT-CODE-FILES-REFERENCE.md)** - Code reference
- **[AI-CHATBOT-QUICK-DIAGRAM.md](AI-CHATBOT-QUICK-DIAGRAM.md)** - Quick architecture diagram
- **[SELF-HOSTED-AI-CHATBOT-IMPLEMENTATION-PLAN.md](SELF-HOSTED-AI-CHATBOT-IMPLEMENTATION-PLAN.md)** - Implementation plan
- **[CHATBOT-README.md](CHATBOT-README.md)** - Chatbot README
- **[CHATBOT-API-REFERENCE.md](CHATBOT-API-REFERENCE.md)** - API reference
- **[CHATBOT-QUICK-START.md](CHATBOT-QUICK-START.md)** - Quick start guide
- **[CHATBOT-DATABASE-SCHEMA.md](CHATBOT-DATABASE-SCHEMA.md)** - Database schema

---

## 🔧 AI/ML Service Integration

### Backend ML Service Client
- **[backend/src/modules/ai-matching/ml-service-client.ts](backend/src/modules/ai-matching/ml-service-client.ts)**
  - Client for communicating with ML service
  - Used by AI matching system

### AI Matching Services (Related AI)
- **[backend/src/modules/ai-matching/ai-matching.service.ts](backend/src/modules/ai-matching/ai-matching.service.ts)** - AI matching logic
- **[backend/src/modules/ai-matching/ai-matching.controller.ts](backend/src/modules/ai-matching/ai-matching.controller.ts)** - AI matching API
- **[backend/src/modules/ai-matching/recommendation.service.ts](backend/src/modules/ai-matching/recommendation.service.ts)** - Recommendation engine
- **[backend/src/modules/ai-matching/analytics.service.ts](backend/src/modules/ai-matching/analytics.service.ts)** - Analytics service
- **[backend/src/modules/ai-matching/ml-model.service.ts](backend/src/modules/ai-matching/ml-model.service.ts)** - ML model management
- **[backend/src/modules/ai-matching/collaboration-outcome.service.ts](backend/src/modules/ai-matching/collaboration-outcome.service.ts)** - Outcome tracking
- **[backend/src/modules/ai-matching/feature-engineering.service.ts](backend/src/modules/ai-matching/feature-engineering.service.ts)** - Feature engineering

### AI Matching Module
- **[backend/src/modules/ai-matching/ai-matching.module.ts](backend/src/modules/ai-matching/ai-matching.module.ts)** - Module definition

---

## 📊 File Organization Summary

### **Priority 1: Core AI Response Generation**
1. **[backend/src/modules/chatbot/chatbot-ai.service.ts](backend/src/modules/chatbot/chatbot-ai.service.ts)** ⭐⭐⭐⭐⭐
2. **[ml-service/app/main.py](ml-service/app/main.py)** ⭐⭐⭐⭐⭐
3. **[ml-service/app/models/intent_classifier.py](ml-service/app/models/intent_classifier.py)** ⭐⭐⭐⭐⭐
4. **[ml-service/app/models/response_generator.py](ml-service/app/models/response_generator.py)** ⭐⭐⭐⭐⭐
5. **[ml-service/data/intents.json](ml-service/data/intents.json)** ⭐⭐⭐⭐⭐

### **Priority 2: Backend Integration**
6. **[backend/src/modules/chatbot/chatbot.service.ts](backend/src/modules/chatbot/chatbot.service.ts)** ⭐⭐⭐⭐
7. **[backend/src/modules/chatbot/chatbot.gateway.ts](backend/src/modules/chatbot/chatbot.gateway.ts)** ⭐⭐⭐⭐
8. **[backend/src/modules/chatbot/chatbot.controller.ts](backend/src/modules/chatbot/chatbot.controller.ts)** ⭐⭐⭐⭐

### **Priority 3: Frontend UI**
9. **[src/renderer/components/ChatbotWidget/ChatbotWidget.tsx](src/renderer/components/ChatbotWidget/ChatbotWidget.tsx)** ⭐⭐⭐⭐
10. **[src/renderer/hooks/useChatbot.ts](src/renderer/hooks/useChatbot.ts)** ⭐⭐⭐⭐

### **Priority 4: Supporting AI Models**
11. **[ml-service/app/models/entity_extractor.py](ml-service/app/models/entity_extractor.py)** ⭐⭐⭐
12. **[ml-service/app/models/sentiment_analyzer.py](ml-service/app/models/sentiment_analyzer.py)** ⭐⭐⭐

---

## 🚀 Quick Navigation by Function

### **To Modify AI Responses:**
1. Edit **[ml-service/data/intents.json](ml-service/data/intents.json)** - Add/modify intents and responses
2. Edit **[ml-service/app/models/response_generator.py](ml-service/app/models/response_generator.py)** - Change response logic
3. Edit **[backend/src/modules/chatbot/chatbot-ai.service.ts](backend/src/modules/chatbot/chatbot-ai.service.ts)** - Modify fallback responses

### **To Add New Intents:**
1. Edit **[ml-service/data/intents.json](ml-service/data/intents.json)** - Add new intent definition
2. Restart ML service (auto-loads new intents)

### **To Modify UI:**
1. Edit **[src/renderer/components/ChatbotWidget/ChatbotWidget.tsx](src/renderer/components/ChatbotWidget/ChatbotWidget.tsx)** - Change UI
2. Edit **[src/renderer/components/ChatbotWidget/ChatbotWidget.css](src/renderer/components/ChatbotWidget/ChatbotWidget.css)** - Change styles

### **To Debug Connection Issues:**
1. Check **[backend/src/modules/chatbot/chatbot.gateway.ts](backend/src/modules/chatbot/chatbot.gateway.ts)** - WebSocket events
2. Check **[src/renderer/hooks/useChatbot.ts](src/renderer/hooks/useChatbot.ts)** - Client connection
3. Check **[backend/src/modules/chatbot/chatbot-ai.service.ts](backend/src/modules/chatbot/chatbot-ai.service.ts)** - ML service health

### **To Modify Database Schema:**
1. Edit **[backend/src/modules/chatbot/entities/chatbot-conversation.entity.ts](backend/src/modules/chatbot/entities/chatbot-conversation.entity.ts)**
2. Edit **[backend/src/modules/chatbot/entities/chatbot-message.entity.ts](backend/src/modules/chatbot/entities/chatbot-message.entity.ts)**
3. Create new migration in **[backend/src/database/migrations/](backend/src/database/migrations/)**

---

## 💡 Key Insights

### **Self-Hosted AI Architecture:**
- **No external APIs** (OpenAI, etc.) - fully self-contained
- **Python ML Service** handles all AI processing
- **Node.js Backend** orchestrates and provides fallback
- **React Frontend** provides user interface

### **AI Processing Flow:**
```
User Message
    ↓
Frontend (ChatbotWidget.tsx)
    ↓
Backend Gateway (chatbot.gateway.ts)
    ↓
Backend Service (chatbot.service.ts)
    ↓
AI Orchestrator (chatbot-ai.service.ts) ⭐
    ↓
ML Service (main.py) ⭐
    ├─ intent_classifier.py ⭐
    ├─ response_generator.py ⭐
    ├─ entity_extractor.py
    └─ sentiment_analyzer.py
    ↓
Response back to user
```

### **Customization Points:**
1. **Intents & Responses:** [ml-service/data/intents.json](ml-service/data/intents.json)
2. **Fallback Logic:** [backend/src/modules/chatbot/chatbot-ai.service.ts](backend/src/modules/chatbot/chatbot-ai.service.ts)
3. **UI/UX:** [src/renderer/components/ChatbotWidget/](src/renderer/components/ChatbotWidget/)
4. **Database:** [backend/src/modules/chatbot/entities/](backend/src/modules/chatbot/entities/)

---

## 📞 Need Help?

- **Architecture:** See [AI-CHATBOT-INFRASTRUCTURE-GUIDE.md](AI-CHATBOT-INFRASTRUCTURE-GUIDE.md)
- **Code Reference:** See [AI-CHATBOT-CODE-FILES-REFERENCE.md](AI-CHATBOT-CODE-FILES-REFERENCE.md)
- **Quick Start:** See [CHATBOT-QUICK-START.md](CHATBOT-QUICK-START.md)
- **API Docs:** See [CHATBOT-API-REFERENCE.md](CHATBOT-API-REFERENCE.md)

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Total AI/ML Files:** 25+ core files
