'use client';

import { useEffect, useState, useRef } from 'react';

// Types pour Wake Lock API
interface WakeLockSentinel extends EventTarget {
    released: boolean;
    type: 'screen';
    release(): Promise<void>;
}

interface WakeLock {
    request(type: 'screen'): Promise<WakeLockSentinel>;
}

/**
 * Hook pour gérer le Screen Wake Lock API sur Android
 * Empêche l'écran de s'éteindre automatiquement
 */
export function useWakeLock(shouldLock: boolean) {
    const [isSupported, setIsSupported] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        setIsSupported('wakeLock' in navigator);
    }, []);

    useEffect(() => {
        if (!isSupported || !shouldLock) {
            return;
        }

        const requestWakeLock = async () => {
            try {
                const nav = navigator as Navigator & { wakeLock?: WakeLock };
                if (nav.wakeLock) {
                    wakeLockRef.current = await nav.wakeLock.request('screen');
                    setIsActive(true);
                    console.log('[WakeLock] Screen wake lock activated');

                    wakeLockRef.current.addEventListener('release', () => {
                        console.log('[WakeLock] Screen wake lock released');
                        setIsActive(false);
                    });
                }
            } catch (err) {
                console.error('[WakeLock] Failed:', err);
            }
        };

        requestWakeLock();

        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, [isSupported, shouldLock]);

    return { isSupported, isActive };
}
