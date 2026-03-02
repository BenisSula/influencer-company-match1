# 🚀 Start All Services - Complete Guide

## Quick Start (3 Commands)

Open **3 separate terminals** and run:

### Terminal 1: Backend
```bash
cd influencer-company-match1/backend
npm run start:dev
```

### Terminal 2: Frontend
```bash
cd influencer-company-match1
npm run dev
```

### Terminal 3: ML Service (Optional)
```bash
cd influencer-company-match1/ml-service
python -m uvicorn app.main:app --reload --port 8000
```

---

## Detailed Instructions

### 1️⃣ Backend (NestJS) - Port 3000

**Terminal 1:**
```bash
cd influencer-company-match1/backend
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] Mapped {/api/auth/login, POST} route
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application is running on: http://localhost:3000
```

**Health Check:**
```bash
curl http://localhost:3000/api/auth/login
# Should return: {"message":"Invalid credentials"...}
```

---

### 2️⃣ Frontend (Vite + React) - Port 5173

**Terminal 2:**
```bash
cd influencer-company-match1
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Access:**
Open browser: `http://localhost:5173`

---

### 3️⃣ ML Service (Python FastAPI) - Port 8000

**Terminal 3:**

**First, check if Python is installed:**
```bash
python --version
# or
python3 --version
```

**Install dependencies (first time only):**
```bash
cd influencer-company-match1/ml-service
pip install -r requirements.txt
# or
pip3 install -r requirements.txt
```

**Start the service:**
```bash
python -m uvicorn app.main:app --reload --port 8000
# or
python3 -m uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Health Check:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","service":"ml-service"}
```

---

## 🔍 Verify All Services Running

### Check Backend (Port 3000)
```bash
curl http://localhost:3000/api/auth/login
```

### Check Frontend (Port 5173)
Open browser: `http://localhost:5173`

### Check ML Service (Port 8000)
```bash
curl http://localhost:8000/health
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Find and kill the process
```

**Problem: Database connection error**
```bash
# Check if PostgreSQL is running
# Start PostgreSQL service if needed
```

### Frontend Issues

**Problem: Port 5173 already in use**
```bash
# Kill the process or use different port
npm run dev -- --port 5174
```

**Problem: Module not found**
```bash
cd influencer-company-match1
npm install
```

### ML Service Issues

**Problem: Python not found**
```bash
# Install Python from python.org
# Or use: python3 instead of python
```

**Problem: uvicorn not found**
```bash
pip install uvicorn fastapi
# or
pip3 install uvicorn fastapi
```

**Problem: Port 8000 already in use**
```bash
# Use different port
python -m uvicorn app.main:app --reload --port 8001
```

---

## 📊 Service Status Dashboard

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Backend | 3000 | 🟢 | http://localhost:3000/api |
| Frontend | 5173 | 🟢 | http://localhost:5173 |
| ML Service | 8000 | 🟡 | http://localhost:8000 |

🟢 = Required  
🟡 = Optional (for AI features)

---

## 🎯 What Each Service Does

### Backend (Port 3000)
- REST API endpoints
- Database operations
- Authentication
- WebSocket for real-time features
- File uploads

### Frontend (Port 5173)
- React UI
- User interface
- API calls to backend
- Real-time updates

### ML Service (Port 8000)
- AI matching predictions
- ML model training
- Advanced recommendations
- Feature engineering

---

## 🔄 Restart Services

### Restart Backend
```bash
# In backend terminal, press Ctrl+C
# Then run again:
npm run start:dev
```

### Restart Frontend
```bash
# In frontend terminal, press Ctrl+C
# Then run again:
npm run dev
```

### Restart ML Service
```bash
# In ML terminal, press Ctrl+C
# Then run again:
python -m uvicorn app.main:app --reload --port 8000
```

---

## 🛑 Stop All Services

Press `Ctrl+C` in each terminal window.

---

## 📝 Quick Test After Startup

1. **Open browser**: `http://localhost:5173`
2. **Login**: Use test credentials
   - Email: `sarah.fashion@example.com`
   - Password: `password123`
3. **Check feed**: Navigate to Feed page
4. **Create post**: Test post creation

---

## ✅ Success Indicators

### Backend Started Successfully:
- ✅ No error messages
- ✅ "Nest application successfully started"
- ✅ Port 3000 listening

### Frontend Started Successfully:
- ✅ "ready in xxx ms"
- ✅ Local URL shown
- ✅ Browser opens automatically

### ML Service Started Successfully:
- ✅ "Application startup complete"
- ✅ Port 8000 listening
- ✅ No import errors

---

## 🎉 You're Ready!

All services running? Great! Now you can:
- ✅ Login to the platform
- ✅ Create and view posts
- ✅ Match with users
- ✅ Send messages
- ✅ Use AI features (if ML service running)

---

## 📞 Need Help?

If services won't start:
1. Check the error messages
2. Verify ports are available
3. Ensure dependencies installed
4. Check database is running (for backend)
5. Share error messages for help
