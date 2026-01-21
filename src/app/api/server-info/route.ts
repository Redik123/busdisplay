import { NextResponse } from 'next/server';
import { networkInterfaces } from 'os';

/**
 * Vérifie si une IP est une IP privée (interne)
 */
function isPrivateIP(ip: string): boolean {
    return ip.startsWith('10.') ||
        ip.startsWith('172.16.') || ip.startsWith('172.17.') || ip.startsWith('172.18.') ||
        ip.startsWith('172.19.') || ip.startsWith('172.2') || ip.startsWith('172.30.') ||
        ip.startsWith('172.31.') || ip.startsWith('192.168.');
}

/**
 * GET /api/server-info
 * Retourne les informations du serveur (IP locale, hostname)
 * Utile pour identifier quel noeud répond dans un environnement load-balanced
 */
export async function GET() {
    const interfaces = networkInterfaces();
    const allIPs: string[] = [];

    // Collecter toutes les IPs IPv4 non-localhost
    for (const name of Object.keys(interfaces)) {
        const netInterface = interfaces[name];
        if (!netInterface) continue;

        for (const net of netInterface) {
            if (net.family === 'IPv4' && !net.internal && net.address !== '127.0.0.1') {
                allIPs.push(net.address);
            }
        }
    }

    // Priorité : IP privée (10.x.x.x) > autres IPs > unknown
    let serverIP = allIPs.find(ip => isPrivateIP(ip)) || allIPs[0] || 'unknown';

    return NextResponse.json({
        ip: serverIP,
        hostname: process.env.HOSTNAME || 'localhost',
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
}
