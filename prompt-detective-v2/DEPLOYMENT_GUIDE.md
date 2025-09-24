# 🚀 COMPLETE DEPLOYMENT GUIDE - LIFETIME FREE TIER

## 📋 Overview
We'll deploy using **LIFETIME FREE** services:
- **Backend + Database**: Render.com (Free forever with PostgreSQL)
- **Frontend**: Vercel (Free tier - no limits)
- **File Storage**: Cloudinary (Free - 25GB storage, 25GB bandwidth)

---

## 🎯 STEP 1: Setup Cloudinary (File Storage) - 5 minutes

### 1.1 Create Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email
3. Verify your email address

### 1.2 Get Credentials
1. After login, go to Dashboard
2. Copy these values (keep them handy):
   - **Cloud Name** (e.g., `df1a2b3c4`)
   - **API Key** (e.g., `123456789012345`)  
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

---

## 🎯 STEP 2: Deploy Backend on Render - 10 minutes

### 2.1 Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub: `okaditya84/Prompt-Detective`
3. Configure:
   - **Name**: `prompt-detective-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `prompt-detective-v2`

### 2.3 Add Environment Variables
1. In the deployment settings, add these environment variables:

```env
SECRET_KEY=your-super-secret-key-make-this-very-long-and-random-123456789012345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
REFRESH_TOKEN_EXPIRE_DAYS=30
GROQ_API_KEY=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
GROQ_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
DEBUG=false
ENVIRONMENT=production
RATE_LIMIT_PER_MINUTE=30
CLOUDINARY_CLOUD_NAME=your-cloud-name-from-step-1
CLOUDINARY_API_KEY=your-api-key-from-step-1
CLOUDINARY_API_SECRET=your-api-secret-from-step-1
```

### 2.4 Add PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `prompt-detective-db`
3. Plan: **Free** (stays free forever)
4. After creation, copy the **External Database URL**
5. Add it as environment variable in your web service:
   ```env
   DATABASE_URL=postgresql://user:password@hostname:port/database
   ```

---

## 🎯 STEP 3: Deploy Frontend on Vercel - 5 minutes

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import: `okaditya84/Prompt-Detective`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `prompt-detective-v2/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables
1. In project settings → Environment Variables:
   ```env
   VITE_API_URL=https://your-render-app.onrender.com/api/v1
   VITE_APP_TITLE=Prompt Detective
   VITE_DEV_MODE=false
   ```

Replace `your-render-app` with your actual Render app name.

---

## 🎯 STEP 4: Update CORS Settings - 2 minutes

### 4.1 Update Backend CORS
1. Go back to Render dashboard
2. Add/Update environment variable:
   ```env
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

Replace `your-vercel-app` with your actual Vercel domain.

---

## 🎯 STEP 5: Test Your Deployment - 5 minutes

### 5.1 Test Backend
1. Visit: `https://your-render-app.onrender.com/health`
2. Should show: `{"status": "healthy", "version": "2.0.0"}`

### 5.2 Test Frontend  
1. Visit: `https://your-vercel-app.vercel.app`
2. Try signing up and logging in
3. Try uploading a file and see analysis

---

## � STEP 6: Enable Custom Domains (Optional)

### 6.1 Frontend Domain (Vercel)
1. Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS as instructed

### 6.2 Backend Domain (Render)  
1. Render Dashboard → Service → Settings → Custom Domains
2. Add your custom domain
3. Update DNS as instructed

---

## 💰 LIFETIME FREE TIER LIMITS

### ✅ **Render.com (Backend + Database)**
- **FREE FOREVER**: 512 MB RAM, 0.1 CPU
- **PostgreSQL**: 1GB storage, 100 connections
- **Bandwidth**: 100 GB/month
- **Builds**: Unlimited
- **Sleep after 15min inactivity** (wakes up automatically)

### ✅ **Vercel (Frontend)**
- **FREE FOREVER**: 100GB bandwidth/month
- **Builds**: Unlimited
- **Custom domains**: Unlimited
- **SSL**: Automatic

### ✅ **Cloudinary (File Storage)**
- **FREE FOREVER**: 25GB storage
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **API calls**: 1,000,000/month

---

## 🚨 TROUBLESHOOTING GUIDE

### Issue 1: "Build Failed"
**Solution**: Check build logs in Render
- Verify all dependencies in requirements.txt
- Check Python version compatibility

### Issue 2: "Database Connection Error"
**Solution**: 
- Verify DATABASE_URL is correctly set
- Check PostgreSQL service is running
- Ensure database exists and is accessible

### Issue 3: "CORS Error" 
**Solution**:
- Check ALLOWED_ORIGINS includes your Vercel domain
- Ensure both HTTP and HTTPS are included
- Redeploy after changing CORS settings

### Issue 4: "File Upload Not Working"
**Solution**:
- Verify all 3 Cloudinary credentials are set
- Check Cloudinary dashboard for usage limits
- Ensure internet connectivity from Render

### Issue 5: "App Goes to Sleep"
**Solution** (Render free tier sleeps after 15min):
- Use a free uptime monitor like UptimeRobot
- Send a request every 14 minutes to keep it awake
- Or upgrade to paid tier for always-on

---

## ✅ FINAL CHECKLIST

- [ ] Cloudinary account created with credentials
- [ ] Render backend deployed with PostgreSQL
- [ ] All environment variables set correctly
- [ ] Vercel frontend deployed and configured
- [ ] CORS properly configured with actual domains
- [ ] Health check endpoint responding
- [ ] User registration/login working
- [ ] File upload and analysis working
- [ ] SSL certificates active (automatic)

## 🎊 **CONGRATULATIONS!** 

**Your Prompt Detective v2 is now LIVE on the internet with LIFETIME FREE hosting!**

### 📱 **Your Live URLs:**
- **App**: `https://your-app.vercel.app` 
- **API**: `https://your-backend.onrender.com`

**Total Monthly Cost: $0** 💰

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review logs in Render/Vercel dashboards  
3. Verify all environment variables are set
4. Test individual components (health check, database, file upload)

**You've successfully deployed a full-stack AI application for FREE! 🎉🚀**