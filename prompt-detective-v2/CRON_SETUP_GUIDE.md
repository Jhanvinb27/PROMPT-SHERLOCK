# Cron Job Setup for Render Free Tier

This guide will help you set up external cron jobs to keep your Render backend alive.

## Quick Setup (cron-job.org) - RECOMMENDED ⭐

**Total time: 3 minutes**

### Step 1: Sign Up
1. Go to https://cron-job.org/en/
2. Click "Sign up" (top right)
3. Use your email or Google account
4. Verify your email

### Step 2: Create Cron Job
1. After logging in, click "Create cronjob"
2. Fill in the form:

```
Title: Prompt Detective Backend Keep-Alive
Address: https://prompt-detective-backend.onrender.com/health
Schedule: 
  ✓ Every 14 minutes
  (Select "Advanced" and enter: */14 * * * *)
Execution: 
  Enabled: ✓ Yes
  Save responses: □ No (optional, saves quota)
Notifications:
  ✓ Notify on failure
  Email: your-email@example.com
```

3. Click "Create cronjob"
4. Done! ✅

### What Happens:
- Service pings your backend every 14 minutes
- Prevents Render from spinning down (15min idle timeout)
- You get email if backend doesn't respond
- 100% free, no credit card needed

## Alternative: UptimeRobot

### Step 1: Sign Up
1. Go to https://uptimerobot.com
2. Sign up (free account - no credit card)

### Step 2: Add Monitor
1. Click "Add New Monitor"
2. Settings:
```
Monitor Type: HTTP(s)
Friendly Name: Prompt Detective Backend
URL: https://prompt-detective-backend.onrender.com/health
Monitoring Interval: 5 minutes (minimum on free tier)
Alert Contacts: Add your email
```

3. Click "Create Monitor"

### Benefits:
- Also monitors uptime
- Sends alerts if backend is down
- Provides uptime statistics
- Free tier: 50 monitors, 5min interval

## Alternative: GitHub Actions (For Developers)

Already set up in `.github/workflows/keep-alive.yml`!

### To Use:
1. Make sure the workflow file exists (already created)
2. Update backend URL in the file if different
3. Push to GitHub
4. Go to your repo → Actions tab
5. GitHub will run automatically every 14 minutes

### To Manually Trigger:
1. Go to repo → Actions
2. Select "Keep Backend Alive"
3. Click "Run workflow"

## Multiple Services Strategy (BEST) 🎯

For maximum reliability, use BOTH:

1. **cron-job.org** - Primary keep-alive (every 14min)
2. **UptimeRobot** - Backup + monitoring (every 5min)

This ensures:
- Backend gets pinged every 5 minutes
- You have monitoring AND keep-alive
- Redundancy if one service fails
- All FREE!

## Verify It's Working

### Check cron-job.org Dashboard:
- Green ✅ = successful pings
- Red ❌ = failed pings (backend might be down)
- See execution history

### Check UptimeRobot Dashboard:
- Shows uptime percentage
- Response times
- Downtime events

### Check Your Backend Logs (Render):
1. Go to Render Dashboard
2. Open your backend service
3. Click "Logs"
4. Should see GET /health requests every few minutes

## Troubleshooting

### "Cron job shows failures"
- Normal during first ping (backend waking up)
- Should succeed within 30-60 seconds
- If persistent: check Render service is running

### "Backend still spins down"
- Verify cron job is enabled (green toggle)
- Check cron job schedule (should be */14 * * * *)
- Ensure URL is correct
- Render free tier limits: 750 hours/month

### "Getting 404 errors"
- Verify `/health` endpoint exists in backend
- Check backend URL is correct
- Test manually: `curl https://your-backend.onrender.com/health`

## Cost Breakdown

| Service | Cost | Pings/Day | Notes |
|---------|------|-----------|-------|
| cron-job.org | FREE | 103 | Reliable, easy setup |
| UptimeRobot | FREE | 288 | Also monitors uptime |
| GitHub Actions | FREE | 103 | Good for devs |
| Frontend Keep-Alive | FREE | Varies | Only when users active |

**Total cost: $0** 💰

## Next Steps

1. ✅ Set up cron-job.org (3 minutes)
2. ✅ Optionally add UptimeRobot (2 minutes)
3. ✅ Deploy frontend with keep-alive service
4. ✅ Test by waiting 15+ minutes and accessing app
5. ✅ Monitor email for any alerts

## Support Links

- cron-job.org: https://cron-job.org/en/documentation/
- UptimeRobot: https://uptimerobot.com/faq
- Render Docs: https://render.com/docs/free
- Our Guide: See `FREE_TIER_SOLUTIONS.md`

---

**Pro Tip:** Bookmark your cron-job.org and UptimeRobot dashboards for easy monitoring!
