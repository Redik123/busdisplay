import { NextRequest, NextResponse } from 'next/server';
import type { HealthResponse } from '@/types/api';
import { cacheManager } from '@/lib/cache';
import { updateRedisStatus } from '@/lib/metrics';
import { requireMetricsAuth } from '@/lib/auth/middleware';

/**
 * GET /api/health
 * Health check pour le load balancer et le monitoring (protégé par authentification)
 */
export async function GET(request: NextRequest) {
    // Vérification de l'authentification
    const authError = requireMetricsAuth(request);
    if (authError) return authError;
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    // Récupère les stats du cache
    const cacheStats = await cacheManager.getStats();

    // Met à jour la métrique Redis
    updateRedisStatus(cacheStats.redisConnected);

    const response: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cache: {
            backend: cacheStats.backend,
            redisConnected: cacheStats.redisConnected,
            redisKeys: cacheStats.redisKeys,
            localMapKeys: cacheStats.localMapKeys
        },
        uptime,
        memory: {
            rss: memory.rss,
            heapTotal: memory.heapTotal,
            heapUsed: memory.heapUsed,
            external: memory.external
        }
    };

    return NextResponse.json(response, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
