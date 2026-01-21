import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

/**
 * GET /api/server-info
 * Retourne les informations du serveur (IP locale, hostname)
 * Utile pour identifier quel noeud répond dans un environnement load-balanced
 */
export async function GET() {
    const interfaces = networkInterfaces();
    let serverIP = 'unknown';

    // Chercher l'IP locale (pas localhost)
    for (const name of Object.keys(interfaces)) {
        const netInterface = interfaces[name];
        if (!netInterface) continue;

        for (const net of netInterface) {
            // Ignorer les adresses internes et IPv6
            if (net.family === 'IPv4' && !net.internal) {
                serverIP = net.address;
                break;
            }
        }
        if (serverIP !== 'unknown') break;
    }

    return NextResponse.json({
        ip: serverIP,
        hostname: process.env.HOSTNAME || 'localhost',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
}
