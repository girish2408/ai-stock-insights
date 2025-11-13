# Security Guidelines

## ⚠️ IMPORTANT: This Repository is Public

**Never commit API keys, secrets, or sensitive data to this repository.**

## Protected Files

The following files are automatically ignored by Git (see `.gitignore`):

- `.env` files (all variants)
- `*.key`, `*.secret`, `*.pem` files
- Any file containing `secret`, `key`, `password`, `token`, or `credential` in the name

## Environment Variables

### Backend Environment Variables

All API keys and secrets must be set via environment variables:

```bash
# Required
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
MARKET_AUX_KEY=your_key_here

# Optional
OPENAI_API_KEY=your_key_here
OLLAMA_ENDPOINT=http://localhost:11434/api/generate

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Other
SEC_USER_AGENT=ai-stock-insights/1.0 (contact: you@example.com)
TRACKED_SYMBOLS=AAPL,MSFT,GOOGL
```

### Frontend Environment Variables

```bash
VITE_API_BASE=https://your-backend-domain.com/api
```

## Security Best Practices

### 1. Never Log API Keys

✅ **Good:**
```javascript
if (!API_KEY) {
  console.warn('API_KEY is not set');
}
```

❌ **Bad:**
```javascript
console.log('API_KEY:', API_KEY.substring(0, 10)); // NEVER DO THIS
```

### 2. Use Environment Variables

✅ **Good:**
```javascript
const apiKey = process.env.API_KEY;
```

❌ **Bad:**
```javascript
const apiKey = 'sk-1234567890abcdef'; // NEVER HARDCODE
```

### 3. Check Before Committing

Before committing, always check:

```bash
# Check for potential secrets
git diff | grep -i "api.*key\|secret\|password\|token"

# Check for .env files
git status | grep -i "\.env"

# Verify .gitignore is working
git check-ignore -v backend/.env
```

### 4. Use .env.sample Files

The `backend/env.sample` file shows required variables without exposing actual keys.

**Never copy `.env.sample` to `.env` and commit it!**

## Pre-Commit Checklist

Before committing to this public repository:

- [ ] No `.env` files are staged
- [ ] No API keys in code (check with `grep -r "api.*key.*=" --include="*.js"`)
- [ ] No secrets in console.log statements
- [ ] All sensitive data is in environment variables
- [ ] `.gitignore` includes all sensitive file patterns

## If You Accidentally Commit a Secret

**If you accidentally commit an API key or secret:**

1. **Immediately revoke the key** from the service provider
2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** (if already pushed):
   ```bash
   git push origin --force --all
   ```
4. **Generate new keys** and update your environment variables

## Railway Deployment

When deploying to Railway:

1. Set environment variables in Railway dashboard (not in code)
2. Use Railway's variable references: `${{Postgres.DATABASE_URL}}`
3. Never commit Railway tokens or deployment keys

## Local Development

1. Copy `backend/env.sample` to `backend/.env`
2. Fill in your actual API keys in `backend/.env`
3. **Never commit `backend/.env`**
4. Use `.env` files for local development only

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Contact the repository maintainer privately
3. Include details about the vulnerability

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Environment Variables Best Practices](https://12factor.net/config)

