# 🔐 Super Admin System - Complete Guide

## Overview
The platform now has a comprehensive admin system with a super admin account that has **unlimited power** and access to all features.

---

## 🎯 Super Admin Account

### Credentials
- **Email:** `tryreverseai@gmail.com`
- **Default Password:** `Admin@123456`
- ⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

### Login URL
- **Production:** https://prompt-detective.vercel.app
- **Local:** http://localhost:3000

---

## 🚀 Super Admin Capabilities

### Unlimited Access
✅ **Unlimited API calls** - No rate limiting (api_calls_limit set to -1)  
✅ **All free features** - Complete access to basic tier  
✅ **All paid/premium features** - Full pro and enterprise access  
✅ **All subscription tiers** - Can test free, pro, and enterprise features  
✅ **No usage restrictions** - Bypass all limits  

### Admin Powers
✅ **View all users** - Complete user database access  
✅ **Manage users** - Update, activate, deactivate, delete users  
✅ **Toggle features** - Enable/disable premium for any user  
✅ **Reset usage** - Reset API call counters for users  
✅ **View analytics** - Platform-wide metrics and statistics  
✅ **Create users** - Admin-created users (pre-verified)  
✅ **Change subscriptions** - Modify any user's subscription tier  
✅ **Set limits** - Adjust API limits for any user  

---

## 📊 Admin API Endpoints

### Base URL
All admin endpoints are under `/api/v1/admin`

### Authentication
All endpoints require admin JWT token in Authorization header:
```
Authorization: Bearer <admin_jwt_token>
```

### Endpoints

#### 1. Dashboard Statistics
```http
GET /api/v1/admin/dashboard
```

**Response:**
```json
{
  "total_users": 150,
  "active_users": 120,
  "verified_users": 100,
  "premium_users": 25,
  "total_analyses": 5000,
  "analyses_today": 150,
  "total_api_calls": 12500,
  "subscription_breakdown": {
    "free": 100,
    "pro": 40,
    "enterprise": 10
  }
}
```

#### 2. List All Users
```http
GET /api/v1/admin/users?skip=0&limit=50&search=email
```

**Query Parameters:**
- `skip`: Number of records to skip (pagination)
- `limit`: Max records to return (1-500)
- `search`: Search by email, name, or username

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "username": "johndoe",
    "subscription_tier": "pro",
    "is_active": true,
    "is_premium": true,
    "is_email_verified": true,
    "is_admin": false,
    "is_super_admin": false,
    "api_calls_used": 50,
    "api_calls_limit": 1000,
    "created_at": "2025-01-01T00:00:00Z",
    "total_analyses": 25
  }
]
```

#### 3. Update User
```http
PUT /api/v1/admin/users/{user_id}
```

**Request Body:**
```json
{
  "is_active": true,
  "is_premium": true,
  "subscription_tier": "enterprise",
  "api_calls_limit": 5000
}
```

**Requires:** Super Admin access

#### 4. Toggle Premium Status
```http
POST /api/v1/admin/users/{user_id}/toggle-premium
```

**Response:**
```json
{
  "is_premium": true
}
```

**Use Case:** Quick testing of premium features for a user

#### 5. Reset User Usage
```http
POST /api/v1/admin/users/{user_id}/reset-usage
```

**Response:**
```json
{
  "message": "Usage reset successfully"
}
```

**Use Case:** Reset monthly API call counter for a user

---

## 🔧 Testing Features as Admin

### Testing Free Features
The super admin can test free features by:
1. Login with super admin account
2. Access any free feature
3. Features work with unlimited calls

### Testing Paid Features
Admin has **all premium features enabled** by default:
- `is_premium`: `true`
- `subscription_tier`: `enterprise`
- Can test pro and enterprise features without limits

### Toggle Testing Mode
To test how non-premium users see the app:
1. Use admin API to toggle your own premium status
2. Frontend will reflect non-premium UI
3. Toggle back to premium when done

**Example:**
```bash
POST /api/v1/admin/users/6/toggle-premium
# Toggles admin's own premium status
```

---

## 🛠️ Admin Dashboard Features

### Current Implementation
✅ Dashboard statistics endpoint  
✅ User list with search and filters  
✅ User detail view  
✅ Update user properties  
✅ Toggle premium status  
✅ Reset usage counters  

### Recommended Frontend (To Be Built)
Create a React admin dashboard at `/admin` route with:

1. **Dashboard Page**
   - Total users card
   - Active users card
   - API calls today card
   - Analyses today card
   - Subscription breakdown chart
   - User growth graph

2. **Users Management Page**
   - Searchable table of all users
   - Filter by: subscription, active status, verified status
   - Actions: Edit, Toggle Premium, Reset Usage, Delete
   - Click row to view user details

3. **User Detail Modal/Page**
   - Full user information
   - Usage statistics
   - Analysis history
   - Action buttons (edit, toggle, reset, delete)

4. **Analytics Page**
   - Platform metrics
   - Usage trends
   - Popular features
   - Performance stats

5. **Settings Page**
   - Admin account settings
   - System configuration
   - Feature flags

---

## 🔐 Security Features

### Admin Middleware
```python
from app.core.admin import get_current_admin, get_current_super_admin

# Requires any admin
@router.get("/endpoint")
async def endpoint(admin: User = Depends(get_current_admin)):
    pass

# Requires super admin only
@router.put("/critical-endpoint")
async def critical(admin: User = Depends(get_current_super_admin)):
    pass
```

### Permission Checks
```python
from app.core.admin import check_feature_access, can_bypass_rate_limit

# Check if user has feature access
if check_feature_access(user, "premium"):
    # Grant access to premium feature
    pass

# Check if user can bypass rate limits
if can_bypass_rate_limit(user):
    # Skip rate limit check
    pass
```

### Unlimited Access Check
```python
from app.core.admin import check_unlimited_access

if check_unlimited_access(user):
    # User has unlimited access
    # api_calls_limit is -1 or user is admin
    pass
```

---

## 📝 Database Schema Changes

### Added Fields to `users` Table
```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
```

### Super Admin User Record
```sql
SELECT * FROM users WHERE email = 'tryreverseai@gmail.com';

-- Result:
id: 6
email: tryreverseai@gmail.com
is_admin: TRUE
is_super_admin: TRUE
is_premium: TRUE
subscription_tier: enterprise
api_calls_limit: -1 (unlimited)
is_email_verified: TRUE
is_active: TRUE
```

---

## 🚀 Deployment

### Production Setup (Already Done)
✅ Migration ran successfully  
✅ Admin fields added to database  
✅ Super admin account created  
✅ Backend deployed on Render  

### Local Setup
To set up locally:

```bash
# 1. Run migration
cd backend
python migrations/add_admin_fields.py

# 2. Create super admin
python create_super_admin.py

# 3. Start backend
uvicorn app.main:app --reload

# 4. Login with admin credentials
# Email: tryreverseai@gmail.com
# Password: Admin@123456
```

---

## 🧪 Testing the Admin System

### 1. Test Admin Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tryreverseai@gmail.com",
    "password": "Admin@123456"
  }'
```

### 2. Test Dashboard Access
```bash
curl -X GET http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Test User Management
```bash
# List users
curl -X GET "http://localhost:8000/api/v1/admin/users?limit=10" \
  -H "Authorization: Bearer <admin_token>"

# Toggle premium for user ID 1
curl -X POST http://localhost:8000/api/v1/admin/users/1/toggle-premium \
  -H "Authorization: Bearer <admin_token>"
```

---

## 📋 Feature Checklist

### Backend (✅ Complete)
- [x] User model with admin fields
- [x] Admin middleware and authorization
- [x] Admin API endpoints
- [x] Dashboard statistics
- [x] User management CRUD
- [x] Toggle premium/reset usage
- [x] Super admin account creation
- [x] Database migration
- [x] Unlimited API calls for admin
- [x] Feature access control
- [x] Rate limit bypass for admin

### Frontend (⏳ Pending)
- [ ] Admin dashboard page
- [ ] Users management table
- [ ] User detail modal
- [ ] Analytics visualization
- [ ] Admin navigation menu
- [ ] Protected admin routes
- [ ] Admin-only components

---

## 🎯 Next Steps

1. **Change Default Password**
   - Login with default password
   - Go to profile settings
   - Change to secure password

2. **Test All Features**
   - Login as super admin
   - Test free features (unlimited)
   - Test premium features (all enabled)
   - Test admin dashboard API

3. **Build Frontend Admin Dashboard** (Optional)
   - Create `/admin` route
   - Build dashboard components
   - Add user management UI
   - Add analytics visualizations

4. **Configure Additional Admins** (Optional)
   - Use super admin API to promote users
   - Set `is_admin: true` for regular admins
   - Keep `is_super_admin: true` only for tryreverseai@gmail.com

---

## 🆘 Troubleshooting

### Cannot Login as Admin
- Check email is exactly: `tryreverseai@gmail.com`
- Check password is: `Admin@123456`
- Verify user exists in database
- Check `is_super_admin` field is TRUE

### Admin API Returns 403 Forbidden
- Check JWT token is valid and not expired
- Check Authorization header format
- Verify user has `is_admin` or `is_super_admin` set to TRUE

### Unlimited Calls Not Working
- Check `api_calls_limit` is set to -1
- Verify rate limit middleware checks for admin status
- Check `check_unlimited_access()` function is used

---

**Created:** 2025-10-13  
**Super Admin Email:** tryreverseai@gmail.com  
**Status:** ✅ Production Ready  
**Backend:** ✅ Deployed  
**Frontend:** ⏳ Admin UI pending
