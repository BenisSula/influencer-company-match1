# Stripe Setup Flow - Enhanced UX Implementation

## Overview
When a collaboration is accepted but Stripe isn't configured, guide users through the setup process instead of just showing an error.

## User Flow

### Scenario 1: Stripe Not Configured (Platform Level)
**Who:** Platform admin hasn't set up Stripe keys
**Action:** Show admin contact message
**Message:** "Payment system setup required. Please contact support to enable payments."

### Scenario 2: Company Missing Stripe Account
**Who:** Company accepting collaboration
**Action:** Redirect to Stripe onboarding
**Flow:**
1. Accept collaboration ✅
2. Show modal: "Set up payments to complete this collaboration"
3. Button: "Connect Stripe Account"
4. Redirect to Stripe Connect onboarding
5. After setup, return to collaboration

### Scenario 3: Influencer Missing Stripe Account
**Who:** Influencer whose collaboration was accepted
**Action:** Prompt to set up payout account
**Flow:**
1. Collaboration accepted ✅
2. Show notification: "Set up your payout account to receive payment"
3. Link to Settings → Payments
4. Connect Stripe account for payouts

## Implementation Plan

### Phase 1: Payment Setup Modal Component
Create a modal that guides users through Stripe setup

### Phase 2: Backend - Stripe Onboarding URLs
Generate Stripe Connect account links

### Phase 3: Settings Page - Payment Setup
Add payment configuration section

### Phase 4: Smart Redirects
Automatically redirect based on user role and setup status
