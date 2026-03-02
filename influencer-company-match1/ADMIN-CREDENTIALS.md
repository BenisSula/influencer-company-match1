# 🔐 Admin Dashboard Credentials

## Super Admin Account

**Access URL:** http://localhost:5173/admin/login

**Credentials:**
- **Email:** admin@example.com
- **Password:** Admin123!
- **Role:** SUPER_ADMIN

---

## ⚠️ Important Security Notes

1. **Change Password Immediately:** After first login, change your password to something secure
2. **Don't Share Credentials:** Keep these credentials private
3. **Production Setup:** For production, use strong passwords and enable MFA

---

## 🎯 What You Can Do

As a Super Admin, you have full access to:

✅ **User Management**
- View all users (influencers and companies)
- Edit user profiles
- Ban/unban users
- Delete users
- Export user data

✅ **Tenant Management** (Multi-tenant features)
- Create new tenants
- Manage subscriptions
- Configure branding
- Set feature flags

✅ **Payment Management**
- View all payments
- Track subscriptions
- Generate invoices
- Handle refunds

✅ **Audit Logs**
- View all admin actions
- Track user activities
- Monitor system changes

✅ **Analytics**
- Platform-wide statistics
- User growth metrics
- Revenue tracking

---

## 📚 Reference Documents

For detailed information, see:
- [WHITE-LABEL-ADMIN-DASHBOARD-MASTER-PLAN.md](./WHITE-LABEL-ADMIN-DASHBOARD-MASTER-PLAN.md) - Complete implementation guide
- [ADMIN-DASHBOARD-SETUP-COMPLETE-GUIDE.md](./ADMIN-DASHBOARD-SETUP-COMPLETE-GUIDE.md) - Setup instructions
- [ADMIN-DASHBOARD-QUICK-START.md](./ADMIN-DASHBOARD-QUICK-START.md) - Quick reference

---

## 🔄 Reset Admin Password

If you need to reset the admin password, run:

```bash
cd backend
node create-super-admin.js
```

This will update the existing admin user with the default password.
