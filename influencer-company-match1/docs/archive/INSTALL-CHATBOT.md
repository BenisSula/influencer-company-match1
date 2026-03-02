# 🤖 AI Chatbot Installation Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- Backend and Frontend already set up

---

## Installation (5 Minutes)

### Step 1: Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

This installs:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- Other lightweight NLP tools

**Time:** ~2 minutes

---

### Step 2: Start ML Service

```bash
python app/main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Keep this terminal open!**

---

### Step 3: Test ML Service

Open a new terminal:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "models_loaded": true
}
```

Or run the test script:
```bash
node test-ml-service.js
```

---

### Step 4: Restart Backend

The backend is already configured. Just restart it:

```bash
cd backend
npm run start:dev
```

---

### Step 5: Test Chatbot

1. Open http://localhost:5173
2. Login with any user
3. Click the chat icon (💬) in bottom-right
4. Type "hi" and press Enter

You should get: "Hello! 👋 How can I help you today?"

---

## ✅ Verification Checklist

- [ ] ML Service running on port 8000
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Chat widget appears in bottom-right
- [ ] Chatbot responds to messages

---

## 🎯 Quick Test Commands

```bash
# Test greeting
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'

# Test find matches
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "find me some matches"}'

# Test help
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "help"}'
```

---

## 🐛 Common Issues

### Issue: "pip: command not found"

**Solution:** Install Python first
```bash
# Windows
Download from python.org

# Mac
brew install python3

# Linux
sudo apt-get install python3 python3-pip
```

### Issue: "Port 8000 already in use"

**Solution:** Kill the process or use different port
```bash
# Kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8001
```

### Issue: "Module not found"

**Solution:** Install dependencies
```bash
cd ml-service
pip install -r requirements.txt
```

### Issue: "Backend can't connect to ML service"

**Solution:** Check ML service is running
```bash
curl http://localhost:8000/health
```

If not running, start it:
```bash
cd ml-service
python app/main.py
```

---

## 🚀 Production Deployment

### Option 1: Docker

```bash
# Build image
cd ml-service
docker build -t chatbot-ml .

# Run container
docker run -d -p 8000:8000 chatbot-ml
```

### Option 2: PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start ML service
pm2 start ml-service/app/main.py --name chatbot-ml --interpreter python3

# Start backend
cd backend
pm2 start npm --name backend -- run start:prod

# Start frontend
pm2 start npm --name frontend -- run dev
```

### Option 3: Systemd (Linux)

Create `/etc/systemd/system/chatbot-ml.service`:

```ini
[Unit]
Description=Chatbot ML Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/ml-service
ExecStart=/usr/bin/python3 app/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable chatbot-ml
sudo systemctl start chatbot-ml
```

---

## 📊 Performance Tips

### 1. Use Production Server

Instead of:
```bash
python app/main.py
```

Use:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 2. Enable Caching

Add Redis for response caching (optional).

### 3. Load Balancing

Run multiple ML service instances behind nginx.

---

## 🎨 Customization

### Add New Intents

1. Edit `ml-service/data/intents.json`
2. Add your intent:
```json
{
  "tag": "pricing",
  "patterns": ["how much", "pricing", "cost"],
  "responses": ["Check our Pricing page!"]
}
```
3. Restart ML service

### Change Response Style

Edit `ml-service/app/models/response_generator.py`:

```python
def generate(self, intent, message, context, confidence):
    response = self.get_response(intent)
    
    # Add personality
    if context.get('user_name'):
        response = f"Hey {context['user_name']}! {response}"
    
    # Add emojis
    response = f"{response} 😊"
    
    return response
```

---

## 📈 Monitoring

### Check ML Service Logs

```bash
# If running directly
# Logs appear in terminal

# If using PM2
pm2 logs chatbot-ml

# If using Docker
docker logs chatbot-ml
```

### Monitor Performance

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/health

# curl-format.txt:
time_total: %{time_total}s
```

---

## 🎉 Done!

Your self-hosted AI chatbot is now running!

**Next Steps:**
1. Test all intents
2. Customize responses
3. Add more training data
4. Deploy to production

**Documentation:**
- `CHATBOT-FINAL-STATUS.md` - Overview
- `SELF-HOSTED-CHATBOT-IMPLEMENTATION-COMPLETE.md` - Details
- `ml-service/README.md` - ML Service docs

**Support:**
- API Docs: http://localhost:8000/docs
- Test Script: `node test-ml-service.js`

---

**Installation Time:** 5 minutes  
**Cost:** $0/month  
**Status:** ✅ Ready to use!
