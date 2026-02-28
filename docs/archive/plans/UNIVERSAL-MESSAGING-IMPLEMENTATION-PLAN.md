# Universal Messaging Implementation Plan 📨

## Investigation Summary

### Current State ✅

**What Works:**
1. ✅ **ProfileView** - Has "Send Message" button
2. ✅ **MatchCard** - Has "Connect" button that opens messages
3. ✅ **Messages Page** - Handles `recipientId` from navigation state
4. ✅ **Backend** - Auto-creates conversations and connections
5. ✅ **Settings** - Has `message_permission` field (everyone/connections/none)

**What's Missing:**
1. ❌ **CampaignCard** - No message button
2. ❌ **CampaignDetail** - No message button
3. ❌ **FeedPost** - No message author button
4. ❌ **Backend** - No privacy check enforcement
5. ❌ **Messages Page** - No context display

---

## Implementation Plan

### Phase 1: Backend Privacy Enforcement (Critical) ⭐⭐⭐

#### Task 1.1: Add Settings Service to Messaging Module

**File:** `backend/src/modules/messaging/messaging.module.ts`

**Changes:**
```typescript
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Connection]),
    SettingsModule, // Add this
  ],
  // ...
})
```

#### Task 1.2: Implement Privacy Check in Messaging Service

**File:** `backend/src/modules/messaging/messaging.service.ts`

**Add Method:**
```typescript
import { SettingsService } from '../settings/settings.service';

constructor(
  // ... existing
  private settingsService: SettingsService, // Add this
) {}

private async checkMessagePermission(
  senderId: string,
  recipientId: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const settings = await this.settingsService.getSettings(recipientId);
    
    // Check if messaging is completely disabled
    if (settings.messagePermission === 'none') {
      return {
        allowed: false,
        reason: 'This user has disabled all messages'
      };
    }
    
    // Check if only connections can message
    if (settings.messagePermission === 'connections') {
      const connection = await this.connectionRepository.findOne({
        where: [
          { requesterId: senderId, recipientId, status: ConnectionStatus.CONNECTED },
          { requesterId: recipientId, recipientId: senderId, status: ConnectionStatus.CONNECTED }
        ]
      });
      
      if (!connection) {
        return {
          allowed: false,
          reason: 'This user only accepts messages from connections'
        };
      }
    }
    
    // Default: everyone can message
    return { allowed: true };
  } catch (error) {
    console.error('Failed to check message permission:', error);
    // Default to allowing if check fails
    return { allowed: true };
  }
}
```

**Update createMessage:**
```typescript
async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
  // Check permission first
  const permission = await this.checkMessagePermission(senderId, createMessageDto.recipientId);
  
  if (!permission.allowed) {
    throw new ForbiddenException(permission.reason || 'Cannot send message to this user');
  }
  
  // Continue with existing logic...
  const conversation = await this.getOrCreateConversation(senderId, createMessageDto.recipientId);
  // ... rest of existing code
}
```

**Estimated Time:** 30 minutes

---

### Phase 2: Add Message Buttons to Components (High Priority) ⭐⭐⭐

#### Task 2.1: Add Message Button to CampaignCard

**File:** `src/renderer/components/CampaignCard/CampaignCard.tsx`

**Add Import:**
```typescript
import { HiMail } from 'react-icons/hi';
```

**Add Handler:**
```typescript
const handleMessageCompany = (e: React.MouseEvent) => {
  e.stopPropagation();
  navigate('/messages', {
    state: {
      recipientId: campaign.companyId,
      recipientName: campaign.company?.companyProfile?.companyName || 'Company',
      context: 'campaign',
      contextData: {
        campaignId: campaign.id,
        campaignTitle: campaign.title
      }
    }
  });
};
```

**Add Button (in actions section):**
```typescript
{!isOwner && campaign.status === CampaignStatus.ACTIVE && (
  <>
    <Button
      variant="secondary"
      size="md"
      onClick={handleMessageCompany}
    >
      <HiMail size={18} />
      Message Company
    </Button>
    <Button
      variant="primary"
      size="md"
      onClick={() => onApply?.(campaign.id)}
    >
      Apply Now
    </Button>
  </>
)}
```

**Estimated Time:** 15 minutes

#### Task 2.2: Add Message Button to CampaignDetail

**File:** `src/renderer/pages/CampaignDetail.tsx`

**Add to company section:**
```typescript
<div className="campaign-company-section">
  <Avatar ... />
  <div className="company-info">...</div>
  <div className="company-actions">
    <Button
      variant="secondary"
      onClick={() => navigate(`/profile/${campaign.companyId}`)}
    >
      View Profile
    </Button>
    {!isOwner && (
      <Button
        variant="secondary"
        onClick={() => navigate('/messages', {
          state: {
            recipientId: campaign.companyId,
            recipientName: campaign.company?.companyProfile?.companyName,
            context: 'campaign',
            contextData: {
              campaignId: campaign.id,
              campaignTitle: campaign.title
            }
          }
        })}
      >
        <HiMail size={18} />
        Message
      </Button>
    )}
  </div>
</div>
```

**Estimated Time:** 10 minutes

#### Task 2.3: Add Message Button to MatchCard

**File:** `src/renderer/components/MatchCard/MatchCard.tsx`

**Add Handler:**
```typescript
const handleMessage = (e: React.MouseEvent) => {
  e.stopPropagation();
  navigate('/messages', {
    state: {
      recipientId: profile.id,
      recipientName: profile.name,
      context: 'match',
      contextData: {
        matchScore: score,
        matchTier: tier
      }
    }
  });
};
```

**Add Button (after Connect button):**
```typescript
<div className="match-actions">
  <Button
    variant={connectionStatus === 'connected' ? 'success' : 'primary'}
    onClick={handleConnect}
    disabled={connectionStatus === 'pending'}
  >
    {/* existing connect button logic */}
  </Button>
  
  <Button
    variant="secondary"
    onClick={handleMessage}
  >
    <HiMail size={18} />
    Message
  </Button>
</div>
```

**Estimated Time:** 15 minutes

#### Task 2.4: Add Message Author to FeedPost

**File:** `src/renderer/components/FeedPost/FeedPost.tsx`

**Add to ActionBar actions:**
```typescript
const actions: ActionBarItem[] = [
  {
    icon: <ReactionPicker onReact={handleReaction} currentReaction={reaction} />,
    label: '',
    onClick: () => {},
  },
  {
    icon: <HiChat size={20} />,
    label: 'Comment',
    onClick: () => setShowComments(!showComments),
    count: commentCount,
  },
  {
    icon: <HiMail size={20} />,
    label: 'Message',
    onClick: () => {
      navigate('/messages', {
        state: {
          recipientId: post.authorId,
          recipientName: getAuthorName(),
          context: 'post',
          contextData: {
            postId: post.id,
            postType: post.type
          }
        }
      });
    },
  },
  {
    icon: saved ? <HiBookmark size={20} /> : <HiOutlineBookmark size={20} />,
    label: 'Save',
    onClick: handleSave,
    active: saved,
  },
  {
    icon: <HiShare size={20} />,
    label: 'Share',
    onClick: handleShare,
  },
];
```

**Estimated Time:** 10 minutes

---

### Phase 3: Add Message Context Display (Medium Priority) ⭐⭐

#### Task 3.1: Update Messages Page to Show Context

**File:** `src/renderer/pages/Messages.tsx`

**Add Context Banner Component:**
```typescript
const MessageContextBanner = ({ context, contextData }: any) => {
  if (!context) return null;
  
  const getContextMessage = () => {
    switch (context) {
      case 'campaign':
        return {
          icon: '📋',
          text: `About campaign: ${contextData?.campaignTitle}`,
          action: () => navigate(`/campaigns/${contextData?.campaignId}`)
        };
      case 'match':
        return {
          icon: '🎯',
          text: `Match score: ${contextData?.matchScore}% (${contextData?.matchTier})`,
          action: null
        };
      case 'post':
        return {
          icon: '📝',
          text: `About a post`,
          action: null
        };
      default:
        return null;
    }
  };
  
  const contextInfo = getContextMessage();
  if (!contextInfo) return null;
  
  return (
    <div className="message-context-banner">
      <span className="context-icon">{contextInfo.icon}</span>
      <span className="context-text">{contextInfo.text}</span>
      {contextInfo.action && (
        <button onClick={contextInfo.action} className="context-action">
          View
        </button>
      )}
    </div>
  );
};
```

**Add to createNewConversation:**
```typescript
const createNewConversation = async (recipientId: string, recipientName?: string, context?: any) => {
  // ... existing code
  
  // Store context for display
  if (context) {
    setConversationContext({
      conversationId: newConvo.id,
      context: context.context,
      contextData: context.contextData
    });
  }
};
```

**Display in UI:**
```typescript
<div className="message-thread-container">
  {conversationContext && (
    <MessageContextBanner 
      context={conversationContext.context}
      contextData={conversationContext.contextData}
    />
  )}
  <MessageThread ... />
</div>
```

**Estimated Time:** 30 minutes

---

### Phase 4: Frontend Error Handling (Medium Priority) ⭐⭐

#### Task 4.1: Handle Privacy Errors in Frontend

**File:** `src/renderer/services/messaging.service.ts`

**Update sendMessage:**
```typescript
async sendMessage(recipientId: string, content: string, attachmentUrl?: string): Promise<Message> {
  try {
    return await apiClient.post<Message>('/messages', {
      recipientId,
      content,
      attachmentUrl,
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Privacy restriction
      const message = error.response?.data?.message || 'This user has restricted who can message them';
      throw new Error(message);
    }
    throw error;
  }
}
```

**Update Messages Page:**
```typescript
const handleSendMessage = async (content: string) => {
  try {
    await messagingService.sendMessage(recipientId, content);
    // ... success handling
  } catch (error: any) {
    if (error.message.includes('restricted') || error.message.includes('disabled')) {
      showToast(error.message, 'error');
      // Show privacy info modal
      setShowPrivacyInfo(true);
    } else {
      showToast('Failed to send message', 'error');
    }
  }
};
```

**Estimated Time:** 20 minutes

---

### Phase 5: UI Polish (Low Priority) ⭐

#### Task 5.1: Add Message Context CSS

**File:** `src/renderer/pages/Messages.css`

**Add Styles:**
```css
.message-context-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-left: 3px solid var(--primary-color);
  border-radius: 8px;
  margin-bottom: 16px;
}

.context-icon {
  font-size: 20px;
}

.context-text {
  flex: 1;
  font-size: 14px;
  color: var(--gray-700);
}

.context-action {
  padding: 6px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.context-action:hover {
  opacity: 0.9;
}
```

**Estimated Time:** 10 minutes

#### Task 5.2: Update Button Styles for Consistency

**File:** `src/renderer/components/CampaignCard/CampaignCard.css`

**Add:**
```css
.campaign-card-actions button {
  display: flex;
  align-items: center;
  gap: 6px;
}

.campaign-card-actions button svg {
  flex-shrink: 0;
}
```

**Estimated Time:** 5 minutes

---

## Implementation Order

### Day 1: Backend & Critical Features (2-3 hours)

1. ✅ **Task 1.1** - Add Settings to Messaging Module (15 min)
2. ✅ **Task 1.2** - Implement Privacy Check (30 min)
3. ✅ **Task 2.1** - Add Message to CampaignCard (15 min)
4. ✅ **Task 2.2** - Add Message to CampaignDetail (10 min)
5. ✅ **Task 2.3** - Add Message to MatchCard (15 min)
6. ✅ **Task 2.4** - Add Message to FeedPost (10 min)
7. ✅ **Task 4.1** - Handle Privacy Errors (20 min)

**Total:** ~2 hours

### Day 2: Polish & Context (1-2 hours)

8. ✅ **Task 3.1** - Add Context Display (30 min)
9. ✅ **Task 5.1** - Add Context CSS (10 min)
10. ✅ **Task 5.2** - Update Button Styles (5 min)
11. ✅ **Testing** - Test all flows (30 min)

**Total:** ~1.5 hours

---

## Files to Modify

### Backend (2 files)
```
backend/src/modules/messaging/
├── messaging.module.ts (add SettingsModule import)
└── messaging.service.ts (add privacy check)
```

### Frontend (7 files)
```
src/renderer/
├── components/
│   ├── CampaignCard/
│   │   ├── CampaignCard.tsx (add message button)
│   │   └── CampaignCard.css (add button styles)
│   ├── MatchCard/
│   │   └── MatchCard.tsx (add message button)
│   └── FeedPost/
│       └── FeedPost.tsx (add message action)
├── pages/
│   ├── CampaignDetail.tsx (add message button)
│   ├── Messages.tsx (add context display)
│   └── Messages.css (add context styles)
└── services/
    └── messaging.service.ts (add error handling)
```

---

## Testing Checklist

### Backend Testing
- [ ] User with "everyone" permission can receive messages
- [ ] User with "connections" permission only receives from connections
- [ ] User with "none" permission blocks all messages
- [ ] Proper error messages returned
- [ ] Connection auto-created on first message

### Frontend Testing
- [ ] Message button on CampaignCard works
- [ ] Message button on CampaignDetail works
- [ ] Message button on MatchCard works
- [ ] Message button on FeedPost works
- [ ] Context banner shows correctly
- [ ] Privacy errors display properly
- [ ] Navigation state handled correctly

### Integration Testing
- [ ] Campaign → Message → Conversation created
- [ ] Match → Message → Conversation created
- [ ] Post → Message → Conversation created
- [ ] Profile → Message → Conversation created
- [ ] Context preserved in conversation
- [ ] Privacy settings respected

---

## User Flows

### Flow 1: Message from Campaign
```
1. Browse campaigns
2. See interesting campaign
3. Click "Message Company"
4. Opens Messages with context banner
5. Type: "Hi! I'm interested in your Summer Campaign..."
6. Send message
7. Company receives with campaign context
```

### Flow 2: Message from Match
```
1. See match suggestion
2. Click "Message" button
3. Opens Messages with match context
4. Type: "Hi! We're a 95% match..."
5. Send message
6. Match receives message
```

### Flow 3: Message from Post
```
1. See interesting post in feed
2. Click "Message" action
3. Opens Messages with post context
4. Type: "Loved your post about..."
5. Send message
6. Author receives message
```

### Flow 4: Privacy Restriction
```
1. Try to message user
2. User has "connections only" setting
3. Backend blocks message
4. Frontend shows error
5. Suggests sending connection request first
```

---

## Success Metrics

### Functionality
- ✅ Message buttons on all components
- ✅ Privacy settings enforced
- ✅ Context displayed in conversations
- ✅ Error handling works
- ✅ No breaking changes

### User Experience
- ✅ One-click messaging from anywhere
- ✅ Clear context about conversation origin
- ✅ Respectful of privacy preferences
- ✅ Helpful error messages
- ✅ Smooth navigation flow

### Technical
- ✅ No TypeScript errors
- ✅ Consistent button styling
- ✅ Mobile responsive
- ✅ Performance maintained
- ✅ Backward compatible

---

## Rollout Strategy

### Phase 1: Backend (Deploy First)
1. Deploy privacy check to backend
2. Monitor for errors
3. Verify settings integration works

### Phase 2: Frontend (Deploy After)
1. Deploy message buttons
2. Deploy context display
3. Deploy error handling
4. Monitor user adoption

### Phase 3: Monitor & Iterate
1. Track message success rate
2. Monitor privacy blocks
3. Gather user feedback
4. Iterate on UX

---

## Conclusion

This implementation will:
- ✅ Enable messaging from anywhere (campaigns, matches, feed, profiles)
- ✅ Respect user privacy settings
- ✅ Provide context for conversations
- ✅ Maintain clean, consistent UX
- ✅ Complete in ~3-4 hours total

The infrastructure is already there - we're just exposing it better and adding the necessary privacy controls!

**Ready to implement!** 🚀

