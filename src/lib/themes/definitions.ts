/**
 * Définitions des thèmes
 * Chaque thème définit couleurs, styles et animations
 */

import type { Theme } from './types';
import { defaultStyles, defaultAnimations } from './types';

// ============================================
// THÈME CLASSIC (Sombre Original)
// ============================================

export const classicTheme: Theme = {
    id: 'classic',
    name: 'Classic',
    description: 'Design original sombre',
    emoji: '🎯',
    layoutId: 'default',

    colors: {
        background: '#000000',
        backgroundSecondary: '#0a0a0a',
        surface: '#1a1a1a',
        surfaceHover: '#252525',
        footer: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc',
        textMuted: '#888888',
        header: '#ffffff',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        accent: '#FFD700',
        success: '#4CAF50',
        warning: '#ff9800',
        error: '#ff4444',
        border: '#333333',
        borderLight: '#444444',
        lineNumberBg: '#FFD700',
        lineNumberColor: '#000000',
    },

    styles: defaultStyles,
    animations: defaultAnimations,
};

// ============================================
// THÈME LIGHT (Clair Original)
// ============================================

export const lightTheme: Theme = {
    id: 'light',
    name: 'Clair',
    description: 'Design clair lumineux',
    emoji: '☀️',
    layoutId: 'default',

    colors: {
        background: '#ffffff',
        backgroundSecondary: '#f5f5f5',
        surface: '#f0f0f0',
        surfaceHover: '#e5e5e5',
        footer: '#f0f0f0',
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        header: '#000000',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        accent: '#FFD700',
        success: '#4CAF50',
        warning: '#ff9800',
        error: '#ff4444',
        border: '#e0e0e0',
        borderLight: '#d0d0d0',
        lineNumberBg: '#FFD700',
        lineNumberColor: '#000000',
    },

    styles: defaultStyles,
    animations: defaultAnimations,
};

// ============================================
// THÈME NOËL
// ============================================

export const christmasTheme: Theme = {
    id: 'christmas',
    name: 'Noël',
    description: 'Ambiance festive de Noël',
    emoji: '🎄',
    layoutId: 'default',
    seasonal: { startMonth: 12, endMonth: 1 },

    colors: {
        background: '#1a0a0a',
        backgroundSecondary: '#0f0505',
        surface: '#2d1515',
        surfaceHover: '#3d2020',
        footer: '#2d1515',
        text: '#fff5f5',
        textSecondary: '#fecaca',
        textMuted: '#f87171',
        header: '#fff5f5',
        primary: '#dc2626',
        primaryHover: '#b91c1c',
        accent: '#22c55e',
        success: '#22c55e',
        warning: '#fbbf24',
        error: '#dc2626',
        border: '#4a2020',
        borderLight: '#5a3030',
        lineNumberBg: '#dc2626',
        lineNumberColor: '#ffffff',
    },

    styles: {
        ...defaultStyles,
        borderRadius: {
            small: '8px',
            medium: '12px',
            large: '20px',
            full: '9999px',
        },
    },

    animations: {
        ...defaultAnimations,
        approachingGlow: true,
    },
};

// ============================================
// THÈME ÉTÉ
// ============================================

export const summerTheme: Theme = {
    id: 'summer',
    name: 'Été',
    description: 'Couleurs chaudes et ensoleillées',
    emoji: '🌴',
    layoutId: 'default',
    seasonal: { startMonth: 6, endMonth: 8 },

    colors: {
        background: '#1c1917',
        backgroundSecondary: '#0c0a09',
        surface: '#292524',
        surfaceHover: '#44403c',
        footer: '#292524',
        text: '#fef3c7',
        textSecondary: '#fcd34d',
        textMuted: '#d97706',
        header: '#fef3c7',
        primary: '#f59e0b',
        primaryHover: '#d97706',
        accent: '#06b6d4',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#dc2626',
        border: '#44403c',
        borderLight: '#57534e',
        lineNumberBg: '#f59e0b',
        lineNumberColor: '#000000',
    },

    styles: defaultStyles,
    animations: defaultAnimations,
};

// ============================================
// THÈME RÉTRO (Synthwave 80s)
// ============================================

export const retroTheme: Theme = {
    id: 'retro',
    name: 'Rétro',
    description: 'Style synthwave années 80',
    emoji: '📼',
    layoutId: 'default',

    colors: {
        background: '#0f0720',
        backgroundSecondary: '#08030f',
        surface: '#1a0f35',
        surfaceHover: '#2a1f55',
        footer: '#1a0f35',
        text: '#f0e6ff',
        textSecondary: '#c4b5fd',
        textMuted: '#8b5cf6',
        header: '#f0e6ff',
        primary: '#f472b6',
        primaryHover: '#ec4899',
        accent: '#06b6d4',
        success: '#4ade80',
        warning: '#facc15',
        error: '#f43f5e',
        border: '#3b2070',
        borderLight: '#4c3090',
        lineNumberBg: '#f472b6',
        lineNumberColor: '#000000',
    },

    styles: {
        ...defaultStyles,
        borderRadius: {
            small: '0px',
            medium: '4px',
            large: '8px',
            full: '9999px',
        },
    },

    animations: {
        ...defaultAnimations,
        cardHover: true,
    },
};

// ============================================
// THÈME OCÉAN
// ============================================

export const oceanTheme: Theme = {
    id: 'ocean',
    name: 'Océan',
    description: 'Ambiance bleue apaisante',
    emoji: '🌊',
    layoutId: 'default',

    colors: {
        background: '#0c1929',
        backgroundSecondary: '#061019',
        surface: '#0f2942',
        surfaceHover: '#1a3a5c',
        footer: '#0f2942',
        text: '#e0f2fe',
        textSecondary: '#7dd3fc',
        textMuted: '#0ea5e9',
        header: '#e0f2fe',
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        accent: '#2dd4bf',
        success: '#22c55e',
        warning: '#fbbf24',
        error: '#f43f5e',
        border: '#1e4976',
        borderLight: '#2563eb',
        lineNumberBg: '#0ea5e9',
        lineNumberColor: '#ffffff',
    },

    styles: defaultStyles,
    animations: defaultAnimations,
};

// ============================================
// EXPORTS
// ============================================

export const themes: Record<string, Theme> = {
    classic: classicTheme,
    light: lightTheme,
    christmas: christmasTheme,
    summer: summerTheme,
    retro: retroTheme,
    ocean: oceanTheme,
};

export const themesList = Object.values(themes);

export function getTheme(id: string): Theme {
    return themes[id] || classicTheme;
}

export function getSeasonalTheme(): Theme {
    const month = new Date().getMonth() + 1;

    for (const theme of themesList) {
        if (theme.seasonal) {
            const { startMonth, endMonth } = theme.seasonal;
            if (startMonth <= endMonth) {
                if (month >= startMonth && month <= endMonth) return theme;
            } else {
                if (month >= startMonth || month <= endMonth) return theme;
            }
        }
    }

    return classicTheme;
}
