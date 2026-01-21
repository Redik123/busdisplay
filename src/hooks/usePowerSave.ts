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

    // Vérifie si on est dans la plage horaire de veille
    const isInSleepHours = useCallback(() => {
        if (!config.sleepMode.enabled) return false;
        return isWithinTimeRange(config.sleepMode.startTime, config.sleepMode.endTime);
    }, [config.sleepMode]);

    // Active le mode veille
    const enable = useCallback(() => {
        setPowerSaveActive(true);
        document.body.classList.add('power-save-mode');
    }, []);

    // Désactive le mode veille
    const disable = useCallback(() => {
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
            disable();
        }

        // Si on est dans la plage horaire, redémarrer le timer
        if (isInSleepHours()) {
            inactivityTimerRef.current = setTimeout(() => {
                setIsInactive(true);
                enable();
            }, INACTIVITY_TIMEOUT);
        }
    }, [isPowerSaveActive, isInSleepHours, enable, disable]);

    // Écouter les événements d'activité utilisateur
    useEffect(() => {
        if (!config.sleepMode.enabled) {
            // Utilisation de setTimeout pour éviter le warning ESLint
            const disableTimer = setTimeout(() => disable(), 0);
            return () => clearTimeout(disableTimer);
        }

        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'touchmove', 'scroll'];

        const handleActivity = () => {
            resetInactivityTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [config.sleepMode.enabled, resetInactivityTimer, disable]);

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

            if (inHours && !isPowerSaveActive && isInactive) {
                enable();
            } else if (!inHours && isPowerSaveActive) {
                disable();
            }
        };

        // Vérifie toutes les minutes
        checkIntervalRef.current = setInterval(checkSleepHours, 60000);

        // Vérifie immédiatement via setTimeout pour éviter l'appel synchrone
        const initialCheck = setTimeout(checkSleepHours, 0);

        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            clearTimeout(initialCheck);
        };
    }, [config.sleepMode.enabled, isInSleepHours, isPowerSaveActive, isInactive, enable, disable]);

    // Démarre le timer d'inactivité initial
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (config.sleepMode.enabled && isInSleepHours()) {
            // Utilisation de setTimeout pour éviter le warning ESLint
            timer = setTimeout(() => resetInactivityTimer(), 0);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [config.sleepMode.enabled, isInSleepHours, resetInactivityTimer]);

    return {
        isPowerSaveActive,
        isInSleepHours: isInSleepHours(),
        isInactive,
        enable,
        disable,
        resetInactivityTimer
    };
}
