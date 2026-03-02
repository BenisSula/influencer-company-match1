@echo off
echo Starting ML Matching Service...
cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist "venv\Lib\site-packages\fastapi" (
    echo Installing dependencies...
    pip install fastapi uvicorn scikit-learn numpy pydantic
)

REM Start the service with proper uvicorn command
echo.
echo ML Matching Service starting on http://localhost:8001
echo.
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

pause
