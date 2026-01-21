import { NextResponse } from 'next/server';

/**
 * GET /api/ping
 * Endpoint simple et public pour le healthcheck du load balancer Jelastic
 * Ne nécessite pas d'authentification
 */
export async function GET() {
    return new NextResponse('pong', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
