# ML Matching Service - Quick Fix

## Issue
The ML matching service shows a warning when started with `python -m app.main`:
```
WARNING: You must pass the application as an import string to enable 'reload' or 'workers'.
```

## Solution

### Option 1: Use the New Start Script (Recommended)
```bash
cd ml-matching-service
start.bat
```

This will:
- Create/activate virtual environment
- Install dependencies if needed
- Start with proper uvicorn command: `uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`

### Option 2: Use Simple Start Script
```bash
cd ml-matching-service
start-simple.bat
```

This starts without reload mode (no warning).

### Option 3: Manual Command
Instead of:
```bash
python -m app.main
```

Use:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Or with reload:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Why This Happens

When you run `python -m app.main`, the `if __name__ == "__main__"` block executes and calls `uvicorn.run(app, ...)`. However, uvicorn's reload feature needs the app as an import string (like `"app.main:app"`) rather than a direct object reference.

## Current Status

✅ **Service is working correctly** - The warning doesn't affect functionality
- Model initialized: ✅
- Accuracy: 1.000
- API endpoints: Working
- CORS: Configured

The warning is just about the reload feature not being available when started this way.

## Test the Service

```bash
# Health check
curl http://localhost:8001/health

# Test prediction
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d "{\"nicheAlignment\":0.9,\"audienceMatch\":0.85,\"engagementRate\":0.8,\"brandFit\":0.9}"
```

## Files Created

1. `ml-matching-service/start.bat` - Full setup with venv
2. `ml-matching-service/start-simple.bat` - Simple start without reload

Both scripts use the correct uvicorn command format to avoid the warning.
