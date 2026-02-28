# 🚀 Quick Start - All Services

## Start Everything (One Command)

```bash
npm run start
```

**OR**

Double-click: `start-all.bat`

---

## What Starts

✅ ML Service (AI) - Port 8000  
✅ Backend (API) - Port 3000  
✅ Frontend (UI) - Port 5173  

---

## Check Status

```bash
# Run this to check if all services are running:
check-services.bat
```

---

## Access Application

Open browser: **http://localhost:5173**

---

## Test AI Chatbot

1. Login (any test account)
2. Click chatbot icon (bottom right 💬)
3. Send message: "Hi"
4. Check backend console for:
   ```
   ✅ ML Service response received
   ```

---

## Stop Everything

Press `Ctrl+C` in the terminal

---

## Verify ML Service Connected

Backend console should show:
```
✅ ML Service is now AVAILABLE and CONNECTED
✅ ML Service health check: OK
```

If you see "using fallback responses", restart with `npm run start`

---

## Need Help?

See: **START-ALL-SERVICES-GUIDE.md**
