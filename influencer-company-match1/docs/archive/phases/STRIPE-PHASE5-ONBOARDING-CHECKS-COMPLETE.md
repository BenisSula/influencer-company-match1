# ✅ Stripe Phase 5: Onboarding Checks Complete

## Overview
Phase 5 adds intelligent onboarding checks to the payment flow, ensuring users complete their Stripe setup before they can create or accept payments.

## Backend Implementation Complete

### 1. Enhanced Payment Service

**File**: `backend/src/modules/payments/payments.service.ts`

#### Modified `createCollaborationPayment` Method

The method now returns either a payment object OR an onboarding requirement:

```typescript
async createCollaborationPayment(
  collaborationId: string,
  companyId: string,
  influencerId: string,
  budget: number,
): Promise<{ 
  payment?: Payment; 
  onboardingRequired?: { 
    type: 'company' | 'influencer'; 
    redirectTo: string; 
    message: string 
  } 
}>
```

#### Onboarding Check Logic

**Company Check**:
```typescript
if (company.role === 'company' && !company.stripeCustomerId) {
  return {
    onboardingRequired: {
      type: 'company',
      redirectTo: '/onboarding/company',
      message: 'Please complete payment setup before sending collaboration requests.'
    }
  };
}
```

**Influencer Check**:
```typescript
if (influencer.role === 'influencer' && !influencer.stripeAccountId) {
  return {
    onboardingRequired: {
      type: 'influencer',
      redirectTo: '/onboarding/influencer',
      message: 'Please complete payout setup before accepting collaborations.'
    }
  };
}
```

### 2. Onboarding Status Endpoint

**Existing Method**: `getOnboardingStatus(userId: string)`

Returns:
```typescript
{
  hasStripeAccount: boolean,
  stripeAccountId: string | null,
  stripeCustomerId: string | null,
  onboardingComplete: boolean
}
```

## Frontend Implementation Needed

### 1. Update Collaboration Request Flow

**File**: `src/renderer/components/CollaborationRequestModal/CollaborationRequestModal.tsx`

```typescript
const handleSendRequest = async () => {
  try {
    const response = await api.post(`/payments/collaboration/${collaborationId}`);
    
    // Check for onboarding requirement
    if (response.data.onboardingRequired) {
      const { type, redirectTo, message } = response.data.onboardingRequired;
      setError(message);
      
      // Show modal or redirect after delay
      setTimeout(() => {
        navigate(redirectTo);
      }, 2000);
      return;
    }
    
    // Continue with normal payment flow
    const { payment } = response.data;
    navigate(`/payments/checkout/${collaborationId}`);
  } catch (error) {
    setError('Failed to create payment');
  }
};
```

### 2. Create Onboarding Status Utility

**File**: `src/renderer/utils/onboardingUtils.ts`

```typescript
export const checkOnboardingStatus = async (): Promise<{
  needsOnboarding: boolean;
  type?: 'company' | 'influencer';
  redirectTo?: string;
  message?: string;
}> => {
  try {
    const { data } = await api.get('/payments/onboarding-status');
    
    return {
      needsOnboarding: !data.hasStripeAccount,
      type: data.userRole,
      redirectTo: data.userRole === 'company' 
        ? '/onboarding/company' 
        : '/onboarding/influencer',
      message: data.userRole === 'company'
        ? 'Complete payment setup to send collaboration requests'
        : 'Complete payout setup to receive payments'
    };
  } catch (error) {
    return { needsOnboarding: false };
  }
};
```

### 3. Add Onboarding Banner to Dashboard

**File**: `src/renderer/pages/Dashboard.tsx`

```typescript
const [onboardingStatus, setOnboardingStatus] = useState(null);

useEffect(() => {
  checkOnboardingStatus().then(setOnboardingStatus);
}, []);

return (
  <div className="dashboard">
    {onboardingStatus?.needsOnboarding && (
      <div className="onboarding-banner">
        <div className="banner-content">
          <h3>⚠️ Complete Your Setup</h3>
          <p>{onboardingStatus.message}</p>
          <button 
            onClick={() => navigate(onboardingStatus.redirectTo)}
            className="btn-primary"
          >
            Complete Setup Now
          </button>
        </div>
      </div>
    )}
    {/* Rest of dashboard */}
  </div>
);
```

### 4. Add Banner Styling

**File**: `src/renderer/pages/Dashboard.css`

```css
.onboarding-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.banner-content h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.banner-content p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.95;
}

.banner-content .btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.banner-content .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .onboarding-banner {
    padding: 1rem;
  }
  
  .banner-content h3 {
    font-size: 1.25rem;
  }
}
```

## Payment Flow with Onboarding Checks

### Flow Diagram

```
User Action: Accept Collaboration
         ↓
Backend: createCollaborationPayment()
         ↓
Check: Company has stripeCustomerId?
         ↓ NO
Return: onboardingRequired (company)
         ↓
Frontend: Show message + redirect to /onboarding/company
         ↓
User completes onboarding
         ↓
Retry: Accept Collaboration
         ↓
Check: Influencer has stripeAccountId?
         ↓ NO
Return: onboardingRequired (influencer)
         ↓
Frontend: Show message + redirect to /onboarding/influencer
         ↓
User completes onboarding
         ↓
Retry: Accept Collaboration
         ↓
Both checks pass ✓
         ↓
Create Payment Intent
         ↓
Return: payment object
         ↓
Frontend: Navigate to /payments/checkout
```

## User Experience Improvements

### 1. Proactive Onboarding Prompts

- Dashboard banner shows if onboarding incomplete
- Clear call-to-action buttons
- Contextual messages based on user role

### 2. Graceful Error Handling

- User-friendly error messages
- Automatic redirect to onboarding
- No confusing technical errors

### 3. Role-Specific Messaging

**Company**:
- "Complete payment setup to send collaboration requests"
- Redirects to `/onboarding/company`
- Sets up Stripe Customer for payments

**Influencer**:
- "Complete payout setup to receive payments"
- Redirects to `/onboarding/influencer`
- Sets up Stripe Connect for payouts

## API Endpoints

### Check Onboarding Status
```
GET /payments/onboarding-status
Response: {
  hasStripeAccount: boolean,
  stripeAccountId: string | null,
  stripeCustomerId: string | null,
  onboardingComplete: boolean
}
```

### Create Collaboration Payment
```
POST /payments/collaboration/:collaborationId
Response: {
  payment?: Payment,
  onboardingRequired?: {
    type: 'company' | 'influencer',
    redirectTo: string,
    message: string
  }
}
```

## Testing Checklist

### Backend Tests
- [ ] Company without stripeCustomerId returns onboarding requirement
- [ ] Influencer without stripeAccountId returns onboarding requirement
- [ ] Both users with Stripe IDs create payment successfully
- [ ] Onboarding status endpoint returns correct data

### Frontend Tests
- [ ] Onboarding banner displays when needed
- [ ] Banner hides after onboarding complete
- [ ] Collaboration request shows onboarding message
- [ ] Redirect to onboarding page works
- [ ] Retry after onboarding succeeds

### User Flow Tests
- [ ] New company sees onboarding prompt
- [ ] New influencer sees onboarding prompt
- [ ] Onboarded users don't see prompts
- [ ] Error messages are clear and helpful

## Security Considerations

### 1. Server-Side Validation
- All onboarding checks happen on backend
- Frontend cannot bypass checks
- Stripe IDs verified before payment creation

### 2. User Authorization
- Only authorized users can check onboarding status
- Payment creation requires valid authentication
- Collaboration ownership verified

### 3. Data Privacy
- Stripe IDs not exposed to unauthorized users
- Onboarding status only visible to account owner
- Payment details protected

## Next Steps (Phase 6)

1. **Enhanced Onboarding UI**
   - Progress indicators
   - Step-by-step guidance
   - Success confirmations

2. **Onboarding Analytics**
   - Track completion rates
   - Identify drop-off points
   - Optimize conversion

3. **Email Notifications**
   - Remind users to complete onboarding
   - Notify when setup required
   - Celebrate completion

4. **Multi-Currency Support**
   - Support different currencies
   - Automatic conversion
   - Regional payment methods

---

**Status**: Phase 5 Backend Complete ✅  
**Frontend**: Implementation guide provided  
**Next Phase**: Phase 6 - Enhanced Onboarding UI  
**Date**: 2026-02-18
