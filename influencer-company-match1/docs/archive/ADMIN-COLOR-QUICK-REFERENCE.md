# Admin Dashboard - Instagram Color Quick Reference

## 🎨 Color Palette

### Primary Colors
```css
--color-primary: #E1306C;        /* Instagram Pink */
--color-secondary: #5B51D8;      /* Purple */
--color-accent: #FD8D32;         /* Orange */
```

### Semantic Colors
```css
--color-success: #00D95F;        /* Green */
--color-warning: #FFCC00;        /* Yellow */
--color-error: #ED4956;          /* Red */
--color-info: #0095F6;           /* Blue */
```

### Gradients
```css
--gradient-primary: linear-gradient(135deg, #E1306C 0%, #FD8D32 100%);
--gradient-secondary: linear-gradient(135deg, #5B51D8 0%, #0095F6 100%);
--gradient-accent: linear-gradient(135deg, #FD8D32 0%, #FFCC00 100%);
```

---

## 🔄 Quick Replace Guide

### Replace Purple Gradient
**Find:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
**Replace:** `var(--gradient-primary)` or `linear-gradient(135deg, #E1306C 0%, #FD8D32 100%)`

### Replace Purple Color
**Find:** `#667eea` or `#764ba2`
**Replace:** `var(--color-primary)` or `#E1306C`

### Replace Purple Focus
**Find:** `rgba(102, 126, 234, 0.1)`
**Replace:** `rgba(225, 48, 108, 0.1)`

---

## 📋 Usage Examples

### Primary Button
```css
.button-primary {
  background: var(--gradient-primary);
  color: white;
}
```

### Secondary Button
```css
.button-secondary {
  background: var(--gradient-secondary);
  color: white;
}
```

### Success Badge
```css
.badge-success {
  background: var(--color-success);
  color: white;
}
```

### Input Focus
```css
input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(225, 48, 108, 0.1);
}
```

### Tab Active
```css
.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}
```

---

## ✅ Files to Update

1. ✅ AdminLogin.css
2. ✅ AdminAnalytics.css
3. ✅ AdminDashboard.css
4. ✅ AdminBranding.css
5. ✅ AdminFeatureFlags.css
6. ✅ AdminModeration.css
7. ✅ AdminSystemSettings.css

---

**Total Time:** ~3 hours
**Priority:** High
**Impact:** Visual consistency across admin dashboard
