/**
 * Système simple de tracking des clients connectés
 * Basé sur les requêtes vers /api/stationboard
 */

interface ClientConnection {
    id: string;
    lastSeen: number;
    station: string;
}

// Map des clients connectés (en mémoire)
const connectedClients = new Map<string, ClientConnection>();

// Timeout: considère un client déconnecté après 2 minutes d'inactivité
const CLIENT_TIMEOUT = 2 * 60 * 1000;

/**
 * Enregistre ou met à jour une connexion client
 */
export function trackClient(clientId: string, station: string): void {
    connectedClients.set(clientId, {
        id: clientId,
        lastSeen: Date.now(),
        station
    });

    // Nettoie les clients inactifs
    cleanupInactiveClients();
}

/**
 * Nettoie les clients qui n'ont pas donné signe de vie
 */
function cleanupInactiveClients(): void {
    const now = Date.now();
    for (const [clientId, client] of connectedClients.entries()) {
        if (now - client.lastSeen > CLIENT_TIMEOUT) {
            connectedClients.delete(clientId);
        }
    }
}

/**
 * Récupère le nombre de clients actifs
 */
export function getActiveClientsCount(): number {
    cleanupInactiveClients();
    return connectedClients.size;
}

/**
 * Récupère les détails des clients actifs
 */
export function getActiveClients(): ClientConnection[] {
    cleanupInactiveClients();
    return Array.from(connectedClients.values());
}

/**
 * Récupère les stats par station
 */
export function getClientsByStation(): Record<string, number> {
    cleanupInactiveClients();
    const stats: Record<string, number> = {};

    for (const client of connectedClients.values()) {
        stats[client.station] = (stats[client.station] || 0) + 1;
    }

    return stats;
}
