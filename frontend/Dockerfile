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

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

