// Utilitaires pour la gestion du temps

/**
 * Formate une heure en string "HH:mm"
 */
export function formatTime(date: Date = new Date()): string {
    return date.toLocaleTimeString('fr-CH', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formate une date complète
 */
export function formatDate(date: Date = new Date()): string {
    return date.toLocaleDateString('fr-CH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

/**
 * Vérifie si l'heure actuelle est dans une plage horaire
 * Gère les plages qui passent minuit (ex: 23:00 - 05:00)
 */
export function isWithinTimeRange(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Cas où la plage ne passe pas minuit
    if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    // Cas où la plage passe minuit (ex: 23:00 - 05:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

/**
 * Calcule le temps restant jusqu'à un timestamp
 */
export function getTimeRemaining(timestamp: number): {
    minutes: number;
    seconds: number;
    total: number;
    isNegative: boolean;
} {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    const isNegative = diff < 0;
    const absDiff = Math.abs(diff);

    return {
        minutes: Math.floor(absDiff / 60),
        seconds: Math.floor(absDiff % 60),
        total: Math.floor(diff),
        isNegative
    };
}

/**
 * Formate les minutes restantes de façon lisible
 */
export function formatMinutesRemaining(timestamp: number): string {
    const { minutes, isNegative } = getTimeRemaining(timestamp);

    if (isNegative) return '∞';
    if (minutes === 0) return '<1\'';
    if (minutes < 60) return `${minutes}'`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Parse une heure au format "HH:mm" et retourne les minutes depuis minuit
 */
export function parseTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convertit des minutes depuis minuit en string "HH:mm"
 */
export function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
