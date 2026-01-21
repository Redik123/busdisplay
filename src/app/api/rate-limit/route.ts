import { NextRequest, NextResponse } from 'next/server';
import { requireMetricsAuth } from '@/lib/auth/middleware';

// Compteur global des appels API (reset quotidien)
interface ApiCounter {
    stationboard: number;
    connections: number;
    locations: number;
    lastReset: string; // Date ISO
}

// Limites de l'API transport.opendata.ch
export const API_LIMITS = {
    stationboard: 10080, // 10 080 tableaux de départs/arrivées par jour
    connections: 1000,    // 1 000 demandes d'itinéraires par jour
    locations: 10000,     // Pas de limite officielle, on met 10000
};

// Stockage en mémoire (sera perdu au redémarrage)
let apiCounter: ApiCounter = {
    stationboard: 0,
    connections: 0,
    locations: 0,
    lastReset: new Date().toISOString().split('T')[0]
};

/**
 * Incrémente le compteur pour un endpoint
 */
export function incrementApiCounter(endpoint: 'stationboard' | 'connections' | 'locations'): void {
    // Reset si nouveau jour
    const today = new Date().toISOString().split('T')[0];
    if (apiCounter.lastReset !== today) {
        apiCounter = {
            stationboard: 0,
            connections: 0,
            locations: 0,
            lastReset: today
        };
    }

    apiCounter[endpoint]++;
}

/**
 * Récupère les compteurs actuels
 */
export function getApiCounters(): ApiCounter & { limits: typeof API_LIMITS } {
    // Reset si nouveau jour
    const today = new Date().toISOString().split('T')[0];
    if (apiCounter.lastReset !== today) {
        apiCounter = {
            stationboard: 0,
            connections: 0,
            locations: 0,
            lastReset: today
        };
    }

    return {
        ...apiCounter,
        limits: API_LIMITS
    };
}

/**
 * Vérifie si un endpoint a dépassé sa limite
 */
export function isRateLimited(endpoint: 'stationboard' | 'connections' | 'locations'): boolean {
    const counters = getApiCounters();
    return counters[endpoint] >= API_LIMITS[endpoint];
}

/**
 * GET /api/rate-limit
 * Récupère les compteurs d'appels API et les limites (protégé par authentification)
 */
export async function GET(request: NextRequest) {
    // Vérification de l'authentification
    const authError = requireMetricsAuth(request);
    if (authError) return authError;
    const counters = getApiCounters();

    // Calcul des pourcentages
    const usage = {
        stationboard: {
            current: counters.stationboard,
            limit: API_LIMITS.stationboard,
            percentage: Math.round((counters.stationboard / API_LIMITS.stationboard) * 100),
            remaining: API_LIMITS.stationboard - counters.stationboard
        },
        connections: {
            current: counters.connections,
            limit: API_LIMITS.connections,
            percentage: Math.round((counters.connections / API_LIMITS.connections) * 100),
            remaining: API_LIMITS.connections - counters.connections
        },
        locations: {
            current: counters.locations,
            limit: API_LIMITS.locations,
            percentage: Math.round((counters.locations / API_LIMITS.locations) * 100),
            remaining: API_LIMITS.locations - counters.locations
        }
    };

    // Avertissement si proche de la limite
    const warnings: string[] = [];
    if (usage.stationboard.percentage >= 80) {
        warnings.push(`Attention: ${usage.stationboard.percentage}% de la limite stationboard atteinte`);
    }
    if (usage.connections.percentage >= 80) {
        warnings.push(`Attention: ${usage.connections.percentage}% de la limite connections atteinte`);
    }

    return NextResponse.json({
        date: counters.lastReset,
        usage,
        warnings,
        resetAt: 'Minuit (heure locale)'
    }, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
