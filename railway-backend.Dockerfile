# Railway-specific backend Dockerfile
# This ensures proper context for Railway builds

FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace manifests first for efficient caching
COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json

# Install production dependencies for the backend workspace only
RUN pnpm install --filter backend-dev... --prod

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["pnpm", "start"]

