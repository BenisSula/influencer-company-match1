# 🚀 Start All Services - Complete Guide

## Quick Start (Recommended)

### Option 1: Use the Batch File (Easiest)
```bash
# Just double-click or run:
start-all.bat
```

This will automatically start all three services:
- ✅ ML Service (Python FastAPI) on port 8000
- ✅ Backend (NestJS) on port 3000  
- ✅ Frontend (Vite) on port 5173

### Option 2: Use NPM Script
```bash
npm run start
```

---

## What Gets Started

### 1. ML Service (Port 8000)
- **Purpose**: AI-powered chatbot intelligence
- **Technology**: Python FastAPI with NLP models
- **Status**: http://localhost:8000/health
- **Features**:
  - Intent classification
  - Entity extraction
  - Sentiment analysis
  - Smart response generation

### 2. Backend (Port 3000)
- **Purpose**: API server and business logic
- **Technology**: NestJS (Node.js)
- **Status**: http://localhost:3000
- **Features**:
  - User authentication
  - Matching algorithm
  - Messaging system
  - Database operations
  - **Chatbot integration** (connects to ML service)

### 3. Frontend (Port 5173)
- **Purpose**: User interface
- **Technology**: React + Vite
- **URL**: http://localhost:5173
- **Features**:
  - Dashboard
  - Matches
  - Messaging
  - **AI Chatbot widget** (bottom right corner)

---

## How the AI Chatbot Works

### Architecture Flow:
```
User Message → Frontend Chatbot Widget → Backend Chatbot Service → ML Service → Response
                                              ↓ (if ML unavailable)
                                         Fallback Responses
```

### Connection Status:
The backend automatically checks ML service health every 30 seconds:
- ✅ **Connected**: Chatbot uses AI-powered responses from ML service
- ⚠️ **Fallback**: Chatbot uses comprehensive fallback responses (still functional!)

### Checking Connection:
Look for these logs in the backend console:
```
✅ ML Service is now AVAILABLE and CONNECTED
✅ ML Service health check: OK
✅ ML Service response received - Intent: greeting, Confidence: 0.9
```

If you see:
```
❌ ML Service health check failed
⚠️  Chatbot will use fallback responses until ML service is available
```
Then the ML service isn't running or isn't reachable.

---

## Manual Startup (If Needed)

### Step 1: Start ML Service
```bash
cd ml-service
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Wait for:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Step 2: Start Backend
```bash
cd backend
npm run start:dev
```

Wait for:
```
[Nest] LOG [NestApplication] Nest application successfully started
✅ ML Service is now AVAILABLE and CONNECTED
```

### Step 3: Start Frontend
```bash
npm run dev:renderer
# or
vite
```

Wait for:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## Testing the AI Chatbot

### 1. Open the Application
Navigate to: http://localhost:5173

### 2. Login
Use any test account (see CREDENTIALS-SUMMARY.md)

### 3. Open Chatbot
Click the chatbot icon in the bottom right corner (💬 or robot icon)

### 4. Test Messages
Try these to verify ML service connection:

**Test 1: Greeting**
```
User: Hi
Expected: Personalized greeting with platform info
```

**Test 2: Fees Question**
```
User: How much does it cost?
Expected: Detailed explanation of 5% company / 10% influencer fees
```

**Test 3: Matching**
```
User: How does matching work?
Expected: Explanation of AI matching algorithm
```

### 5. Check Backend Logs
You should see:
```
✅ ML Service response received - Intent: greeting, Confidence: 0.9
✅ ML Service response received - Intent: fees, Confidence: 0.85
```

If you see "using fallback responses", the ML service isn't connected.

---

## Troubleshooting

### ML Service Not Connecting

**Problem**: Backend shows "ML Service health check failed"

**Solutions**:
1. **Check if ML service is running**:
   - Open http://localhost:8000/health in browser
   - Should return: `{"status":"ok","service":"ml-service"}`

2. **Check Python virtual environment**:
   ```bash
   cd ml-service
   .venv\Scripts\python.exe --version
   ```

3. **Reinstall dependencies**:
   ```bash
   cd ml-service
   .venv\Scripts\pip.exe install -r requirements.txt
   ```

4. **Check backend .env file**:
   ```
   ML_SERVICE_URL=http://localhost:8000
   ```

### Backend Can't Find ML Service

**Problem**: Backend logs show connection refused

**Solution**: Make sure ML service started BEFORE backend
```bash
# Stop all services (Ctrl+C)
# Start in order:
1. ML Service first
2. Wait 5 seconds
3. Backend second
4. Frontend last
```

### Chatbot Always Uses Fallback

**Problem**: Chatbot works but responses seem generic

**Check**:
1. Backend logs for "✅ ML Service response received"
2. If you see "using fallback responses", ML service isn't connected
3. Restart backend after ML service is running

---

## Environment Variables

### Backend (.env)
```env
ML_SERVICE_URL=http://localhost:8000
PORT=3000
```

### ML Service
No .env needed - uses default port 8000

---

## Stopping Services

### If using start-all.bat or npm run start:
Press `Ctrl+C` once - it will stop all three services

### If running manually:
Press `Ctrl+C` in each terminal window

---

## Production Deployment

For production, you'll want to:
1. Deploy ML service separately (e.g., AWS Lambda, Google Cloud Run)
2. Update `ML_SERVICE_URL` in backend .env to production URL
3. Ensure ML service is always running before backend starts
4. Set up health monitoring for ML service

---

## Quick Reference

| Service | Port | Health Check | Purpose |
|---------|------|--------------|---------|
| ML Service | 8000 | http://localhost:8000/health | AI chatbot intelligence |
| Backend | 3000 | http://localhost:3000 | API server |
| Frontend | 5173 | http://localhost:5173 | User interface |

---

## Success Indicators

✅ **All services running correctly when you see**:
- ML Service: `INFO: Application startup complete.`
- Backend: `✅ ML Service is now AVAILABLE and CONNECTED`
- Frontend: `VITE ready in XXX ms`
- Chatbot: Backend logs show `✅ ML Service response received`

---

## Need Help?

If you're still having issues:
1. Check all three services are running
2. Check backend logs for ML service connection status
3. Try the manual startup steps above
4. Verify ports 3000, 5173, and 8000 are not in use by other apps
