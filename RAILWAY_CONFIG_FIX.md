# Railway Configuration Fix: Multiple Services

## Problem

Railway is using `railway.toml` from the root directory, which specifies `backend/Dockerfile` for all services. This causes the frontend service to try building with the backend Dockerfile.

## Solution

We've created service-specific configuration files:

- **`backend/railway.json`** - Configuration for backend service
- **`frontend/railway.json`** - Configuration for frontend service
- **`railway.toml`** - Updated to not specify dockerfilePath (let services auto-detect)

## How Railway Detects Configuration

Railway looks for configuration in this order:

1. **Service-specific files** (highest priority):
   - `backend/railway.json` or `backend/railway.toml`
   - `frontend/railway.json` or `frontend/railway.toml`

2. **Root-level files**:
   - `railway.json` or `railway.toml` (fallback)

3. **Dashboard settings** (if no config files):
   - Manual settings in Railway dashboard

## Fixing Your Current Deployment

### Option 1: Use Service-Specific Configs (Recommended)

1. **Push the new config files:**
   ```bash
   git add backend/railway.json frontend/railway.json railway.toml
   git commit -m "Add service-specific Railway configs"
   git push origin main
   ```

2. **Railway will auto-detect:**
   - Backend service → uses `backend/railway.json` → `backend/Dockerfile`
   - Frontend service → uses `frontend/railway.json` → `frontend/Dockerfile`

### Option 2: Override in Dashboard

If Railway still uses the wrong Dockerfile:

1. **For Frontend Service:**
   - Go to frontend service → **"Settings"** → **"Build"**
   - Click on the Dockerfile path field
   - Change from `backend/Dockerfile` to `frontend/Dockerfile`
   - Save

2. **For Backend Service:**
   - Go to backend service → **"Settings"** → **"Build"**
   - Verify it shows `backend/Dockerfile`
   - If not, set it to `backend/Dockerfile`

### Option 3: Remove Root Config (If Still Having Issues)

If Railway keeps using the root `railway.toml`:

1. **Temporarily rename it:**
   ```bash
   git mv railway.toml railway.toml.backup
   git commit -m "Temporarily disable root railway.toml"
   git push origin main
   ```

2. **Set Dockerfile paths manually in Railway dashboard:**
   - Backend: `backend/Dockerfile`
   - Frontend: `frontend/Dockerfile`

3. **After deployment works, you can restore it** (or keep it disabled)

## Verification

After deploying:

1. **Check Backend Service:**
   - Go to backend service → **"Settings"** → **"Build"**
   - Should show: `backend/Dockerfile`
   - Check logs - should build backend successfully

2. **Check Frontend Service:**
   - Go to frontend service → **"Settings"** → **"Build"**
   - Should show: `frontend/Dockerfile`
   - Check logs - should build frontend successfully

3. **Test:**
   - Backend: `https://your-backend.railway.app/health` ✅
   - Frontend: `https://your-frontend.railway.app` ✅

## File Structure

```
ai-stock-insights/
├── railway.toml          # Root config (fallback, no dockerfilePath)
├── backend/
│   ├── Dockerfile        # Backend Docker image
│   └── railway.json      # Backend-specific config
└── frontend/
    ├── Dockerfile        # Frontend Docker image
    └── railway.json      # Frontend-specific config
```

## Why This Happens

Railway reads configuration files in order of priority. The root `railway.toml` was applying to all services. By creating service-specific configs in subdirectories, Railway can differentiate between services.

## Next Steps

1. Push the new config files
2. Railway will auto-detect and use the correct Dockerfile per service
3. If it still doesn't work, manually override in the dashboard
4. Verify both services build correctly

