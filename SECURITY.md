# Guide de Sécurité - Bus Display Next.js

Ce document décrit les mesures de sécurité implémentées dans l'application et les configurations requises pour un déploiement sécurisé en production.

## 📋 Table des matières

1. [Authentification](#authentification)
2. [Rate Limiting](#rate-limiting)
3. [Validation des entrées](#validation-des-entrées)
4. [CORS](#cors)
5. [Redis](#redis)
6. [Variables d'environnement](#variables-denvironnement)
7. [Checklist de déploiement](#checklist-de-déploiement)

---

## 🔐 Authentification

### Endpoints protégés

Les endpoints suivants nécessitent une authentification par clé API :

- `/api/metrics` - Métriques Prometheus
- `/api/cache-stats` - Statistiques du cache
- `/api/health` - Health check détaillé
- `/api/rate-limit` - Statistiques de rate limiting

### Configuration

**Générer une clé API sécurisée** :
```bash
openssl rand -hex 32
```

**Variables d'environnement** :
```env
# Obligatoire en production
ADMIN_API_KEY=your-secure-key-here

# Optionnel (utilise ADMIN_API_KEY par défaut)
METRICS_API_KEY=your-metrics-key-here
```

### Méthodes d'authentification supportées

#### 1. Header Authorization (Recommandé)
```bash
curl -H "Authorization: Bearer your-api-key" https://your-domain/api/metrics
```

#### 2. Header X-API-Key
```bash
curl -H "X-API-Key: your-api-key" https://your-domain/api/metrics
```

#### 3. Query Parameter (Moins sécurisé)
```bash
curl https://your-domain/api/metrics?api_key=your-api-key
```

### Whitelist IP (Optionnel)

Pour une sécurité renforcée, limitez l'accès par IP :

```env
# Liste d'IPs autorisées (séparées par virgule)
ALLOWED_IPS=192.168.1.1,10.0.0.5

# Autoriser toutes les IPs
ALLOWED_IPS=*
```

### Réponse en cas d'échec d'authentification

**Code**: 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Une clé API valide est requise pour accéder à cette ressource",
  "hint": "Utilisez le header \"Authorization: Bearer YOUR_KEY\" ou \"X-API-Key: YOUR_KEY\""
}
```

---

## 🚦 Rate Limiting

### Limites configurées

L'application suit les limites de l'API transport.opendata.ch :

| Endpoint | Limite quotidienne | Reset |
|----------|-------------------|-------|
| `/api/stationboard` | 10,080 requêtes | Minuit |
| `/api/locations` | 10,000 requêtes | Minuit |
| `/api/connections` | 1,000 requêtes | Minuit |

### Comportement

1. **Sous la limite** : Les requêtes passent normalement
2. **Limite atteinte** :
   - Si cache disponible : Retourne le cache (même stale)
   - Sinon : Retourne 429 Too Many Requests

### Headers de réponse

```
X-Rate-Limit-Exceeded: true
Retry-After: 3600
```

### Réponse 429

```json
{
  "error": "Limite de taux dépassée",
  "message": "Le quota quotidien d'appels API a été dépassé. Veuillez réessayer plus tard."
}
```

### Monitoring

Consultez l'utilisation actuelle :
```bash
curl -H "X-API-Key: your-key" https://your-domain/api/rate-limit
```

**Réponse** :
```json
{
  "date": "2026-01-12",
  "usage": {
    "stationboard": {
      "current": 234,
      "limit": 10080,
      "percentage": 2,
      "remaining": 9846
    },
    "locations": {
      "current": 45,
      "limit": 10000,
      "percentage": 0,
      "remaining": 9955
    }
  },
  "warnings": [],
  "resetAt": "Minuit (heure locale)"
}
```

---

## ✅ Validation des entrées

### Endpoint `/api/locations`

**Validations appliquées** :
- Longueur min : 2 caractères
- Longueur max : 200 caractères
- Caractères autorisés : `[a-zA-Z0-9\s\-À-ÿ]+`

**Exemple d'erreur** :
```json
{
  "error": "Le paramètre query contient des caractères non autorisés"
}
```

### Endpoint `/api/stationboard`

**Validations appliquées** :
- Paramètre `station` obligatoire
- Encodage URL automatique
- Filtrage des départs passés/futurs lointains

### Clés de cache

**Sécurité** : Les entrées utilisateur sont utilisées dans les clés de cache après :
- Conversion en minuscules
- Encodage URL
- Préfixe namespace (`bus-display:`)

**Format** : `bus-display:locations:geneve`

---

## 🌐 CORS

### Configuration

Par défaut, CORS est désactivé (même origine uniquement).

Pour autoriser des origines spécifiques :

```env
# Origines autorisées (séparées par virgule)
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

### Headers CORS appliqués

Si `ALLOWED_ORIGINS` est configuré :
```
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
Access-Control-Max-Age: 86400
```

### Routes affectées

CORS est appliqué uniquement sur `/api/*`

---

## 🔴 Redis

### Sécurité

**Problème résolu** : Remplacement de la commande `KEYS` par `SCAN`

#### Avant (❌ Dangereux)
```typescript
const keys = await redis.keys('bus-display:*'); // Bloque Redis O(N)
```

#### Après (✅ Sécurisé)
```typescript
let cursor = '0';
do {
    const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        'bus-display:*',
        'COUNT',
        100
    );
    cursor = nextCursor;
    // Traite les clés par batch
} while (cursor !== '0');
```

### Configuration Redis en production

**Authentification** :
```env
# Avec mot de passe
REDIS_URL=redis://:password@host:6379

# Avec TLS
REDIS_URL=rediss://user:password@host:6380
```

**Recommandations** :
- ✅ Activer l'authentification (`requirepass`)
- ✅ Utiliser TLS pour les connexions réseau
- ✅ Limiter l'accès par firewall
- ✅ Configurer `maxmemory` et `maxmemory-policy`

### Nettoyage automatique

Le cache local Map est nettoyé automatiquement :
- Entrées > 5 minutes sont supprimées
- Appel manuel : `cacheManager.cleanupLocal()`

---

## 🔧 Variables d'environnement

### Variables obligatoires en production

```env
# Sécurité (CRITIQUE)
ADMIN_API_KEY=<générer avec: openssl rand -hex 32>
NODE_ENV=production

# Application
PORT=3000
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Variables optionnelles

```env
# Redis (recommandé)
REDIS_ENABLED=true
REDIS_URL=redis://:password@host:6379
REDIS_PREFIX=bus-display:

# Cache
CACHE_TTL=45000

# Sécurité avancée
METRICS_API_KEY=<autre clé si séparation requise>
ALLOWED_IPS=192.168.1.1,10.0.0.5
ALLOWED_ORIGINS=https://example.com

# Monitoring
METRICS_ENABLED=true
```

### Fichier .env

⚠️ **Ne jamais commiter le fichier `.env` dans git**

Utilisez `env.example.txt` comme template.

---

## 📝 Checklist de déploiement

### Avant le déploiement

- [ ] Générer une clé API sécurisée (`ADMIN_API_KEY`)
- [ ] Configurer Redis avec authentification
- [ ] Définir `ALLOWED_ORIGINS` si nécessaire
- [ ] Vérifier `NODE_ENV=production`
- [ ] Configurer le firewall pour Redis
- [ ] Tester les endpoints protégés
- [ ] Vérifier les limites de rate limiting

### Headers de sécurité (automatiques)

Ces headers sont configurés automatiquement :
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Monitoring en production

1. **Métriques Prometheus** : `GET /api/metrics`
   ```bash
   curl -H "X-API-Key: your-key" https://your-domain/api/metrics
   ```

2. **Health check** : `GET /api/health`
   ```bash
   curl -H "X-API-Key: your-key" https://your-domain/api/health
   ```

3. **Cache stats** : `GET /api/cache-stats`
   ```bash
   curl -H "X-API-Key: your-key" https://your-domain/api/cache-stats
   ```

4. **Rate limit** : `GET /api/rate-limit`
   ```bash
   curl -H "X-API-Key: your-key" https://your-domain/api/rate-limit
   ```

### Alertes recommandées

Configurer des alertes sur :
- Rate limit > 80% (warning dans `/api/rate-limit`)
- Échec d'authentification répété
- Erreurs Redis
- Memory usage > 80%

---

## 🐛 Bugs de sécurité corrigés

### 1. Boucle infinie dans useDepartures
**Problème** : `departures.length` dans les dépendances causait des re-renders infinis

**Solution** : Séparation des données brutes (`rawDepartures`) et filtrées (`departures`)

### 2. Redis KEYS bloquant
**Problème** : Commande `KEYS` bloque Redis en O(N)

**Solution** : Remplacement par `SCAN` non-bloquant

### 3. Endpoints publics
**Problème** : Métriques et stats accessibles publiquement

**Solution** : Authentification par clé API obligatoire

### 4. Rate limiting non appliqué
**Problème** : Compteur incrémenté mais pas de rejet de requêtes

**Solution** : Vérification `isRateLimited()` avec rejet 429

### 5. Validation insuffisante
**Problème** : Paramètres non validés (longueur, caractères)

**Solution** : Validation stricte avec regex et limites

### 6. CORS non configuré
**Problème** : Aucune restriction d'origine

**Solution** : Configuration CORS via `ALLOWED_ORIGINS`

---

## 📞 Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, veuillez **NE PAS** créer une issue publique.

Contactez directement l'équipe de développement.

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Redis Security](https://redis.io/topics/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [API Rate Limiting Best Practices](https://www.nginx.com/blog/rate-limiting-nginx/)

---

**Dernière mise à jour** : 2026-01-12
**Version** : 1.0.0
