# 🚌 Bus Display Next.js

Application d'affichage d'horaires de bus en temps réel pour les arrêts suisses.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css)
![Redis](https://img.shields.io/badge/Redis-Optional-DC382D?logo=redis)

## ✨ Fonctionnalités

- 📺 **Affichage en temps réel** des horaires de bus
- 🔍 **Recherche de stations** avec auto-complétion
- 🎨 **Filtrage par lignes** et directions
- 🌙 **Mode veille** programmable
- 🎭 **Thèmes** sombre/clair/auto
- 💾 **Cache intelligent** Redis/Map avec stale-while-revalidate
- 📊 **Métriques Prometheus** pour monitoring
- 🔐 **Sécurisé** : authentification API, rate limiting, validation entrées
- 📱 **Responsive design** mobile-first
- 🐳 **Docker ready** pour déploiement

## 🚀 Démarrage Rapide

### Windows - Démarrage Automatique ⚡

**Double-cliquez sur** `start-dev.bat` ou exécutez `start-dev.ps1` avec PowerShell.

Les scripts font **tout automatiquement**:
- ✅ Vérification de Node.js et npm
- ✅ Installation des dépendances
- ✅ Création de `.env.local` avec clé API
- ✅ Démarrage du serveur

Voir [DEMARRAGE-LOCAL.md](./DEMARRAGE-LOCAL.md) pour le guide complet Windows.

### Linux/Mac - Installation Manuelle

#### Prérequis

- Node.js 20+
- npm ou yarn

#### Installation

```bash
# Accéder au projet
cd bus-display-next

# Installer les dépendances
npm install

# Créer .env.local
cp env.example.txt .env.local

# Générer une clé API sécurisée
openssl rand -hex 32

# Éditer .env.local et ajouter la clé
nano .env.local

# Lancer en développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📁 Structure du Projet

```
src/
├── app/
│   ├── layout.tsx          # Layout racine
│   ├── page.tsx            # Page d'accueil
│   ├── display/            # Page d'affichage
│   ├── admin/              # Page de configuration
│   └── api/                # API Routes
│       ├── stationboard/   # Horaires
│       ├── locations/      # Recherche stations
│       ├── available-lines/# Lignes disponibles
│       ├── directions/     # Directions
│       ├── health/         # Health check
│       ├── metrics/        # Prometheus
│       └── cache-stats/    # Stats cache
├── components/
│   ├── display/            # Composants d'affichage
│   └── admin/              # Composants admin
├── hooks/                  # Hooks React (Zustand)
├── lib/
│   ├── cache/              # Gestionnaire cache Redis/Map
│   ├── metrics/            # Métriques Prometheus
│   └── utils/              # Utilitaires
└── types/                  # Types TypeScript
```

## 🔧 Configuration

### Variables d'Environnement

Créer un fichier `.env.local` basé sur `env.example.txt` :

```env
# Sécurité (OBLIGATOIRE en production)
ADMIN_API_KEY=change-me-in-production  # Générer avec: openssl rand -hex 32

# Redis (optionnel)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=bus-display:

# Cache
CACHE_TTL=45000

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# CORS (optionnel)
ALLOWED_ORIGINS=https://example.com

# Monitoring
METRICS_ENABLED=true
```

⚠️ **Important** : En production, vous **devez** configurer une clé API sécurisée pour `ADMIN_API_KEY`.

Voir [SECURITY.md](./SECURITY.md) pour plus de détails.

## 🐳 Déploiement Docker

### Build et Run

```bash
# Build l'image
docker build -t bus-display .

# Run le container
docker run -p 3000:3000 bus-display
```

### Avec Docker Compose (Redis inclus)

```bash
docker-compose up -d
```

## 📊 API Endpoints

| Endpoint | Auth requise | Description |
|----------|--------------|-------------|
| `GET /api/stationboard?station=...` | Non | Horaires de départs |
| `GET /api/locations?query=...` | Non | Recherche de stations |
| `GET /api/available-lines?station=...` | Non | Lignes disponibles |
| `GET /api/directions?station=...` | Non | Directions disponibles |
| `GET /api/health` | **Oui** 🔐 | Health check |
| `GET /api/metrics` | **Oui** 🔐 | Métriques Prometheus |
| `GET /api/cache-stats` | **Oui** 🔐 | Statistiques du cache |
| `GET /api/rate-limit` | **Oui** 🔐 | Statistiques rate limiting |

### Authentification

Les endpoints protégés nécessitent une clé API dans le header :

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/api/metrics
# ou
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:3000/api/metrics
```

## 📈 Monitoring

### Métriques Prometheus

Les métriques sont exposées sur `/api/metrics` :

- `bus_display_http_requests_total` - Requêtes HTTP
- `bus_display_http_request_duration_seconds` - Durée des requêtes
- `bus_display_cache_operations_total` - Opérations cache
- `bus_display_external_api_calls_total` - Appels API externe
- `bus_display_redis_connected` - Statut Redis

### Configuration Prometheus

```yaml
scrape_configs:
  - job_name: 'bus-display'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    # Authentification requise
    authorization:
      credentials: 'your-api-key-here'
```

## 🛠️ Développement

### Scripts

```bash
npm run dev      # Développement avec Turbopack
npm run build    # Build production
npm run start    # Lancer la production
npm run lint     # Vérification ESLint
```

### Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand
- **Cache**: Redis (ioredis) / Map fallback
- **Monitoring**: prom-client (Prometheus)
- **API**: transport.opendata.ch

## 🔒 Sécurité

L'application implémente plusieurs mesures de sécurité :

- ✅ **Authentification par clé API** pour endpoints sensibles
- ✅ **Rate limiting** avec enforcement (10,080 req/jour pour stationboard)
- ✅ **Validation stricte** des entrées utilisateur
- ✅ **CORS configurable** pour limiter les origines
- ✅ **Redis SCAN** au lieu de KEYS (non-bloquant)
- ✅ **Headers de sécurité** (X-Frame-Options, CSP, etc.)

Voir [SECURITY.md](./SECURITY.md) pour le guide complet de sécurité.

### Checklist de déploiement

- [ ] Générer et configurer `ADMIN_API_KEY`
- [ ] Configurer Redis avec authentification
- [ ] Définir `NODE_ENV=production`
- [ ] Configurer `ALLOWED_ORIGINS` si nécessaire
- [ ] Vérifier le firewall Redis
- [ ] Tester l'authentification des endpoints

## 📝 License

MIT

## 🙏 Crédits

- Données: [transport.opendata.ch](https://transport.opendata.ch)
- Icons: Emoji natifs
