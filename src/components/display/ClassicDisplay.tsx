'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Departure } from '@/types/departure';
import { getLineColors } from '@/lib/utils/line-colors';
import { useSimpleTimeRemaining } from '@/hooks/useTimeRemaining';

interface ClassicDepartureItemProps {
    departure: Departure;
}

/**
 * Composant de départ style Classic (design original fidèle)
 * Design sobre avec fond noir et séparateurs
 */
export default function ClassicDepartureItem({ departure }: ClassicDepartureItemProps) {
    const colors = useMemo(
        () => getLineColors(departure.number),
        [departure.number]
    );

    // Calcul du temps restant format "3h06" avec hook dédié
    const timeRemaining = useSimpleTimeRemaining(departure.stop.departureTimestamp, 30000);

    // Heure de départ formatée "04:51"
    const departureTime = useMemo(() => {
        const date = new Date(departure.stop.departureTimestamp * 1000);
        return date.toLocaleTimeString('fr-CH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [departure.stop.departureTimestamp]);

    return (
        <div
            className="flex items-center py-4 px-4"
            style={{
                backgroundColor: '#000000',
                borderBottom: '1px solid #333333',
            }}
        >
            {/* Numéro de ligne - Badge carré */}
            <div
                className="flex items-center justify-center w-10 h-10 rounded font-bold text-lg flex-shrink-0"
                style={{
                    backgroundColor: colors.background,
                    color: colors.color,
                    border: `2px solid ${colors.background}`,
                }}
            >
                {departure.number}
            </div>

            {/* Heure de départ */}
            <div
                className="text-base ml-6 flex-shrink-0 w-14"
                style={{ color: '#888888' }}
            >
                {departureTime}
            </div>

            {/* Destination + Quai */}
            <div className="flex-1 ml-4 flex flex-col">
                <div
                    className="text-lg font-medium truncate"
                    style={{ color: '#ffffff' }}
                >
                    {departure.to}
                </div>
                {/* Quai */}
                {departure.stop.platform && (
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span style={{ color: '#888888' }}>
                            Quai {departure.stop.platform}
                        </span>
                        {/* Changement de quai */}
                        {departure.stop.isPlatformChanged && departure.stop.prognosisPlatform && (
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>
                                → {departure.stop.prognosisPlatform}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Temps restant - Grand format */}
            <div
                className="text-2xl font-bold tabular-nums flex-shrink-0 ml-4"
                style={{ color: '#ffffff' }}
            >
                {timeRemaining}
            </div>
        </div>
    );
}

// ========================
// Header Classic
// ========================

interface ClassicHeaderProps {
    stationName: string;
    onLinesClick?: () => void;
}

export function ClassicHeader({ stationName, onLinesClick }: ClassicHeaderProps) {
    return (
        <header
            className="flex items-center px-4 py-3"
            style={{
                backgroundColor: '#000000',
                borderBottom: '1px solid #333333',
            }}
        >
            {/* Icône bus */}
            <span className="text-2xl mr-3">🚌</span>

            {/* Nom de la station */}
            <h1
                className="text-xl font-medium flex-1"
                style={{ color: '#ffffff' }}
            >
                {stationName}
            </h1>

            {/* Bouton Lignes */}
            {onLinesClick ? (
                <button
                    onClick={onLinesClick}
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{
                        backgroundColor: '#444444',
                        color: '#ffffff',
                    }}
                >
                    Lignes
                </button>
            ) : (
                <Link
                    href="/admin"
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{
                        backgroundColor: '#444444',
                        color: '#ffffff',
                    }}
                >
                    Lignes
                </Link>
            )}
        </header>
    );
}

// ========================
// Footer avec horloge et logos
// ========================

interface ClassicFooterProps {
    currentTime: string;
}

export function ClassicFooter({ currentTime }: ClassicFooterProps) {
    return (
        <footer
            className="fixed bottom-0 left-0 right-0 py-3 px-4"
            style={{
                backgroundColor: '#000000',
                borderTop: '1px solid #333333',
            }}
        >
            <div className="flex items-center justify-between">
                {/* Logo SBB CFF FFS - Gauche */}
                <div className="flex items-center gap-2 min-w-[150px]">
                    {/* Indicateur rouge */}
                    <div
                        className="w-6 h-1 rounded"
                        style={{ backgroundColor: '#dc2626' }}
                    />
                    <span
                        className="text-sm font-bold"
                        style={{ color: '#dc2626' }}
                    >
                        SBB CFF FFS
                    </span>
                </div>

                {/* Horloge centrale - Grande */}
                <div
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: '#ffffff' }}
                >
                    {currentTime}
                </div>

                {/* Logo MediaCom's - Droite */}
                <div className="flex items-center justify-end min-w-[150px]">
                    <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: '#666666' }}
                    >
                        <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{
                                backgroundColor: '#ff6600',
                                color: '#ffffff',
                            }}
                        >
                            M
                        </span>
                        <span>Medias-Com&apos;S</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ========================
// Mode Clair (pour admin) - Export des variantes
// ========================

export function LightModeCard({
    children,
    title,
    icon
}: {
    children: React.ReactNode;
    title: string;
    icon?: string;
}) {
    return (
        <div
            className="rounded-xl p-6 mb-4"
            style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
        >
            <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: '#111827' }}
            >
                {icon && <span>{icon}</span>}
                {title}
            </h2>
            {children}
        </div>
    );
}
