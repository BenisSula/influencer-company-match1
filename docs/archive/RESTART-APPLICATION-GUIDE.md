# Application Restart Guide

## Quick Fix Steps

### 1. Stop Current Dev Server
If the dev server is running, stop it:
- Press `Ctrl+C` in the terminal

### 2. Clear Vite Cache
```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules\.vite

# Linux/Mac
rm -rf node_modules/.vite
```

### 3. Start Dev Server
```bash
npm run dev
```

### 4. Open Application
Navigate to: http://localhost:5173

## What Was Fixed

### React Hook Errors ✅
- Fixed React imports in main.tsx
- Fixed React imports in AuthContext.tsx
- Added Vite configuration for React resolution

### WebSocket Warnings ✅
- Configured Vite HMR properly
- Added server configuration

### Icon Display Issues ✅
- Added explicit sizing to all icons
- Fixed CSS display properties
- Added global SVG rules

### Manifest Warnings ✅
- Fixed meta tags in index.html
- Added fallback favicon

## Expected Behavior

### Browser Console Should Show:
```
✅ No "Invalid hook call" errors
✅ No "Cannot read properties of null" errors
✅ No WebSocket connection warnings
✅ Application loads successfully
```

### Visual Checks:
- ✅ Icons display in right sidebar
- ✅ Icons display in match cards
- ✅ Icons display in dashboard widgets
- ✅ All icons are properly sized and aligned

## Troubleshooting

### If Errors Persist

#### 1. Clear Browser Cache
```
Chrome/Edge: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Option+E
```

#### 2. Hard Reload
```
Chrome/Edge: Ctrl+Shift+R
Firefox: Ctrl+Shift+R
Safari: Cmd+Shift+R
```

#### 3. Reinstall Dependencies
```bash
rm -rf node_modules
npm install
npm run dev
```

#### 4. Check Node Version
```bash
node --version
# Should be v18 or higher
```

### Common Issues

#### "Module not found" Error
**Solution**: Run `npm install`

#### "Port 5173 already in use"
**Solution**: 
```bash
# Find and kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

#### Icons Still Not Showing
**Solution**: 
1. Clear browser cache
2. Hard reload (Ctrl+Shift+R)
3. Check browser console for errors

## Verification Steps

### 1. Check Console
Open browser DevTools (F12) and verify:
- No red errors
- No React warnings
- No WebSocket errors

### 2. Check Icons
Navigate to different pages and verify icons display:
- Dashboard → Check widget icons
- Matches → Check match card icons
- Right Sidebar → Check suggested match icons

### 3. Check HMR
Make a small change to a component and verify:
- Page updates automatically
- No errors in console
- Changes reflect immediately

## Success Criteria

✅ Application loads without errors
✅ All icons display correctly
✅ HMR works properly
✅ No console warnings
✅ Navigation works smoothly

## Quick Commands

```bash
# Clear cache and restart
Remove-Item -Recurse -Force node_modules\.vite; npm run dev

# Full clean restart
Remove-Item -Recurse -Force node_modules; npm install; npm run dev

# Build to verify
npm run build

# Check for TypeScript errors
npm run type-check
```

---

**Status**: Ready to restart
**Estimated Time**: 1-2 minutes
**Risk**: Low - only configuration changes
