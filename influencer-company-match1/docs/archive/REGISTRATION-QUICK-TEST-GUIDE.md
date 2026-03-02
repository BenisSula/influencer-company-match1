# Multi-Step Registration - Quick Test Guide

## 🚀 Quick Start

### 1. Start the Servers

```bash
# Terminal 1: Start Backend
cd backend
npm run start:dev

# Terminal 2: Start Frontend
npm run dev
```

### 2. Navigate to Registration
Open browser: `http://localhost:5173/register`

---

## ✅ Test Scenarios

### Scenario 1: Influencer Registration (Complete)

**Step 1**:
1. Select "Influencer" role
2. Full Name: `John Doe`
3. Email: `john@example.com`
4. Password: `SecurePass123!`
5. Confirm Password: `SecurePass123!`
6. Check "Agree to Terms"
7. Click "Continue"

**Step 2**:
1. Niche: `Fashion & Style`
2. Primary Platform: `Instagram`
3. Audience Size: `50K-100K`
4. Location: `New York, USA`
5. Click "Get Started"

**Expected Result**:
- ✅ Success toast: "Welcome, John Doe! 🎉"
- ✅ Redirected to dashboard
- ✅ Profile shows all data
- ✅ Profile completion ~60%

---

### Scenario 2: Company Registration (Complete)

**Step 1**:
1. Select "Company" role
2. Full Name: `Acme Corp`
3. Email: `acme@example.com`
4. Password: `SecurePass123!`
5. Confirm Password: `SecurePass123!`
6. Check "Agree to Terms"
7. Click "Continue"

**Step 2**:
1. Industry: `Technology & SaaS`
2. Company Size: `51-200`
3. Budget: `$10K-$50K`
4. Location: `San Francisco, USA`
5. Click "Get Started"

**Expected Result**:
- ✅ Success toast: "Welcome, Acme Corp! 🎉"
- ✅ Redirected to dashboard
- ✅ Profile shows all data
- ✅ Profile completion ~60%

---

### Scenario 3: Skip Step 2

**Step 1**: Complete as above

**Step 2**: Click "Skip for now"

**Expected Result**:
- ✅ Success toast: "Welcome! Complete your profile to get better matches."
- ✅ Redirected to dashboard
- ✅ Profile completion ~20%
- ✅ Can complete profile later

---

### Scenario 4: Back Button

**Step 1**: Complete and click "Continue"

**Step 2**: Click "Back"

**Expected Result**:
- ✅ Returns to Step 1
- ✅ All data preserved
- ✅ Can edit and continue

---

### Scenario 5: Validation Errors

**Test Password Validation**:
- Try password: `weak` → Error: "Password must be at least 8 characters"
- Try password: `weakpass` → Error: "Password must contain uppercase"
- Try password: `WeakPass` → Error: "Password must contain number"
- Try password: `WeakPass1` → Error: "Password must contain special character"
- Try password: `WeakPass1!` → ✅ Valid

**Test Password Match**:
- Password: `SecurePass123!`
- Confirm: `DifferentPass123!`
- Error: "Passwords do not match"

**Test Required Fields**:
- Leave any field empty → Error: "Please fill in all fields"

**Test Terms Agreement**:
- Don't check terms → Error: "Please agree to Terms of Service"

---

## 🧪 Automated Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Integration Tests
```bash
node test-multi-step-registration.js
```

### Browser Console Test
```javascript
// Open browser console on any page
await window.testMultiStepRegistration();
```

---

## 📊 What to Verify

### After Registration
1. **User Profile**:
   - Navigate to Profile page
   - Verify all fields are displayed
   - Check profile completion percentage

2. **Database**:
   - Check `users` table for new user
   - Check `influencer_profiles` or `company_profiles` table
   - Verify Step 2 data is saved

3. **Matching**:
   - Navigate to Matches page
   - Verify matches appear (if Step 2 completed)
   - Check match quality

### Range Mapping Verification

**Audience Size**:
- `<10K` → 5,000
- `10K-50K` → 30,000
- `50K-100K` → 75,000
- `100K-500K` → 300,000
- `500K+` → 750,000

**Budget**:
- `<$1K` → $500
- `$1K-$5K` → $3,000
- `$5K-$10K` → $7,500
- `$10K-$50K` → $30,000
- `$50K+` → $75,000

**Platform**:
- `Instagram` → `["Instagram"]`
- `YouTube` → `["YouTube"]`

---

## 🐛 Common Issues

### Issue: "Email already exists"
**Solution**: Use a different email or delete the existing user from database

### Issue: Backend not responding
**Solution**: 
1. Check backend is running: `http://localhost:3000/api/health`
2. Check database connection
3. Restart backend server

### Issue: Frontend not loading
**Solution**:
1. Check frontend is running: `http://localhost:5173`
2. Clear browser cache
3. Restart frontend server

### Issue: TypeScript errors in IDE
**Solution**: Restart IDE or TypeScript server

---

## 📈 Success Criteria

### Must Pass
- ✅ All 5 test scenarios work
- ✅ No console errors
- ✅ Data saves correctly to database
- ✅ Profile completion calculates correctly
- ✅ Range mapping works correctly

### Should Pass
- ✅ Smooth animations
- ✅ Fast loading times (<2s)
- ✅ Mobile responsive
- ✅ Keyboard navigation works
- ✅ Error messages are clear

---

## 🎯 Quick Commands

```bash
# Start everything
npm run dev & cd backend && npm run start:dev

# Run tests
npm test

# Check backend health
curl http://localhost:3000/api/health

# View logs
tail -f backend/logs/app.log

# Reset database (if needed)
cd backend && npm run migration:revert
```

---

## 📞 Need Help?

- Check `REGISTRATION-PHASE2-COMPLETE.md` for full documentation
- Check `REGISTRATION-FIELDS-UNIFICATION-INVESTIGATION.md` for design decisions
- Run automated tests for detailed error messages
- Check browser console for frontend errors
- Check backend logs for API errors

---

**Happy Testing! 🎉**
