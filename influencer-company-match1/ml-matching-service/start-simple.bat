@echo off
echo Starting ML Matching Service (Simple Mode)...
cd /d "%~dp0"

REM Start with uvicorn directly (no reload)
uvicorn app.main:app --host 0.0.0.0 --port 8001

pause
