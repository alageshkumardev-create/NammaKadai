# Vercel Deployment Guide
## RO Maintenance Server

**Last Updated**: December 5, 2024

---

## ✅ Files Created for Vercel

### 1. `vercel.json`
Configuration file that tells Vercel how to deploy your Node.js/Express app as a serverless function.

### 2. Modified `server.js`
- Exports the Express app for Vercel
- Conditionally starts server (only in local environment)
- Works both locally and on Vercel

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
cd "G:\Namma Kadai\server"
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to https://vercel.com/
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the `server` directory as root
5. Add environment variables (see below)
6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
cd "G:\Namma Kadai\server"
vercel
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app

# Optional (for notifications)
FAST2SMS_API_KEY=your_api_key
GMAIL_USER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
ADMIN_PHONE=+919876543210
ADMIN_EMAIL=admin@example.com
```

---

## ⚠️ Important Notes

### Cron Jobs Won't Work on Vercel

Vercel serverless functions are stateless and don't support cron jobs. The notification scheduler won't run automatically.

**Solutions**:

**Option 1: Use Vercel Cron (Recommended)**
Create `vercel.json` with cron configuration:

```json
{
  "crons": [{
    "path": "/api/notifications/trigger",
    "schedule": "0 8 * * *"
  }]
}
```

**Option 2: Use External Cron Service**
- Use services like cron-job.org or EasyCron
- Set up to call `https://your-api.vercel.app/api/notifications/trigger` daily at 8 AM

**Option 3: Deploy to Different Platform**
- Use Railway, Render, or Heroku for traditional server deployment
- These support long-running processes and cron jobs

### MongoDB Connection

- Use MongoDB Atlas (cloud database)
- Don't use local MongoDB
- Ensure IP whitelist includes `0.0.0.0/0` (allow all) in Atlas

### File Uploads

- Vercel has limited file storage
- Use Cloudinary or AWS S3 for image uploads
- The current upload route should work if configured properly

---

## 📋 Vercel Configuration Explained

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Explanation**:
- `builds`: Tells Vercel to build `server.js` as a Node.js serverless function
- `routes`: Routes all requests to `server.js`
- `env`: Sets environment to production

### Modified `server.js`

```javascript
// Only start server if not in Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
```

**Explanation**:
- Checks if running on Vercel (`VERCEL=1` is set automatically)
- If local: starts Express server normally
- If Vercel: exports app for serverless function
- Works in both environments!

---

## 🧪 Testing Deployment

### 1. Test Health Endpoint

```bash
curl https://your-api.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### 2. Test Authentication

```bash
curl -X POST https://your-api.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

### 3. Test Database Connection

Check Vercel logs for:
```
🔥 MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

## 🐛 Troubleshooting

### Error: "EADDRINUSE: address already in use"

**Cause**: Trying to listen on a port in serverless environment

**Fix**: ✅ Already fixed! The code now checks `process.env.VERCEL`

### Error: "Cannot find module"

**Cause**: Missing dependencies

**Fix**: Ensure `package.json` has all dependencies and run:
```bash
vercel --prod
```

### Error: "MongoDB connection timeout"

**Cause**: IP not whitelisted or wrong connection string

**Fix**:
1. Go to MongoDB Atlas
2. Network Access → Add IP Address → Allow from anywhere (`0.0.0.0/0`)
3. Verify `MONGODB_URI` in Vercel environment variables

### Cron job not running

**Cause**: Vercel doesn't support traditional cron jobs

**Fix**: Use Vercel Cron or external service (see above)

---

## 🎯 Alternative Deployment Options

If Vercel doesn't meet your needs (especially for cron jobs), consider:

### 1. Railway (Recommended for this app)
- ✅ Supports traditional servers
- ✅ Supports cron jobs
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- 🔗 https://railway.app/

### 2. Render
- ✅ Supports background workers
- ✅ Supports cron jobs
- ✅ Free tier
- 🔗 https://render.com/

### 3. Heroku
- ✅ Traditional platform
- ✅ Supports cron jobs (with scheduler add-on)
- ⚠️ No free tier anymore
- 🔗 https://heroku.com/

---

## ✅ Deployment Checklist

- [ ] Created `vercel.json`
- [ ] Modified `server.js` to export app
- [ ] Pushed to GitHub
- [ ] Created Vercel project
- [ ] Added environment variables
- [ ] Deployed successfully
- [ ] Tested health endpoint
- [ ] Tested authentication
- [ ] Verified MongoDB connection
- [ ] Set up cron alternative (if needed)
- [ ] Updated frontend API URL

---

## 🚀 Next Steps

1. **Deploy Frontend**: Deploy React app to Vercel
2. **Update API URL**: Set `VITE_API_URL` in frontend to your Vercel backend URL
3. **Test End-to-End**: Verify all features work with deployed backend
4. **Set up Monitoring**: Use Vercel Analytics or external monitoring
5. **Configure Custom Domain** (optional): Add custom domain in Vercel

---

**Your server is now ready for Vercel deployment!** 🎉
