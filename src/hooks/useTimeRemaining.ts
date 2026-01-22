'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatMinutesRemaining } from '@/lib/utils/time';

interface TimeRemainingResult {
    timeRemaining: string;
    isApproaching: boolean;
    hasDeparted: boolean;
    totalMinutes: number;
}

/**
 * Hook pour calculer le temps restant en temps réel
 * Se met à jour automatiquement chaque minute
 * 
 * @param timestamp - Timestamp Unix (en secondes) de l'heure de départ
 * @param updateIntervalMs - Intervalle de mise à jour en millisecondes (défaut: 60000 = 1 minute)
 * @returns Objet avec timeRemaining formaté, isApproaching, hasDeparted, totalMinutes
 */
export function useTimeRemaining(timestamp: number, updateIntervalMs: number = 60000): TimeRemainingResult {
    // Fonction pour calculer toutes les infos de temps
    const calculateTime = useCallback((): TimeRemainingResult => {
        const now = Date.now() / 1000;
        const diff = timestamp - now;

        // Bus déjà parti
        if (diff <= 0) {
            return {
                timeRemaining: '',
                isApproaching: false,
                hasDeparted: true,
                totalMinutes: Math.floor(diff / 60)
            };
        }

        // À l'approche (< 60 secondes)
        if (diff < 60) {
            return {
                timeRemaining: "À l'approche",
                isApproaching: true,
                hasDeparted: false,
                totalMinutes: 0
            };
        }

        // Arrondi vers le haut pour ne pas tromper les passagers
        const totalMinutes = Math.ceil(diff / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Format selon durée
        let formatted: string;
        if (hours > 0) {
            formatted = `${hours}h${minutes.toString().padStart(2, '0')}`;
        } else {
            formatted = `${totalMinutes} min`;
        }

        return {
            timeRemaining: formatted,
            isApproaching: false,
            hasDeparted: false,
            totalMinutes
        };
    }, [timestamp]);

    const [result, setResult] = useState<TimeRemainingResult>(() => calculateTime());

    useEffect(() => {
        // Mise à jour initiale via setTimeout pour éviter le warning ESLint
        const initialUpdate = setTimeout(() => setResult(calculateTime()), 0);

        // Mise à jour périodique
        const interval = setInterval(() => {
            setResult(calculateTime());
        }, updateIntervalMs);

        // Nettoyage au démontage
        return () => {
            clearTimeout(initialUpdate);
            clearInterval(interval);
        };
    }, [timestamp, updateIntervalMs, calculateTime]);

    return result;
}

/**
 * Version simple qui retourne juste le temps formaté
 */
export function useSimpleTimeRemaining(timestamp: number, updateIntervalMs: number = 60000): string {
    const calculateTime = useCallback(() => {
        return formatMinutesRemaining(timestamp);
    }, [timestamp]);

    const [timeRemaining, setTimeRemaining] = useState<string>(() => calculateTime());

    useEffect(() => {
        // Mise à jour initiale via setTimeout pour éviter le warning ESLint
        const initialUpdate = setTimeout(() => setTimeRemaining(calculateTime()), 0);
        const interval = setInterval(() => {
            setTimeRemaining(calculateTime());
        }, updateIntervalMs);
        return () => {
            clearTimeout(initialUpdate);
            clearInterval(interval);
        };
    }, [timestamp, updateIntervalMs, calculateTime]);

    return timeRemaining;
}

