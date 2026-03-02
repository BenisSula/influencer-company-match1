# 🔍 Chatbot Visual Troubleshooting Guide

## What You're Seeing vs What Should Happen

### ❌ PROBLEM: Stuck on "Connecting..."

```
┌─────────────────────────────────┐
│ IC Match Assistant              │
│ 🟡 Connecting...                │  ← STUCK HERE
├─────────────────────────────────┤
│                                 │
│   Hi! I'm your AI assistant     │
│                                 │
├─────────────────────────────────┤
│ ⚠️ Connecting to chatbot...    │  ← WARNING
│ [Disabled Input Field]          │  ← CAN'T TYPE
└─────────────────────────────────┘
```

### ✅ SOLUTION: Should Look Like This

```
┌─────────────────────────────────┐
│ IC Match Assistant              │
│ 🟢 Online                       │  ← GREEN DOT
├─────────────────────────────────┤
│                                 │
│   Hi! I'm your AI assistant     │
│                                 │
├─────────────────────────────────┤
│ Type your message...       [📤] │  ← CAN TYPE
└─────────────────────────────────┘
```

## Step-by-Step Visual Fix

### Step 1: Check Backend Status

```
Terminal:
┌─────────────────────────────────────┐
│ $ cd backend                        │
│ $ npm run start:dev                 │
│                                     │
│ ✅ [Nest] INFO [NestApplication]   │
│ ✅ Nest application started         │
│ ✅ 🚀 Backend running on :3000     │
└─────────────────────────────────────┘
```

### Step 2: Open Browser Console (F12)

```
Browser Console:
┌─────────────────────────────────────┐
│ Console  Network  Sources           │
├─────────────────────────────────────┤
│ [Chatbot] Connecting to:            │
│   http://localhost:3000/chatbot     │
│ ✅ [Chatbot] Connected successfully │
│ ✅ [Chatbot] Ready: {...}           │
└─────────────────────────────────────┘
```

### Step 3: Test Message Flow

```
1. Type Message:
┌─────────────────────────────────┐
│ Hello                      [📤] │ ← Click send
└─────────────────────────────────┘

2. See Typing Indicator:
┌─────────────────────────────────┐
│ 🤖 ● ● ●                        │ ← Bot typing
└─────────────────────────────────┘

3. Get Response:
┌─────────────────────────────────┐
│ 👤 You:                         │
│    Hello                        │
│                                 │
│ 🤖 Bot:                         │
│    Hello! 👋 How can I help?   │
└─────────────────────────────────┘
```

## Common Error Patterns

### Error 1: No Backend Connection

```
Browser Console:
┌─────────────────────────────────────┐
│ ❌ [Chatbot] Connection error:      │
│    Error: xhr poll error            │
└─────────────────────────────────────┘

FIX: Start backend server
```

### Error 2: Not Logged In

```
Browser Console:
┌─────────────────────────────────────┐
│ ❌ [Chatbot] No auth token          │
│    available                        │
└─────────────────────────────────────┘

FIX: Login to the application first
```

### Error 3: Backend Error

```
Backend Logs:
┌─────────────────────────────────────┐
│ ❌ [ChatbotGateway] Connection      │
│    error: Invalid token             │
└─────────────────────────────────────┘

FIX: Logout and login again
```

## Connection Status Indicators

### 🟢 Online (Working)
- Green dot in header
- Input field is white and enabled
- Send button is blue
- Can type and send messages

### 🟡 Connecting (Temporary)
- Yellow dot in header
- Input field is gray and disabled
- "Connecting..." message
- Should change to Online in 2-3 seconds

### 🔴 Offline (Problem)
- Red dot in header
- Input field disabled
- Error message shown
- Need to troubleshoot

## Quick Diagnostic Checklist

```
□ Backend server running?
  → Check: http://localhost:3000/api

□ Logged into application?
  → Check: User menu shows your name

□ Browser console clean?
  → Check: No red errors in F12 console

□ Backend logs clean?
  → Check: No errors in terminal

□ Waited 3+ seconds?
  → Check: Give it time to connect

□ Tried refreshing page?
  → Check: F5 or Ctrl+R
```

## Test Commands

### Test 1: Backend Health
```bash
curl http://localhost:3000/api
# Should return: {"message":"API is running"}
```

### Test 2: ML Service (Optional)
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
# If fails: Chatbot will use fallback responses
```

### Test 3: Automated Test
```bash
node test-chatbot-connection.js
# Should show: ✅ ALL TESTS PASSED!
```

## Success Indicators

When everything is working, you'll see:

```
Frontend:
✅ Green "Online" status
✅ Input field enabled
✅ Messages send/receive
✅ Bot responds in 2-3 seconds

Backend Logs:
✅ [ChatbotGateway] Client connected
✅ [ChatbotService] Processing message
✅ No error messages

Browser Console:
✅ [Chatbot] Connected successfully
✅ [Chatbot] Ready
✅ [Chatbot] Message received
```

## Still Not Working?

### Last Resort Steps:

1. **Clear Everything**
```bash
# Stop all servers
Ctrl+C (in all terminals)

# Clear browser cache
Ctrl+Shift+Delete → Clear all

# Restart backend
cd backend
npm run start:dev

# Restart frontend
cd ..
npm run dev
```

2. **Check Ports**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :3000
lsof -i :5173
```

3. **Review Logs**
- Backend terminal: Look for errors
- Browser console: Look for red messages
- Network tab: Check WebSocket connection

## Need More Help?

📖 Full documentation: `CHATBOT-CONNECTION-FIX-COMPLETE.md`
🧪 Run tests: `node test-chatbot-connection.js`
💬 Check existing docs: `AI-CHATBOT-*.md` files
