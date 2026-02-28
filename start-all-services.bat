@echo off
echo ========================================
echo   IC Match - Starting All Services
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Checking ML Chatbot Service...
if not exist "ml-service\venv" (
    echo [SETUP] Creating virtual environment for ML Chatbot...
    cd ml-service
    python -m venv venv
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo [OK] ML Chatbot environment ready
) else (
    echo [OK] ML Chatbot environment exists
)

echo.
echo [2/5] Checking ML Matching Service...
if not exist "ml-matching-service\venv" (
    echo [SETUP] Creating virtual environment for ML Matching...
    cd ml-matching-service
    python -m venv venv
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
    echo [OK] ML Matching environment ready
) else (
    echo [OK] ML Matching environment exists
)

echo.
echo [3/5] Checking Backend Dependencies...
if not exist "backend\node_modules" (
    echo [SETUP] Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo [OK] Backend dependencies installed
) else (
    echo [OK] Backend dependencies exist
)

echo.
echo [4/5] Checking Frontend Dependencies...
if not exist "node_modules" (
    echo [SETUP] Installing frontend dependencies...
    call npm install
    echo [OK] Frontend dependencies installed
) else (
    echo [OK] Frontend dependencies exist
)

echo.
echo [5/5] Starting All Services...
echo.
echo ========================================
echo   Services will start in this order:
echo   1. ML Chatbot Service (Port 8000)
echo   2. ML Matching Service (Port 8001)
echo   3. Backend API (Port 3000)
echo   4. Frontend (Port 5173)
echo ========================================
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start all services using npm script
npm start
