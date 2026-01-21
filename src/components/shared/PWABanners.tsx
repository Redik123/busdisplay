'use client';

import { useState, useEffect } from 'react';
import { useOffline, usePWAInstalled, usePWAInstallPrompt } from '@/hooks';

/**
 * Composant bannière offline - affiché quand l'utilisateur est hors ligne
 */
export function OfflineBanner() {
    const { isOffline } = useOffline();

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-2 text-center z-50">
            <div className="flex items-center justify-center gap-2">
                <span>📡</span>
                <span className="font-medium">Mode hors-ligne</span>
                <span className="text-yellow-200 text-sm">- Données potentiellement obsolètes</span>
            </div>
        </div>
    );
}

/**
 * Composant bannière installation PWA
 */
export function InstallBanner() {
    const { canInstall, promptInstall } = usePWAInstallPrompt();
    const isInstalled = usePWAInstalled();
    const [dismissed, setDismissed] = useState(() => {
        // Initialisation côté client uniquement
        if (typeof window !== 'undefined') {
            return localStorage.getItem('pwa-install-dismissed') === 'true';
        }
        return false;
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Utilisation d'un callback pour éviter le warning ESLint
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    const handleInstall = async () => {
        const accepted = await promptInstall();
        if (accepted) {
            setDismissed(true);
        }
    };

    // Ne pas afficher si pas monté, déjà installé, déjà fermé, ou pas installable
    if (!mounted || isInstalled || dismissed || !canInstall) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 z-50 safe-area-inset-bottom">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                        <div className="font-medium">Installer Bus Display</div>
                        <div className="text-blue-200 text-sm">Accès rapide depuis votre écran d&apos;accueil</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstall}
                        className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium 
                      hover:bg-blue-50 transition-colors"
                    >
                        Installer
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-2 text-blue-200 hover:text-white transition-colors"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Composant qui combine les bannières
 */
export function PWABanners() {
    return (
        <>
            <OfflineBanner />
            <InstallBanner />
        </>
    );
}

export default PWABanners;
