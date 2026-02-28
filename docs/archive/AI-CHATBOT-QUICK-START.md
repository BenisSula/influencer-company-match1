# AI Chatbot - Quick Start Guide

## 🚀 Quick Implementation Steps

### 1. Database Setup (5 minutes)

```bash
# Run migration
cd backend
npm run typeorm migration:run

# Verify tables created
psql -d your_database -c "\dt chatbot*"
```

### 2. Install Dependencies (2 minutes)

```bash
# Backend
cd backend
npm install openai socket.io @nestjs/websockets nodemailer

# Frontend
cd ..
npm install socket.io-client
```

### 3. Environment Variables (2 minutes)

```bash
# backend/.env
OPENAI_API_KEY=sk-your-key-here
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-key
SMTP_FROM=notifications@yourdomain.com
```

### 4. Register Module (1 minute)

```typescript
// backend/src/app.module.ts
import { ChatbotModule } from './modules/chatbot/chatbot.module';

@Module({
  imports: [
    // ... other modules
    ChatbotModule,
  ],
})
export class AppModule {}
```

### 5. Add Widget to App (1 minute)

```typescript
// src/renderer/AppComponent.tsx
import { ChatbotWidget } from './components/ChatbotWidget/ChatbotWidget';

export const AppComponent = () => {
  return (
    <>
      {/* Your app */}
      <ChatbotWidget />
    </>
  );
};
```

### 6. Start Services (1 minute)

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

---

## 🎨 Brand Colors Used

```css
Primary: #E1306C (Instagram Pink)
Secondary: #5B51D8 (Purple)
Accent: #FD8D32 (Orange)
Success: #00D95F (Green)
Info: #0095F6 (Blue)
```

---

## 📱 Mobile-First Features

- ✅ Full-screen on mobile (<768px)
- ✅ Floating widget on desktop
- ✅ 44px minimum tap targets
- ✅ Touch-optimized gestures
- ✅ Responsive typography
- ✅ Auto-hide keyboard

---

## 🔒 Privacy Features

- ✅ Email masking (u***@e***.com)
- ✅ PII redaction (emails, phones, cards)
- ✅ AES-256 encryption at rest
- ✅ TLS 1.3 in transit
- ✅ Rate limiting (100 req/min)
- ✅ No direct contact sharing

---

## 🧪 Test the Chatbot

```bash
# Open browser
http://localhost:5173

# Click chatbot button (bottom-right)
# Try these messages:
- "Hello"
- "Find matches"
- "Show my analytics"
- "Help"
```

---

## 📊 Monitor Performance

```bash
# Check WebSocket connections
curl http://localhost:3000/chatbot/health

# View conversation stats
psql -d your_database -c "SELECT COUNT(*) FROM chatbot_conversations;"

# Check message count
psql -d your_database -c "SELECT COUNT(*) FROM chatbot_messages;"
```

---

## 🐛 Troubleshooting

### Chatbot won't connect
```bash
# Check backend is running
curl http://localhost:3000/health

# Check WebSocket port
netstat -an | grep 3000

# Verify JWT token
# Open browser console and check localStorage
```

### AI responses not working
```bash
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Test API directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Emails not sending
```bash
# Check SMTP credentials
# Test with nodemailer
node backend/test-email.js
```

---

## 📁 File Structure

```
backend/src/modules/chatbot/
├── entities/
│   ├── chatbot-conversation.entity.ts ✅
│   ├── chatbot-message.entity.ts ✅
│   └── chatbot-intent.entity.ts ✅
├── chatbot.module.ts ✅
├── chatbot.service.ts ✅
├── chatbot-ai.service.ts ✅
├── chatbot-email.service.ts ✅
├── chatbot.gateway.ts ✅
└── chatbot.controller.ts ✅

src/renderer/components/ChatbotWidget/
├── ChatbotWidget.tsx ✅
└── ChatbotWidget.css ✅

src/renderer/hooks/
└── useChatbot.ts ✅
```

---

## 🎯 Next Steps

1. ✅ Seed intent data
2. ✅ Test all features
3. ✅ Configure email templates
4. ✅ Set up monitoring
5. ✅ Deploy to staging
6. ✅ User acceptance testing
7. ✅ Production deployment

---

## 📚 Documentation

- Full Implementation: `AI-CHATBOT-ENHANCED-IMPLEMENTATION.md`
- Database Schema: `CHATBOT-DATABASE-SCHEMA.md`
- Original Plan: `AI-CHATBOT-COMPREHENSIVE-IMPLEMENTATION-PLAN.md`

---

**Total Setup Time: ~15 minutes** ⚡

**Questions?** Check the full implementation guide or contact the dev team!
