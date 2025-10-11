# ⚡ Google OAuth Quick Setup - DO THIS NOW!

## 🎯 Your Immediate Next Steps (5 Minutes)

### Step 1: Configure Google Cloud Console (2 min)

1. **Go to**: https://console.cloud.google.com/apis/credentials

2. **Find your OAuth Client**: 
   - Client ID: `555256501823-0jeqapof1fouuf260au2j59ekgr1g2ln`

3. **Click EDIT** (pencil icon)

4. **Add Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://prompt-detective.vercel.app
   ```

5. **Add Authorized redirect URIs**:
   ```
   http://localhost:5173
   https://prompt-detective.vercel.app
   ```

6. **Click SAVE** ← Don't forget this!

---

### Step 2: Install Backend Dependencies (1 min)

```powershell
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\backend"
pip install -r requirements.txt
```

This installs:
- `google-auth`
- `google-auth-oauthlib`
- `google-auth-httplib2`

---

### Step 3: Test Locally (2 min)

#### Terminal 1 - Start Backend:
```powershell
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\backend"
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

#### Terminal 2 - Start Frontend:
```powershell
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\frontend"
npm run dev
```

#### Test:
1. Open: http://localhost:5173
2. Click "Login"
3. Click "Continue with Google"
4. Select your Google account
5. ✅ You should be redirected to dashboard!

---

## 🚀 Deploy to Production

### Update Render (Backend):
1. Go to Render Dashboard
2. Environment Variables → Add:
   ```
   GOOGLE_CLIENT_ID=555256501823-0jeqapof1fouuf260au2j59ekgr1g2ln.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   FRONTEND_URL=https://prompt-detective.vercel.app
   ```
3. Deploy

### Update Vercel (Frontend):
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   ```
   VITE_GOOGLE_CLIENT_ID=555256501823-0jeqapof1fouuf260au2j59ekgr1g2ln.apps.googleusercontent.com
   ```
3. Redeploy

---

## ✅ Quick Verification

After setup, verify:

### Backend is Ready:
```powershell
# Check if Google libraries installed
python -c "import google.oauth2; print('✅ Google OAuth ready')"
```

### Frontend is Ready:
```powershell
# Check env variable
cd frontend
echo $env:VITE_GOOGLE_CLIENT_ID
```

Should output: `555256501823-0jeqapof1fouuf260au2j59ekgr1g2ln.apps.googleusercontent.com`

---

## 🎯 What to Expect

### ✅ Success Looks Like:
- Click "Continue with Google"
- Google popup appears
- Select account
- Popup closes
- Instantly redirected to dashboard
- User name and email shown

### ❌ If It Fails:
1. Check Google Cloud Console URLs are saved
2. Check backend logs for errors
3. Check browser console for errors
4. See detailed troubleshooting in `GOOGLE_OAUTH_IMPLEMENTATION.md`

---

## 📋 Files You Need to Push

```bash
# After testing locally, commit and push:
cd "c:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2"
git add .
git commit -m "feat: implement Google OAuth 2.0 authentication"
git push
```

This will auto-deploy to Vercel and Render.

---

## 🎉 That's It!

You now have:
- ✅ Google Sign-In on Login page
- ✅ Google Sign-Up on Signup page  
- ✅ Works locally and in production
- ✅ Secure OAuth 2.0 flow
- ✅ Automatic user creation/update
- ✅ JWT token authentication

**Total implementation time**: ~5 minutes to test! 🚀

---

**CRITICAL**: Don't forget to SAVE in Google Cloud Console! 
Without it, you'll get "redirect_uri_mismatch" errors.
