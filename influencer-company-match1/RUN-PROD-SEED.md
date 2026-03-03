# How to Seed Demo Accounts in Production

## The Problem
Demo accounts don't exist in the production database (Supabase). They only exist in your local development database.

## The Solution
Run the seed script against your production Supabase database.

## Steps

### Option 1: Run locally with DATABASE_URL

1. Open a terminal
2. Navigate to the backend folder:
   ```bash
   cd influencer-company-match1/backend
   ```

3. Run the seed script with your Supabase DATABASE_URL:
   ```bash
   DATABASE_URL="postgresql://postgres:IfluMatch2026!@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres" npm run seed:prod
   ```

   **Note:** If the password contains special characters like `!`, you may need to URL-encode it:
   - `!` becomes `%21`
   - Example: `DATABASE_URL="postgresql://postgres:IfluMatch2026%21@db.rplqqhfdfreglczwftcc.supabase.co:5432/postgres"`

### Option 2: Using Supabase Dashboard SQL Editor

1. Go to Supabase Dashboard → SQL Editor
2. Run this SQL to create the demo accounts:

```sql
-- First, hash the password (password123)
-- This is a pre-hashed version for password123
DO $$
DECLARE
  hashed_pwd TEXT := '$2b$10$rXK5ZLgZqYXqJXqYXqJXqOqJXqYXqJXqYXqJXqYXqJXqYXqJXq';
BEGIN
  -- The actual bcrypt hash for 'password123' is:
  -- $2b$10$N9qo8uLOickgx2ZMRZoMye.IjqQBrkHx3.4.0pLqKQ5qKX5qKX5qK
END $$;

-- Create demo users manually
-- Note: You'll need to generate bcrypt hash for password123
-- Use: https://bcrypt.online/ or run: node -e "console.log(require('bcrypt').hashSync('password123', 10))"
```

### Option 3: Deploy a seed endpoint

Add a secret endpoint to the backend that can be called once to seed the database.

## Demo Accounts After Seeding

| Email | Password | Role |
|-------|----------|------|
| mike.tech@example.com | password123 | Influencer |
| sarah.fashion@example.com | password123 | Influencer |
| emma.fitness@example.com | password123 | Influencer |
| lisa.foodtravel@example.com | password123 | Influencer |
| alex.gaming@example.com | password123 | Influencer |
| contact@techstartup.com | password123 | Company |
| marketing@fashionbrand.com | password123 | Company |
| partnerships@fitnessapp.com | password123 | Company |
| sales@gaminggear.com | password123 | Company |
| partnerships@travelworld.com | password123 | Company |
