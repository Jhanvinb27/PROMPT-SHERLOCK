# 🚨 COMPLETE FIX: Email Not Working + Database Reset

## 🔍 Current Status Check

### ✅ What's Already Fixed:
1. Frontend files use correct `VITE_API_URL` ✓
2. Backend has enhanced error logging ✓
3. `.env.production` has SMTP settings ✓

### ❓ What to Verify:
1. Are the frontend changes deployed to Vercel?
2. Are Vercel environment variables set correctly?
3. Are Render environment variables set correctly?
4. Is the backend redeployed with latest code?

---

## 🎯 PART 1: Fix Email Issues

### Step 1: Verify Vercel Environment Variables

**CRITICAL**: Vercel needs the environment variable set in the dashboard!

1. Go to: https://vercel.com/dashboard
2. Select project: **prompt-detective**
3. Go to: **Settings** → **Environment Variables**
4. **Check if `VITE_API_URL` exists**:
   - If **YES**: Verify value is `https://prompt-detective-backend.onrender.com/api/v1`
   - If **NO**: Add it now!

**To Add/Update:**
```
Variable Name: VITE_API_URL
Value: https://prompt-detective-backend.onrender.com/api/v1
Environment: Production
```

5. Click **Save**
6. **CRITICAL**: Redeploy the frontend!

### Step 2: Trigger Vercel Redeploy

**Option A: Via Dashboard**
1. Go to Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Find the latest deployment
4. Click **⋯** (three dots) → **Redeploy**
5. Check **"Use existing Build Cache"** = OFF
6. Click **Redeploy**

**Option B: Via Git Push (Recommended)**
```bash
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2"

# Make a small change to trigger deployment
echo "# Build: $(date)" >> frontend/README.md

git add .
git commit -m "Trigger Vercel redeploy with correct env vars"
git push origin main
```

### Step 3: Verify Render Environment Variables

1. Go to: https://dashboard.render.com/
2. Select your backend service: **prompt-detective-backend**
3. Click **Environment** tab
4. **Verify ALL these variables exist:**

```bash
# Email Settings (ALL 8 REQUIRED!)
EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tryreverseai@gmail.com
SMTP_PASSWORD=pcxwmethpzntypmc
SMTP_USE_TLS=true
EMAIL_FROM_ADDRESS=tryreverseai@gmail.com
EMAIL_FROM_NAME=Reverse AI

# Also verify:
DATABASE_URL=postgresql://...
FRONTEND_URL=https://prompt-detective.vercel.app
ALLOWED_ORIGINS=https://prompt-detective.vercel.app
```

**IMPORTANT**: The `SMTP_PASSWORD` should be the App Password from Gmail. Render might need it **without spaces**.

5. If any are missing, add them now
6. Click **Save Changes**
7. Render will auto-redeploy

### Step 4: Test SMTP Password Format

Gmail App Passwords can work **with or without spaces**, but some systems are picky. Try both:

**Current (with spaces):**
```
SMTP_PASSWORD=pcxw meth pznt ypmc
```

**Alternative (without spaces):**
```
SMTP_PASSWORD=pcxwmethpzntypmc
```

If emails still don't work, try changing to the version **without spaces** in Render.

### Step 5: Check Deployment Status

**Vercel:**
1. Go to Vercel Dashboard
2. Check **Deployments** - should show "Building" or "Ready"
3. Wait for "Ready" status
4. Click on deployment → Check build logs for errors

**Render:**
1. Go to Render Dashboard
2. Check your backend service
3. Look at **Logs** tab
4. Should see: "Application startup complete"

### Step 6: Test Email Functionality

1. **Open Browser DevTools** (F12)
2. Go to **Network** tab
3. Clear network log
4. Go to: https://prompt-detective.vercel.app/forgot-password
5. Enter email and submit

**What to Look For:**

✅ **Success Indicators:**
```
Request URL: https://prompt-detective-backend.onrender.com/api/v1/auth/password-reset/request
Status: 200 OK
Response: {"message": "If email exists, reset OTP has been sent"}
```

❌ **Failure Indicators:**
```
Request URL: http://localhost:8000/... (WRONG!)
Status: Failed (CORS error)
OR
Status: 500 (Backend error - check Render logs)
```

### Step 7: Check Render Logs for SMTP Errors

1. Go to Render Dashboard → Your Service → **Logs**
2. Look for recent entries after testing
3. Look for:

✅ **Success:**
```
POST /api/v1/auth/password-reset/request
✅ Email sent via SMTP to user@example.com
```

❌ **SMTP Errors:**
```
❌ SMTP send failed for user@example.com: ...
SMTP Authentication failed
OR
SMTP Config: host=smtp.gmail.com, port=587, username=tryreverseai@gmail.com
```

---

## 🗑️ PART 2: Reset Production Database

### ⚠️ WARNING: This Deletes ALL Data!

**What This Does:**
- ✅ Deletes all users
- ✅ Deletes all OTP codes
- ✅ Deletes all analysis history
- ✅ Creates fresh empty tables
- ✅ Allows reusing emails that were previously registered

### Method 1: Using Python Script (Recommended)

**Step 1: Set Production Database URL Locally**

```bash
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\backend"

# Set environment variable (PowerShell)
$env:DATABASE_URL="postgresql://prompt_detective_db_user:OyjxQv0T17529VGPU0MiltopkmWUVb6Y@dpg-d39se06mcj7s739jud1g-a.singapore-postgres.render.com/prompt_detective_db"
```

**Step 2: Run Reset Script**

```bash
python reset_production_database.py
```

**Step 3: Confirm**

When prompted, type exactly: `DELETE ALL DATA`

**Output:**
```
🗑️  Database Reset Script
============================================================

⚠️  WARNING: This will DELETE ALL DATA in the database!
Database: postgresql://prompt_detective_db_user:...

⚠️  This is a PRODUCTION database. Type 'DELETE ALL DATA' to confirm: DELETE ALL DATA

🔧 Starting database reset...

📋 Found 3 existing tables:
  - users
  - otp_codes
  - analyses

🗑️  Dropping all tables...
✅ All tables dropped successfully

🏗️  Creating fresh tables...
✅ All tables created successfully

📋 Created 3 fresh tables:
  - users
  - otp_codes
  - analyses

✅ Database reset complete!

📊 Fresh database ready for use:
  - All old users deleted
  - All old OTP codes deleted
  - All old analyses deleted
  - Ready for new signups
```

### Method 2: Using Render Dashboard (Alternative)

**If you have Render Pro plan with Shell access:**

1. Go to Render Dashboard → Your Service
2. Click **Shell** tab
3. Run:
```bash
python reset_production_database.py
```

**If you're on Free Tier (No Shell):**
- Use Method 1 (run locally with production DATABASE_URL)

### Method 3: Manual SQL (Advanced)

**Only if Python script doesn't work:**

1. Install PostgreSQL client locally or use online SQL tool
2. Connect to database:
```
Host: dpg-d39se06mcj7s739jud1g-a.singapore-postgres.render.com
Database: prompt_detective_db
User: prompt_detective_db_user
Password: OyjxQv0T17529VGPU0MiltopkmWUVb6Y
Port: 5432
```

3. Run SQL:
```sql
-- Drop all tables
DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    username VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    api_calls_used INTEGER DEFAULT 0,
    api_calls_limit INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate otp_codes table
CREATE TABLE otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    otp_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate analyses table
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_url VARCHAR(500),
    result_data TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
```

---

## 🧪 Complete Testing Procedure

### After Environment Variables are Set & Redeployed:

### Test 1: Password Reset Flow
1. Open browser DevTools (F12) → Network tab
2. Go to: https://prompt-detective.vercel.app/forgot-password
3. Enter: `test@example.com`
4. Click "Send Reset Code"

**Expected Network Request:**
```
URL: https://prompt-detective-backend.onrender.com/api/v1/auth/password-reset/request
Method: POST
Status: 200 OK
```

**Expected Render Logs:**
```
POST /api/v1/auth/password-reset/request
✅ Email sent via SMTP to test@example.com
```

**Expected Email:**
- Received within 30 seconds
- Subject: "🔐 Reset Your Prompt Detective Password"
- Contains 6-digit OTP code

### Test 2: Signup Flow
1. Go to: https://prompt-detective.vercel.app/signup
2. Fill in details with fresh email (or email from reset DB)
3. Click "Sign Up"

**Expected:**
- Redirected to email verification page
- Network request to production backend (not localhost)
- OTP email received
- Render logs show email sent

### Test 3: Email Verification
1. Enter OTP from email
2. Should verify successfully
3. Should receive welcome email
4. Redirected to dashboard

---

## 🔧 Debugging Checklist

If emails still don't work, check in order:

### 1. Frontend Environment
- [ ] Vercel has `VITE_API_URL` set
- [ ] Value is correct: `https://prompt-detective-backend.onrender.com/api/v1`
- [ ] Frontend redeployed after adding env var
- [ ] Browser Network tab shows requests to production backend (not localhost)

### 2. Backend Environment
- [ ] Render has all 8 SMTP variables
- [ ] `SMTP_PASSWORD` is set (try with and without spaces)
- [ ] `SMTP_USERNAME` is `tryreverseai@gmail.com`
- [ ] Backend redeployed after adding env vars

### 3. Gmail Account
- [ ] 2-Step Verification enabled
- [ ] App Password generated
- [ ] App Password copied correctly (16 characters)
- [ ] Account not locked or suspicious activity flagged

### 4. Network/CORS
- [ ] `ALLOWED_ORIGINS` includes `https://prompt-detective.vercel.app`
- [ ] No CORS errors in browser console
- [ ] Requests reaching backend (check Render logs)

### 5. SMTP Configuration
- [ ] Port 587 (not 465 or 25)
- [ ] `SMTP_USE_TLS=true`
- [ ] Host is `smtp.gmail.com`
- [ ] Render logs show SMTP connection attempts

---

## 🎯 Quick Fix Commands

### Redeploy Everything:
```bash
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2"

# Trigger both deployments
echo "# Redeploy $(date)" >> README.md
git add .
git commit -m "Trigger redeploy - Fix email issues"
git push origin main
```

### Reset Production Database:
```bash
cd backend
$env:DATABASE_URL="postgresql://prompt_detective_db_user:OyjxQv0T17529VGPU0MiltopkmWUVb6Y@dpg-d39se06mcj7s739jud1g-a.singapore-postgres.render.com/prompt_detective_db"
python reset_production_database.py
```

### Check Logs:
```bash
# Vercel: Dashboard → Deployments → Click latest → View Function Logs
# Render: Dashboard → Your Service → Logs tab
```

---

## 📊 Success Criteria

### Email Working:
- ✅ OTP email received within 30 seconds
- ✅ Network requests go to production backend
- ✅ Render logs show "Email sent via SMTP"
- ✅ No CORS errors in browser console

### Database Reset:
- ✅ Can signup with previously used emails
- ✅ Old users no longer exist
- ✅ Fresh OTP codes work
- ✅ No database errors in Render logs

---

## 🆘 If Still Not Working

### Get Detailed Logs:

**From Browser:**
1. F12 → Console tab
2. Copy any error messages
3. F12 → Network tab → Click failed request → Copy response

**From Render:**
1. Dashboard → Logs
2. Copy last 50 lines including any errors
3. Look for "SMTP" or "Email" or "Error"

**From Vercel:**
1. Dashboard → Deployments → Latest
2. Click "View Function Logs"
3. Look for build errors or runtime errors

### Common Issues & Solutions:

**Issue**: Requests go to localhost
**Solution**: Vercel env var not set or frontend not redeployed

**Issue**: 500 error on backend
**Solution**: Check Render logs for SMTP error, verify SMTP_PASSWORD

**Issue**: No logs on Render
**Solution**: Request not reaching backend, check CORS/network in browser

**Issue**: SMTP Authentication Failed
**Solution**: Try SMTP_PASSWORD without spaces, verify App Password

**Issue**: Database reset fails
**Solution**: Check DATABASE_URL is correct, verify PostgreSQL connection

---

**Created**: January 2025  
**Priority**: CRITICAL  
**Status**: Ready to Execute  
