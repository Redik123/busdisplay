import { describe, it, expect } from 'vitest';
import {
    formatTimeRemaining,
    isDepartureApproaching,
    isDeparturePast,
} from '@/types/departure';
import { defaultConfig, validateConfig } from '@/types/config';

describe('Departure Types - formatTimeRemaining', () => {
    it('formate les minutes courtes', () => {
        const timestamp = Date.now() / 1000 + 5 * 60; // 5 minutes
        const result = formatTimeRemaining(timestamp);
        expect(result).toMatch(/\d+'/);
    });

    it('formate les heures', () => {
        const timestamp = Date.now() / 1000 + 2 * 60 * 60; // 2 heures
        const result = formatTimeRemaining(timestamp);
        expect(result).toMatch(/\d+h\d{2}/);
    });

    it('retourne ∞ pour les timestamps passés', () => {
        const timestamp = Date.now() / 1000 - 60;
        const result = formatTimeRemaining(timestamp);
        expect(result).toBe('∞');
    });
});

describe('Departure Types - isDepartureApproaching', () => {
    it('retourne true pour un départ dans moins de 2 minutes', () => {
        const timestamp = Date.now() / 1000 + 60; // 1 minute
        expect(isDepartureApproaching(timestamp)).toBe(true);
    });

    it('retourne false pour un départ dans plus de 2 minutes', () => {
        const timestamp = Date.now() / 1000 + 180; // 3 minutes
        expect(isDepartureApproaching(timestamp)).toBe(false);
    });

    it('retourne false pour un départ passé', () => {
        const timestamp = Date.now() / 1000 - 60;
        expect(isDepartureApproaching(timestamp)).toBe(false);
    });

    it('respecte le threshold personnalisé', () => {
        const timestamp = Date.now() / 1000 + 240; // 4 minutes
        expect(isDepartureApproaching(timestamp, 5)).toBe(true);
        expect(isDepartureApproaching(timestamp, 3)).toBe(false);
    });
});

describe('Departure Types - isDeparturePast', () => {
    it('retourne true pour un timestamp passé', () => {
        const timestamp = Date.now() / 1000 - 60;
        expect(isDeparturePast(timestamp)).toBe(true);
    });

    it('retourne false pour un timestamp futur', () => {
        const timestamp = Date.now() / 1000 + 60;
        expect(isDeparturePast(timestamp)).toBe(false);
    });
});

describe('Config Types - defaultConfig', () => {
    it('a une station par défaut non configurée', () => {
        expect(defaultConfig.station.id).toBeNull();
        expect(defaultConfig.station.name).toBe('Sélectionnez une station');
    });

    it('a le mode veille désactivé par défaut', () => {
        expect(defaultConfig.sleepMode.enabled).toBe(false);
    });

    it('a un intervalle de rafraîchissement de 2 minutes', () => {
        expect(defaultConfig.refreshInterval).toBe(120000);
    });

    it('a le thème sombre par défaut', () => {
        expect(defaultConfig.theme.mode).toBe('dark');
    });
});

describe('Config Types - validateConfig', () => {
    it('garde les valeurs valides', () => {
        const config = validateConfig({
            refreshInterval: 60000,
        });
        expect(config.refreshInterval).toBe(60000);
    });

    it('corrige un refreshInterval trop petit', () => {
        const config = validateConfig({
            refreshInterval: 1000, // Trop petit
        });
        expect(config.refreshInterval).toBe(30000); // Minimum
    });

    it('corrige un refreshInterval trop grand', () => {
        const config = validateConfig({
            refreshInterval: 1000000, // Trop grand
        });
        expect(config.refreshInterval).toBe(300000); // Maximum
    });

    it('fusionne avec les valeurs par défaut', () => {
        const config = validateConfig({
            station: { id: '123', name: 'Test' },
        });
        expect(config.station.id).toBe('123');
        expect(config.sleepMode).toEqual(defaultConfig.sleepMode);
    });
});
