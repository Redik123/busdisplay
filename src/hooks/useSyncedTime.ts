'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const SYNC_INTERVAL = 2 * 60 * 60 * 1000; // 2 heures

/**
 * Hook pour synchroniser l'horloge avec une source de temps fiable
 * Priorité : 1. API externe (worldtimeapi) 2. Serveur (/api/time) 3. Horloge locale
 * Se resynchronise toutes les 2 heures
 */
export function useSyncedTime() {
    const [currentTime, setCurrentTime] = useState('--:--:--');
    const offsetRef = useRef(0); // Décalage en ms (source - local)

    // Tente de synchroniser avec worldtimeapi.org
    const syncExternal = useCallback(async (): Promise<boolean> => {
        try {
            const startTime = Date.now();
            const response = await fetch('https://worldtimeapi.org/api/timezone/Europe/Zurich', {
                signal: AbortSignal.timeout(5000)
            });
            const endTime = Date.now();

            if (!response.ok) return false;

            const data = await response.json();
            // unixtime est en secondes (UTC), on convertit en ms
            const actualTime = data.unixtime * 1000;

            const rtt = endTime - startTime;
            const estimatedNow = actualTime + rtt / 2;
            offsetRef.current = estimatedNow - endTime;

            console.log(`[SYNC] Source: worldtimeapi | Décalage: ${Math.round(offsetRef.current)}ms (RTT: ${rtt}ms)`);
            return true;
        } catch {
            return false;
        }
    }, []);

    // Tente de synchroniser avec le serveur local
    const syncServer = useCallback(async (): Promise<boolean> => {
        try {
            const startTime = Date.now();
            const response = await fetch('/api/time', {
                signal: AbortSignal.timeout(5000)
            });
            const endTime = Date.now();

            if (!response.ok) return false;

            const data = await response.json();
            const serverTime = data.timestamp;

            const rtt = endTime - startTime;
            const estimatedNow = serverTime + rtt / 2;
            offsetRef.current = estimatedNow - endTime;

            console.log(`[SYNC] Source: serveur | Décalage: ${Math.round(offsetRef.current)}ms (RTT: ${rtt}ms)`);
            return true;
        } catch {
            return false;
        }
    }, []);

    // Synchronisation avec fallback
    const sync = useCallback(async () => {
        // 1. Essaie l'API externe fiable
        const externalOk = await syncExternal();
        if (externalOk) return;

        // 2. Fallback: serveur local
        const serverOk = await syncServer();
        if (serverOk) return;

        // 3. Dernier fallback: horloge locale (offset = 0)
        console.log('[SYNC] Source: horloge locale (aucune source disponible)');
        offsetRef.current = 0;
    }, [syncExternal, syncServer]);

    // Synchronisation initiale + toutes les 2h
    useEffect(() => {
        sync();
        const interval = setInterval(sync, SYNC_INTERVAL);
        return () => clearInterval(interval);
    }, [sync]);

    // Mise à jour de l'horloge chaque seconde avec l'offset
    useEffect(() => {
        const updateClock = () => {
            const correctedTime = new Date(Date.now() + offsetRef.current);
            setCurrentTime(correctedTime.toLocaleTimeString('fr-CH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }));
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return currentTime;
}
