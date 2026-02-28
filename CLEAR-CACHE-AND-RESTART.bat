@echo off
echo ========================================
echo CLEARING ALL CACHES AND RESTARTING
echo ========================================
echo.

echo [1/5] Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared
) else (
    echo No Vite cache found
)

echo [3/5] Clearing dist folder...
if exist "dist" (
    rmdir /s /q "dist"
    echo Dist folder cleared
) else (
    echo No dist folder found
)

echo [4/5] Clearing browser cache instructions...
echo.
echo IMPORTANT: You need to manually clear your browser cache:
echo 1. Open DevTools (F12)
echo 2. Right-click the refresh button
echo 3. Select "Empty Cache and Hard Reload"
echo    OR press Ctrl+Shift+Delete and clear cache
echo.
echo Press any key once you've cleared your browser cache...
pause >nul

echo [5/5] Starting dev server...
echo.
npm run dev

echo.
echo ========================================
echo If you still see errors, close your browser completely and reopen it
echo ========================================
