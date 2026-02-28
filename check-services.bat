@echo off
echo ========================================
echo IC Match Services Status Check
echo ========================================
echo.

echo Checking ML Service (Port 8000)...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] ML Service is running
) else (
    echo [X] ML Service is NOT running
)
echo.

echo Checking Backend (Port 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Backend is running
) else (
    echo [X] Backend is NOT running
)
echo.

echo Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Frontend is running
) else (
    echo [X] Frontend is NOT running
)
echo.

echo ========================================
echo.
echo If any service shows [X], start it with:
echo   npm run start
echo or
echo   start-all.bat
echo.
pause
