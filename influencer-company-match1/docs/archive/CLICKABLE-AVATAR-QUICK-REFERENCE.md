# Clickable Avatar - Quick Reference

## Usage

### Basic Clickable Avatar
```typescript
<Avatar
  src={user.avatarUrl}
  name={user.name}
  size="md"
  userId={user.id}
  trackingContext="your_context"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | string | No | - | User ID for auto-navigation |
| `clickable` | boolean | No | true | Enable/disable clickability |
| `trackingContext` | string | No | 'avatar_click' | Analytics context |
| `onClick` | function | No | - | Custom click handler (overrides auto-nav) |

## Tracking Contexts

| Component | Context |
|-----------|---------|
| FeedPost | `feed_post` |
| MatchCard | `match_card` |
| ConversationList | `conversation_list` |
| CommentSection | `comment_section` |
| WhoReactedModal | `who_reacted_modal` |
| NotificationDropdown | `notification_dropdown` |
| SuggestedMatchCard | `suggested_match_card` |

## Behavior

- **With userId**: Clicking navigates to `/profile/{userId}`
- **Own profile**: Navigates to `/profile`
- **Custom onClick**: Takes precedence over auto-navigation
- **Keyboard**: Enter/Space keys work
- **Analytics**: Automatically tracked

## Visual Feedback

- ✅ Pointer cursor on hover
- ✅ Scale up (1.05x) on hover
- ✅ Shadow on hover
- ✅ Focus outline for keyboard

## Components Updated

✅ FeedPost  
✅ MatchCard  
✅ ConversationList  
✅ CommentSection  
✅ WhoReactedModal  
✅ NotificationDropdown  
✅ SuggestedMatchCard  

## Status

**✅ COMPLETE** - All avatars are now clickable across the platform!
