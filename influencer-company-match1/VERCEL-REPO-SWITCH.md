# How to Change Vercel to Use the Correct Repository

Your Vercel is currently deploying from the wrong repository (`influmatch-app`) instead of the one I pushed fixes to (`influencer-company-match1`).

## Steps to Fix:

1. Go to **Vercel Dashboard** → **Your Backend Project** → **Settings** → **Git**

2. Find the **Repository** setting and change it from:
   - `BenisSula/influmatch-app` 
   
   to:
   - `BenisSula/influencer-company-match1`

3. Make sure **Branch** is set to: `master`

4. **Important**: Also check the **Root Directory** setting:
   - It should be: `influencer-company-match1/backend` (since the backend code is in that subfolder)

5. Click **Save**

Vercel will automatically trigger a new deployment from the correct repository with my fixes applied.
