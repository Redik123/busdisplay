'use client';

import { useEffect, useState, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    type Theme,
    type ThemeId,
    type ThemeConfig,
    themes,
    getTheme,
    getSeasonalTheme,
    defaultThemeConfig,
} from '@/lib/themes';

// ============================================
// Store Zustand pour le thème
// ============================================

interface ThemeState extends ThemeConfig {
    setThemeId: (id: ThemeId) => void;
    setAutoSeasonal: (auto: boolean) => void;
    setSchedule: (schedule: ThemeConfig['schedule']) => void;
    cycleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            ...defaultThemeConfig,

            setThemeId: (themeId) => set({ themeId, autoSeasonal: false }),

            setAutoSeasonal: (autoSeasonal) => {
                if (autoSeasonal) {
                    const seasonal = getSeasonalTheme();
                    set({ autoSeasonal: true, themeId: seasonal.id });
                } else {
                    set({ autoSeasonal: false });
                }
            },

            setSchedule: (schedule) => set({ schedule }),

            cycleTheme: () => {
                const themeIds = Object.keys(themes) as ThemeId[];
                const currentIndex = themeIds.indexOf(get().themeId);
                const nextIndex = (currentIndex + 1) % themeIds.length;
                set({ themeId: themeIds[nextIndex], autoSeasonal: false });
            },
        }),
        {
            name: 'bus-display-theme',
        }
    )
);

// ============================================
// Fonction pour appliquer les variables CSS
// ============================================

function applyThemeCSS(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const { colors, styles } = theme;

    // Appliquer data-theme pour le CSS existant
    root.setAttribute('data-theme', theme.id === 'light' ? 'light' : 'dark');

    // Variables de couleur
    root.style.setProperty('--bg-color', colors.background);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--card-bg', colors.surface);
    root.style.setProperty('--card-hover', colors.surfaceHover);
    root.style.setProperty('--footer', colors.footer);
    root.style.setProperty('--header-color', colors.header);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--line-number-bg', colors.lineNumberBg);
    root.style.setProperty('--error-color', colors.error);

    // Variables supplémentaires pour thèmes avancés
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);

    // Variables de style
    root.style.setProperty('--border-radius-small', styles.borderRadius.small);
    root.style.setProperty('--border-radius-medium', styles.borderRadius.medium);
    root.style.setProperty('--border-radius-large', styles.borderRadius.large);

    // Mettre à jour la meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', colors.background);
    }
}

// ============================================
// Fonction pour vérifier le thème planifié
// ============================================

function checkScheduledTheme(config: ThemeConfig): ThemeId {
    if (!config.schedule?.enabled) return config.themeId;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = config.schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = config.schedule.endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const isLightTime = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    return isLightTime
        ? (config.schedule.lightTheme || 'light')
        : (config.schedule.darkTheme || 'classic');
}

// ============================================
// Hook useTheme
// ============================================

interface UseThemeReturn {
    theme: Theme;
    themeId: ThemeId;
    autoSeasonal: boolean;
    isHydrated: boolean;
    setTheme: (id: ThemeId) => void;
    setAutoSeasonal: (auto: boolean) => void;
    cycleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
    const store = useThemeStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Obtenir le thème effectif
    const effectiveThemeId = store.autoSeasonal
        ? getSeasonalTheme().id
        : checkScheduledTheme(store);

    const theme = getTheme(effectiveThemeId);

    // Hydratation - utilisation de setTimeout pour éviter le warning ESLint
    useEffect(() => {
        const timer = setTimeout(() => setIsHydrated(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // Appliquer le thème
    const applyTheme = useCallback(() => {
        applyThemeCSS(theme);
    }, [theme]);

    useEffect(() => {
        if (isHydrated) {
            applyTheme();
        }
    }, [isHydrated, applyTheme]);

    // Vérification périodique pour thème planifié
    useEffect(() => {
        if (!store.schedule?.enabled) return;

        const interval = setInterval(() => {
            const newThemeId = checkScheduledTheme(store);
            if (newThemeId !== store.themeId) {
                store.setThemeId(newThemeId);
            }
        }, 60000); // Vérifie chaque minute

        return () => clearInterval(interval);
    }, [store]);

    return {
        theme,
        themeId: effectiveThemeId,
        autoSeasonal: store.autoSeasonal,
        isHydrated,
        setTheme: store.setThemeId,
        setAutoSeasonal: store.setAutoSeasonal,
        cycleTheme: store.cycleTheme,
    };
}

// ============================================
// Hook pour vérifier l'hydratation
// ============================================

export function useThemeHydrated(): boolean {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setHydrated(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return hydrated;
}

// ============================================
// Export des types
// ============================================

export type { Theme, ThemeId, ThemeConfig };
