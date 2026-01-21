'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime, formatDate } from '@/lib/utils/time';

interface ClockProps {
    showDate?: boolean;
    showSeconds?: boolean;
    className?: string;
}

/**
 * Composant d'horloge en temps réel
 */
export default function Clock({
    showDate = false,
    showSeconds = false,
    className = ''
}: ClockProps) {
    const [time, setTime] = useState<string>('--:--');
    const [date, setDate] = useState<string>('');
    const mountedRef = useRef(false);

    const updateClock = useCallback(() => {
        const now = new Date();

        if (showSeconds) {
            setTime(now.toLocaleTimeString('fr-CH', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }));
        } else {
            setTime(formatTime(now));
        }

        if (showDate) {
            setDate(formatDate(now));
        }
    }, [showDate, showSeconds]);

    useEffect(() => {
        // Marque comme monté
        mountedRef.current = true;

        // Mise à jour initiale différée pour éviter le warning ESLint
        const initialUpdate = setTimeout(updateClock, 0);

        // Mise à jour chaque seconde
        const interval = setInterval(updateClock, 1000);

        return () => {
            clearTimeout(initialUpdate);
            clearInterval(interval);
            mountedRef.current = false;
        };
    }, [updateClock]);

    return (
        <div className={`font-mono ${className}`}>
            <span className="text-2xl font-bold text-white">{time}</span>
            {showDate && date && (
                <span className="block text-sm text-gray-400 capitalize">{date}</span>
            )}
        </div>
    );
}
