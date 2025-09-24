# 🚀 COMPLETE DEPLOYMENT GUIDE FOR PROMPT DETECTIVE V2

## 📋 Overview
We'll deploy using:
- **Backend + Database**: Railway (Free tier with PostgreSQL)
- **Frontend**: Vercel (Free tier)
- **File Storage**: Cloudinary (Free tier - 25GB storage, 25GB bandwidth)

---

## 🎯 STEP 1: Setup Cloudinary (File Storage)

### 1.1 Create Cloudinary Account
1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email
3. Verify your email address

### 1.2 Get Credentials
1. After login, go to Dashboard
2. Copy these values:
   - **Cloud Name** (e.g., `df1a2b3c4`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

---

## 🎯 STEP 2: Deploy Backend on Railway

### 2.1 Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign in with GitHub
4. Authorize Railway to access your repositories

### 2.2 Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository: `okaditya84/Prompt-Detective`
3. Railway will auto-detect your project
4. Select the root directory (it should detect the Dockerfile)

### 2.3 Add Environment Variables
1. In Railway dashboard, click on your project
2. Go to "Variables" tab
3. Add these environment variables one by one:

```env
SECRET_KEY=your-super-secret-key-make-this-very-long-and-random-12345678901234567890
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

### 2.4 Add Database (PostgreSQL)
1. In Railway dashboard, click "Add Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the DATABASE_URL from the database service
5. Add it as environment variable:
   ```env
   DATABASE_URL=postgresql://postgres:password@host:5432/railway
   ```

### 2.5 Add Redis
1. In Railway dashboard, click "Add Service"
2. Select "Database" → "Redis"
3. Copy the REDIS_URL from the Redis service
4. Add it as environment variable:
   ```env
   REDIS_URL=redis://user:password@host:6379
   ```

### 2.6 Configure CORS
1. After deployment, Railway will give you a domain like: `https://your-app-name.railway.app`
2. Add this to environment variables:
   ```env
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-app-name.railway.app
   ```

---

## 🎯 STEP 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.2 Deploy Frontend
1. Click "New Project"
2. Import your repository: `okaditya84/Prompt-Detective`
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `prompt-detective-v2/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Add Environment Variables
1. In project settings, go to "Environment Variables"
2. Add these variables:
   ```env
   VITE_API_URL=https://your-backend-domain.railway.app/api/v1
   VITE_APP_TITLE=Prompt Detective
   VITE_DEV_MODE=false
   VITE_ENABLE_DEVTOOLS=false
   ```

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a domain like: `https://your-app-name.vercel.app`

---

## 🎯 STEP 4: Update CORS Settings

### 4.1 Update Backend CORS
1. Go back to Railway dashboard
2. Update the `ALLOWED_ORIGINS` environment variable:
   ```env
   ALLOWED_ORIGINS=https://your-actual-frontend-domain.vercel.app
   ```
2. Save and redeploy

---

## 🎯 STEP 5: Test Your Deployment

### 5.1 Test Backend
1. Visit: `https://your-backend-domain.railway.app/health`
2. You should see: `{"status": "healthy", "version": "2.0.0"}`

### 5.2 Test Frontend
1. Visit: `https://your-frontend-domain.vercel.app`
2. Try signing up and logging in
3. Try uploading a file

---

## 🔧 STEP 6: Final Configuration

### 6.1 Custom Domain (Optional)
**For Frontend (Vercel):**
1. Go to Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**For Backend (Railway):**
1. Go to Railway dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 6.2 SSL Certificates
- Both Vercel and Railway automatically provide SSL certificates
- No additional configuration needed

---

## 📊 STEP 7: Monitoring & Maintenance

### 7.1 Railway Monitoring
- Check logs in Railway dashboard
- Monitor database usage
- Set up alerts for errors

### 7.2 Vercel Monitoring
- Check function logs
- Monitor build status
- Set up alerts for deployment failures

### 7.3 Cloudinary Monitoring
- Check usage statistics
- Monitor storage and bandwidth
- Set up usage alerts

---

## 🚨 TROUBLESHOOTING

### Common Issues:

1. **CORS Errors**
   - Check ALLOWED_ORIGINS in backend
   - Ensure frontend domain is correctly added

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if database service is running

3. **File Upload Issues**
   - Verify Cloudinary credentials
   - Check API limits

4. **Build Failures**
   - Check logs in Railway/Vercel
   - Verify all dependencies are in requirements.txt

---

## 💰 COST BREAKDOWN (All FREE tiers)

- **Railway**: Free tier (512MB RAM, $5 credit/month)
- **Vercel**: Free tier (100GB bandwidth, unlimited sites)
- **Cloudinary**: Free tier (25GB storage, 25GB bandwidth)
- **PostgreSQL**: Included with Railway
- **Redis**: Included with Railway

**Total Monthly Cost: $0** (within free tier limits)

---

## 🎉 COMPLETION CHECKLIST

- [ ] Cloudinary account created and credentials obtained
- [ ] Railway project deployed with PostgreSQL and Redis
- [ ] All environment variables set in Railway
- [ ] Vercel project deployed and configured
- [ ] Frontend environment variables set
- [ ] CORS properly configured
- [ ] File upload and analysis working
- [ ] User authentication working
- [ ] SSL certificates active

**Your Prompt Detective v2 is now live! 🚀**