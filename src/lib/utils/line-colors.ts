// Configuration des couleurs des lignes de bus
// Basé sur les couleurs officielles des opérateurs

export interface LineColor {
    background: string;
    color: string;
}

// Couleurs par numéro de ligne
const LINE_COLORS: Record<string, LineColor> = {
    // SMC (Remontées mécaniques)
    '421': { background: '#904e9e', color: '#FFFFFF' }, // Or SMC (purple)
    '422': { background: '#eb1f25', color: '#FFFFFF' },
    '431': { background: '#2351a0', color: '#FFFFFF' },
    '432': { background: '#f7931d', color: '#FFFFFF' },
    '433': { background: '#83c555', color: '#FFFFFF' },
    '434': { background: '#2351a0', color: '#FFFFFF' },
    '435': { background: '#904e9e', color: '#FFFFFF' },
    '436': { background: '#9d070d', color: '#FFFFFF' },

    // Car Postal (Bus jaunes)
    '353': { background: '#fecd08', color: '#000000' },
    '354': { background: '#fecd08', color: '#000000' },
    '355': { background: '#fecd08', color: '#000000' },
    '411': { background: '#fecd08', color: '#000000' },
    '441': { background: '#fecd08', color: '#000000' },
    '451': { background: '#fecd08', color: '#000000' },

    // CFF (Trains)
    '225': { background: '#FF0000', color: '#FFFFFF' }, // Rouge CFF
    '461': { background: '#a2cf62', color: '#000000' },

    // VMCV (Vevey-Montreux)
    '1': { background: '#EC0016', color: '#FFFFFF' }, // Rouge VMCV
    '3': { background: '#EC0016', color: '#FFFFFF' },
    '201': { background: '#00A3E0', color: '#FFFFFF' },
    '202': { background: '#00A3E0', color: '#FFFFFF' },
    '203': { background: '#00A3E0', color: '#FFFFFF' },
    '204': { background: '#00A3E0', color: '#FFFFFF' },

    // TPN (Transports Publics du Chablais)
    '111': { background: '#00AEEF', color: '#FFFFFF' },
    '112': { background: '#00AEEF', color: '#FFFFFF' },

    // TPG (Genève)
    '2': { background: '#E3000E', color: '#FFFFFF' },
    '12': { background: '#7FC31C', color: '#FFFFFF' },
    '14': { background: '#007BC2', color: '#FFFFFF' },

    // TL (Lausanne)
    'M1': { background: '#009EE0', color: '#FFFFFF' },
    'M2': { background: '#FF0000', color: '#FFFFFF' },

    // MBC
    '701': { background: '#0066B3', color: '#FFFFFF' },
    '702': { background: '#0066B3', color: '#FFFFFF' },
    '703': { background: '#0066B3', color: '#FFFFFF' },
    '704': { background: '#0066B3', color: '#FFFFFF' },
    '705': { background: '#0066B3', color: '#FFFFFF' },
};

// Couleurs par défaut
const DEFAULT_COLORS: LineColor = {
    background: '#6B7280',
    color: '#FFFFFF'
};

/**
 * Récupère les couleurs pour une ligne donnée
 * @param lineNumber - Numéro de la ligne
 * @returns Couleurs de la ligne
 */
export function getLineColors(lineNumber: string): LineColor {
    // Essaie d'abord le numéro exact
    if (LINE_COLORS[lineNumber]) {
        return LINE_COLORS[lineNumber];
    }

    // Essaie en majuscules
    const upperLine = lineNumber.toUpperCase();
    if (LINE_COLORS[upperLine]) {
        return LINE_COLORS[upperLine];
    }

    // Retourne les couleurs par défaut
    return DEFAULT_COLORS;
}

/**
 * Génère le style CSS inline pour un badge de ligne
 * @param lineNumber - Numéro de la ligne
 * @returns Objet de style React
 */
export function getLineStyle(lineNumber: string): React.CSSProperties {
    const colors = getLineColors(lineNumber);
    return {
        backgroundColor: colors.background,
        color: colors.color,
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '3rem',
        transition: 'transform 0.2s ease'
    };
}

/**
 * Ajoute de nouvelles couleurs de ligne
 * @param colors - Objet avec les nouvelles couleurs
 */
export function addLineColors(colors: Record<string, LineColor>): void {
    Object.assign(LINE_COLORS, colors);
}
