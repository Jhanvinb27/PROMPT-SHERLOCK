# 🚀 Brevo Email Setup Guide (Completely FREE Solution)

## ✅ Why Brevo?

- **FREE 300 emails/day** (vs Resend 100/day)
- **NO domain verification required** (works with gmail, yahoo, any email)
- **Works on Render free tier** (uses HTTPS API, no port blocking)
- **No credit card needed** for free tier
- **More reliable** than SMTP on free hosting

---

## 📋 Step-by-Step Setup (5 minutes)

### 1️⃣ Create Brevo Account (FREE)

1. Go to **https://app.brevo.com/account/register**
2. Sign up with your email (can use `tryreverseai@gmail.com`)
3. Verify your email address
4. Complete the quick onboarding (select "Transactional" as use case)

### 2️⃣ Get Your API Key

1. After login, go to **Settings** (top right corner)
2. Click **SMTP & API** in the left sidebar
3. Click on **API Keys** tab
4. Click **"Create a new API key"** button
5. Give it a name like `Prompt Detective Production`
6. **Copy the API key** - it looks like: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **Save this immediately** - you can only see it once!

### 3️⃣ Verify Sender Email (IMPORTANT)

Brevo requires verifying any email you want to send FROM:

1. In Brevo dashboard, go to **Senders, Domains & Dedicated IPs**
2. Click **"Add a sender"**
3. Enter your email: `tryreverseai@gmail.com`
4. Enter your name: `Reverse AI`
5. Click **"Add sender"**
6. **Check your Gmail inbox** for verification email from Brevo
7. Click the verification link
8. ✅ Sender verified!

### 4️⃣ Add API Key to Render

1. Go to your Render dashboard: **https://dashboard.render.com**
2. Click on your backend service (`prompt-detective-backend`)
3. Click **"Environment"** in the left sidebar
4. Click **"Add Environment Variable"**
5. Set:
   - **Key**: `BREVO_API_KEY`
   - **Value**: `xkeysib-your-actual-api-key-here` (paste the key from step 2)
6. Click **"Save Changes"**
7. Render will automatically redeploy your app

---

## 🧪 Testing Email Functionality

### After deployment completes:

1. **Go to your production site**: https://prompt-detective.vercel.app
2. **Try signing up** with a new email
3. **Check email logs** in Render:
   - Go to Render dashboard → Your service → Logs
   - Look for: `✅ Email sent via Brevo to user@example.com`
   - Should see Brevo message ID in logs

### Expected Success Messages:
```
📧 Attempting to send email via Brevo to user@example.com
✅ Email sent via Brevo to user@example.com (ID: <xxxxxxxx@brevo.com>)
```

### If Email Doesn't Arrive:
1. **Check spam folder** (Brevo emails sometimes land in spam initially)
2. **Verify sender email** was completed (step 3 above)
3. **Check Render logs** for error messages
4. **Check Brevo dashboard** → Email → Statistics to see if email was sent

---

## 📊 Brevo Free Tier Limits

- ✅ **300 emails per day** (plenty for your app)
- ✅ Unlimited contacts
- ✅ Transactional emails
- ✅ No credit card required
- ✅ No expiration

---

## 🔍 Monitoring Email Usage

1. Go to Brevo dashboard: **https://app.brevo.com**
2. Click **Email** → **Statistics**
3. View:
   - Emails sent today
   - Delivery rate
   - Opens/clicks (if tracking enabled)

---

## 🆘 Troubleshooting

### "API key is invalid"
- Make sure you copied the complete API key from Brevo
- API keys start with `xkeysib-`
- Check for extra spaces when pasting into Render

### "Sender email not verified"
- Complete step 3 (verify sender email)
- Check tryreverseai@gmail.com inbox for verification email
- Click the verification link from Brevo

### "Failed to send email via Brevo"
- Check Render logs for specific error message
- Verify `BREVO_API_KEY` environment variable is set in Render
- Make sure Render redeployed after adding the env variable

### Still getting SMTP errors?
- SMTP is the fallback (3rd priority)
- If you see SMTP errors but Brevo is configured, it means Brevo succeeded but logs still show SMTP attempt
- Check for `✅ Email sent via Brevo` message earlier in logs

---

## 📝 Current Configuration

Your `email_service.py` now tries methods in this order:

1. **Brevo API** (if `BREVO_API_KEY` is set) ⭐ RECOMMENDED
2. **Resend API** (if `RESEND_API_KEY` is set) - requires domain
3. **SMTP** (if `SMTP_PASSWORD` is set) - blocked on Render free tier

**Just set `BREVO_API_KEY` in Render and you're done!**

---

## ✨ Why This Solution is Perfect for You

✅ **Completely FREE** - No credit card, no trial expiration  
✅ **No domain needed** - Works with gmail.com sender  
✅ **Works on Render** - Uses HTTPS, no port blocking  
✅ **300 emails/day** - More than enough for your app  
✅ **Professional** - Better deliverability than SMTP  
✅ **Easy setup** - 5 minutes total  

---

## 📞 Support

- **Brevo Help**: https://help.brevo.com
- **Your app logs**: Check Render dashboard → Logs
- **Test emails**: Try signup/password reset on production site

---

**Created:** 2025-01-16  
**Status:** ✅ Code updated, ready for API key configuration
