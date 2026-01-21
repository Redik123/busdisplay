/**
 * Système de Layouts
 * 
 * Permet de changer l'agencement des composants indépendamment des couleurs
 * 
 * Layouts disponibles:
 * - default: Design original avec grandes cards
 * - compact: Plus condensé, plus de départs visibles
 * - minimal: Épuré, juste l'essentiel
 */

import type { LayoutId } from './types';

// ============================================
// TYPES
// ============================================

export interface LayoutConfig {
    id: LayoutId;
    name: string;
    description: string;
    emoji: string;

    // Configuration du header
    header: {
        height: string;
        showBusIcon: boolean;
        showLinesBadge: boolean;
        iconSize: string;
        titleSize: string;
    };

    // Configuration des départs
    departures: {
        cardPadding: string;
        cardMargin: string;
        cardMinHeight: string;
        gridColumns: string;  // CSS grid-template-columns
        gap: string;
        fontSize: {
            lineNumber: string;
            time: string;
            destination: string;
            minutesLeft: string;
        };
        lineNumberSize: string;  // Taille du badge
        showSeconds: boolean;
        maxVisible: number;
    };

    // Configuration du footer
    footer: {
        height: string;
        clockSize: string;
        showLogos: boolean;
        showPartnerLogo: boolean;
        showCompanyLogo: boolean;
    };
}

// ============================================
// LAYOUT DEFAULT (Original)
// ============================================

export const defaultLayout: LayoutConfig = {
    id: 'default',
    name: 'Standard',
    description: 'Design original avec grandes cards',
    emoji: '📺',

    header: {
        height: '15vh',
        showBusIcon: true,
        showLinesBadge: true,
        iconSize: '5vh',
        titleSize: '4vh',
    },

    departures: {
        cardPadding: '1.5rem',
        cardMargin: '0 20px 1rem',
        cardMinHeight: '120px',
        gridColumns: 'auto auto minmax(0, 1fr) 25rem',
        gap: '2rem',
        fontSize: {
            lineNumber: '2.5rem',
            time: '2.5rem',
            destination: '2.5rem',
            minutesLeft: '3rem',
        },
        lineNumberSize: '5rem',
        showSeconds: true,
        maxVisible: 7,
    },

    footer: {
        height: '80px',
        clockSize: '4rem',
        showLogos: true,
        showPartnerLogo: true,
        showCompanyLogo: true,
    },
};

// ============================================
// LAYOUT COMPACT
// ============================================

export const compactLayout: LayoutConfig = {
    id: 'compact',
    name: 'Compact',
    description: 'Plus condensé, plus de départs',
    emoji: '📋',

    header: {
        height: '10vh',
        showBusIcon: true,
        showLinesBadge: true,
        iconSize: '3vh',
        titleSize: '3vh',
    },

    departures: {
        cardPadding: '0.75rem 1rem',
        cardMargin: '0 10px 0.5rem',
        cardMinHeight: '60px',
        gridColumns: 'auto auto minmax(0, 1fr) auto',
        gap: '1rem',
        fontSize: {
            lineNumber: '1.5rem',
            time: '1.5rem',
            destination: '1.5rem',
            minutesLeft: '1.75rem',
        },
        lineNumberSize: '3rem',
        showSeconds: false,
        maxVisible: 12,
    },

    footer: {
        height: '50px',
        clockSize: '2rem',
        showLogos: true,
        showPartnerLogo: true,
        showCompanyLogo: true,
    },
};

// ============================================
// LAYOUT MINIMAL
// ============================================

export const minimalLayout: LayoutConfig = {
    id: 'minimal',
    name: 'Minimal',
    description: 'Épuré, juste l\'essentiel',
    emoji: '✨',

    header: {
        height: '8vh',
        showBusIcon: false,
        showLinesBadge: false,
        iconSize: '0',
        titleSize: '2.5vh',
    },

    departures: {
        cardPadding: '0.5rem 1rem',
        cardMargin: '0 10px 0.25rem',
        cardMinHeight: '40px',
        gridColumns: 'auto auto minmax(0, 1fr) auto',
        gap: '0.75rem',
        fontSize: {
            lineNumber: '1.25rem',
            time: '1.25rem',
            destination: '1.25rem',
            minutesLeft: '1.5rem',
        },
        lineNumberSize: '2.5rem',
        showSeconds: false,
        maxVisible: 15,
    },

    footer: {
        height: '40px',
        clockSize: '1.5rem',
        showLogos: false,
        showPartnerLogo: false,
        showCompanyLogo: false,
    },
};

// ============================================
// EXPORTS
// ============================================

export const layouts: Record<LayoutId, LayoutConfig> = {
    default: defaultLayout,
    compact: compactLayout,
    minimal: minimalLayout,
};

export const layoutsList = Object.values(layouts);

export function getLayout(id: LayoutId): LayoutConfig {
    return layouts[id] || defaultLayout;
}
