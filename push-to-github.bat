@echo off
REM Quick script to push to GitHub (Windows)
REM Usage: push-to-github.bat

echo 🚀 Pushing Influencer Matching Platform to GitHub...
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing git repository...
    git init
)

REM Add all files
echo 📝 Adding files to git...
git add .

REM Create commit
echo 💾 Creating commit...
git commit -m "Initial commit: Influencer-Company Matching Platform - Complete authentication system with login/register - Matching algorithm with weighted scoring - Profile management for influencers and companies - Advanced filtering system - Real-time features foundation - Phase 1 and 2 complete, Phase 3 entities ready"

REM Check if remote exists
git remote | findstr "origin" >nul
if errorlevel 1 (
    echo.
    echo ⚠️  No remote repository configured!
    echo.
    echo Please create a repository on GitHub first:
    echo 1. Go to https://github.com/Benissula
    echo 2. Click '+' -^> 'New repository'
    echo 3. Name it: influencer-matching-platform
    echo 4. Choose Private or Public
    echo 5. DO NOT initialize with README
    echo 6. Click 'Create repository'
    echo.
    set /p REPO_URL="Enter the repository URL: "
    
    echo.
    echo 🔗 Adding remote repository...
    git remote add origin %REPO_URL%
)

REM Rename branch to main if needed
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo 🔄 Renaming branch to main...
    git branch -M main
)

REM Push to GitHub
echo ⬆️  Pushing to GitHub...
git push -u origin main

echo.
echo ✅ Done! Your code is now on GitHub!
echo 🌐 Visit: https://github.com/Benissula/influencer-matching-platform
pause
