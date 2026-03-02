# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive white-label multi-tenant administration system for managing the entire platform. It provides super admins and tenant admins with tools to manage users, tenants, payments, analytics, moderation, and system configuration.

**Base Route:** `/admin`  
**Access:** Admin authentication required  
**Component Directory:** `src/renderer/pages/admin/`

---

## Authentication & Access Control

### Admin Login
**Route:** `/admin/login`  
**Component:** `AdminLogin.tsx`

**Features:**
- Separate authentication system from regular users
- JWT-based session management
- Role-based access control (RBAC)
- Account lockout after failed attempts
- Secure password requirements

**Credentials (Development):**
- **Super Admin:** admin@platform.com / Admin123!@#
- **Tenant Admin:** (created via super admin)

**Backend:**
- `POST /api/admin/auth/login` - Admin authentication
- `POST /api/admin/auth/logout` - Session termination
- `GET /api/admin/auth/me` - Current admin user info

**Database Tables:**
- `admin_users` - Admin user accounts
- `audit_logs` - Admin action tracking

**Security Features:**
- Password hashing with bcrypt (10 rounds)
- JWT tokens with short expiration
- Rate limiting on login attempts
- IP-based access restrictions (configurable)
- Two-factor authentication (planned)

---

## Dashboard Pages

### 1. Dashboard Overview
**Route:** `/admin/dashboard`  
**Component:** `AdminDashboard.tsx`

**Purpose:** High-level platform metrics and KPIs

**Widgets:**
- **User Statistics**
  - Total users (influencers + companies)
  - New registrations (daily, weekly, monthly)
  - Active users (last 7/30 days)
  - User growth trends

- **Match Statistics**
  - Total matches generated
  - Active collaborations
  - Match success rate
  - Average compatibility score

- **Revenue Metrics**
  - Total revenue
  - Monthly recurring revenue (MRR)
  - Average transaction value
  - Revenue by tenant

- **Engagement Metrics**
  - Messages sent
  - Posts created
  - Active conversations
  - Platform engagement rate

**Charts:**
- User growth over time (line chart)
- Match distribution by industry (pie chart)
- Revenue trends (bar chart)
- Engagement heatmap (calendar view)

**Backend:**
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/charts` - Chart data

**Real-time Updates:**
- WebSocket connection for live statistics
- Auto-refresh every 30 seconds
- Manual refresh button

---

### 2. User Management
**Route:** `/admin/users`  
**Component:** `AdminUsers.tsx`

**Purpose:** Manage all platform users (influencers and companies)

**Features:**
- **User List**
  - Paginated table view (50 users per page)
  - Search by name, email, or ID
  - Filter by role, status, tenant
  - Sort by registration date, activity, etc.

- **User Actions**
  - View detailed profile
  - Edit user information
  - Suspend/activate accounts
  - Delete users (soft delete)
  - Reset passwords
  - Verify email addresses
  - Export user data (CSV)

- **User Details Modal**
  - Complete profile information
  - Activity history
  - Match statistics
  - Payment history
  - Audit log

**Search & Filters:**
- Full-text search across name, email, company
- Role filter (influencer, company, all)
- Status filter (active, suspended, pending)
- Tenant filter (multi-tenant support)
- Date range filter (registration date)

**Backend:**
- `GET /api/admin/users` - List users with pagination
- `GET /api/admin/users/:id` - User details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/suspend` - Suspend user
- `POST /api/admin/users/:id/activate` - Activate user
- `GET /api/admin/users/export` - Export users to CSV

**Components:**
- `AdminUserModal.tsx` - Create/edit user modal
- `AdminUserProfileModal.tsx` - View user profile
- `UserDetailModal.tsx` - Detailed user information
- `Pagination.tsx` - Table pagination

---

### 3. Tenant Management
**Route:** `/admin/tenants`  
**Component:** `AdminTenants.tsx` (Super Admin only)

**Purpose:** Manage multi-tenant instances of the platform

**Features:**
- **Tenant List**
  - All tenant instances
  - Tenant status (active, trial, suspended)
  - Subscription tier
  - User count per tenant
  - Storage usage

- **Tenant Actions**
  - Create new tenant
  - Edit tenant configuration
  - Suspend/activate tenant
  - Delete tenant
  - View tenant analytics
  - Manage tenant admins

- **Tenant Configuration**
  - Tenant name and domain
  - Subscription plan
  - Feature flags
  - Storage limits
  - User limits
  - Custom branding
  - API keys

**Backend:**
- `GET /api/admin/tenants` - List all tenants
- `POST /api/admin/tenants` - Create tenant
- `GET /api/admin/tenants/:id` - Tenant details
- `PUT /api/admin/tenants/:id` - Update tenant
- `DELETE /api/admin/tenants/:id` - Delete tenant

**Database Tables:**
- `tenants` - Tenant configurations
- `tenant_subscriptions` - Subscription details

**Components:**
- `CreateTenantModal.tsx` - Create new tenant
- `TenantDetailModal.tsx` - View tenant details
- `TenantSwitcher.tsx` - Switch between tenants

---

### 4. Payment Management
**Route:** `/admin/payments`  
**Component:** `AdminPayments.tsx`

**Purpose:** Monitor and manage all platform payments

**Features:**
- **Payment List**
  - All transactions
  - Payment status (pending, completed, failed, refunded)
  - Amount and currency
  - Payer and payee information
  - Payment method
  - Stripe transaction ID

- **Payment Actions**
  - View payment details
  - Issue refunds
  - Retry failed payments
  - Export payment reports
  - Generate invoices

- **Subscription Management**
  - Active subscriptions
  - Subscription status
  - Billing cycles
  - Upgrade/downgrade plans
  - Cancel subscriptions

- **Payout Management**
  - Pending payouts
  - Completed payouts
  - Payout schedules
  - Stripe Connect accounts

**Filters:**
- Status filter
- Date range
- Amount range
- Payment method
- Tenant filter

**Backend:**
- `GET /api/admin/payments` - List payments
- `GET /api/admin/payments/:id` - Payment details
- `POST /api/admin/payments/:id/refund` - Issue refund
- `GET /api/admin/subscriptions` - List subscriptions
- `GET /api/admin/payouts` - List payouts

**Stripe Integration:**
- Stripe Connect for payouts
- Stripe Checkout for payments
- Webhook handling for payment events
- Automatic invoice generation

**Database Tables:**
- `payments` - Payment transactions
- `subscriptions` - Subscription records
- `invoices` - Generated invoices
- `payouts` - Payout records

---

### 5. Analytics
**Route:** `/admin/analytics`  
**Component:** `AdminAnalytics.tsx`

**Purpose:** Comprehensive platform analytics and insights

**Analytics Sections:**

**User Analytics:**
- User acquisition trends
- User retention rates
- Churn analysis
- User lifetime value (LTV)
- Cohort analysis

**Match Analytics:**
- Match generation rate
- Match acceptance rate
- Compatibility score distribution
- Industry-specific match performance
- Geographic match distribution

**Engagement Analytics:**
- Daily/weekly/monthly active users
- Session duration
- Feature usage statistics
- Content creation metrics
- Message volume

**Revenue Analytics:**
- Revenue trends
- Revenue by source
- Customer acquisition cost (CAC)
- LTV:CAC ratio
- Revenue forecasting

**Charts & Visualizations:**
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Heatmaps for engagement
- Funnel charts for conversions

**Export Options:**
- PDF reports
- CSV data export
- Scheduled email reports
- Custom date ranges

**Backend:**
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/matches` - Match analytics
- `GET /api/admin/analytics/engagement` - Engagement metrics
- `GET /api/admin/analytics/revenue` - Revenue analytics
- `POST /api/admin/analytics/export` - Export analytics data

**Database Tables:**
- `user_analytics` - User behavior tracking
- `match_analytics` - Match performance data
- `revenue_analytics` - Revenue metrics

**Components:**
- `OverviewCharts.tsx` - Dashboard overview charts
- `UserCharts.tsx` - User-specific charts
- `MatchCharts.tsx` - Match analytics charts
- `EngagementCharts.tsx` - Engagement visualizations
- `CampaignCharts.tsx` - Campaign performance

---

### 6. Content Moderation
**Route:** `/admin/moderation`  
**Component:** `AdminModeration.tsx`

**Purpose:** Moderate user-generated content and enforce community guidelines

**Features:**

**Content Flags:**
- Flagged posts and comments
- Reported users
- Flagged profiles
- Automated content detection alerts

**Moderation Actions:**
- Review flagged content
- Approve/reject content
- Remove content
- Ban users
- Issue warnings
- Whitelist users

**User Bans:**
- Temporary bans
- Permanent bans
- IP bans
- Ban reasons and notes
- Ban appeal system

**Automated Moderation:**
- Profanity filter
- Spam detection
- Inappropriate image detection (planned)
- Suspicious activity alerts

**Moderation Queue:**
- Pending reviews
- Priority flagging
- Bulk actions
- Moderation history

**Backend:**
- `GET /api/admin/moderation/flags` - Content flags
- `POST /api/admin/moderation/flags/:id/review` - Review flag
- `GET /api/admin/moderation/bans` - User bans
- `POST /api/admin/moderation/bans` - Ban user
- `DELETE /api/admin/moderation/bans/:id` - Unban user

**Database Tables:**
- `content_flags` - Flagged content
- `user_bans` - User ban records
- `moderation_actions` - Moderation history

---

### 7. Platform Branding
**Route:** `/admin/branding`  
**Component:** `AdminBranding.tsx`

**Purpose:** Customize platform appearance and branding (white-label)

**Customization Options:**

**Visual Branding:**
- Platform logo (light/dark mode)
- Favicon
- Primary color
- Secondary color
- Accent color
- Font family
- Custom CSS

**Text Content:**
- Platform name
- Tagline
- Welcome message
- Footer text
- Terms of service URL
- Privacy policy URL

**Email Templates:**
- Welcome email
- Password reset
- Email verification
- Notification emails
- Invoice emails
- Custom email templates

**Features:**
- Live preview of changes
- Revert to default branding
- Export/import branding configuration
- Version history

**Backend:**
- `GET /api/admin/branding` - Get branding config
- `PUT /api/admin/branding` - Update branding
- `POST /api/admin/branding/logo` - Upload logo
- `GET /api/admin/branding/email-templates` - Email templates
- `PUT /api/admin/branding/email-templates/:id` - Update template

**Database Tables:**
- `platform_config` - Branding configuration
- `email_templates` - Email template content

**Real-time Updates:**
- WebSocket broadcast of branding changes
- Automatic application across all users
- Cache invalidation

---

### 8. Feature Flags
**Route:** `/admin/features`  
**Component:** `AdminFeatureFlags.tsx`

**Purpose:** Enable/disable platform features dynamically

**Feature Categories:**

**Core Features:**
- User registration
- Matching algorithm
- Messaging system
- Payment processing

**Advanced Features:**
- AI-powered recommendations
- Campaign system
- Match history & analytics
- Saved items
- Profile reviews
- Global search

**Experimental Features:**
- A/B testing framework
- ML-based matching
- Video calls (planned)
- Advanced analytics

**Feature Configuration:**
- Enable/disable toggle
- Rollout percentage (gradual rollout)
- User segment targeting
- Tenant-specific features
- Feature dependencies

**Backend:**
- `GET /api/admin/features` - List all features
- `PUT /api/admin/features/:key` - Update feature flag
- `POST /api/admin/features/rollout` - Configure rollout

**Database Tables:**
- `feature_flags` - Feature configurations
- `rollouts` - Gradual rollout settings

---

### 9. Reviews Management
**Route:** `/admin/reviews`  
**Component:** `AdminReviews.tsx`

**Purpose:** Manage user reviews and ratings

**Features:**
- View all profile reviews
- Moderate inappropriate reviews
- Feature positive reviews
- Remove spam reviews
- Respond to reviews (planned)
- Review analytics

**Backend:**
- `GET /api/admin/reviews` - List reviews
- `PUT /api/admin/reviews/:id` - Update review
- `DELETE /api/admin/reviews/:id` - Delete review
- `POST /api/admin/reviews/:id/feature` - Feature review

**Database Tables:**
- `profile_reviews` - User reviews

---

### 10. System Settings
**Route:** `/admin/settings`  
**Component:** `AdminSystemSettings.tsx`

**Purpose:** Configure global system settings

**Settings Categories:**

**General Settings:**
- Platform name
- Support email
- Maintenance mode
- Registration enabled
- Email verification required

**Security Settings:**
- Password requirements
- Session timeout
- Rate limiting
- IP whitelist/blacklist
- Two-factor authentication

**Email Settings:**
- SMTP configuration
- Email sender name
- Email templates
- Email notifications

**Payment Settings:**
- Stripe API keys
- Payment methods enabled
- Currency settings
- Transaction fees

**AI/ML Settings:**
- ML service endpoints
- Matching algorithm weights
- Recommendation thresholds
- Chatbot configuration

**Real-time Settings:**
- WebSocket gateway for instant updates
- Settings broadcast to all connected clients
- No page refresh required

**Backend:**
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings` - Update settings
- `WebSocket /admin/settings` - Real-time updates

**Database Tables:**
- `system_config` - System configuration

---

## Common Features Across All Pages

### Navigation
**Component:** `AdminPageHeader.tsx`

**Features:**
- Sidebar navigation
- Breadcrumb trail
- User profile dropdown
- Logout button
- Tenant switcher (super admin)

### Data Tables
**Component:** `Pagination.tsx`

**Features:**
- Sortable columns
- Pagination controls
- Items per page selector
- Total count display
- Loading states

### Modals
**Components:**
- `ConfirmationModal.tsx` - Confirm destructive actions
- `Toast.tsx` - Success/error notifications

### Real-time Updates
**Provider:** `SettingsSocketProvider.tsx`

**Features:**
- WebSocket connection management
- Automatic reconnection
- Real-time setting updates
- Maintenance mode banner

---

## Security & Audit

### Audit Logging
**Database Table:** `audit_logs`

**Logged Actions:**
- User creation/modification/deletion
- Tenant changes
- Payment actions
- Content moderation
- Setting changes
- Login attempts

**Audit Log Fields:**
- Admin user ID
- Action type
- Target entity
- Changes made
- IP address
- Timestamp

### Role-Based Access Control (RBAC)

**Roles:**
- **Super Admin:** Full platform access
- **Tenant Admin:** Tenant-specific access
- **Moderator:** Content moderation only
- **Support:** Read-only access

**Guards:**
- `AdminAuthGuard` - Verify admin authentication
- `RolesGuard` - Check role permissions

**Decorators:**
- `@Roles('super_admin')` - Restrict to super admins
- `@Roles('admin', 'moderator')` - Multiple role access

---

## API Documentation

### Base URL
```
/api/admin/*
```

### Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

### Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## Testing

### Test Files
- `test-admin-login.js` - Admin authentication
- `test-admin-dashboard-complete.js` - Dashboard functionality
- `test-admin-users-search.js` - User search and filters
- `test-admin-edit-user-profile.js` - User editing
- `test-admin-settings-realtime.js` - Real-time settings
- `test-admin-phase1-verification.js` - Complete admin system

---

## Deployment Considerations

### Environment Variables
```env
ADMIN_JWT_SECRET=<secret>
ADMIN_SESSION_TIMEOUT=3600
ADMIN_RATE_LIMIT=100
```

### Database Migrations
- All admin tables created via TypeORM migrations
- Migration files in `backend/src/database/migrations/`

### Performance
- Admin dashboard uses separate code chunk (81 KB)
- Lazy loading for all admin routes
- Optimized queries with pagination
- Redis caching for frequently accessed data

---

## Future Enhancements

- [ ] Advanced analytics with ML insights
- [ ] Automated report generation
- [ ] Custom dashboard widgets
- [ ] Multi-language admin interface
- [ ] Mobile admin app
- [ ] Advanced user segmentation
- [ ] Bulk operations
- [ ] API access management
- [ ] Webhook configuration
- [ ] Integration marketplace

---

## Related Documentation
- [Backend API](./04-BACKEND-API.md)
- [Database Schema](./05-DATABASE-SCHEMA.md)
- [Frontend Architecture](./03-FRONTEND-ARCHITECTURE.md)
