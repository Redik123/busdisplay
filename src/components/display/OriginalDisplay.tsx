'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Departure } from '@/types/departure';
import { getLineColors } from '@/lib/utils/line-colors';
import { useTimeRemaining } from '@/hooks/useTimeRemaining';

// ============================================
// DEPARTURE ITEM - Fidèle au design original
// ============================================

interface DepartureItemProps {
    departure: Departure;
}

export default function OriginalDepartureItem({ departure }: DepartureItemProps) {
    const colors = useMemo(
        () => getLineColors(departure.number),
        [departure.number]
    );

    // Calcul du temps restant avec hook dédié
    const timeRemainingData = useTimeRemaining(departure.stop.departureTimestamp, 30000);

    // Formatage pour compatibilité avec le design existant
    const timeRemaining = timeRemainingData.hasDeparted
        ? '∞'
        : timeRemainingData.isApproaching
            ? "0'"
            : timeRemainingData.timeRemaining.replace(' min', "'");
    const isApproaching = timeRemainingData.isApproaching;

    // Heure de départ formatée
    const departureTime = useMemo(() => {
        const date = new Date(departure.stop.departureTimestamp * 1000);
        return date.toLocaleTimeString('fr-CH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [departure.stop.departureTimestamp]);

    // Classes conditionnelles
    const departureClasses = [
        'departure',
        isApproaching ? 'approaching' : '',
        departure.stop.delay && departure.stop.delay > 60 ? 'delayed' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={departureClasses}>
            <div className="departure-info">
                {/* Numéro de ligne */}
                <div
                    className="line-number"
                    style={{
                        backgroundColor: colors.background,
                        color: colors.color,
                    }}
                >
                    {departure.number}
                </div>

                {/* Heure de départ */}
                <div className="scheduled-time">
                    {departureTime}
                </div>

                {/* Destination */}
                <div className="destination">
                    {departure.to}
                </div>

                {/* Temps restant */}
                <div className="minutes-left">
                    {timeRemaining}
                    {/* Délai si présent */}
                    {departure.stop.delay && departure.stop.delay > 60 && (
                        <span className="delay">
                            +{Math.floor(departure.stop.delay / 60)}&apos;
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// HEADER - Fidèle au design original
// ============================================

interface OriginalHeaderProps {
    stationName: string;
}

export function OriginalHeader({ stationName }: OriginalHeaderProps) {
    return (
        <div className="header relative">
            {/* Bouton de configuration (lien vers admin) */}
            <Link href="/admin" aria-label="Configuration">
                <div className="bus-icon">🚌</div>
            </Link>

            {/* Informations de l'arrêt */}
            <div className="stop-info">
                <h1 id="station-name" className="station-title">
                    {stationName || 'Chargement...'}
                </h1>
                <Link href="/admin" className="line-indicator">
                    Lignes
                </Link>
            </div>
        </div>
    );
}

// ============================================
// FOOTER - Fidèle au design original
// ============================================

interface OriginalFooterProps {
    currentTime: string;
    partnerLogo?: 'cff' | null;
    companyLogo?: 'mc' | null;
}

export function OriginalFooter({
    currentTime,
    partnerLogo = 'cff',
    companyLogo = 'mc'
}: OriginalFooterProps) {
    return (
        <div className="footer">
            {/* Logo partenaire (gauche) */}
            <div className="partners">
                <div className="partner-logo">
                    {partnerLogo === 'cff' && (
                        <Image
                            src="/assets/cff.png"
                            alt="CFF"
                            width={120}
                            height={40}
                            style={{ objectFit: 'contain' }}
                        />
                    )}
                </div>
            </div>

            {/* Horloge (centre) */}
            <div className="current-time">
                {currentTime}
            </div>

            {/* Logo entreprise (droite) */}
            <div className="company-logo">
                {companyLogo === 'mc' && (
                    <Image
                        src="/assets/logomc.png"
                        alt="MediaCom's"
                        width={80}
                        height={60}
                        style={{ objectFit: 'contain' }}
                    />
                )}
            </div>
        </div>
    );
}

// ============================================
// LOADING - État de chargement
// ============================================

export function OriginalLoading() {
    return (
        <div className="loading">
            <div className="loading-spinner" />
            <p>Chargement des horaires...</p>
        </div>
    );
}

// ============================================
// ERROR - État d'erreur
// ============================================

interface OriginalErrorProps {
    message: string;
}

export function OriginalError({ message }: OriginalErrorProps) {
    return (
        <div className="error">
            <p>⚠️ {message}</p>
        </div>
    );
}

// ============================================
// NO DEPARTURES - Aucun départ
// ============================================

export function OriginalNoDepartures() {
    return (
        <div className="no-departures">
            <p>Aucun départ à afficher</p>
        </div>
    );
}
