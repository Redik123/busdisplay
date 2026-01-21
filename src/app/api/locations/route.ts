import { NextRequest, NextResponse } from 'next/server';
import type { LocationsResponse } from '@/types/api';
import { incrementApiCounter, isRateLimited } from '@/app/api/rate-limit/route';

const TRANSPORT_API = 'https://transport.opendata.ch/v1';
const CACHE_TTL = 3600000; // 1 heure
const MAX_QUERY_LENGTH = 200; // Limite de longueur pour éviter les abus

// Cache en mémoire
interface CacheEntry {
    data: LocationsResponse;
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * GET /api/locations
 * Recherche des stations par nom
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    // Validation du paramètre
    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: 'Paramètre query manquant ou trop court (min 2 caractères)' },
            { status: 400 }
        );
    }

    // Validation de la longueur max
    if (query.length > MAX_QUERY_LENGTH) {
        return NextResponse.json(
            { error: `Le paramètre query est trop long (max ${MAX_QUERY_LENGTH} caractères)` },
            { status: 400 }
        );
    }

    // Validation des caractères (alphanumérique + espaces, tirets, accents)
    const validPattern = /^[a-zA-Z0-9\s\-À-ÿ]+$/;
    if (!validPattern.test(query)) {
        return NextResponse.json(
            { error: 'Le paramètre query contient des caractères non autorisés' },
            { status: 400 }
        );
    }

    const cacheKey = `locations:${query.toLowerCase()}`;
    const now = Date.now();

    // Vérifie le cache
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return NextResponse.json(cached.data, {
            headers: {
                'X-Cache-Status': 'HIT',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    }

    // Vérifie le rate limiting
    if (isRateLimited('locations')) {
        if (cached) {
            return NextResponse.json(cached.data, {
                headers: {
                    'X-Cache-Status': 'STALE-RATE-LIMITED',
                    'X-Rate-Limit-Exceeded': 'true',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }
        return NextResponse.json(
            {
                error: 'Limite de taux dépassée',
                message: 'Le quota quotidien d\'appels API a été dépassé.'
            },
            {
                status: 429,
                headers: {
                    'Retry-After': '3600'
                }
            }
        );
    }

    try {
        const response = await fetch(
            `${TRANSPORT_API}/locations?query=${encodeURIComponent(query)}&type=station`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BusDisplay/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        // Incrémenter le compteur API
        incrementApiCounter('locations');

        const rawData = await response.json();

        // Filtre et formate les stations
        const data: LocationsResponse = {
            stations: (rawData.stations || [])
                .filter((s: { id: string | null }) => s.id)
                .slice(0, 10) // Limite à 10 résultats
                .map((s: { id: string; name: string; score?: number; coordinate?: { x: number; y: number } }) => ({
                    id: s.id,
                    name: s.name,
                    score: s.score || 0,
                    coordinate: s.coordinate
                }))
        };

        // Mise en cache
        cache.set(cacheKey, { data, timestamp: now });

        return NextResponse.json(data, {
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error('[API] Erreur locations:', error);

        // Retourne le cache périmé si disponible
        if (cached) {
            return NextResponse.json(cached.data, {
                headers: {
                    'X-Cache-Status': 'STALE',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        return NextResponse.json(
            { error: 'Erreur de recherche de stations' },
            { status: 503 }
        );
    }
}
