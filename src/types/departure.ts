// Types pour les départs de bus

export interface DepartureStop {
    departure: string;           // Heure de départ formatée
    departureTimestamp: number;  // Timestamp Unix
    delay: number;               // Retard en minutes
    platform?: string;           // Quai/voie prévu
    prognosisPlatform?: string;  // Quai/voie réel (si différent)
    isPlatformChanged?: boolean; // Si le quai a changé
    status: string;              // Statut (ex: "CANCELLED")
    isPastDeparture: boolean;    // Si le départ est passé
    isApproaching: boolean;      // Si le bus arrive bientôt (<1min)
}

export interface Departure {
    number: string;         // Numéro de ligne (ex: "12", "D", "421")
    to: string;             // Destination
    category?: string;      // Catégorie (bus, tram, etc.)
    operator?: string;      // Opérateur
    stop: DepartureStop;
}

export interface StationInfo {
    id: string;
    name: string;
    score?: number;
    coordinate?: {
        x: number;
        y: number;
    };
}

export interface StationboardResponse {
    station: StationInfo;
    stationboard: Departure[];
}

// Fonction utilitaire pour formater le temps restant
export function formatTimeRemaining(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    const minutes = Math.floor(diff / 60);

    if (minutes <= 0) return '∞';
    if (minutes < 60) return `${minutes}'`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
}

// Fonction pour déterminer si un départ est imminent
export function isDepartureApproaching(timestamp: number, thresholdMinutes: number = 1): boolean {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    const minutes = diff / 60;
    return minutes > 0 && minutes <= thresholdMinutes;
}

// Fonction pour déterminer si un départ est passé
export function isDeparturePast(timestamp: number): boolean {
    const now = Date.now() / 1000;
    return timestamp < now;
}
