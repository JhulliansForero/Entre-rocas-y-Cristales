# ── Etapa 1: Build con Node ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# VITE_API_URL se inyecta en tiempo de build (queda embebido en el bundle)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instalar dependencias (capa cacheada si package.json no cambia)
COPY package*.json ./
RUN npm install --prefer-offline

# Copiar fuente y compilar
COPY . .
RUN npm run build

# ── Etapa 2: Servir con Nginx ─────────────────────────────────
FROM nginx:1.25-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
