# 🚀 Setup ML Matching Service - Quick Guide

## What You Need to Do

The ML Matching Service has been created but needs initial setup.

---

## Step 1: Setup ML Matching Service

Open Command Prompt and run:

```bash
cd influencer-company-match1\ml-matching-service
setup.bat
```

This will:
1. Create Python virtual environment
2. Install all dependencies (scikit-learn, FastAPI, etc.)

**Time**: ~2-3 minutes

---

## Step 2: Start All Services

After setup is complete, start everything:

```bash
cd influencer-company-match1
npm run start
```

OR

```bash
cd influencer-company-match1
start-all.bat
```

---

## What Will Start

You'll see 4 services starting:

```
[ML-CHAT]   ML Chatbot Service starting on http://localhost:8000
[ML-MATCH]  ML Matching Service starting on http://localhost:8001
[BACKEND]   Backend starting on http://localhost:3000
[FRONTEND]  Frontend starting on http://localhost:5173
```

---

## Verify It's Working

### Check 1: ML Matching Service Health
Open browser: http://localhost:8001/health

Should see:
```json
{
  "status": "healthy",
  "service": "ml-matching-service",
  "model_loaded": false
}
```

### Check 2: Backend Logs
Look for in backend console:
```
✅ ML Service is now AVAILABLE and CONNECTED (chatbot - port 8000)
✅ Python ML Service is available (matching - port 8001)
```

### Check 3: Frontend Matches
1. Open http://localhost:5173
2. Login
3. Go to Matches page
4. Backend should now use ML predictions!

---

## Troubleshooting

### If setup.bat fails:

**Check Python is installed**:
```bash
python --version
```

Should show Python 3.8 or higher.

**If Python not found**:
Download from: https://www.python.org/downloads/

### If ML Matching Service won't start:

**Manual setup**:
```bash
cd influencer-company-match1\ml-matching-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Then start**:
```bash
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

## Quick Commands

```bash
# Setup (first time only)
cd influencer-company-match1\ml-matching-service
setup.bat

# Start all services
cd influencer-company-match1
npm run start

# Check ML Matching Service
curl http://localhost:8001/health

# Check ML Chatbot Service
curl http://localhost:8000/health
```

---

## What's Different Now

### Before:
- Only 3 services (ML Chatbot, Backend, Frontend)
- AI matching used TypeScript fallback
- No real machine learning for matches

### After:
- 4 services (ML Chatbot, ML Matching, Backend, Frontend)
- AI matching uses scikit-learn Random Forest
- Real machine learning predictions!

---

## Ports

| Service | Port | Status |
|---------|------|--------|
| ML Chatbot | 8000 | ✅ Existing |
| ML Matching | 8001 | ✅ NEW! |
| Backend | 3000 | ✅ Existing |
| Frontend | 5173 | ✅ Existing |

---

## Next Steps

1. Run `setup.bat` in ml-matching-service folder
2. Run `npm run start` from root
3. Test matches in frontend
4. Enjoy ML-powered match predictions!

---

**Status**: Ready for setup  
**Time Required**: 5 minutes  
**Difficulty**: Easy
