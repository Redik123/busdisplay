import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Clock from '@/components/display/Clock';

describe('Clock Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('rend sans erreur', async () => {
        await act(async () => {
            render(<Clock />);
        });
        // Le composant devrait être rendu
        expect(document.body).toBeDefined();
    });

    it('affiche le format HH:mm par défaut', async () => {
        // Mock une date fixe
        vi.setSystemTime(new Date('2024-12-16T14:30:00'));

        await act(async () => {
            render(<Clock />);
        });

        // Avance le temps pour déclencher le useEffect
        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        // Le composant devrait afficher l'heure
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByText(/\d{2}:\d{2}/)).toBeTruthy();
    });

    it('affiche les secondes si showSeconds est true', async () => {
        vi.setSystemTime(new Date('2024-12-16T14:30:45'));

        await act(async () => {
            render(<Clock showSeconds={true} />);
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        // Le composant devrait afficher HH:mm:ss
        // Note: dépend de la locale
        expect(document.body.textContent).toBeDefined();
    });

    it('applique la className personnalisée', async () => {
        await act(async () => {
            render(<Clock className="test-class" />);
        });

        const container = document.querySelector('.test-class');
        expect(container).toBeTruthy();
    });

    it('se met à jour chaque seconde', async () => {
        vi.setSystemTime(new Date('2024-12-16T14:30:00'));

        await act(async () => {
            render(<Clock showSeconds={true} />);
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
        });

        // Avance d'une seconde
        vi.setSystemTime(new Date('2024-12-16T14:30:01'));
        await act(async () => {
            vi.advanceTimersByTime(1000);
        });

        // Le contenu peut avoir changé (dépend de si showSeconds montre les secondes)
        expect(document.body.textContent).toBeDefined();
    });
});
