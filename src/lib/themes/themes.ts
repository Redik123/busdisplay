/**
 * Système de Thèmes Saisonniers
 * 
 * Thèmes disponibles:
 * - classic: Design original noir sobre
 * - dark: Sombre moderne avec accents bleus
 * - christmas: Thème Noël avec rouge et vert
 * - summer: Thème été avec couleurs chaudes
 * - retro: Style rétro années 80
 * - ocean: Thème océan bleu
 */

export type ThemeId = 'classic' | 'dark' | 'christmas' | 'summer' | 'retro' | 'ocean';

export interface Theme {
    id: ThemeId;
    name: string;
    emoji: string;
    description: string;
    colors: ThemeColors;
    seasonal?: {
        startMonth: number;
        endMonth: number;
    };
}

export interface ThemeColors {
    // Backgrounds
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceHover: string;

    // Text
    text: string;
    textSecondary: string;
    textMuted: string;

    // Accents
    primary: string;
    primaryHover: string;
    accent: string;

    // Status
    success: string;
    warning: string;
    danger: string;

    // Border
    border: string;
    borderLight: string;

    // Special
    headerBackground: string;
    departureBg: string;
    departureHoverBg: string;
    clockColor: string;
}

// ========================
// Définition des thèmes
// ========================

export const themes: Record<ThemeId, Theme> = {
    // Thème Classic - Design original
    classic: {
        id: 'classic',
        name: 'Classic',
        emoji: '🎯',
        description: 'Design original sobre et élégant',
        colors: {
            background: '#000000',
            backgroundSecondary: '#0a0a0a',
            surface: '#1a1a1a',
            surfaceHover: '#2a2a2a',
            text: '#ffffff',
            textSecondary: '#cccccc',
            textMuted: '#888888',
            primary: '#4a90d9',
            primaryHover: '#5aa0e9',
            accent: '#4a90d9',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            border: '#333333',
            borderLight: '#444444',
            headerBackground: '#1a1a1a',
            departureBg: '#1a1a1a',
            departureHoverBg: '#252525',
            clockColor: '#ffffff',
        },
    },

    // Thème Dark - Moderne sombre
    dark: {
        id: 'dark',
        name: 'Sombre',
        emoji: '🌙',
        description: 'Thème sombre moderne avec accents bleus',
        colors: {
            background: '#111827',
            backgroundSecondary: '#0f172a',
            surface: '#1f2937',
            surfaceHover: '#374151',
            text: '#f9fafb',
            textSecondary: '#d1d5db',
            textMuted: '#6b7280',
            primary: '#3b82f6',
            primaryHover: '#2563eb',
            accent: '#10b981',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#ef4444',
            border: '#374151',
            borderLight: '#4b5563',
            headerBackground: '#1f2937',
            departureBg: 'rgba(31, 41, 55, 0.8)',
            departureHoverBg: 'rgba(55, 65, 81, 0.9)',
            clockColor: '#f9fafb',
        },
    },

    // Thème Noël
    christmas: {
        id: 'christmas',
        name: 'Noël',
        emoji: '🎄',
        description: 'Ambiance festive de Noël',
        seasonal: { startMonth: 12, endMonth: 1 },
        colors: {
            background: '#1a0f0f',
            backgroundSecondary: '#0f0808',
            surface: '#2d1515',
            surfaceHover: '#3d2020',
            text: '#fff5f5',
            textSecondary: '#fecaca',
            textMuted: '#f87171',
            primary: '#dc2626',
            primaryHover: '#b91c1c',
            accent: '#22c55e',
            success: '#22c55e',
            warning: '#fbbf24',
            danger: '#dc2626',
            border: '#4a2020',
            borderLight: '#5a3030',
            headerBackground: '#2d1515',
            departureBg: 'rgba(45, 21, 21, 0.9)',
            departureHoverBg: 'rgba(61, 32, 32, 0.9)',
            clockColor: '#fef2f2',
        },
    },

    // Thème Été
    summer: {
        id: 'summer',
        name: 'Été',
        emoji: '☀️',
        description: 'Couleurs chaudes et ensoleillées',
        seasonal: { startMonth: 6, endMonth: 8 },
        colors: {
            background: '#1c1917',
            backgroundSecondary: '#0c0a09',
            surface: '#292524',
            surfaceHover: '#44403c',
            text: '#fef3c7',
            textSecondary: '#fcd34d',
            textMuted: '#d97706',
            primary: '#f59e0b',
            primaryHover: '#d97706',
            accent: '#06b6d4',
            success: '#22c55e',
            warning: '#f59e0b',
            danger: '#dc2626',
            border: '#44403c',
            borderLight: '#57534e',
            headerBackground: '#292524',
            departureBg: 'rgba(41, 37, 36, 0.9)',
            departureHoverBg: 'rgba(68, 64, 60, 0.9)',
            clockColor: '#fef3c7',
        },
    },

    // Thème Rétro années 80
    retro: {
        id: 'retro',
        name: 'Rétro',
        emoji: '📼',
        description: 'Style synthwave rétro',
        colors: {
            background: '#0f0720',
            backgroundSecondary: '#08030f',
            surface: '#1a0f35',
            surfaceHover: '#2a1f55',
            text: '#f0e6ff',
            textSecondary: '#c4b5fd',
            textMuted: '#8b5cf6',
            primary: '#f472b6',
            primaryHover: '#ec4899',
            accent: '#06b6d4',
            success: '#4ade80',
            warning: '#facc15',
            danger: '#f43f5e',
            border: '#3b2070',
            borderLight: '#4c3090',
            headerBackground: '#1a0f35',
            departureBg: 'rgba(26, 15, 53, 0.9)',
            departureHoverBg: 'rgba(42, 31, 85, 0.9)',
            clockColor: '#f472b6',
        },
    },

    // Thème Océan
    ocean: {
        id: 'ocean',
        name: 'Océan',
        emoji: '🌊',
        description: 'Ambiance bleue apaisante',
        colors: {
            background: '#0c1929',
            backgroundSecondary: '#061019',
            surface: '#0f2942',
            surfaceHover: '#1a3a5c',
            text: '#e0f2fe',
            textSecondary: '#7dd3fc',
            textMuted: '#0ea5e9',
            primary: '#0ea5e9',
            primaryHover: '#0284c7',
            accent: '#2dd4bf',
            success: '#22c55e',
            warning: '#fbbf24',
            danger: '#f43f5e',
            border: '#1e4976',
            borderLight: '#2563eb',
            headerBackground: '#0f2942',
            departureBg: 'rgba(15, 41, 66, 0.9)',
            departureHoverBg: 'rgba(26, 58, 92, 0.9)',
            clockColor: '#e0f2fe',
        },
    },
};

// ========================
// Utilitaires
// ========================

/**
 * Retourne le thème par défaut basé sur la saison
 */
export function getSeasonalTheme(): ThemeId {
    const month = new Date().getMonth() + 1;

    for (const theme of Object.values(themes)) {
        if (theme.seasonal) {
            const { startMonth, endMonth } = theme.seasonal;
            if (startMonth <= endMonth) {
                if (month >= startMonth && month <= endMonth) return theme.id;
            } else {
                // Cas où la saison passe l'année (ex: Noël Dec-Jan)
                if (month >= startMonth || month <= endMonth) return theme.id;
            }
        }
    }

    return 'dark'; // Par défaut
}

/**
 * Génère les variables CSS pour un thème
 */
export function generateCSSVariables(theme: Theme): string {
    const { colors } = theme;
    return `
    --theme-background: ${colors.background};
    --theme-background-secondary: ${colors.backgroundSecondary};
    --theme-surface: ${colors.surface};
    --theme-surface-hover: ${colors.surfaceHover};
    --theme-text: ${colors.text};
    --theme-text-secondary: ${colors.textSecondary};
    --theme-text-muted: ${colors.textMuted};
    --theme-primary: ${colors.primary};
    --theme-primary-hover: ${colors.primaryHover};
    --theme-accent: ${colors.accent};
    --theme-success: ${colors.success};
    --theme-warning: ${colors.warning};
    --theme-danger: ${colors.danger};
    --theme-border: ${colors.border};
    --theme-border-light: ${colors.borderLight};
    --theme-header-bg: ${colors.headerBackground};
    --theme-departure-bg: ${colors.departureBg};
    --theme-departure-hover-bg: ${colors.departureHoverBg};
    --theme-clock-color: ${colors.clockColor};
  `;
}

/**
 * Liste des thèmes pour l'UI
 */
export const themesList = Object.values(themes);

/**
 * Récupère un thème par son ID
 */
export function getTheme(id: ThemeId): Theme {
    return themes[id] || themes.dark;
}
