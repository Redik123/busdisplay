import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache';
import { requireMetricsAuth } from '@/lib/auth/middleware';

/**
 * GET /api/cache-stats
 * Statistiques du cache pour debugging (protégé par authentification)
 */
export async function GET(request: NextRequest) {
    // Vérification de l'authentification
    const authError = requireMetricsAuth(request);
    if (authError) return authError;
    try {
        const stats = await cacheManager.getStats();

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    } catch (error) {
        console.error('[CACHE-STATS] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur de récupération des stats' },
            { status: 500 }
        );
    }
}
