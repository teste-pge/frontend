# ==============================================================================
#  Dockerfile — RideFlow Frontend (Angular 18 + Nginx)
#
#  Multi-stage build:
#    Stage 1 (build)   — Node 18: npm ci + ng build --configuration=production
#    Stage 2 (runtime) — Nginx Alpine: serve SPA com try_files
#
#  Build:   docker build -t rideflow-frontend .
#  Run:     docker run -p 4200:80 rideflow-frontend
# ==============================================================================

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS build

LABEL maintainer="RideFlow Team"
LABEL description="RideFlow Frontend — Angular 18 SPA"

WORKDIR /app

# Copia manifests primeiro para cache de dependências
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copia código-fonte e builda
COPY . .
RUN npm run build:prod

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove configuração default do nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia configuração customizada e artefatos do build
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/rideflow-frontend/browser /usr/share/nginx/html

# Porta exposta (HTTP)
EXPOSE 80

# Healthcheck básico
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
