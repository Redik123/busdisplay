'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppConfig, Station, SleepMode, ThemeConfig } from '@/types/config';
import { defaultConfig, validateConfig } from '@/types/config';

// Interface du store
interface ConfigStore {
    // État
    config: AppConfig;
    isHydrated: boolean;

    // Actions station
    setStation: (station: Station) => void;
    clearStation: () => void;

    // Actions filtres
    toggleLine: (line: string) => void;
    setFilteredLines: (lines: string[]) => void;
    clearFilteredLines: () => void;
    toggleDirection: (direction: string) => void;
    setFilteredDirections: (directions: string[]) => void;
    clearFilteredDirections: () => void;

    // Actions mode veille
    updateSleepMode: (sleepMode: Partial<SleepMode>) => void;
    toggleSleepMode: () => void;

    // Actions thème
    updateTheme: (theme: Partial<ThemeConfig>) => void;
    setThemeMode: (mode: 'dark' | 'light' | 'auto') => void;

    // Actions générales
    updateConfig: (partial: Partial<AppConfig>) => void;
    resetConfig: () => void;
    setHydrated: (hydrated: boolean) => void;
}

/**
 * Hook de gestion de la configuration avec Zustand
 * Persiste automatiquement dans localStorage
 */
export const useConfig = create<ConfigStore>()(
    persist(
        (set) => ({
            // État initial
            config: defaultConfig,
            isHydrated: false,

            // Station
            setStation: (station) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        station,
                        // Reset des filtres quand on change de station
                        filteredLines: [],
                        filteredDirections: []
                    }
                })),

            clearStation: () =>
                set((state) => ({
                    config: {
                        ...state.config,
                        station: { id: null, name: 'Sélectionnez une station' },
                        filteredLines: [],
                        filteredDirections: []
                    }
                })),

            // Lignes
            toggleLine: (line) =>
                set((state) => {
                    const lines = state.config.filteredLines.includes(line)
                        ? state.config.filteredLines.filter(l => l !== line)
                        : [...state.config.filteredLines, line];
                    return { config: { ...state.config, filteredLines: lines } };
                }),

            setFilteredLines: (lines) =>
                set((state) => ({
                    config: { ...state.config, filteredLines: lines }
                })),

            clearFilteredLines: () =>
                set((state) => ({
                    config: { ...state.config, filteredLines: [] }
                })),

            // Directions
            toggleDirection: (direction) =>
                set((state) => {
                    const dirs = state.config.filteredDirections.includes(direction)
                        ? state.config.filteredDirections.filter(d => d !== direction)
                        : [...state.config.filteredDirections, direction];
                    return { config: { ...state.config, filteredDirections: dirs } };
                }),

            setFilteredDirections: (directions) =>
                set((state) => ({
                    config: { ...state.config, filteredDirections: directions }
                })),

            clearFilteredDirections: () =>
                set((state) => ({
                    config: { ...state.config, filteredDirections: [] }
                })),

            // Mode veille
            updateSleepMode: (sleepMode) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        sleepMode: { ...state.config.sleepMode, ...sleepMode }
                    }
                })),

            toggleSleepMode: () =>
                set((state) => ({
                    config: {
                        ...state.config,
                        sleepMode: {
                            ...state.config.sleepMode,
                            enabled: !state.config.sleepMode.enabled
                        }
                    }
                })),

            // Thème
            updateTheme: (theme) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        theme: { ...state.config.theme, ...theme }
                    }
                })),

            setThemeMode: (mode) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        theme: { ...state.config.theme, mode }
                    }
                })),

            // Général
            updateConfig: (partial) =>
                set((state) => ({
                    config: validateConfig({ ...state.config, ...partial })
                })),

            resetConfig: () => set({ config: defaultConfig }),

            setHydrated: (hydrated) => set({ isHydrated: hydrated })
        }),
        {
            name: 'bus-display-config',
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            }
        }
    )
);

/**
 * Hook pour vérifier si la config est chargée
 * Utile pour éviter les problèmes d'hydratation SSR
 */
export function useConfigHydrated(): boolean {
    return useConfig((state) => state.isHydrated);
}

/**
 * Hook pour récupérer uniquement la station
 */
export function useStation() {
    return useConfig((state) => ({
        station: state.config.station,
        setStation: state.setStation,
        clearStation: state.clearStation
    }));
}

/**
 * Hook pour récupérer uniquement le thème
 */
export function useThemeConfig() {
    return useConfig((state) => ({
        theme: state.config.theme,
        setThemeMode: state.setThemeMode,
        updateTheme: state.updateTheme
    }));
}
