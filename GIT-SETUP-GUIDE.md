# Git Setup and GitHub Push Guide

## Step 1: Initialize Git Repository (if not already done)

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

## Step 2: Configure Git (First Time Only)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Add All Files to Git

```bash
# Add all files to staging
git add .

# Check what will be committed
git status
```

## Step 4: Create Initial Commit

```bash
# Commit all files
git commit -m "Initial commit: Influencer-Company Matching Platform

- Complete authentication system with login/register
- Matching algorithm with weighted scoring
- Profile management for influencers and companies
- Advanced filtering system
- Real-time features foundation
- Phase 1 & 2 complete, Phase 3 entities ready"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com/Benissula
2. Click the "+" icon in the top right
3. Select "New repository"
4. Repository name: `influencer-matching-platform` (or your preferred name)
5. Description: "B2B SaaS platform connecting influencers with companies through intelligent matching"
6. Choose: **Private** (recommended) or Public
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 6: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/Benissula/influencer-matching-platform.git

# Verify remote was added
git remote -v
```

## Step 7: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If you're on 'master' branch instead of 'main':
git branch -M main
git push -u origin main
```

## Step 8: Verify on GitHub

1. Go to https://github.com/Benissula/influencer-matching-platform
2. Refresh the page
3. You should see all your files!

---

## Quick Commands for Future Updates

After making changes on your new computer:

```bash
# Pull latest changes
git pull origin main

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push changes
git push origin main
```

---

## Setting Up on New Computer

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Benissula/influencer-matching-platform.git
   cd influencer-matching-platform
   ```

2. **Install dependencies:**
   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   ```bash
   # Copy example files
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Edit .env files with your database credentials
   ```

4. **Set up database:**
   ```bash
   cd backend
   
   # Start PostgreSQL with Docker
   docker-compose up -d
   
   # Run migrations
   npm run migration:run
   
   # Seed database
   npm run seed
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

---

## Important Files to Keep Private

Make sure these are in `.gitignore` (already configured):
- `.env` files (contain database passwords, API keys)
- `node_modules/` (dependencies, will be reinstalled)
- `dist/` and `build/` (generated files)

---

## Troubleshooting

### "Permission denied (publickey)" Error

If you get this error when pushing:

1. **Use HTTPS instead of SSH:**
   ```bash
   git remote set-url origin https://github.com/Benissula/influencer-matching-platform.git
   ```

2. **Or set up SSH keys:**
   - Follow GitHub's guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Repository not found" Error

- Make sure the repository exists on GitHub
- Check the URL is correct
- Verify you're logged into the correct GitHub account

### "Failed to push some refs" Error

```bash
# Pull first, then push
git pull origin main --rebase
git push origin main
```

---

## Repository Structure

```
influencer-matching-platform/
├── backend/                 # NestJS API
│   ├── src/                # Source code
│   ├── package.json        # Backend dependencies
│   └── docker-compose.yml  # PostgreSQL setup
├── src/                    # Frontend (Electron + React)
│   ├── main/              # Electron main process
│   └── renderer/          # React app
├── .kiro/                 # Kiro specs and steering
├── package.json           # Frontend dependencies
└── README.md              # Project documentation
```

---

## Next Steps After Pushing

1. ✅ Repository is on GitHub
2. ✅ Can clone on any computer
3. ✅ Can collaborate with team
4. ✅ Version history preserved
5. ✅ Backup of your work

**Remember:** Always commit and push your changes before switching computers!
