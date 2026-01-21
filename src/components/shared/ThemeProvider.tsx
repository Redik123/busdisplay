'use client';

import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

/**
 * Provider de thème - initialise le thème au chargement
 * Note: Le hook useTheme applique automatiquement le thème via useEffect
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
    const { isHydrated, theme } = useTheme();

    // Le thème est appliqué automatiquement dans useTheme
    // Ce provider sert principalement à garantir l'initialisation
    useEffect(() => {
        if (isHydrated) {
            document.body.setAttribute('data-theme-id', theme.id);
        }
    }, [isHydrated, theme.id]);

    return <>{children}</>;
}

export default ThemeProvider;
