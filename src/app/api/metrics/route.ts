import { NextRequest, NextResponse } from 'next/server';
import { metricsRegister } from '@/lib/metrics';
import { requireMetricsAuth } from '@/lib/auth/middleware';

/**
 * GET /api/metrics
 * Endpoint pour Prometheus (protégé par authentification)
 */
export async function GET(request: NextRequest) {
    // Vérification de l'authentification
    const authError = requireMetricsAuth(request);
    if (authError) return authError;
    try {
        const metrics = await metricsRegister.metrics();

        return new NextResponse(metrics, {
            headers: {
                'Content-Type': metricsRegister.contentType
            }
        });
    } catch (error) {
        console.error('[METRICS] Erreur:', error);
        return NextResponse.json(
            { error: 'Erreur de génération des métriques' },
            { status: 500 }
        );
    }
}
