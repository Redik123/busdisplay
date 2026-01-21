import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache';

const TRANSPORT_API = 'https://transport.opendata.ch/v1';

/**
 * GET /api/directions
 * Récupère les directions disponibles pour une station
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const station = searchParams.get('station');

    if (!station) {
        return NextResponse.json(
            { error: 'Paramètre station manquant' },
            { status: 400 }
        );
    }

    const cacheKey = `directions:${station}`;

    // Vérifie le cache
    const cached = await cacheManager.get<{ directions: string[] }>(cacheKey);

    if (cached && !cached.isStale) {
        return NextResponse.json(cached.data, {
            headers: { 'X-Cache-Status': 'HIT' }
        });
    }

    try {
        // Récupère les départs pour extraire les directions
        const response = await fetch(
            `${TRANSPORT_API}/stationboard?station=${encodeURIComponent(station)}&limit=50`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Extrait les directions uniques
        const directionsSet = new Set<string>();
        (data.stationboard || []).forEach((dep: { to: string }) => {
            if (dep.to) {
                directionsSet.add(dep.to);
            }
        });

        const directions = Array.from(directionsSet).sort();

        const result = { directions };

        // Cache plus long pour les directions (12h)
        await cacheManager.set(cacheKey, result, 12 * 60 * 60 * 1000);

        return NextResponse.json(result, {
            headers: { 'X-Cache-Status': 'MISS' }
        });

    } catch (error) {
        console.error('[API] Erreur directions:', error);

        // Retourne le cache périmé si disponible
        if (cached) {
            return NextResponse.json(cached.data, {
                headers: { 'X-Cache-Status': 'STALE' }
            });
        }

        return NextResponse.json(
            { error: 'Impossible de récupérer les directions' },
            { status: 503 }
        );
    }
}
