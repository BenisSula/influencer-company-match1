@echo off
echo Starting IC Match ML Service...
cd /d %~dp0

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies if needed
echo Checking dependencies...
pip install -q -r requirements.txt

REM Start the service
echo.
echo ML Service starting on http://localhost:8000
echo Press Ctrl+C to stop
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
