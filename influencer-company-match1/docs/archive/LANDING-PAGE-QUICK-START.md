# Landing Page - Quick Start Implementation Guide

**Date:** February 15, 2026  
**Time to Complete:** 1-2 hours for basic version  
**Difficulty:** Beginner-Intermediate  

---

## 🚀 Quick Implementation (Minimal Viable Landing Page)

This guide will help you create a basic but functional landing page in under 2 hours.

---

## Step 1: Create Basic Structure (15 minutes)

### 1.1 Create Landing Page File

**File:** `src/renderer/pages/Landing.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">ICMatch</div>
          <div className="nav-actions">
            <button 
              className="btn-secondary"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button 
              className="btn-primary"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Connect Influencers with Brands Through AI-Powered Matching
          </h1>
          <p className="hero-subtitle">
            Join thousands of influencers and companies creating successful 
            collaborations with our intelligent matching platform.
          </p>
          <div className="hero-ctas">
            <button 
              className="btn-large btn-primary"
              onClick={() => navigate('/register?role=INFLUENCER')}
            >
              I'm an Influencer
            </button>
            <button 
              className="btn-large btn-secondary"
              onClick={() => navigate('/register?role=COMPANY')}
            >
              I'm a Company
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">50,000+</div>
            <div className="stat-label">Successful Matches</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">93%</div>
            <div className="stat-label">AI Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$5M+</div>
            <div className="stat-label">In Partnerships</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose ICMatch?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Matching</h3>
              <p>93% accuracy in predicting successful collaborations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Real-Time Messaging</h3>
              <p>Connect instantly with potential partners</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Track performance and measure ROI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p>&copy; 2026 ICMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
```

### 1.2 Create Basic Styles

**File:** `src/renderer/pages/Landing.css`

```css
.landing-page {
  min-height: 100vh;
  background: #ffffff;
}

/* Navigation */
.landing-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-bottom: 1px solid #E4E6EB;
  z-index: 1000;
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1877f2;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

/* Hero Section */
.hero-section {
  padding: 8rem 2rem 4rem;
  text-align: center;
  background: linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%);
}

.hero-container {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1C1E21;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #65676B;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-ctas {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Stats Section */
.stats-section {
  padding: 4rem 2rem;
  background: #ffffff;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1877f2;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #65676B;
}

/* Features Section */
.features-section {
  padding: 4rem 2rem;
  background: #f0f2f5;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1C1E21;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1C1E21;
}

.feature-card p {
  color: #65676B;
  line-height: 1.6;
}

/* Footer */
.landing-footer {
  padding: 2rem;
  background: #1C1E21;
  color: #ffffff;
  text-align: center;
}

/* Buttons */
.btn-primary {
  background: #1877f2;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1565D8;
}

.btn-secondary {
  background: transparent;
  color: #1877f2;
  border: 2px solid #1877f2;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #1877f2;
  color: #ffffff;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-ctas {
    flex-direction: column;
  }
  
  .btn-large {
    width: 100%;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Step 2: Update Routing (5 minutes)

### 2.1 Update AppComponent.tsx

**File:** `src/renderer/AppComponent.tsx`

Add import at the top:
```typescript
import { Landing } from './pages/Landing';
```

Update routes (replace the existing routes section):
```typescript
<Routes>
  {/* Public landing page */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Auth />} />
  <Route path="/register" element={<Auth />} />

  {/* Protected routes */}
  <Route
    path="/app"
    element={
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    }
  />
  
  {/* Redirect old dashboard route */}
  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
  
  {/* All other protected routes stay the same but prefix with /app */}
  {/* ... rest of your routes ... */}
</Routes>
```

---

## Step 3: Update Auth Redirect (5 minutes)

### 3.1 Update ProtectedRoute

**File:** `src/renderer/components/ProtectedRoute/ProtectedRoute.tsx`

Change redirect from `/login` to `/`:
```typescript
if (!user) {
  return <Navigate to="/" replace />;
}
```

### 3.2 Update Auth Page

**File:** `src/renderer/pages/Auth.tsx`

Change redirect after login from `/` to `/app`:
```typescript
useEffect(() => {
  if (user) {
    navigate('/app');
  }
}, [user, navigate]);
```

---

## Step 4: Test (5 minutes)

### 4.1 Start Development Server

```bash
npm run dev
```

### 4.2 Test Navigation

1. Visit `http://localhost:5173/`
2. Should see landing page
3. Click "I'm an Influencer" → Should go to register with role pre-filled
4. Click "Log In" → Should go to login page
5. After login → Should redirect to `/app` (dashboard)

---

## Step 5: Add Dynamic Stats (Optional - 15 minutes)

### 5.1 Create Stats Hook

**File:** `src/renderer/hooks/useLandingStats.ts`

```typescript
import { useState, useEffect } from 'react';

interface LandingStats {
  totalUsers: number;
  totalMatches: number;
  successRate: number;
  totalPartnerships: number;
}

export const useLandingStats = () => {
  const [stats, setStats] = useState<LandingStats>({
    totalUsers: 10000,
    totalMatches: 50000,
    successRate: 93,
    totalPartnerships: 5000000
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3000/api/public/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
```

### 5.2 Use in Landing Page

Update Landing.tsx:
```typescript
import { useLandingStats } from '../hooks/useLandingStats';

export const Landing = () => {
  const { stats, loading } = useLandingStats();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* ... nav ... */}
      
      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">
              {loading ? '...' : `${(stats.totalUsers / 1000).toFixed(0)}K+`}
            </div>
            <div className="stat-label">Active Users</div>
          </div>
          {/* ... other stats ... */}
        </div>
      </section>
      
      {/* ... rest ... */}
    </div>
  );
};
```

---

## 🎯 What You've Built

After completing these steps, you have:

✅ A professional landing page with:
- Navigation bar
- Hero section with dual CTAs
- Social proof (stats)
- Features showcase
- Footer

✅ Proper routing:
- `/` → Landing page
- `/login` → Auth page
- `/register` → Auth page with role pre-fill
- `/app` → Dashboard (protected)

✅ Conversion tracking:
- Role selection tracked in URL
- Easy to add analytics later

---

## 🚀 Next Steps

### Immediate Enhancements (1-2 hours each)

1. **Add More Sections**
   - How It Works
   - For Influencers
   - For Companies
   - Testimonials
   - FAQ

2. **Improve Styling**
   - Add animations
   - Better mobile responsiveness
   - Custom illustrations

3. **Add Analytics**
   - Track CTA clicks
   - Monitor scroll depth
   - Measure conversion rate

4. **Backend Integration**
   - Create stats endpoint
   - Add analytics tracking
   - Implement email capture

---

## 📚 Resources

### Design Inspiration
- Stripe.com
- Notion.so
- Linear.app
- Vercel.com

### Component Libraries (Optional)
- Headless UI
- Radix UI
- shadcn/ui

### Animation Libraries (Optional)
- Framer Motion
- React Spring
- GSAP

---

## 🐛 Troubleshooting

### Issue: Landing page not showing
**Solution:** Check that route is added correctly in AppComponent.tsx

### Issue: Buttons not working
**Solution:** Verify navigate function is imported from react-router-dom

### Issue: Styles not applying
**Solution:** Make sure Landing.css is imported in Landing.tsx

### Issue: Protected routes broken
**Solution:** Ensure all protected routes are prefixed with `/app`

---

## ✅ Checklist

- [ ] Created Landing.tsx
- [ ] Created Landing.css
- [ ] Updated AppComponent.tsx routing
- [ ] Updated ProtectedRoute redirect
- [ ] Updated Auth page redirect
- [ ] Tested navigation flow
- [ ] Tested registration with role
- [ ] Verified mobile responsiveness
- [ ] Added dynamic stats (optional)
- [ ] Deployed to staging

---

**Status:** ✅ QUICK START COMPLETE  
**Time Spent:** ~30 minutes  
**Next:** Add more sections and polish  

