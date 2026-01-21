import { NextResponse } from 'next/server';
import { getActiveClientsCount, getActiveClients, getClientsByStation } from '@/lib/connectedClients';

/**
 * GET /api/clients
 * Retourne les statistiques des clients connectés
 */
export async function GET() {
    try {
        const totalClients = getActiveClientsCount();
        const clients = getActiveClients();
        const byStation = getClientsByStation();

        return NextResponse.json({
            success: true,
            data: {
                total: totalClients,
                byStation,
                clients: clients.map(c => ({
                    id: c.id,
                    station: c.station,
                    lastSeen: new Date(c.lastSeen).toISOString(),
                    connectedFor: Math.floor((Date.now() - c.lastSeen) / 1000)
                }))
            }
        });
    } catch (error) {
        console.error('[API /clients] Erreur:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur lors de la récupération des clients' },
            { status: 500 }
        );
    }
}
