'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useConfig } from './useConfig';
import { isWithinTimeRange } from '@/lib/utils/time';

interface UsePowerSaveReturn {
    isPowerSaveActive: boolean;
    isInSleepHours: boolean;
    isInactive: boolean;
    enable: () => void;
    disable: () => void;
    resetInactivityTimer: () => void;
}

const INACTIVITY_TIMEOUT = 15000; // 15 secondes

/**
 * Hook pour gérer le mode économie d'énergie
 * 
 * Le mode veille s'active quand:
 * 1. On est dans la plage horaire configurée (23h - 5h par défaut)
 * 2. ET l'utilisateur est inactif depuis 15 secondes
 */
export function usePowerSave(): UsePowerSaveReturn {
    const { config } = useConfig();
    const [isPowerSaveActive, setPowerSaveActive] = useState(false);
    const [isInactive, setIsInactive] = useState(false);

    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const resetInactivityTimerRef = useRef<(() => void) | null>(null);
    const isPowerSaveActiveRef = useRef(isPowerSaveActive);
    const isInactiveRef = useRef(isInactive);

    // Vérifie si on est dans la plage horaire de veille
    const isInSleepHours = useCallback(() => {
        if (!config.sleepMode.enabled) {
            return false;
        }
        const inRange = isWithinTimeRange(config.sleepMode.startTime, config.sleepMode.endTime);
        return inRange;
    }, [config.sleepMode]);

    // Active le mode veille
    const enable = useCallback(() => {
        console.log('[PowerSave] ✅ ENABLING POWER SAVE MODE - Screen should go black');
        setPowerSaveActive(true);
        document.body.classList.add('power-save-mode');
    }, []);

    // Désactive le mode veille
    const disable = useCallback(() => {
        console.log('[PowerSave] ❌ DISABLING POWER SAVE MODE - Screen should be normal');
        setPowerSaveActive(false);
        document.body.classList.remove('power-save-mode');
        setIsInactive(false);
    }, []);

    // Reset le timer d'inactivité
    const resetInactivityTimer = useCallback(() => {
        setIsInactive(false);

        // Clear le timer existant
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        // Si le mode veille est actif, le désactiver
        if (isPowerSaveActive) {
            console.log('[PowerSave] 👆 Waking up from activity');
            disable();
        }

        // Si on est dans la plage horaire, redémarrer le timer
        const inHours = isInSleepHours();
        if (inHours) {
            inactivityTimerRef.current = setTimeout(() => {
                console.log('[PowerSave] ⏰ 15s inactivity - activating sleep mode');
                setIsInactive(true);
                enable();
            }, INACTIVITY_TIMEOUT);
        }
    }, [isPowerSaveActive, isInSleepHours, enable, disable]);

    // Mettre à jour les refs à chaque render
    useEffect(() => {
        resetInactivityTimerRef.current = resetInactivityTimer;
        isPowerSaveActiveRef.current = isPowerSaveActive;
        isInactiveRef.current = isInactive;
    }, [resetInactivityTimer, isPowerSaveActive, isInactive]);

    // Écouter les événements d'activité utilisateur
    useEffect(() => {
        if (!config.sleepMode.enabled) {
            // Utilisation de setTimeout pour éviter le warning ESLint
            const disableTimer = setTimeout(() => disable(), 0);
            return () => clearTimeout(disableTimer);
        }

        // Priorité aux événements tactiles pour Android
        // Exclusion de mousemove pour éviter les événements fantômes
        const events = ['mousedown', 'keypress', 'touchstart', 'touchmove', 'touchend', 'click', 'scroll'];

        // Debounce pour éviter les appels trop fréquents
        let debounceTimer: NodeJS.Timeout | null = null;
        const DEBOUNCE_DELAY = 100; // 100ms

        const handleActivity = (e: Event) => {
            // Ignorer les événements mousemove fantômes
            if (e.type === 'mousemove') {
                return;
            }

            // Log pour debug
            console.log('[PowerSave] 🔍 Real user event:', e.type);

            // Debounce pour éviter les appels trop fréquents
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => {
                resetInactivityTimerRef.current?.();
            }, DEBOUNCE_DELAY);
        };

        // Détecter le retour au premier plan (Android PWA)
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('[PowerSave] 📱 App back to foreground');
                resetInactivityTimerRef.current?.();
            }
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [config.sleepMode.enabled]);

    // Vérifier périodiquement si on entre/sort de la plage horaire
    useEffect(() => {
        if (!config.sleepMode.enabled) {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            return;
        }

        const checkSleepHours = () => {
            const inHours = isInSleepHours();
            const currentActive = isPowerSaveActiveRef.current;
            const currentInactive = isInactiveRef.current;

            if (inHours && !currentActive && currentInactive) {
                enable();
            } else if (!inHours && currentActive) {
                disable();
            }
        };

        // Vérifie toutes les minutes
        checkIntervalRef.current = setInterval(checkSleepHours, 60000);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
        };
    }, [config.sleepMode.enabled]);

    // Démarre le timer d'inactivité initial (une seule fois au montage)
    useEffect(() => {
        if (config.sleepMode.enabled && isInSleepHours()) {
            const timer = setTimeout(() => {
                resetInactivityTimerRef.current?.();
            }, 0);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isPowerSaveActive,
        isInSleepHours: isInSleepHours(),
        isInactive,
        enable,
        disable,
        resetInactivityTimer
    };
}
