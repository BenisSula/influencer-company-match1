@echo off
echo ========================================
echo Installing Cache Manager Packages
echo ========================================
echo.

cd backend

echo Installing @nestjs/cache-manager...
call npm install @nestjs/cache-manager

echo.
echo Installing cache-manager...
call npm install cache-manager

echo.
echo Installing TypeScript types...
call npm install --save-dev @types/cache-manager

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart the backend server
echo 2. Test the statistics endpoint
echo 3. Update Landing page component
echo.
pause
