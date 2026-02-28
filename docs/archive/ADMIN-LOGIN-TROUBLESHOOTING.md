# Admin Login Troubleshooting Guide

## ✅ Admin User Created Successfully!

Your custom admin user has been created in the database.

### 🔐 Your Admin Credentials:
```
Email:    sula.benis@gmail.com
Password: sb3127212
Role:     SUPER_ADMIN
```

---

## 🚀 How to Login

1. **Open Browser:**
   ```
   http://localhost:5173/admin/login
   ```

2. **Enter Credentials:**
   - Email: `sula.benis@gmail.com`
   - Password: `sb3127212`

3. **Click "Sign In"**

---

## 🔍 If Login Still Fails

### Check 1: Verify Servers Are Running

**Backend Server:**
```bash
cd backend
npm run start:dev
```
Should be running on: http://localhost:3000

**Frontend Server:**
```bash
npm run dev
```
Should be running on: http://localhost:5173

### Check 2: Verify Database Connection

Run this to check if admin user exists:
```bash
cd backend
node -e "const {Client}=require('pg');require('dotenv').config();const c=new Client({host:process.env.DB_HOST||'localhost',port:process.env.DB_PORT||5432,user:process.env.DB_USERNAME||'postgres',password:process.env.DB_PASSWORD||'postgres',database:process.env.DB_DATABASE||'influencer_matching'});c.connect().then(()=>c.query('SELECT email, role FROM admin_users')).then(r=>{console.log('Admin Users:',r.rows);c.end()}).catch(e=>{console.error('Error:',e.message);c.end()})"
```

### Check 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for any error messages

Common errors:
- **Network Error:** Backend not running
- **401 Unauthorized:** Wrong credentials
- **404 Not Found:** Route not configured

### Check 4: Verify Admin Module is Loaded

Check backend console for:
```
[Nest] INFO [RoutesResolver] AdminAuthController {/api/admin/auth}:
[Nest] INFO [RouterExplorer] Mapped {/api/admin/auth/login, POST} route
```

If not present, the admin module might not be imported in app.module.ts

### Check 5: Test API Directly

Test the login endpoint directly:
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"sula.benis@gmail.com\",\"password\":\"sb3127212\"}"
```

Expected response:
```json
{
  "accessToken": "eyJhbGc...",
  "adminUser": {
    "id": "...",
    "email": "sula.benis@gmail.com",
    "fullName": "Sula Benis",
    "role": "SUPER_ADMIN"
  }
}
```

---

## 🔧 Common Fixes

### Fix 1: Recreate Admin User

If password doesn't work, recreate the user:
```bash
cd backend
node create-custom-admin.js
```

### Fix 2: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check CORS Settings

Verify backend allows frontend origin:
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Fix 4: Restart Both Servers

```bash
# Stop all processes
# Then restart:

# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
npm run dev
```

---

## 📊 Verification Checklist

- [ ] PostgreSQL is running
- [ ] Database exists and has admin_users table
- [ ] Admin user created (run create-custom-admin.js)
- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] No CORS errors in browser console
- [ ] Admin routes registered in backend
- [ ] Admin routes added to frontend (AppComponent.tsx)

---

## 🎯 Quick Test Script

Save this as `test-admin-login.js` in backend folder:

```javascript
const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...\n');
    
    const response = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: 'sula.benis@gmail.com',
      password: 'sb3127212'
    });

    console.log('✅ Login successful!');
    console.log('Token:', response.data.accessToken.substring(0, 20) + '...');
    console.log('User:', response.data.adminUser);
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin();
```

Run with:
```bash
cd backend
node test-admin-login.js
```

---

## 🆘 Still Having Issues?

### Check Backend Logs

Look for errors in the backend console when you try to login.

### Check Frontend Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the POST request to `/api/admin/auth/login`
5. Check the request payload and response

### Verify Environment Variables

Check `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=influencer_matching
JWT_SECRET=your-secret-key-here
```

---

## ✅ Success Indicators

When login works, you should see:
1. No errors in browser console
2. Redirect to `/admin/dashboard`
3. Admin dashboard loads with your name
4. Statistics displayed
5. Navigation menu visible

---

## 📝 After Successful Login

Once logged in, you can:
- View user statistics
- Manage users
- Customize branding (colors, logo, content)
- Toggle feature flags
- Configure platform settings

---

**Your admin user is ready! Try logging in now at http://localhost:5173/admin/login** 🚀
