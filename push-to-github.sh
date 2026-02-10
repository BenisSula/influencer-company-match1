#!/bin/bash

# Quick script to push to GitHub
# Usage: bash push-to-github.sh

echo "🚀 Pushing Influencer Matching Platform to GitHub..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Influencer-Company Matching Platform

- Complete authentication system with login/register
- Matching algorithm with weighted scoring
- Profile management for influencers and companies
- Advanced filtering system
- Real-time features foundation
- Phase 1 & 2 complete, Phase 3 entities ready"

# Check if remote exists
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  No remote repository configured!"
    echo ""
    echo "Please create a repository on GitHub first:"
    echo "1. Go to https://github.com/Benissula"
    echo "2. Click '+' → 'New repository'"
    echo "3. Name it: influencer-matching-platform"
    echo "4. Choose Private or Public"
    echo "5. DO NOT initialize with README"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Enter the repository URL (e.g., https://github.com/Benissula/influencer-matching-platform.git): " REPO_URL
    
    echo ""
    echo "🔗 Adding remote repository..."
    git remote add origin "$REPO_URL"
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Renaming branch to main..."
    git branch -M main
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your code is now on GitHub!"
echo "🌐 Visit: https://github.com/Benissula/influencer-matching-platform"
