# Railway 502 Error Troubleshooting

## Problem: 502 Bad Gateway Error

If you're seeing a 502 error when accessing your Railway URL, it typically means:

1. **Frontend service is not deployed** (most common)
2. Frontend service failed to build
3. Frontend service is not running/healthy
4. You're accessing the backend URL instead of frontend URL

## Quick Diagnosis

### Step 1: Check Your Railway Dashboard

1. Go to your Railway project dashboard
2. **Count your services** - you should see **3 services**:
   - ✅ PostgreSQL (Database)
   - ✅ Backend (Express API)
   - ❓ Frontend (React + Nginx) - **Check if this exists!**

### Step 2: Verify Service Status

For each service, check:
- **Status**: Should be "Active" or "Deployed"
- **Deployments**: Should have at least one successful deployment
- **Logs**: Click "View Logs" to see if there are errors

## Common Scenarios

### Scenario 1: Only Backend is Deployed

**Symptoms:**
- You see only 2 services (PostgreSQL + Backend)
- No frontend service exists
- Accessing the URL gives 502 error

**Solution: Deploy Frontend Service**

1. In Railway dashboard, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your `ai-stock-insights` repository again
4. Railway should detect `frontend/Dockerfile` automatically

5. **Set Environment Variable BEFORE first build:**
   - Go to frontend service → **"Variables"** tab
   - Add: `VITE_API_BASE=https://your-backend-domain.railway.app/api`
   - Replace `your-backend-domain` with your actual backend domain
   - **Example:** If backend is `backend-production-xxxx.up.railway.app`, use:
     ```
     VITE_API_BASE=https://backend-production-xxxx.up.railway.app/api
     ```

6. **Configure Build (if needed):**
   - Go to **"Settings"** → **"Build"**
   - Verify **Dockerfile Path:** `frontend/Dockerfile`
   - **Root Directory:** Leave empty

7. **Generate Domain:**
   - Go to **"Settings"** → **"Generate Domain"**
   - Copy the frontend domain (e.g., `frontend-production-xxxx.up.railway.app`)

8. **Access the FRONTEND URL**, not the backend URL:
   - ✅ Use: `https://frontend-production-xxxx.up.railway.app`
   - ❌ Don't use: `https://backend-production-xxxx.up.railway.app` (this is the API)

### Scenario 2: Frontend Build Failed

**Symptoms:**
- Frontend service exists but shows "Failed" status
- Build logs show errors

**Solution: Check Build Logs**

1. Click on frontend service
2. Go to **"Deployments"** tab
3. Click on the failed deployment
4. Click **"View Logs"**

**Common Build Errors:**

**Error: `VITE_API_BASE` is undefined**
- **Fix:** Set `VITE_API_BASE` environment variable BEFORE building
- Go to **"Variables"** → Add `VITE_API_BASE=https://your-backend.railway.app/api`
- Click **"Redeploy"**

**Error: Dockerfile not found**
- **Fix:** Go to **"Settings"** → **"Build"**
- Set **Dockerfile Path:** `frontend/Dockerfile`
- Set **Root Directory:** `/` (or leave empty)

**Error: Build dependencies failed**
- **Fix:** Check `frontend/package.json` is correct
- Verify pnpm workspace configuration

### Scenario 3: Frontend Running But Wrong Backend URL

**Symptoms:**
- Frontend loads but shows "Cannot connect to API"
- Browser console shows CORS or network errors

**Solution: Update VITE_API_BASE**

1. Get your backend domain:
   - Go to backend service → **"Settings"** → **"Networking"**
   - Copy the domain (e.g., `backend-production-xxxx.up.railway.app`)

2. Update frontend environment variable:
   - Go to frontend service → **"Variables"**
   - Update `VITE_API_BASE` to: `https://backend-production-xxxx.up.railway.app/api`

3. **Redeploy frontend:**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** → **"Deploy"**
   - Railway will rebuild with the new environment variable

### Scenario 4: Accessing Wrong URL

**Symptoms:**
- Backend health check works: `https://backend-xxx.railway.app/health` ✅
- Frontend URL gives 502: `https://backend-xxx.railway.app` ❌

**Solution: Use Frontend URL**

- Each service has its own domain in Railway
- **Backend domain:** `https://backend-xxx.railway.app` (for API calls)
- **Frontend domain:** `https://frontend-xxx.railway.app` (for the UI)

## Step-by-Step: Deploy Frontend (If Missing)

1. **Open Railway Dashboard**
   - Go to https://railway.app/dashboard
   - Select your `ai-stock-insights` project

2. **Add Frontend Service**
   - Click **"+ New"** button
   - Select **"GitHub Repo"**
   - Choose your repository: `girish2408/ai-stock-insights`

3. **Railway Auto-Detection**
   - Railway should detect `frontend/Dockerfile`
   - If not, go to **"Settings"** → **"Build"**
   - Set **Dockerfile Path:** `frontend/Dockerfile`

4. **Set Environment Variable (CRITICAL)**
   - Go to frontend service → **"Variables"** tab
   - Click **"+ New Variable"**
   - **Name:** `VITE_API_BASE`
   - **Value:** `https://YOUR-BACKEND-DOMAIN.railway.app/api`
   - Replace `YOUR-BACKEND-DOMAIN` with your actual backend domain
   - **Example:** `https://backend-production-abc123.up.railway.app/api`

5. **Generate Domain**
   - Go to **"Settings"** → **"Networking"**
   - Click **"Generate Domain"**
   - Copy the frontend domain

6. **Wait for Build**
   - Railway will automatically build and deploy
   - Check **"Deployments"** tab for status
   - Click **"View Logs"** to monitor progress

7. **Test**
   - Visit your frontend domain: `https://frontend-xxx.railway.app`
   - Should show the dashboard

## Verification Checklist

- [ ] PostgreSQL service is running
- [ ] Backend service is running (check `/health` endpoint)
- [ ] Frontend service exists in Railway dashboard
- [ ] Frontend service has successful deployment
- [ ] `VITE_API_BASE` is set correctly in frontend variables
- [ ] Frontend domain is generated and accessible
- [ ] You're accessing the **frontend** URL, not backend URL

## Still Getting 502?

1. **Check Railway Status Page:** https://status.railway.app
2. **View Service Logs:** Click service → Deployments → View Logs
3. **Verify Build Success:** Check if build completed without errors
4. **Check Domain:** Ensure you're using the frontend domain, not backend
5. **Wait a Few Minutes:** Sometimes Railway needs time to propagate DNS

## Quick Test Commands

Test backend (should work):
```bash
curl https://your-backend-domain.railway.app/health
# Should return: {"status":"ok","uptime":...}
```

Test frontend (should show HTML):
```bash
curl https://your-frontend-domain.railway.app
# Should return: HTML content with <!DOCTYPE html>
```

If backend works but frontend doesn't, the frontend service is likely not deployed or not running.

