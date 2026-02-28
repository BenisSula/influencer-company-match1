@echo off
echo ========================================
echo Restarting ML Matching Service
echo ========================================
echo.

cd ml-matching-service

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
pip install -q fastapi uvicorn scikit-learn numpy pydantic

echo.
echo ========================================
echo Starting ML Matching Service on port 8001
echo ========================================
echo.
echo The service will auto-train the model on startup.
echo You should see: "Model initialized successfully"
echo.
echo Press Ctrl+C to stop the service
echo ========================================
echo.

python -m app.main

pause
