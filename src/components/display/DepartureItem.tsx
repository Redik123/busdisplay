'use client';

import { useMemo } from 'react';
import type { Departure } from '@/types/departure';
import { getLineColors } from '@/lib/utils/line-colors';
import { useSimpleTimeRemaining } from '@/hooks/useTimeRemaining';

interface DepartureItemProps {
    departure: Departure;
    index?: number;
}

/**
 * Composant pour afficher un départ individuel
 * Avec animations et design amélioré
 */
export default function DepartureItem({ departure, index = 0 }: DepartureItemProps) {
    const colors = useMemo(
        () => getLineColors(departure.number),
        [departure.number]
    );

    // Utilise le hook pour un rafraîchissement automatique du temps restant
    const timeRemaining = useSimpleTimeRemaining(departure.stop.departureTimestamp);

    const { isApproaching, delay, isPastDeparture, platform, prognosisPlatform, isPlatformChanged } = departure.stop;

    return (
        <div
            className={`
        departure-item
        flex items-center justify-between p-4 mb-3
        glass rounded-xl
        transition-all duration-300 ease-out
        hover-lift
        ${isApproaching ? 'departure-approaching bg-green-900/20' : ''}
        ${isPastDeparture ? 'opacity-50' : ''}
        ${delay > 0 && !isPlatformChanged ? 'border-l-4 border-l-orange-500' : ''}
        ${isPlatformChanged ? 'border-l-4 border-l-red-500' : ''}
      `}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Numéro de ligne avec badge */}
            <div
                className="line-badge px-4 py-2 rounded-xl font-bold text-lg min-w-[65px] text-center shadow-lg"
                style={{
                    backgroundColor: colors.background,
                    color: colors.color,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
            >
                {departure.number}
            </div>

            {/* Destination */}
            <div className="flex-1 mx-4 overflow-hidden">
                <div className="text-white text-lg font-medium truncate">
                    {departure.to}
                </div>

                {/* Indicateur d'arrivée imminente */}
                {isApproaching && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-green-400 text-sm font-medium">
                            Arrivée imminente
                        </span>
                    </div>
                )}

                {/* Quai */}
                {platform && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm">
                            Quai {platform}
                        </span>
                        {/* Indicateur de changement de quai */}
                        {isPlatformChanged && prognosisPlatform && (
                            <span className="platform-changed flex items-center gap-1 text-red-500 text-sm font-semibold">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                → Quai {prognosisPlatform}
                            </span>
                        )}
                    </div>
                )}

                {/* Catégorie/Opérateur si disponible */}
                {departure.category && (
                    <div className="text-gray-500 text-xs mt-0.5">
                        {departure.category}
                    </div>
                )}
            </div>

            {/* Temps restant */}
            <div className="text-right min-w-[90px]">
                <div className={`
          text-3xl font-bold tabular-nums tracking-tight
          transition-colors duration-300
          ${isApproaching ? 'text-green-400 animate-pulse-soft' : ''}
          ${delay > 0 && !isApproaching ? 'text-orange-400' : ''}
          ${!isApproaching && delay === 0 ? 'text-white' : ''}
        `}>
                    {timeRemaining}
                </div>

                {/* Indicateur de retard */}
                {delay > 0 && (
                    <div className="flex items-center justify-end gap-1 text-orange-400 text-sm font-medium mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        +{delay}&apos;
                    </div>
                )}

                {/* Indicateur passé */}
                {isPastDeparture && (
                    <div className="text-gray-500 text-sm mt-1">
                        Passé
                    </div>
                )}
            </div>
        </div>
    );
}
