# Complete User Credentials Database

## 🔐 Universal Password
**All accounts use the same password: `password123`**

---

## 🎭 INFLUENCERS (5 Users)

### 1. Mike Chen - Technology Influencer
```
Email:     mike.tech@example.com
Password:  password123
Role:      INFLUENCER
Niche:     Technology
Followers: 200,000
Bio:       Tech reviewer and enthusiast
Status:    ✅ Active
```

### 2. Sarah Johnson - Fashion & Lifestyle
```
Email:     sarah.fashion@example.com
Password:  password123
Role:      INFLUENCER
Niche:     Fashion & Lifestyle
Followers: 150,000
Bio:       Professional fashion influencer
Status:    ✅ Active
```

### 3. Emma Rodriguez - Fitness & Wellness
```
Email:     emma.fitness@example.com
Password:  password123
Role:      INFLUENCER
Niche:     Fitness & Wellness
Followers: 180,000
Bio:       Fitness coach and wellness advocate
Status:    ✅ Active
```

### 4. Lisa Wang - Food & Travel
```
Email:     lisa.foodtravel@example.com
Password:  password123
Role:      INFLUENCER
Niche:     Food & Travel
Followers: 175,000
Bio:       Food blogger and travel enthusiast
Status:    ✅ Active
```

### 5. Alex Martinez - Gaming & Esports
```
Email:     alex.gaming@example.com
Password:  password123
Role:      INFLUENCER
Niche:     Gaming & Esports
Followers: 250,000
Bio:       Professional gaming content creator
Status:    ✅ Active
```

---

## 🏢 COMPANIES (5 Users)

### 1. TechStartup Inc
```
Email:     contact@techstartup.com
Password:  password123
Role:      COMPANY
Industry:  Technology
Bio:       Innovative technology company building smart digital solutions
Status:    ✅ Active
```

### 2. Fashion Brand Co
```
Email:     marketing@fashionbrand.com
Password:  password123
Role:      COMPANY
Industry:  Fashion
Status:    ✅ Active
```

### 3. FitnessApp
```
Email:     partnerships@fitnessapp.com
Password:  password123
Role:      COMPANY
Industry:  Health & Fitness
Status:    ✅ Active
```

### 4. GamingGear Pro
```
Email:     sales@gaminggear.com
Password:  password123
Role:      COMPANY
Industry:  Gaming & Electronics
Status:    ✅ Active
```

### 5. TravelWorld Agency
```
Email:     partnerships@travelworld.com
Password:  password123
Role:      COMPANY
Industry:  Travel & Tourism
Status:    ✅ Active
```

---

## 📊 Quick Reference Table

### Influencers

| Name | Email | Niche | Followers |
|------|-------|-------|-----------|
| Mike Chen | mike.tech@example.com | Technology | 200K |
| Sarah Johnson | sarah.fashion@example.com | Fashion & Lifestyle | 150K |
| Emma Rodriguez | emma.fitness@example.com | Fitness & Wellness | 180K |
| Lisa Wang | lisa.foodtravel@example.com | Food & Travel | 175K |
| Alex Martinez | alex.gaming@example.com | Gaming & Esports | 250K |

### Companies

| Company | Email | Industry |
|---------|-------|----------|
| TechStartup Inc | contact@techstartup.com | Technology |
| Fashion Brand Co | marketing@fashionbrand.com | Fashion |
| FitnessApp | partnerships@fitnessapp.com | Health & Fitness |
| GamingGear Pro | sales@gaminggear.com | Gaming & Electronics |
| TravelWorld Agency | partnerships@travelworld.com | Travel & Tourism |

---

## 🚀 How to Login

### Via Web Interface
1. Open: http://localhost:5173
2. Click "Login"
3. Enter any email from above
4. Password: `password123`
5. Click "Sign In"

### Via API (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mike.tech@example.com",
    "password": "password123"
  }'
```

### Via Node.js
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:3000/api/auth/login', {
  email: 'mike.tech@example.com',
  password: 'password123'
});

console.log('Token:', response.data.token);
console.log('User:', response.data.user);
```

---

## 🎯 Testing Scenarios

### Influencer-Company Matching
1. Login as **Mike Chen** (Technology Influencer)
2. View matches with **TechStartup Inc** (Technology Company)
3. Send collaboration request

### Cross-Niche Collaboration
1. Login as **Sarah Johnson** (Fashion)
2. View matches with **Fashion Brand Co**
3. Test messaging system

### Multi-Platform Testing
1. Login as **Alex Martinez** (Gaming - 250K followers)
2. View matches with **GamingGear Pro**
3. Test high-engagement scenarios

---

## 📝 Important Notes

- ✅ All accounts are **active** and ready to use
- ✅ All accounts use password: **password123**
- ✅ Profiles are **fully populated** with bio, niche, and follower data
- ✅ Matching algorithm will work between compatible niches
- ✅ All features (messaging, connections, feed) are available

---

## 🔧 Troubleshooting

### If Login Fails
1. Check backend is running: http://localhost:3000/api
2. Check frontend is running: http://localhost:5173
3. Verify email is typed correctly (case-sensitive)
4. Password is always: `password123`

### Rate Limiting
If you see "Too many requests":
- Wait 10 minutes, OR
- Restart backend server to clear rate limits

### Account Locked
If account is locked due to failed attempts:
- Wait 30 minutes, OR
- Restart backend server

---

## 📞 Quick Access Commands

### Check All Users
```bash
node get-all-credentials.js
```

### Test Login
```bash
node test-correct-login.js
```

### Verify User Exists
```bash
node check-mike-tech.js
```

---

**Last Updated**: Server restart completed
**Database**: influencer_matching
**Total Users**: 10 (5 Influencers + 5 Companies)
