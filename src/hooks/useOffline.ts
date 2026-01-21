'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseOfflineReturn {
    isOnline: boolean;
    isOffline: boolean;
    wasOffline: boolean;
    lastOnlineTime: Date | null;
}

/**
 * Hook pour détecter le mode hors-ligne
 * Utilise l'API Navigator.onLine et les événements online/offline
 */
export function useOffline(): UseOfflineReturn {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);
    const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);

    // Gestion des événements online/offline
    const handleOnline = useCallback(() => {
        setIsOnline(true);
        setLastOnlineTime(new Date());
    }, []);

    const handleOffline = useCallback(() => {
        setIsOnline(false);
        setWasOffline(true);
    }, []);

    useEffect(() => {
        // Vérifier l'état initial via setTimeout pour éviter le warning ESLint
        const initTimer = setTimeout(() => {
            if (typeof navigator !== 'undefined') {
                setIsOnline(navigator.onLine);
                if (navigator.onLine) {
                    setLastOnlineTime(new Date());
                }
            }
        }, 0);

        // Ajouter les listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnline, handleOffline]);

    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline,
        lastOnlineTime,
    };
}

/**
 * Hook pour vérifier si la PWA est installée
 */
export function usePWAInstalled(): boolean {
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Vérifier si l'app est en mode standalone (installée) via setTimeout
        const timer = setTimeout(() => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            // Ou si elle a été lancée depuis l'écran d'accueil iOS
            const isIOSStandalone = ('standalone' in window.navigator) &&
                (window.navigator as { standalone?: boolean }).standalone === true;

            setIsInstalled(isStandalone || isIOSStandalone);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    return isInstalled;
}

/**
 * Hook pour le prompt d'installation PWA
 */
export function usePWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const promptInstall = async (): Promise<boolean> => {
        if (!deferredPrompt) return false;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setCanInstall(false);

        return outcome === 'accepted';
    };

    return {
        canInstall,
        promptInstall,
    };
}

// Type pour l'événement beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
