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

CMD ["pnpm", "start"]

