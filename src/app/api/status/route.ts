import { NextResponse } from 'next/server';
import { getApiCounters } from '@/app/api/rate-limit/route';

/**
 * GET /api/status
 * Endpoint PUBLIC simplifié pour le dashboard admin frontend
 *
 * Note: Cet endpoint est volontairement public et limité aux infos non-sensibles.
 * Pour des métriques complètes, utilisez /api/metrics (protégé)
 */
export async function GET() {
    try {
        const counters = getApiCounters();

        // Calcul des pourcentages
        const usage = {
            stationboard: {
                current: counters.stationboard,
                limit: counters.limits.stationboard,
                percentage: Math.round((counters.stationboard / counters.limits.stationboard) * 100),
                remaining: counters.limits.stationboard - counters.stationboard
            },
            connections: {
                current: counters.connections,
                limit: counters.limits.connections,
                percentage: Math.round((counters.connections / counters.limits.connections) * 100),
                remaining: counters.limits.connections - counters.connections
            },
            locations: {
                current: counters.locations,
                limit: counters.limits.locations,
                percentage: Math.round((counters.locations / counters.limits.locations) * 100),
                remaining: counters.limits.locations - counters.locations
            }
        };

        // Avertissements
        const warnings: string[] = [];
        if (usage.stationboard.percentage >= 80) {
            warnings.push(`Attention: ${usage.stationboard.percentage}% de la limite stationboard atteinte`);
        }
        if (usage.connections.percentage >= 80) {
            warnings.push(`Attention: ${usage.connections.percentage}% de la limite connections atteinte`);
        }

        // Status global simplifié (sans infos sensibles)
        const response = {
            status: 'operational', // Toujours operational si l'API répond
            timestamp: new Date().toISOString(),
            usage,
            warnings,
            date: counters.lastReset,
            resetAt: 'Minuit (heure locale)'
        };

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('[STATUS] Erreur:', error);
        return NextResponse.json(
            {
                status: 'error',
                error: 'Erreur de récupération du statut'
            },
            { status: 500 }
        );
    }
}
