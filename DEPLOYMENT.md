# Deployment Guide

This document covers deployment options for the AI Stock Insights Dashboard.

## Quick Start: Railway Deployment

See **[RAILWAY.md](./RAILWAY.md)** for detailed Railway deployment instructions.

## Deployment Options

### Option 1: Railway (Recommended)

**Best for:** Quick deployment, managed PostgreSQL, automatic SSL

- ✅ Free tier available ($5 credit/month)
- ✅ Managed PostgreSQL database
- ✅ Automatic SSL certificates
- ✅ Easy environment variable management
- ✅ GitHub integration

**See:** [RAILWAY.md](./RAILWAY.md) for step-by-step guide

### Option 2: Docker Compose (Local/Server)

**Best for:** Self-hosted servers, VPS, local development

```bash
# 1. Copy environment file
cp backend/env.sample backend/.env
# Edit backend/.env with your API keys

# 2. Start all services
docker-compose up -d

# 3. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# PostgreSQL: localhost:5432
```

### Option 3: Separate Services

Deploy backend and frontend as separate services:

**Backend:**
- Deploy to Railway/Render/Fly.io
- Set environment variables
- Expose port 4000

**Frontend:**
- Build: `pnpm frontend:build`
- Deploy to Vercel/Netlify/Railway
- Set `VITE_API_BASE` environment variable

**Database:**
- Use Railway PostgreSQL or external provider (Supabase, Neon, etc.)

## Environment Variables

### Backend (.env)

```bash
PORT=4000
DATABASE_URL=postgresql://user:password@host:5432/dbname
FINNHUB_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key
MARKET_AUX_KEY=your_key
OPENAI_API_KEY=your_key (optional)
SEC_USER_AGENT=ai-stock-insights/1.0 (contact: you@example.com)
TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
LOG_LEVEL=info
NODE_ENV=production
```

### Frontend (Build-time)

```bash
VITE_API_BASE=https://your-backend-domain.com/api
```

## Railway Deployment Checklist

- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL database service
- [ ] Deploy backend service
- [ ] Set backend environment variables
- [ ] Deploy frontend service
- [ ] Set frontend `VITE_API_BASE` variable
- [ ] Generate domains for both services
- [ ] Test health endpoints
- [ ] Test stock search functionality

## Troubleshooting

See [RAILWAY.md](./RAILWAY.md#troubleshooting) for common issues and solutions.

