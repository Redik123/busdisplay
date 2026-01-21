import { describe, it, expect } from 'vitest';
import { getLineColors, getLineStyle, addLineColors } from '@/lib/utils/line-colors';

describe('getLineColors', () => {
    it('retourne les couleurs pour une ligne connue (421)', () => {
        const colors = getLineColors('421');
        expect(colors.background).toBe('#904e9e');
        expect(colors.color).toBe('#FFFFFF');
    });

    it('retourne les couleurs pour Car Postal (353)', () => {
        const colors = getLineColors('353');
        expect(colors.background).toBe('#fecd08');
        expect(colors.color).toBe('#000000');
    });

    it('retourne les couleurs par défaut pour une ligne inconnue', () => {
        const colors = getLineColors('999');
        expect(colors.background).toBe('#6B7280');
        expect(colors.color).toBe('#FFFFFF');
    });

    it('gère les majuscules/minuscules', () => {
        const colors1 = getLineColors('M1');
        const colors2 = getLineColors('m1');
        expect(colors1.background).toBe(colors2.background);
    });
});

describe('getLineStyle', () => {
    it('retourne un objet de style React valide', () => {
        const style = getLineStyle('421');

        expect(style).toHaveProperty('backgroundColor');
        expect(style).toHaveProperty('color');
        expect(style).toHaveProperty('padding');
        expect(style).toHaveProperty('borderRadius');
        expect(style).toHaveProperty('fontWeight');
    });

    it('inclut la couleur correcte', () => {
        const style = getLineStyle('421');
        expect(style.backgroundColor).toBe('#904e9e');
    });
});

describe('addLineColors', () => {
    it('ajoute de nouvelles couleurs de ligne', () => {
        // Vérifie que la ligne n'existe pas
        const before = getLineColors('TEST123');
        expect(before.background).toBe('#6B7280'); // Couleur par défaut

        // Ajoute la nouvelle couleur
        addLineColors({
            'TEST123': { background: '#FF0000', color: '#FFFFFF' }
        });

        // Vérifie qu'elle est maintenant disponible
        const after = getLineColors('TEST123');
        expect(after.background).toBe('#FF0000');
    });
});
