/**
 * Middleware d'authentification pour les endpoints sensibles
 * Utilise une clé API pour protéger l'accès aux routes admin et de monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Liste des clés API autorisées (en production, utiliser une base de données)
 * La clé par défaut doit être changée via la variable d'environnement ADMIN_API_KEY
 */
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'change-me-in-production';
const METRICS_API_KEY = process.env.METRICS_API_KEY || process.env.ADMIN_API_KEY || 'change-me-in-production';

/**
 * Vérifie si une requête est authentifiée avec une clé API valide
 * @param request - La requête Next.js
 * @param requiredKey - La clé API requise
 * @returns true si authentifié, false sinon
 */
export function isAuthenticated(request: NextRequest, requiredKey: string): boolean {
    // Vérifier dans le header Authorization (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        const token = authHeader.replace('Bearer ', '').trim();
        if (token === requiredKey) {
            return true;
        }
    }

    // Vérifier dans le header X-API-Key
    const apiKeyHeader = request.headers.get('x-api-key');
    if (apiKeyHeader && apiKeyHeader === requiredKey) {
        return true;
    }

    // Vérifier dans les query params (moins sécurisé, pour compatibilité)
    const apiKeyParam = request.nextUrl.searchParams.get('api_key');
    if (apiKeyParam && apiKeyParam === requiredKey) {
        return true;
    }

    return false;
}

/**
 * Middleware pour protéger les routes admin
 * @param request - La requête Next.js
 * @returns NextResponse ou null si authentifié
 */
export function requireAdminAuth(request: NextRequest): NextResponse | null {
    if (!isAuthenticated(request, ADMIN_API_KEY)) {
        return NextResponse.json(
            {
                error: 'Unauthorized',
                message: 'Une clé API valide est requise pour accéder à cette ressource',
                hint: 'Utilisez le header "Authorization: Bearer YOUR_KEY" ou "X-API-Key: YOUR_KEY"'
            },
            {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Bearer realm="Admin API"',
                    'Content-Type': 'application/json'
                }
            }
        );
    }
    return null;
}

/**
 * Middleware pour protéger les routes de monitoring (métriques, stats, etc.)
 * @param request - La requête Next.js
 * @returns NextResponse ou null si authentifié
 */
export function requireMetricsAuth(request: NextRequest): NextResponse | null {
    if (!isAuthenticated(request, METRICS_API_KEY)) {
        return NextResponse.json(
            {
                error: 'Unauthorized',
                message: 'Une clé API valide est requise pour accéder aux métriques',
                hint: 'Utilisez le header "Authorization: Bearer YOUR_KEY" ou "X-API-Key: YOUR_KEY"'
            },
            {
                status: 401,
                headers: {
                    'WWW-Authenticate': 'Bearer realm="Metrics API"',
                    'Content-Type': 'application/json'
                }
            }
        );
    }
    return null;
}

/**
 * Vérifie si la requête provient d'une IP autorisée (whitelist)
 * Utile pour une sécurité supplémentaire en production
 * @param request - La requête Next.js
 * @returns true si l'IP est autorisée
 */
export function isIPWhitelisted(request: NextRequest): boolean {
    const allowedIPs = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

    if (allowedIPs.length === 0) {
        // Si aucune IP n'est configurée, autoriser par défaut (mode dev)
        return true;
    }

    // Récupérer l'IP du client
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               request.headers.get('x-real-ip') ||
               'unknown';

    return allowedIPs.includes(ip) || allowedIPs.includes('*');
}

/**
 * Middleware combiné: API Key + IP Whitelist
 * @param request - La requête Next.js
 * @param requiredKey - La clé API requise
 * @returns NextResponse ou null si authentifié et IP autorisée
 */
export function requireAuthWithIP(request: NextRequest, requiredKey: string): NextResponse | null {
    // Vérifier d'abord l'IP
    if (!isIPWhitelisted(request)) {
        return NextResponse.json(
            {
                error: 'Forbidden',
                message: 'Accès refusé depuis cette adresse IP'
            },
            { status: 403 }
        );
    }

    // Puis vérifier l'authentification
    if (!isAuthenticated(request, requiredKey)) {
        return NextResponse.json(
            {
                error: 'Unauthorized',
                message: 'Une clé API valide est requise'
            },
            { status: 401 }
        );
    }

    return null;
}
