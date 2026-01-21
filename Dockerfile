# ===========================================
# Dockerfile - Bus Display Next.js
# ===========================================
# Image optimisée pour production avec standalone mode
# Build: docker build -t bus-display .
# Run: docker run -p 3000:3000 bus-display

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:25-alpine AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copie uniquement les fichiers de dépendances pour le cache
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm ci --only=production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:25-alpine AS builder

WORKDIR /app

# Copie les node_modules du stage précédent
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build l'application
RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:25-alpine AS runner

WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers publics
COPY --from=builder /app/public ./public

# Copier le build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/ping || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
