@echo off
echo ========================================
echo   Database Error Fix and Backend Start
echo ========================================
echo.

echo Step 1: Applying database fixes...
psql -U postgres -d influencer_match_db -f fix-missing-tables.sql
if %ERRORLEVEL% NEQ 0 (
    echo Warning: SQL script failed. Trying migration instead...
    call npm run migration:run
)

echo.
echo Step 2: Starting backend server...
call npm run start:dev

pause
