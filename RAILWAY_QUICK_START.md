# Railway Quick Start Guide

## 🚀 5-Minute Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ai-stock-insights.git
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository

### Step 3: Add PostgreSQL
1. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Copy the `DATABASE_URL` (or use `${{Postgres.DATABASE_URL}}`)

### Step 4: Deploy Backend
1. Railway auto-detects `backend/Dockerfile`
2. Go to backend service → **"Variables"**
3. Add these variables:

```
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
MARKET_AUX_KEY=your_key
OPENAI_API_KEY=your_key (optional)
SEC_USER_AGENT=ai-stock-insights/1.0 (contact: you@example.com)
TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
NODE_ENV=production
```

4. Generate domain: **Settings** → **Generate Domain**
5. Copy backend domain (e.g., `backend-production.up.railway.app`)

### Step 5: Deploy Frontend
1. Click **"+ New"** → **"GitHub Repo"** → Select repo again
2. Railway detects `frontend/Dockerfile`
3. Go to frontend service → **"Variables"**
4. Add:

```
VITE_API_BASE=https://your-backend-domain.railway.app/api
```

Replace `your-backend-domain.railway.app` with your actual backend domain.

5. Generate domain: **Settings** → **Generate Domain**

### Step 6: Test
- Backend: `https://your-backend.railway.app/health`
- Frontend: `https://your-frontend.railway.app`

## 📝 Environment Variables Cheat Sheet

### Backend Variables
```
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
MARKET_AUX_KEY=...
OPENAI_API_KEY=... (optional)
SEC_USER_AGENT=ai-stock-insights/1.0 (contact: you@example.com)
TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
NODE_ENV=production
```

### Frontend Variables
```
VITE_API_BASE=https://your-backend.railway.app/api
```

## 🔗 Service Structure

```
Railway Project
├── PostgreSQL (Database)
├── Backend (Express API)
└── Frontend (React + Nginx)
```

## 💡 Pro Tips

1. **Use Railway's variable references**: `${{Postgres.DATABASE_URL}}` automatically connects to PostgreSQL
2. **Custom domains**: Add your own domain in Settings → Networking
3. **Monitor logs**: Click any service → View Logs
4. **Auto-deploy**: Railway deploys automatically on git push
5. **Free tier**: $5/month credit covers small projects

## 🆘 Troubleshooting

**Backend won't start?**
- Check all environment variables are set
- Verify `DATABASE_URL` uses `${{Postgres.DATABASE_URL}}`
- Check logs in Railway dashboard

**Frontend can't connect?**
- Verify `VITE_API_BASE` matches your backend domain
- Ensure backend is running and accessible
- Check CORS (should be handled automatically)

**Database connection fails?**
- Verify PostgreSQL service is running
- Check `DATABASE_URL` format
- Review database logs

## 📚 Full Documentation

For detailed instructions, see [RAILWAY.md](./RAILWAY.md)

