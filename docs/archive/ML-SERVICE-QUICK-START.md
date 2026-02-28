# 🚀 ML Service - Quick Start

## ⚡ 3-Step Setup

### 1. Install
```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Start
```bash
python app/main.py
```

### 3. Test
```bash
curl http://localhost:8000/health
```

---

## 🎯 What Was Fixed

- ✅ Created `requirements.txt` (was missing)
- ✅ Created `app/models/__init__.py` (was missing)
- ✅ Fixed `app/__init__.py` (was broken)
- ✅ Created startup scripts (`start.bat`, `start.sh`)
- ✅ Created test script (`test-ml-service.js`)

---

## 📝 Quick Commands

```bash
# Start ML service
cd ml-service
python app/main.py

# Test health
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hi"}'

# Run test script
node ml-service/test-ml-service.js
```

---

## 🔧 Troubleshooting

**Port in use?**
```bash
# Use different port
python -m uvicorn app.main:app --port 8001
```

**Module not found?**
```bash
pip install -r requirements.txt
```

**Backend can't connect?**
```bash
# Check ML service is running
curl http://localhost:8000/health

# Check backend .env
ML_SERVICE_URL=http://localhost:8000
```

---

## 📊 How It Works

```
User → Frontend → Backend → ML Service
                              ↓
                    Intent Classifier
                              ↓
                    Entity Extractor
                              ↓
                    Sentiment Analyzer
                              ↓
                    Response Generator
                              ↓
Backend ← Response ← ML Service
  ↓
Frontend ← Display
```

---

## ✅ Verification

- [ ] ML service starts: `python app/main.py`
- [ ] Health check works: `curl http://localhost:8000/health`
- [ ] Chat works: `curl -X POST http://localhost:8000/chat ...`
- [ ] Backend connects (check logs)
- [ ] Frontend chatbot works (test in browser)

---

## 📚 Full Documentation

- **Complete Guide:** `ML-SERVICE-FIX-AND-COMPLETE-GUIDE.md`
- **Ready Status:** `ML-SERVICE-COMPLETE-READY.md`
- **Original README:** `ml-service/README.md`

---

**Ready to go!** Start with: `python app/main.py` 🎉
