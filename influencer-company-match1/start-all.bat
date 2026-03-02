@echo off
echo ========================================
echo Starting IC Match Platform
echo ========================================
echo.
echo This will start:
echo 1. ML Chatbot Service (Python FastAPI) on port 8000
echo 2. ML Matching Service (Python FastAPI) on port 8001
echo 3. Backend (NestJS) on port 3000
echo 4. Frontend (Vite) on port 5173
echo.
echo Press Ctrl+C to stop all services
echo ========================================
echo.

npm run start
