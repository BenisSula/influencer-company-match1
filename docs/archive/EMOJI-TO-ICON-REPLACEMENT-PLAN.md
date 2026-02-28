# Emoji to React Icons Replacement Plan

## Files with Emojis Found:
1. Dashboard.tsx
2. Profile.tsx
3. Connections.tsx
4. MatchHistory.tsx
5. Matches.tsx

## Emoji Mapping to React Icons:

| Emoji | Meaning | React Icon | Import |
|-------|---------|------------|--------|
| 🤝 | Handshake/Collaboration | `HiHandshake` or `HiUserGroup` | `react-icons/hi2` |
| ⭐ | Star/Rating | `HiStar` | `react-icons/hi2` |
| 🎯 | Target/Goal | `HiTarget` or `HiBullseye` | `react-icons/hi2` |
| 📊 | Chart/Analytics | `HiChartBar` | `react-icons/hi2` |
| 📰 | News/Posts | `HiNewspaper` | `react-icons/hi2` |
| 📍 | Location | `HiMapPin` | `react-icons/hi2` |

## Replacement Strategy:

For each emoji, replace with:
```tsx
<IconComponent size={20} className="inline-icon" />
```

Add CSS for inline icons:
```css
.inline-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.5rem;
}
```
