# 🤖 AI/ML Services Deployment Guide

Your application includes **TWO separate ML/AI services** that need to be deployed:

## 📦 ML Services Overview

### 1. **ML Chatbot Service** (`ml-service/`)
- **Technology:** Python + FastAPI
- **Purpose:** AI-powered chatbot for user assistance
- **Features:**
  - Intent classification
  - Sentiment analysis
  - Entity extraction
  - Response generation
- **Port:** Dynamic (assigned by Render)

### 2. **ML Matching Service** (`ml-matching-service/`)
- **Technology:** Python + FastAPI + scikit-learn
- **Purpose:** AI-powered influencer-company matching
- **Features:**
  - Match prediction
  - Compatibility scoring
  - Feature engineering
  - Model training
- **Port:** Dynamic (assigned by Render)

---

## ✅ Deployment Status

### Included in `render.yaml`:
✅ **ML Chatbot Service** - Configured and ready
✅ **ML Matching Service** - Configured and ready
✅ **Backend Integration** - Environment variables set
✅ **Auto-deployment** - Will deploy with Blueprint

### What Gets Deployed:

```
┌─────────────────────────────────────────┐
│  Frontend (React/Vite)                  │
│  https://influencer-match-frontend...   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend (NestJS)                       │
│  https://influencer-match-backend...    │
│  ├─ Connects to PostgreSQL              │
│  ├─ Connects to ML Chatbot Service      │
│  └─ Connects to ML Matching Service     │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│ ML Chatbot   │  │ ML Matching  │
│ Service      │  │ Service      │
│ (Python)     │  │ (Python)     │
└──────────────┘  └──────────────┘
```

---

## 🚀 Deployment Options

### Option 1: One-Click Blueprint (Recommended) ⭐

The `render.yaml` file includes ALL services:

1. Go to https://dashboard.render.com
2. Click "New" → "Blueprint"
3. Select your repository
4. Render will deploy:
   - ✅ Frontend
   - ✅ Backend
   - ✅ ML Chatbot Service
   - ✅ ML Matching Service
   - ✅ PostgreSQL Database

**All services will be automatically connected!**

### Option 2: Manual Deployment

If you prefer manual control:

#### Deploy ML Chatbot Service:
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** `influencer-match-ml-chatbot`
   - **Runtime:** Python 3
   - **Root Directory:** `ml-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

#### Deploy ML Matching Service:
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name:** `influencer-match-ml-matching`
   - **Runtime:** Python 3
   - **Root Directory:** `ml-matching-service`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free

#### Update Backend Environment:
Add these to your backend service:
```
ML_SERVICE_URL=https://influencer-match-ml-chatbot.onrender.com
ML_MATCHING_SERVICE_URL=https://influencer-match-ml-matching.onrender.com
```

---

## 🔧 How It Works

### AI Chatbot Integration:

**Frontend** → **Backend** → **ML Chatbot Service**

```typescript
// Backend calls ML Chatbot Service
const response = await axios.post(
  `${process.env.ML_SERVICE_URL}/chat`,
  { message: userMessage }
);
```

**Features:**
- Real-time chat responses
- Intent recognition
- Context-aware conversations
- Sentiment analysis

### AI Matching Integration:

**Backend** → **ML Matching Service**

```typescript
// Backend calls ML Matching Service
const matches = await axios.post(
  `${process.env.ML_MATCHING_SERVICE_URL}/predict`,
  { 
    influencerId,
    companyId,
    features 
  }
);
```

**Features:**
- Compatibility scoring (0-100%)
- Match recommendations
- Learning from user feedback
- Feature importance analysis

---

## 📊 ML Services Endpoints

### ML Chatbot Service:
- `POST /chat` - Send message, get AI response
- `GET /health` - Health check
- `POST /train` - Train intent classifier (admin)

### ML Matching Service:
- `POST /predict` - Get match prediction
- `POST /batch-predict` - Batch predictions
- `GET /health` - Health check
- `POST /train` - Train matching model (admin)
- `GET /model-info` - Get model metadata

---

## 🎯 Testing ML Services

### After Deployment:

1. **Test ML Chatbot:**
```bash
curl -X POST https://influencer-match-ml-chatbot.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how can I find influencers?"}'
```

2. **Test ML Matching:**
```bash
curl -X POST https://influencer-match-ml-matching.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "influencer_followers": 50000,
    "company_budget": 5000,
    "niche_match": 0.8
  }'
```

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Cold starts:** Services sleep after 15 minutes
- **First request:** Takes 30-60 seconds to wake up
- **Memory:** 512MB per service
- **CPU:** Shared

### Performance Tips:
1. **Keep services warm:** Use UptimeRobot to ping every 10 minutes
2. **Optimize models:** Use lightweight models for free tier
3. **Cache predictions:** Cache common match predictions in backend
4. **Batch requests:** Send multiple predictions at once

### Model Training:
- Models are **pre-trained** and included in the code
- Training endpoints are available but require data
- For production, consider upgrading to paid tier for training

---

## 🔄 How Backend Connects to ML Services

Your backend already has the integration code:

### Chatbot Integration:
```typescript
// backend/src/modules/chatbot/chatbot-ai.service.ts
async getChatResponse(message: string) {
  const response = await axios.post(
    `${process.env.ML_SERVICE_URL}/chat`,
    { message }
  );
  return response.data;
}
```

### Matching Integration:
```typescript
// backend/src/modules/ai-matching/ml-service-client.ts
async predictMatch(features: MatchFeatures) {
  const response = await axios.post(
    `${process.env.ML_MATCHING_SERVICE_URL}/predict`,
    features
  );
  return response.data;
}
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] ML Chatbot service is running
- [ ] ML Matching service is running
- [ ] Backend can connect to both services
- [ ] Chatbot widget works in frontend
- [ ] Match predictions are generated
- [ ] Health checks return 200 OK

---

## 🆘 Troubleshooting

### ML Service won't start:
- Check logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure Python version is 3.11+

### Backend can't connect:
- Verify `ML_SERVICE_URL` environment variable
- Check service URLs are correct
- Ensure services are running (not sleeping)

### Slow responses:
- Services are sleeping (cold start)
- Use UptimeRobot to keep them awake
- Consider upgrading to paid tier

---

## 💰 Cost Breakdown

### Free Tier (All Services):
- Frontend: **$0/month**
- Backend: **$0/month** (with $5 credit)
- ML Chatbot: **$0/month** (with $5 credit)
- ML Matching: **$0/month** (with $5 credit)
- PostgreSQL: **$0/month**

**Total: Effectively FREE for development!**

### Paid Tier (Recommended for Production):
- Starter Plan: **$7/month per service**
- No cold starts
- More memory and CPU
- Better performance

---

## 🎉 Summary

Your AI/ML services are **fully configured** and will deploy automatically with the Blueprint!

**What you get:**
✅ AI-powered chatbot for user assistance
✅ ML-based influencer-company matching
✅ Automatic compatibility scoring
✅ Learning from user interactions
✅ All integrated with your backend

**Next steps:**
1. Deploy using Blueprint (includes ML services)
2. Test chatbot widget in frontend
3. Test match predictions
4. Monitor performance
5. Consider upgrading for production

Your platform now has **real AI capabilities**! 🚀
