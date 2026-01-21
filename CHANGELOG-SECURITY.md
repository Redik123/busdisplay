# Changelog - Correctifs de Sécurité

**Date**: 2026-01-12
**Version**: 1.1.0
**Type**: Correctifs critiques de sécurité et améliorations

---

## 🔴 Correctifs Critiques

### 1. Authentification des Endpoints Sensibles

**Problème** : Les endpoints de monitoring (`/api/metrics`, `/api/health`, `/api/cache-stats`, `/api/rate-limit`) étaient publiquement accessibles sans authentification.

**Impact** : Exposition d'informations sensibles sur l'architecture système, mémoire, cache, et patterns d'utilisation.

**Solution** :
- Ajout d'un middleware d'authentification par clé API (`src/lib/auth/middleware.ts`)
- Support de 3 méthodes d'auth : Bearer token, X-API-Key header, query param
- Protection de tous les endpoints sensibles
- Configuration via variables d'environnement

**Fichiers modifiés** :
- `src/lib/auth/middleware.ts` (nouveau)
- `src/app/api/metrics/route.ts`
- `src/app/api/cache-stats/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/rate-limit/route.ts`

**Configuration requise** :
```env
ADMIN_API_KEY=<clé générée avec openssl rand -hex 32>
METRICS_API_KEY=<optionnel>
ALLOWED_IPS=<optionnel>
```

---

### 2. Enforcement du Rate Limiting

**Problème** : Le rate limiting était suivi mais jamais appliqué. Les requêtes continuaient même après dépassement des limites quotidiennes.

**Impact** : Risque d'épuisement du quota API externe (transport.opendata.ch), vulnérabilité aux attaques DoS.

**Solution** :
- Ajout de la fonction `isRateLimited()` dans `src/app/api/rate-limit/route.ts`
- Vérification avant chaque appel API externe
- Réponse 429 avec `Retry-After` header
- Utilisation du cache stale si rate limited

**Fichiers modifiés** :
- `src/app/api/rate-limit/route.ts` (ajout `isRateLimited()`)
- `src/app/api/stationboard/route.ts`
- `src/app/api/locations/route.ts`

**Comportement** :
- Si limite atteinte + cache disponible → retourne cache avec header `X-Rate-Limit-Exceeded: true`
- Si limite atteinte + pas de cache → retourne 429

---

### 3. Boucle Infinie dans useDepartures

**Problème** : Le tableau de dépendances de `useCallback` contenait `departures.length`, causant des boucles infinies potentielles et des requêtes API excessives.

**Impact** : Surcharge de l'application, freeze de l'interface, consommation excessive du quota API.

**Solution** :
- Séparation des données brutes (`rawDepartures`) et filtrées (`departures`)
- Déplacement de la logique de filtrage hors de `fetchDepartures`
- Utilisation de `useMemo` pour le filtrage côté client
- Suppression du useEffect sur les filtres

**Fichiers modifiés** :
- `src/hooks/useDepartures.ts`

**Avant** :
```typescript
}, [config.station.name, config.filteredLines, ..., departures.length]); // ❌
```

**Après** :
```typescript
}, [config.station.name, rawDepartures.length]); // ✅
const departures = useMemo(() => filterDepartures(rawDepartures), [...]);
```

---

### 4. Redis KEYS Bloquant

**Problème** : Utilisation de la commande `KEYS` qui bloque Redis en O(N) avec de grands ensembles de clés.

**Impact** : Ralentissement de toute l'application, blocage de Redis en production.

**Solution** :
- Remplacement de `KEYS` par `SCAN` avec itération par cursor
- Traitement par batch de 100 clés
- Implémentation non-bloquante

**Fichiers modifiés** :
- `src/lib/cache/redis-client.ts` (méthodes `flush()` et `getStats()`)

**Avant** :
```typescript
const keys = await redis.keys('bus-display:*'); // ❌ Bloquant O(N)
```

**Après** :
```typescript
let cursor = '0';
do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', '...', 'COUNT', 100);
    // Traite les clés
} while (cursor !== '0'); // ✅ Non-bloquant
```

---

## 🟠 Améliorations de Sécurité

### 5. Validation des Entrées Utilisateur

**Problème** : Validation insuffisante des paramètres d'entrée (longueur, caractères autorisés).

**Impact** : Potentiel d'attaques par injection, cache poisoning.

**Solution** :
- Validation de longueur max (200 chars pour `/api/locations`)
- Regex pour caractères autorisés : `[a-zA-Z0-9\s\-À-ÿ]+`
- Messages d'erreur explicites

**Fichiers modifiés** :
- `src/app/api/locations/route.ts`

**Validations ajoutées** :
```typescript
if (query.length > MAX_QUERY_LENGTH) { return 400; }
if (!validPattern.test(query)) { return 400; }
```

---

### 6. Configuration CORS

**Problème** : Aucune configuration CORS, comportement par défaut potentiellement trop permissif.

**Impact** : APIs appelables depuis n'importe quelle origine, risque CSRF.

**Solution** :
- Configuration CORS via `ALLOWED_ORIGINS` dans `next.config.ts`
- Headers CORS appliqués uniquement sur `/api/*`
- Support multi-origines

**Fichiers modifiés** :
- `next.config.ts`
- `env.example.txt`

**Configuration** :
```env
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

---

## 📚 Documentation

### 7. Guide de Sécurité Complet

**Nouveau fichier** : `SECURITY.md`

Contenu :
- ✅ Guide d'authentification détaillé
- ✅ Explication du rate limiting
- ✅ Validation des entrées
- ✅ Configuration CORS
- ✅ Sécurisation Redis
- ✅ Variables d'environnement
- ✅ Checklist de déploiement
- ✅ Exemples de monitoring

### 8. Mise à jour du README

**Fichier modifié** : `README.md`

Ajouts :
- Section Sécurité avec mesures implémentées
- Documentation authentification API
- Checklist de déploiement
- Lien vers SECURITY.md
- Badges de statut

### 9. Variables d'Environnement

**Fichier modifié** : `env.example.txt`

Ajouts :
```env
# Sécurité
ADMIN_API_KEY=change-me-in-production
METRICS_API_KEY=
ALLOWED_IPS=

# CORS
ALLOWED_ORIGINS=
```

---

## 📊 Statistiques des Changements

### Fichiers créés (3)
1. `src/lib/auth/middleware.ts` - Middleware d'authentification (156 lignes)
2. `SECURITY.md` - Guide de sécurité complet (400+ lignes)
3. `CHANGELOG-SECURITY.md` - Ce fichier

### Fichiers modifiés (9)
1. `src/app/api/metrics/route.ts` - Authentification
2. `src/app/api/cache-stats/route.ts` - Authentification
3. `src/app/api/health/route.ts` - Authentification
4. `src/app/api/rate-limit/route.ts` - Enforcement + authentification
5. `src/app/api/stationboard/route.ts` - Rate limiting enforcement
6. `src/app/api/locations/route.ts` - Validation + rate limiting
7. `src/hooks/useDepartures.ts` - Fix boucle infinie
8. `src/lib/cache/redis-client.ts` - Redis SCAN
9. `next.config.ts` - CORS
10. `env.example.txt` - Nouvelles variables
11. `README.md` - Documentation sécurité

### Lignes de code
- **Ajoutées** : ~700 lignes (code + documentation)
- **Modifiées** : ~150 lignes
- **Supprimées** : ~50 lignes

---

## ✅ Tests

### Build
```bash
npm run build
```
**Résultat** : ✅ Compilation réussie sans erreurs TypeScript

### Routes API
Toutes les routes compilent correctement :
- ✅ `/api/stationboard` (Dynamic)
- ✅ `/api/locations` (Dynamic)
- ✅ `/api/metrics` (Dynamic) - Protégé
- ✅ `/api/health` (Dynamic) - Protégé
- ✅ `/api/cache-stats` (Dynamic) - Protégé
- ✅ `/api/rate-limit` (Dynamic) - Protégé

---

## 🚀 Migration

### Pour les développeurs

1. **Mettre à jour les variables d'environnement** :
   ```bash
   cp env.example.txt .env.local
   # Éditer .env.local et configurer ADMIN_API_KEY
   ```

2. **Générer une clé API** :
   ```bash
   openssl rand -hex 32
   ```

3. **Tester localement** :
   ```bash
   npm run build
   npm run start
   ```

4. **Tester l'authentification** :
   ```bash
   # Sans auth (doit échouer)
   curl http://localhost:3000/api/metrics

   # Avec auth (doit réussir)
   curl -H "X-API-Key: your-key" http://localhost:3000/api/metrics
   ```

### Pour le déploiement

1. Configurer `ADMIN_API_KEY` dans l'environnement de production
2. Configurer Redis avec authentification si activé
3. Définir `ALLOWED_ORIGINS` si nécessaire
4. Vérifier la configuration Prometheus (ajout authentification)
5. Tester tous les endpoints protégés

---

## 🔍 Audit de Sécurité

### Avant ce patch
- ❌ 4 endpoints publics avec info sensibles
- ❌ Rate limiting non appliqué
- ❌ Boucle infinie possible
- ❌ Redis bloquant en production
- ⚠️ Validation partielle des entrées
- ⚠️ CORS non configuré

### Après ce patch
- ✅ Tous les endpoints sensibles protégés
- ✅ Rate limiting avec enforcement
- ✅ Pas de boucles infinies
- ✅ Redis non-bloquant (SCAN)
- ✅ Validation stricte des entrées
- ✅ CORS configurable

---

## 📝 Notes de version

**Version** : 1.1.0
**Compatibilité** : Rétrocompatible avec 1.0.0 pour les routes publiques
**Breaking changes** : Authentification requise pour `/api/metrics`, `/api/health`, `/api/cache-stats`, `/api/rate-limit`

---

## 🙏 Remerciements

Correctifs basés sur la revue de code complète effectuée le 2026-01-12.

Issues adressées :
- #1 Endpoints publics sensibles
- #2 Rate limiting non appliqué
- #3 Boucle infinie useDepartures
- #4 Redis KEYS bloquant
- #5 Validation insuffisante
- #6 CORS non configuré

---

**Pour plus de détails** : Voir [SECURITY.md](./SECURITY.md)
