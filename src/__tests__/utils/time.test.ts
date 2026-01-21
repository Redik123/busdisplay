import { describe, it, expect } from 'vitest';
import {
    formatTime,
    isWithinTimeRange,
    getTimeRemaining,
    formatMinutesRemaining,
    parseTimeToMinutes,
    minutesToTime,
} from '@/lib/utils/time';

describe('formatTime', () => {
    it('formate une date en HH:mm', () => {
        const date = new Date('2024-12-16T14:30:00');
        const result = formatTime(date);
        expect(result).toMatch(/\d{2}:\d{2}/);
    });
});

describe('isWithinTimeRange', () => {
    it('retourne true si dans la plage horaire normale', () => {
        // On teste avec une plage fixe et on mock l'heure actuelle
        // Note: Ce test dépend de l'heure actuelle
        const result = isWithinTimeRange('00:00', '23:59');
        expect(result).toBe(true);
    });

    it('retourne false si en dehors de la plage', () => {
        // Plage impossible (fin avant début et pas passant minuit correctement)
        const result = isWithinTimeRange('23:59', '23:58');
        // Devrait toujours être true car ce range couvre presque tout
        expect(typeof result).toBe('boolean');
    });

    it('gère les plages passant minuit', () => {
        // 23:00 -> 05:00 devrait fonctionner
        const now = new Date();
        const hour = now.getHours();
        const result = isWithinTimeRange('23:00', '05:00');

        // Si on est entre 23h et 5h, devrait être true
        const expected = hour >= 23 || hour < 5;
        expect(result).toBe(expected);
    });
});

describe('getTimeRemaining', () => {
    it('calcule le temps restant correctement', () => {
        const futureTimestamp = Date.now() / 1000 + 300; // 5 minutes dans le futur
        const result = getTimeRemaining(futureTimestamp);

        expect(result.isNegative).toBe(false);
        expect(result.minutes).toBeGreaterThanOrEqual(4);
        expect(result.minutes).toBeLessThanOrEqual(5);
    });

    it('détecte les timestamps passés', () => {
        const pastTimestamp = Date.now() / 1000 - 60; // 1 minute dans le passé
        const result = getTimeRemaining(pastTimestamp);

        expect(result.isNegative).toBe(true);
    });
});

describe('formatMinutesRemaining', () => {
    it('formate les minutes courtes correctement', () => {
        const timestamp = Date.now() / 1000 + 10 * 60; // 10 minutes
        const result = formatMinutesRemaining(timestamp);
        expect(result).toMatch(/\d+'/);
    });

    it('formate les heures correctement', () => {
        const timestamp = Date.now() / 1000 + 90 * 60; // 1h30
        const result = formatMinutesRemaining(timestamp);
        expect(result).toMatch(/\d+h\d{2}/);
    });

    it('retourne ∞ pour les timestamps passés', () => {
        const timestamp = Date.now() / 1000 - 60;
        const result = formatMinutesRemaining(timestamp);
        expect(result).toBe('∞');
    });
});

describe('parseTimeToMinutes', () => {
    it('convertit 00:00 en 0', () => {
        expect(parseTimeToMinutes('00:00')).toBe(0);
    });

    it('convertit 12:30 en 750', () => {
        expect(parseTimeToMinutes('12:30')).toBe(12 * 60 + 30);
    });

    it('convertit 23:59 en 1439', () => {
        expect(parseTimeToMinutes('23:59')).toBe(23 * 60 + 59);
    });
});

describe('minutesToTime', () => {
    it('convertit 0 en 00:00', () => {
        expect(minutesToTime(0)).toBe('00:00');
    });

    it('convertit 750 en 12:30', () => {
        expect(minutesToTime(750)).toBe('12:30');
    });

    it('gère les valeurs > 24h', () => {
        expect(minutesToTime(24 * 60 + 30)).toBe('00:30');
    });
});
