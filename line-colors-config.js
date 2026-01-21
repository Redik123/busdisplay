// Configuration des couleurs par ligne/compagnie
const LINE_COLORS = {
    // SMC (Remontées mécaniques)
    '421': { background: '#904e9e', color: '#FFFFFF' }, // Or SMC
    '422': { background: '#eb1f25', color: '#FFFFFF' },
    '431': { background: '#2351a0', color: '#FFFFFF' },
    '432': { background: '#f7931d', color: '#FFFFFF' },
    '433': { background: '#83c555', color: '#FFFFFF' },
    '434': { background: '#2351a0', color: '#FFFFFF' },
    '435': { background: '#904e9e', color: '#FFFFFF' },
    '436': { background: '#9d070d', color: '#FFFFFF' },
    
    // Car Postal (Bus jaunes)
    '353': { background: '#fecd08', color: '#000000' }, // Jaune postal
    '411': { background: '#fecd08', color: '#000000' },
    '441': { background: '#fecd08', color: '#000000' },
    '451': { background: '#fecd08', color: '#000000' },
    
    // CFF (Trains)
    '225': { background: '#FF0000', color: '#FFFFFF' }, // Rouge CFF
    '461': { background: '#a2cf62', color: '#000000' },
    
    // pffff
    '1': { background: '#EC0016', color: '#FFFFFF' }, // Rouge VMCV
    '3': { background: '#EC0016', color: '#FFFFFF' }
};

/**
 * Obtient les couleurs pour une ligne donnée
 * @param {string} lineNumber - Numéro de la ligne
 * @returns {Object} Couleurs de fond et de texte
 */
function getLineColors(lineNumber) {
    return LINE_COLORS[lineNumber] || { background: '#808080', color: '#FFFFFF' }; // Couleur par défaut
}

/**
 * Applique les couleurs à un élément ligne
 * @param {HTMLElement} element - Élément HTML de la ligne
 * @param {string} lineNumber - Numéro de la ligne
 */
function applyLineColors(element, lineNumber) {
    const colors = getLineColors(lineNumber);
    element.style.backgroundColor = colors.background;
    element.style.color = colors.color;
}

/**
 * Style CSS pour les éléments de ligne
 * @returns {string} Style CSS
 */
function getLineStyle() {
    return `
        .line-number {
            padding: 0.5rem 1.5rem;
            border-radius: 8px;
            font-size: 2.5rem;
            font-weight: bold;
            min-width: 5rem;
            text-align: center;
            transition: background-color 0.3s, color 0.3s;
        }
    `;
}

export { getLineColors, applyLineColors, getLineStyle };