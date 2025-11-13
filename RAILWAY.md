# Railway Deployment Guide

This guide will walk you through deploying the AI Stock Insights Dashboard to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account (free tier available)
2. GitHub account (for connecting your repository)
3. API keys for:
   - Finnhub (free tier: https://finnhub.io/register)
   - Alpha Vantage (free tier: https://www.alphavantage.co/support/#api-key)
   - MarketAux (https://marketaux.com/)
   - OpenAI (optional, for AI summaries: https://platform.openai.com/)

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ai-stock-insights.git
   git push -u origin main
   ```

2. **Ensure `.gitignore` is set up** (see `.gitignore` file in root)

### Step 2: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `ai-stock-insights` repository
5. Railway will detect the project structure

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a PostgreSQL database
4. **Copy the `DATABASE_URL`** from the PostgreSQL service variables (you'll need this)

### Step 4: Deploy Backend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"** (if backend isn't auto-detected)
2. Select your repository again
3. Railway will detect the `backend/Dockerfile`
4. Configure the backend service:

   **Service Name:** `backend` (or `stock-backend`)
   
   **Root Directory:** Leave empty (or set to `backend` if needed)
   
   **Build Command:** Railway will use Dockerfile automatically
   
   **Start Command:** `pnpm start` (handled by Dockerfile)

5. **Set Environment Variables** for backend service:
   - Click on the backend service → **"Variables"** tab
   - Add the following variables:

   ```
   PORT=4000
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FINNHUB_API_KEY=your_finnhub_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   MARKET_AUX_KEY=your_marketaux_key_here
   OPENAI_API_KEY=your_openai_key_here (optional)
   OPENAI_MODEL=gpt-3.5-turbo (optional)
   SEC_USER_AGENT=ai-stock-insights/1.0 (contact: your@email.com)
   TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
   LOG_LEVEL=info
   NODE_ENV=production
   ```

   **Important:** 
   - Use `${{Postgres.DATABASE_URL}}` to reference the PostgreSQL service's DATABASE_URL automatically.
   - **CRITICAL:** Set `NODE_ENV=production` - this ensures Railway's DATABASE_URL is used correctly without modification.

6. **Generate Domain:**
   - Click on backend service → **"Settings"** → **"Generate Domain"**
   - Copy the generated domain (e.g., `backend-production.up.railway.app`)

### Step 5: Deploy Frontend Service

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Railway will detect the `frontend/Dockerfile`

4. **Set Environment Variables** for frontend service:
   - Click on frontend service → **"Variables"** tab
   - Add:

   ```
   VITE_API_BASE=https://your-backend-domain.railway.app/api
   ```

   Replace `your-backend-domain.railway.app` with your actual backend domain from Step 4.
   
   **Important:** `VITE_API_BASE` must be set BEFORE the first build, as Vite injects environment variables at build time.

5. **Configure Build Settings (if needed):**
   - Go to frontend service → **"Settings"** → **"Build"**
   - If Railway doesn't detect the Dockerfile, set:
     - **Dockerfile Path:** `frontend/Dockerfile`
     - **Root Directory:** Leave empty (or `/`)

6. **Generate Domain:**
   - Click on frontend service → **"Settings"** → **"Generate Domain"**
   - Copy the generated domain (e.g., `frontend-production.up.railway.app`)

### Step 6: Verify Frontend Build

**Important:** If you need to update `VITE_API_BASE` after the initial build:

1. Go to frontend service → **"Variables"**
2. Update `VITE_API_BASE` with your backend Railway domain:
   ```
   VITE_API_BASE=https://backend-production-xxxx.up.railway.app/api
   ```
3. Go to **"Deployments"** tab → Click **"Redeploy"** → **"Deploy"**
   - Railway will rebuild with the new environment variable

### Step 7: Verify Deployment

1. **Check Backend Health:**
   - Visit: `https://your-backend-domain.railway.app/health`
   - Should return: `{"status":"ok","uptime":...}`

2. **Check Frontend:**
   - Visit: `https://your-frontend-domain.railway.app`
   - Should show the dashboard

3. **Test Stock Search:**
   - Enter a ticker symbol (e.g., "AAPL")
   - Verify data loads correctly

## Railway Service Structure

Your Railway project should have 3 services:

```
┌─────────────────────────────────────┐
│  Railway Project: ai-stock-insights  │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │  PostgreSQL  │                  │
│  │  (Database)  │                  │
│  └──────┬───────┘                  │
│         │                           │
│         │ DATABASE_URL              │
│         ▼                           │
│  ┌──────────────┐                  │
│  │   Backend    │                  │
│  │  (Port 4000) │                  │
│  │  Express API │                  │
│  └──────┬───────┘                  │
│         │                           │
│         │ API Calls                 │
│         ▼                           │
│  ┌──────────────┐                  │
│  │   Frontend   │                  │
│  │  (Port 80)   │                  │
│  │  React + Nginx│                 │
│  └──────────────┘                  │
│                                     │
└─────────────────────────────────────┘
```

## Environment Variables Reference

### Backend Service Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Yes | Backend server port | `4000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `${{Postgres.DATABASE_URL}}` |
| `FINNHUB_API_KEY` | Yes | Finnhub API key | `your_key_here` |
| `ALPHA_VANTAGE_API_KEY` | Yes | Alpha Vantage API key | `your_key_here` |
| `MARKET_AUX_KEY` | Yes | MarketAux API key | `your_key_here` |
| `OPENAI_API_KEY` | No | OpenAI API key for summaries | `sk-...` |
| `OPENAI_MODEL` | No | OpenAI model to use | `gpt-3.5-turbo` |
| `OLLAMA_ENDPOINT` | No | Ollama endpoint (if using local) | `http://localhost:11434/api/generate` |
| `SEC_USER_AGENT` | Yes | SEC EDGAR user agent | `ai-stock-insights/1.0 (contact: you@example.com)` |
| `TRACKED_SYMBOLS` | No | Symbols for daily refresh | `AAPL,MSFT,GOOGL` |
| `LOG_LEVEL` | No | Logging level | `info` |
| `NODE_ENV` | Yes | Environment | `production` |

### Frontend Service Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE` | Yes | Backend API base URL | `https://backend-production.up.railway.app/api` |

## Custom Domain Setup (Optional)

### Backend Custom Domain

1. Go to backend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow Railway's DNS instructions

### Frontend Custom Domain

1. Go to frontend service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Follow Railway's DNS instructions
5. Update `VITE_API_BASE` if backend also uses custom domain

## Monitoring & Logs

### View Logs

1. Click on any service in Railway dashboard
2. Go to **"Deployments"** tab
3. Click on a deployment → **"View Logs"**

### Health Checks

Railway automatically monitors your services. Check:
- Backend: `https://your-backend-domain.railway.app/health`
- Frontend: `https://your-frontend-domain.railway.app`

## Troubleshooting

### Backend Issues

**Problem:** Backend fails to start
- **Solution:** Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correctly referenced

**Problem:** Database connection fails
- **Solution:** Verify `DATABASE_URL` uses `${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running
- Verify database credentials

**Problem:** `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`
- **Solution:** This error occurs when the database connection code modifies Railway's DATABASE_URL incorrectly
- **Fix:** Ensure `NODE_ENV=production` is set in your backend service environment variables
- The code automatically detects Railway (via `NODE_ENV=production` or Railway environment variables) and uses DATABASE_URL as-is
- If the error persists, verify `DATABASE_URL` is set correctly: `${{Postgres.DATABASE_URL}}`
- Check Railway logs to see the actual DATABASE_URL being used

**Problem:** API calls fail
- **Solution:** Verify API keys are set correctly
- Check API rate limits (especially Alpha Vantage free tier: 5 calls/min)
- Review backend logs for specific errors

### Frontend Issues

**Problem:** Frontend shows "Cannot connect to API"
- **Solution:** Verify `VITE_API_BASE` is set correctly
- Ensure backend domain is accessible
- Check CORS settings (should be handled by backend)

**Problem:** Frontend build fails
- **Solution:** Check build logs in Railway
- Verify all dependencies are in `package.json`
- Ensure `VITE_API_BASE` is set before build

### Database Issues

**Problem:** Cache not working
- **Solution:** Verify PostgreSQL service is running
- Check `DATABASE_URL` connection string
- Review database logs in Railway

## Cost Estimation (Railway Free Tier)

Railway's free tier includes:
- **$5 credit/month** (enough for small projects)
- **500 hours of usage**
- **PostgreSQL database** (included)

**Estimated Monthly Cost:**
- Backend service: ~$2-3/month
- Frontend service: ~$1-2/month
- PostgreSQL: Included
- **Total: ~$3-5/month** (within free tier)

## Production Checklist

- [ ] All environment variables set
- [ ] PostgreSQL database created and connected
- [ ] Backend service deployed and healthy
- [ ] Frontend service deployed with correct API URL
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active (automatic with Railway)
- [ ] API keys secured (not in code)
- [ ] Health checks passing
- [ ] Test stock search functionality
- [ ] Monitor logs for errors

## Updating Your Deployment

### Automatic Deployments

Railway automatically deploys when you push to your main branch:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Deployments

1. Go to Railway dashboard
2. Click on service → **"Deployments"**
3. Click **"Redeploy"** → **"Deploy"**

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Project Issues:** Open an issue on GitHub

## Alternative: Single Service Deployment

If you prefer a single service, you can:

1. Deploy only the backend service
2. Serve frontend as static files from backend
3. Update backend to serve frontend build files

See `DEPLOYMENT.md` for alternative deployment strategies.

