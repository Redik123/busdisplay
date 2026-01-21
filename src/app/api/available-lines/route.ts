import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache';

const TRANSPORT_API = 'https://transport.opendata.ch/v1';

/**
 * GET /api/available-lines
 * Récupère les lignes disponibles pour une station
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

    const cacheKey = `lines:${station}`;

    // Vérifie le cache (cache plus long pour les lignes)
    const cached = await cacheManager.get<{ lines: string[] }>(cacheKey);

    if (cached && !cached.isStale) {
        return NextResponse.json(cached.data, {
            headers: { 'X-Cache-Status': 'HIT' }
        });
    }

    try {
        // Récupère les départs pour extraire les lignes
        const response = await fetch(
            `${TRANSPORT_API}/stationboard?station=${encodeURIComponent(station)}&limit=50`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Extrait les lignes uniques
        const linesSet = new Set<string>();
        (data.stationboard || []).forEach((dep: { number: string }) => {
            if (dep.number) {
                linesSet.add(dep.number);
            }
        });

        const lines = Array.from(linesSet).sort((a, b) => {
            // Tri numérique puis alphabétique
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
            if (!isNaN(aNum)) return -1;
            if (!isNaN(bNum)) return 1;
            return a.localeCompare(b);
        });

        const result = { lines };

        // Cache plus long pour les lignes (12h)
        await cacheManager.set(cacheKey, result, 12 * 60 * 60 * 1000);

        return NextResponse.json(result, {
            headers: { 'X-Cache-Status': 'MISS' }
        });

    } catch (error) {
        console.error('[API] Erreur available-lines:', error);

        // Retourne le cache périmé si disponible
        if (cached) {
            return NextResponse.json(cached.data, {
                headers: { 'X-Cache-Status': 'STALE' }
            });
        }

        return NextResponse.json(
            { error: 'Impossible de récupérer les lignes' },
            { status: 503 }
        );
    }
}
