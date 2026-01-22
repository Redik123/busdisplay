import { NextResponse } from 'next/server';

/**
 * GET /api/time
 * Retourne le timestamp précis du serveur pour synchroniser les horloges des afficheurs
 */
export async function GET() {
    return NextResponse.json({
        timestamp: Date.now(),
        iso: new Date().toISOString()
    }, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
