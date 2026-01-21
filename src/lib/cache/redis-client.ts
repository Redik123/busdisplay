/**
 * Gestionnaire de Cache Redis avec fallback Map
 * 
 * Ce module gère le cache de l'application de manière hybride :
 * - Redis en priorité (pour environnement distribué)
 * - Map locale en fallback (si Redis non disponible)
 * 
 * Stratégie : stale-while-revalidate
 * - Les données fraîches sont servies immédiatement
 * - Les données périmées peuvent être servies pendant la récupération
 */

import Redis from 'ioredis';

// Durées de cache
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '45000'); // 45 secondes
const STALE_TTL = 300000; // 5 minutes (données périmées mais utilisables)
const LOCATIONS_TTL = 3600000; // 1 heure pour les recherches de stations

// Interface pour les entrées de cache
interface CacheEntry<T = unknown> {
    data: T;
    timestamp: number;
}

// Interface pour le résultat de get
interface CacheResult<T = unknown> {
    data: T;
    isStale: boolean;
}

// Type pour le backend utilisé
type CacheBackend = 'redis' | 'local-map';

/**
 * Classe CacheManager
 * Gère le cache avec Redis et fallback Map locale
 */
class CacheManager {
    private redis: Redis | null = null;
    private redisEnabled = false;
    private connecting = false;
    private localCache = new Map<string, CacheEntry>();

    private readonly redisUrl: string;
    private readonly enableRedis: boolean;
    private readonly keyPrefix: string;

    constructor() {
        this.redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        this.enableRedis = process.env.REDIS_ENABLED === 'true';
        this.keyPrefix = process.env.REDIS_PREFIX || 'bus-display:';

        if (this.enableRedis) {
            this.connectRedis();
        } else {
            console.log('[CACHE] Redis désactivé, utilisation du cache Map local');
        }
    }

    /**
     * Connexion à Redis avec gestion des erreurs
     */
    private async connectRedis(): Promise<void> {
        if (this.connecting || this.redisEnabled) return;

        this.connecting = true;
        console.log('[REDIS] Tentative de connexion à', this.redisUrl);

        try {
            this.redis = new Redis(this.redisUrl, {
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.warn('[REDIS] Abandon après 3 tentatives');
                        return null; // Arrête les retries
                    }
                    return Math.min(times * 100, 2000);
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: true,
                connectTimeout: 5000,
            });

            // Event handlers
            this.redis.on('error', (err) => {
                console.error('[REDIS] Erreur:', err.message);
                this.redisEnabled = false;
            });

            this.redis.on('reconnecting', () => {
                console.log('[REDIS] Reconnexion en cours...');
            });

            this.redis.on('ready', () => {
                console.log('[REDIS] Connecté et prêt');
                this.redisEnabled = true;
            });

            this.redis.on('close', () => {
                console.log('[REDIS] Connexion fermée');
                this.redisEnabled = false;
            });

            // Tentative de connexion
            await this.redis.connect();
            this.redisEnabled = true;
            console.log('[REDIS] Connexion établie');

        } catch (err) {
            console.warn('[REDIS] Échec connexion, fallback cache local:',
                err instanceof Error ? err.message : 'Unknown error');
            this.redisEnabled = false;
            this.redis = null;
        } finally {
            this.connecting = false;
        }
    }

    /**
     * Génère la clé avec préfixe
     */
    private getKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    /**
     * Récupère une valeur du cache
     */
    async get<T = unknown>(key: string, allowStale = true): Promise<CacheResult<T> | null> {
        const prefixedKey = this.getKey(key);
        const now = Date.now();

        // Essaie Redis d'abord
        if (this.redisEnabled && this.redis) {
            try {
                const value = await this.redis.get(prefixedKey);

                if (value) {
                    const parsed = JSON.parse(value) as CacheEntry<T>;
                    const age = now - parsed.timestamp;

                    // Cache frais
                    if (age < CACHE_TTL) {
                        return { data: parsed.data, isStale: false };
                    }

                    // Cache périmé mais utilisable
                    if (allowStale && age < STALE_TTL) {
                        return { data: parsed.data, isStale: true };
                    }
                }

                return null;

            } catch (err) {
                console.error('[REDIS] Erreur get:', err);
                this.redisEnabled = false;
                // Fallback vers Map locale
            }
        }

        // Fallback Map locale
        const entry = this.localCache.get(key);

        if (!entry) {
            return null;
        }

        const age = now - entry.timestamp;

        // Cache frais
        if (age < CACHE_TTL) {
            return { data: entry.data as T, isStale: false };
        }

        // Cache périmé mais utilisable
        if (allowStale && age < STALE_TTL) {
            return { data: entry.data as T, isStale: true };
        }

        // Cache trop vieux, on le supprime
        this.localCache.delete(key);
        return null;
    }

    /**
     * Stocke une valeur dans le cache
     */
    async set<T = unknown>(key: string, data: T, ttlMs: number = CACHE_TTL): Promise<boolean> {
        const prefixedKey = this.getKey(key);
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now()
        };

        // Toujours stocker dans la Map locale
        this.localCache.set(key, entry);

        // Essaie de stocker dans Redis aussi
        if (this.redisEnabled && this.redis) {
            try {
                const ttlSeconds = Math.ceil(ttlMs / 1000);
                await this.redis.setex(prefixedKey, ttlSeconds, JSON.stringify(entry));
                return true;
            } catch (err) {
                console.error('[REDIS] Erreur set:', err);
                this.redisEnabled = false;
            }
        }

        return true; // Stocké au moins dans Map locale
    }

    /**
     * Supprime une clé du cache
     */
    async delete(key: string): Promise<void> {
        const prefixedKey = this.getKey(key);

        // Supprime de la Map locale
        this.localCache.delete(key);

        // Supprime de Redis
        if (this.redisEnabled && this.redis) {
            try {
                await this.redis.del(prefixedKey);
            } catch (err) {
                console.error('[REDIS] Erreur delete:', err);
            }
        }
    }

    /**
     * Vide tout le cache
     */
    async flush(): Promise<void> {
        // Vide la Map locale
        this.localCache.clear();

        // Vide Redis (seulement les clés avec notre préfixe)
        // Utilise SCAN au lieu de KEYS pour éviter de bloquer Redis
        if (this.redisEnabled && this.redis) {
            try {
                let cursor = '0';
                const keysToDelete: string[] = [];

                do {
                    const [nextCursor, keys] = await this.redis.scan(
                        cursor,
                        'MATCH',
                        `${this.keyPrefix}*`,
                        'COUNT',
                        100
                    );
                    cursor = nextCursor;

                    if (keys.length > 0) {
                        keysToDelete.push(...keys);
                    }
                } while (cursor !== '0');

                // Supprime les clés par batch de 100
                if (keysToDelete.length > 0) {
                    for (let i = 0; i < keysToDelete.length; i += 100) {
                        const batch = keysToDelete.slice(i, i + 100);
                        await this.redis.del(...batch);
                    }
                }
            } catch (err) {
                console.error('[REDIS] Erreur flush:', err);
            }
        }

        console.log('[CACHE] Cache vidé');
    }

    /**
     * Récupère les statistiques du cache
     */
    async getStats(): Promise<{
        backend: CacheBackend;
        redisConnected: boolean;
        redisKeys?: number;
        localMapKeys: number;
    }> {
        const stats = {
            backend: (this.redisEnabled ? 'redis' : 'local-map') as CacheBackend,
            redisConnected: this.redisEnabled,
            localMapKeys: this.localCache.size
        };

        if (this.redisEnabled && this.redis) {
            try {
                // Utilise SCAN au lieu de KEYS pour compter les clés
                let cursor = '0';
                let count = 0;

                do {
                    const [nextCursor, keys] = await this.redis.scan(
                        cursor,
                        'MATCH',
                        `${this.keyPrefix}*`,
                        'COUNT',
                        100
                    );
                    cursor = nextCursor;
                    count += keys.length;
                } while (cursor !== '0');

                return { ...stats, redisKeys: count };
            } catch {
                // Ignore les erreurs
            }
        }

        return stats;
    }

    /**
     * Nettoie les entrées périmées de la Map locale
     */
    cleanupLocal(): number {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.localCache.entries()) {
            if (now - entry.timestamp > STALE_TTL) {
                this.localCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`[CACHE] Nettoyage local: ${cleaned} entrées supprimées`);
        }

        return cleaned;
    }

    /**
     * Ferme proprement les connexions
     */
    async close(): Promise<void> {
        if (this.redis) {
            await this.redis.quit();
            this.redis = null;
        }
        this.localCache.clear();
        console.log('[CACHE] Fermé proprement');
    }

    /**
     * Vérifie si Redis est disponible
     */
    isRedisEnabled(): boolean {
        return this.redisEnabled;
    }
}

// Export une instance singleton
export const cacheManager = new CacheManager();

// Export le type pour les autres modules
export type { CacheResult, CacheBackend };

// Export les constantes de TTL pour réutilisation
export { CACHE_TTL, STALE_TTL, LOCATIONS_TTL };
