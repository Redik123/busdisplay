/**
 * Types pour le système de thèmes avancé
 * Permet de changer couleurs, styles ET layouts
 */

// ============================================
// IDENTIFIANTS
// ============================================

export type ThemeId = 'classic' | 'light' | 'christmas' | 'summer' | 'retro' | 'ocean';
export type LayoutId = 'default' | 'compact' | 'minimal';

// ============================================
// COULEURS
// ============================================

export interface ThemeColors {
    // Arrière-plans
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;
    footer: string;

    // Texte
    text: string;
    textSecondary: string;
    textMuted: string;
    header: string;

    // Accents
    primary: string;
    primaryHover: string;
    accent: string;

    // États
    success: string;
    warning: string;
    error: string;

    // Bordures
    border: string;
    borderLight: string;

    // Spécifiques
    lineNumberBg: string;
    lineNumberColor: string;
}

// ============================================
// STYLES
// ============================================

export interface ThemeStyles {
    // Rayons de bordure
    borderRadius: {
        small: string;
        medium: string;
        large: string;
        full: string;
    };

    // Espacement
    spacing: {
        cardPadding: string;
        gap: string;
    };

    // Typographie
    fontSize: {
        clock: string;
        lineNumber: string;
        destination: string;
        time: string;
        minutesLeft: string;
    };

    // Ombres
    shadow: {
        card: string;
        elevated: string;
    };
}

// ============================================
// ANIMATIONS
// ============================================

export interface ThemeAnimations {
    // Durées
    duration: {
        fast: string;
        normal: string;
        slow: string;
    };

    // Easing
    easing: string;

    // Animations spécifiques (noms CSS)
    cardHover: boolean;
    fadeSlideIn: boolean;
    approachingGlow: boolean;
}

// ============================================
// THEME COMPLET
// ============================================

export interface Theme {
    id: ThemeId;
    name: string;
    description: string;
    emoji: string;

    // Layout à utiliser
    layoutId: LayoutId;

    // Définitions
    colors: ThemeColors;
    styles: ThemeStyles;
    animations: ThemeAnimations;

    // Saisonnier (optionnel)
    seasonal?: {
        startMonth: number;  // 1-12
        endMonth: number;    // 1-12
    };
}

// ============================================
// THEME CONFIG (stocké dans localStorage)
// ============================================

export interface ThemeConfig {
    themeId: ThemeId;
    layoutId?: LayoutId;  // Override du layout
    autoSeasonal: boolean;
    schedule?: {
        enabled: boolean;
        startTime: string;  // "06:00"
        endTime: string;    // "22:00"
        lightTheme: ThemeId;
        darkTheme: ThemeId;
    };
}

// ============================================
// VALEURS PAR DÉFAUT
// ============================================

export const defaultColors: ThemeColors = {
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
};

export const defaultStyles: ThemeStyles = {
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '16px',
        full: '9999px',
    },
    spacing: {
        cardPadding: '1.5rem',
        gap: '2rem',
    },
    fontSize: {
        clock: '4rem',
        lineNumber: '2.5rem',
        destination: '2.5rem',
        time: '2.5rem',
        minutesLeft: '3rem',
    },
    shadow: {
        card: 'none',
        elevated: '0 4px 6px rgba(0,0,0,0.1)',
    },
};

export const defaultAnimations: ThemeAnimations = {
    duration: {
        fast: '0.15s',
        normal: '0.3s',
        slow: '0.5s',
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    cardHover: true,
    fadeSlideIn: true,
    approachingGlow: true,
};

export const defaultThemeConfig: ThemeConfig = {
    themeId: 'classic',
    autoSeasonal: false,
};
