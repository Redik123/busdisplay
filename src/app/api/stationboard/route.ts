import { NextRequest, NextResponse } from 'next/server';
import type { Departure, StationboardResponse } from '@/types/departure';
import { cacheManager, CACHE_TTL } from '@/lib/cache';
import {
    trackCacheOperation,
    trackExternalApiCall,
    trackError,
    createTimer
} from '@/lib/metrics';
import { incrementApiCounter, isRateLimited } from '@/app/api/rate-limit/route';
import { trackClient } from '@/lib/connectedClients';

const TRANSPORT_API = 'https://transport.opendata.ch/v1';

/**
 * GET /api/stationboard
 * Récupère les horaires de départs pour une station
 * 
 * Features:
 * - Cache Redis/Map avec TTL 45s
 * - Stale-while-revalidate (5min)
 * - Retry automatique
 * - Métriques Prometheus
 */
export async function GET(request: NextRequest) {
    const timer = createTimer();
    const searchParams = request.nextUrl.searchParams;
    const station = searchParams.get('station');

    // Validation du paramètre
    if (!station) {
        trackError('validation_error', '/api/stationboard');
        return NextResponse.json(
            { error: 'Paramètre station manquant' },
            { status: 400 }
        );
    }

    // Track le client connecté (utilise l'IP ou un identifiant unique)
    const clientId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    trackClient(clientId, station);

    const cacheKey = `stationboard:${station}`;

    // Vérifie le cache
    const cached = await cacheManager.get<StationboardResponse>(cacheKey, true);

    // Si rate limited, retourne uniquement le cache (même stale)
    if (isRateLimited('stationboard')) {
        if (cached) {
            trackCacheOperation('get', cached.isStale ? 'stale' : 'hit', cacheManager.isRedisEnabled() ? 'redis' : 'map');
            return NextResponse.json(cached.data, {
                headers: {
                    'X-Cache-Status': cached.isStale ? 'STALE-RATE-LIMITED' : 'HIT-RATE-LIMITED',
                    'X-Rate-Limit-Exceeded': 'true',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'X-Response-Time': `${Math.round(timer() * 1000)}ms`
                }
            });
        }
        // Pas de cache et rate limited = erreur
        trackError('rate_limit_exceeded', '/api/stationboard');
        return NextResponse.json(
            {
                error: 'Limite de taux dépassée',
                message: 'Le quota quotidien d\'appels API a été dépassé. Veuillez réessayer plus tard.'
            },
            {
                status: 429,
                headers: {
                    'Retry-After': '3600' // 1 heure
                }
            }
        );
    }

    if (cached && !cached.isStale) {
        trackCacheOperation('get', 'hit', cacheManager.isRedisEnabled() ? 'redis' : 'map');

        return NextResponse.json(cached.data, {
            headers: {
                'X-Cache-Status': 'HIT',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Response-Time': `${Math.round(timer() * 1000)}ms`
            }
        });
    }

    try {
        const apiTimer = createTimer();

        // Appel API externe avec retry
        const response = await fetchWithRetry(
            `${TRANSPORT_API}/stationboard?station=${encodeURIComponent(station)}&limit=30`
        );

        const apiDuration = apiTimer();

        if (!response.ok) {
            trackExternalApiCall('stationboard', 'error', apiDuration);
            throw new Error(`API Error: ${response.status}`);
        }

        trackExternalApiCall('stationboard', 'success', apiDuration);
        incrementApiCounter('stationboard');

        const rawData = await response.json();

        // Filtre et nettoie les données
        const data = processStationboardData(rawData);

        // Mise en cache
        await cacheManager.set(cacheKey, data, CACHE_TTL);
        trackCacheOperation('set', 'success', cacheManager.isRedisEnabled() ? 'redis' : 'map');

        return NextResponse.json(data, {
            headers: {
                'X-Cache-Status': 'MISS',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Response-Time': `${Math.round(timer() * 1000)}ms`
            }
        });

    } catch (error) {
        console.error('[API] Erreur stationboard:', error);
        trackError('api_error', '/api/stationboard');

        // Retourne le cache périmé si disponible
        if (cached) {
            trackCacheOperation('get', 'stale', cacheManager.isRedisEnabled() ? 'redis' : 'map');

            return NextResponse.json(cached.data, {
                headers: {
                    'X-Cache-Status': 'STALE',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'X-Response-Time': `${Math.round(timer() * 1000)}ms`
                }
            });
        }

        return NextResponse.json(
            { error: 'Impossible de récupérer les horaires' },
            { status: 503 }
        );
    }
}

/**
 * Fetch avec retry automatique et backoff exponentiel
 */
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'BusDisplay/1.0'
                },
                // Timeout de 10 secondes
                signal: AbortSignal.timeout(10000)
            });

            if (response.ok || response.status < 500) {
                return response;
            }

            throw new Error(`Server error: ${response.status}`);
        } catch (error) {
            if (i === retries - 1) throw error;

            console.log(`[API] Retry ${i + 1}/${retries} après ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('Max retries reached');
}

/**
 * Traite et nettoie les données du stationboard
 */
function processStationboardData(rawData: {
    station: { id: string; name: string };
    stationboard: Array<{
        number: string;
        to: string;
        category?: string;
        operator?: string;
        stop: {
            departure?: string;
            departureTimestamp?: number;
            delay?: number;
            platform?: string;
            prognosis?: {
                platform?: string | null;
                departure?: string | null;
            };
        };
    }>;
}): StationboardResponse {
    const now = Date.now() / 1000;
    const thirtyMinutesAgo = now - 30 * 60;
    const twentyFourHoursLater = now + 24 * 60 * 60;

    // Filtre les départs
    const filteredDepartures = rawData.stationboard
        .filter(dep => {
            // Doit avoir un timestamp de départ
            if (!dep.stop?.departureTimestamp) return false;

            const timestamp = dep.stop.departureTimestamp;

            // Exclure les départs trop anciens ou trop lointains
            if (timestamp < thirtyMinutesAgo) return false;
            if (timestamp > twentyFourHoursLater) return false;

            return true;
        })
        .map(dep => {
            const timestamp = dep.stop.departureTimestamp!;
            const delay = dep.stop.delay || 0;
            const platform = dep.stop.platform || undefined;
            const prognosisPlatform = dep.stop.prognosis?.platform || undefined;
            const isPlatformChanged = !!(platform && prognosisPlatform && platform !== prognosisPlatform);

            return {
                number: dep.number,
                to: dep.to,
                category: dep.category,
                operator: dep.operator,
                stop: {
                    departure: dep.stop.departure || '',
                    departureTimestamp: timestamp,
                    delay,
                    platform,
                    prognosisPlatform,
                    isPlatformChanged,
                    status: '',
                    isPastDeparture: timestamp < now,
                    isApproaching: timestamp - now < 120 && timestamp > now // Moins de 2 minutes
                }
            } as Departure;
        })
        .sort((a, b) => a.stop.departureTimestamp - b.stop.departureTimestamp);

    return {
        station: rawData.station,
        stationboard: filteredDepartures
    };
}
