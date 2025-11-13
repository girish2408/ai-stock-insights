FROM node:20-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json

RUN pnpm install --filter frontend-app...

COPY frontend ./frontend

WORKDIR /app/frontend

# Accept build-time environment variable for API base URL
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

RUN pnpm build

FROM nginx:1.25-alpine AS runner

# Railway sets PORT automatically, default to 80 if not set
ENV PORT=80

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx config template that uses PORT env var
# nginx's docker-entrypoint.sh will automatically substitute ${PORT} at runtime
COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]

