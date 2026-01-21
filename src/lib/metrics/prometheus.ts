/**
 * Métriques Prometheus pour le monitoring
 * 
 * Ce module expose des métriques pour Prometheus/Grafana :
 * - Requêtes HTTP (count, duration)
 * - Opérations de cache (hits, misses, stale)
 * - Appels API externes
 * - Statut Redis
 * - Erreurs
 */

import client from 'prom-client';

// Créer un registre personnalisé
const register = new client.Registry();

// Métriques par défaut (CPU, mémoire, event loop, GC)
client.collectDefaultMetrics({
    register,
    prefix: 'bus_display_',
    labels: { app: 'bus-display' }
});

// ============================================
// Métriques HTTP
// ============================================

/**
 * Compteur total des requêtes HTTP
 */
const httpRequestsTotal = new client.Counter({
    name: 'bus_display_http_requests_total',
    help: 'Total des requêtes HTTP',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

/**
 * Histogramme de la durée des requêtes HTTP
 */
const httpRequestDuration = new client.Histogram({
    name: 'bus_display_http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register]
});

// ============================================
// Métriques Cache
// ============================================

/**
 * Compteur des opérations de cache
 */
const cacheOperations = new client.Counter({
    name: 'bus_display_cache_operations_total',
    help: 'Total des opérations de cache',
    labelNames: ['operation', 'status', 'cache_type'],
    registers: [register]
});

/**
 * Gauge de la taille du cache
 */
const cacheSize = new client.Gauge({
    name: 'bus_display_cache_size',
    help: 'Nombre d\'entrées dans le cache',
    labelNames: ['cache_type'],
    registers: [register]
});

// ============================================
// Métriques API Externe
// ============================================

/**
 * Compteur des appels API externes
 */
const externalApiCalls = new client.Counter({
    name: 'bus_display_external_api_calls_total',
    help: 'Total des appels à l\'API transport.opendata.ch',
    labelNames: ['endpoint', 'status'],
    registers: [register]
});

/**
 * Histogramme de la durée des appels API externes
 */
const externalApiDuration = new client.Histogram({
    name: 'bus_display_external_api_duration_seconds',
    help: 'Durée des appels API externes en secondes',
    labelNames: ['endpoint', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
});

// ============================================
// Métriques Redis
// ============================================

/**
 * Gauge du statut Redis
 */
const redisStatus = new client.Gauge({
    name: 'bus_display_redis_connected',
    help: 'Statut de connexion Redis (1=connecté, 0=déconnecté)',
    registers: [register]
});

// ============================================
// Métriques Erreurs
// ============================================

/**
 * Compteur des erreurs
 */
const errorsTotal = new client.Counter({
    name: 'bus_display_errors_total',
    help: 'Total des erreurs',
    labelNames: ['type', 'route'],
    registers: [register]
});

// ============================================
// Fonctions utilitaires
// ============================================

/**
 * Enregistre une requête HTTP
 */
export function trackHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number
): void {
    httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
    httpRequestDuration.observe(
        { method, route, status_code: statusCode.toString() },
        durationSeconds
    );
}

/**
 * Enregistre une opération de cache
 */
export function trackCacheOperation(
    operation: 'get' | 'set' | 'delete',
    status: 'hit' | 'miss' | 'stale' | 'success' | 'error',
    cacheType: 'redis' | 'map' = 'map'
): void {
    cacheOperations.inc({ operation, status, cache_type: cacheType });
}

/**
 * Met à jour la taille du cache
 */
export function updateCacheSize(size: number, cacheType: 'redis' | 'map'): void {
    cacheSize.set({ cache_type: cacheType }, size);
}

/**
 * Enregistre un appel API externe
 */
export function trackExternalApiCall(
    endpoint: string,
    status: 'success' | 'error' | 'timeout',
    durationSeconds?: number
): void {
    externalApiCalls.inc({ endpoint, status });

    if (durationSeconds !== undefined) {
        externalApiDuration.observe({ endpoint, status }, durationSeconds);
    }
}

/**
 * Met à jour le statut Redis
 */
export function updateRedisStatus(connected: boolean): void {
    redisStatus.set(connected ? 1 : 0);
}

/**
 * Enregistre une erreur
 */
export function trackError(type: string, route: string = 'unknown'): void {
    errorsTotal.inc({ type, route });
}

/**
 * Timer pour mesurer la durée d'une opération
 */
export function createTimer(): () => number {
    const start = process.hrtime.bigint();
    return () => {
        const end = process.hrtime.bigint();
        return Number(end - start) / 1e9; // Convertit en secondes
    };
}

// ============================================
// Export
// ============================================

export {
    register,
    httpRequestsTotal,
    httpRequestDuration,
    cacheOperations,
    cacheSize,
    externalApiCalls,
    externalApiDuration,
    redisStatus,
    errorsTotal
};

// Export par défaut du registre pour l'endpoint /metrics
export default register;
