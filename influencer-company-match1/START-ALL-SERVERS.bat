@echo off
echo ========================================
echo Starting All Services
echo ========================================
echo.

echo [1/4] Starting Backend Server...
echo Path: influencer-company-match1/backend
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run start:dev"
timeout /t 5 /nobreak >nul

echo.
echo [2/4] Starting Frontend...
echo Path: influencer-company-match1
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting ML Service (AI Chatbot)...
echo Path: influencer-company-match1/ml-service
start "ML Service" cmd /k "cd /d %~dp0ml-service && python app/main.py"
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting ML Matching Service...
echo Path: influencer-company-match1/ml-matching-service
start "ML Matching Service" cmd /k "cd /d %~dp0ml-matching-service && python app/main.py"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Backend:          http://localhost:3000
echo Frontend:         http://localhost:5173
echo ML Service:       http://localhost:5000
echo ML Matching:      http://localhost:5001
echo.
echo Press any key to exit...
pause >nul
