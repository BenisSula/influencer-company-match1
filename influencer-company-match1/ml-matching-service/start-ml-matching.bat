@echo off
echo Starting IC Match ML Matching Service...

if not exist "venv\" (
    echo Virtual environment not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Creating virtual environment...
call venv\Scripts\activate.bat

echo Checking dependencies...
pip install -q -r requirements.txt

echo.
echo ML Matching Service starting on http://localhost:8001
echo Press Ctrl+C to stop
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
