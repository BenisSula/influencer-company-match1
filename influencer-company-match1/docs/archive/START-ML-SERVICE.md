# 🚀 Start ML Service - Manual Instructions

## ✅ Setup Complete!

All files are ready. Dependencies are installed. Now you just need to start the service manually.

---

## 🎯 Quick Start (Choose One Method)

### Method 1: Using Batch File (Easiest - Windows)

1. Open File Explorer
2. Navigate to: `influencer-company-match1/ml-service`
3. Double-click: `start.bat`
4. A command window will open showing the ML service running

### Method 2: Using Command Line

1. Open a new Command Prompt or PowerShell
2. Run these commands:

```bash
cd influencer-company-match1/ml-service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Method 3: Using Python Directly

```bash
cd influencer-company-match1/ml-service
python app/main.py
```

---

## ✅ Verify It's Running

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🧪 Test the Service

### Test 1: Health Check

Open a new terminal and run:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok","service":"ml-service"}
```

### Test 2: Chat Endpoint

```bash
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d "{\"message\":\"hi\"}"
```

Expected: A JSON response with greeting message

### Test 3: Run Test Script

```bash
cd influencer-company-match1
node ml-service/test-ml-service.js
```

This will run all 6 tests automatically!

---

## 🎉 What's Running Now

You should have 3 services running:

1. ✅ **Frontend** (port 5173) - Already running
2. ✅ **Backend** (port 3000) - Already running  
3. 🆕 **ML Service** (port 8000) - Start this now!

---

## 🌐 Test the Complete System

Once ML service is running:

1. Open browser: `http://localhost:5173`
2. Click the chatbot button (bottom-right corner)
3. Type: "how do fees work?"
4. You should get a detailed AI response!

---

## 🐛 Troubleshooting

### "Port 8000 already in use"

```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### "Module not found" error

```bash
# Reinstall dependencies
cd influencer-company-match1/ml-service
pip install -r requirements.txt
```

### Service won't start

1. Check Python is installed: `python --version`
2. Check you're in the right directory: `cd influencer-company-match1/ml-service`
3. Try running: `python -m uvicorn app.main:app --port 8001` (different port)

---

## 📊 Current Status

- ✅ Dependencies installed
- ✅ All files created
- ✅ Startup scripts ready
- ✅ Test script ready
- ⏳ **Next:** Start the ML service manually

---

## 🎯 Quick Command Reference

```bash
# Start ML service
cd influencer-company-match1/ml-service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test health (in new terminal)
curl http://localhost:8000/health

# Run full test suite
node ml-service/test-ml-service.js

# Stop ML service
# Press Ctrl+C in the terminal where it's running
```

---

**Ready!** Just start the ML service using one of the methods above, then test it! 🚀
