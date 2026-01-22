'use client';

import { useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Departure } from '@/types/departure';
import { getLineColors } from '@/lib/utils/line-colors';
import { useTheme } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { useTimeRemaining } from '@/hooks/useTimeRemaining';

// ============================================
// THEMED DEPARTURE ITEM
// ============================================

interface ThemedDepartureItemProps {
    departure: Departure;
}

export function ThemedDepartureItem({ departure }: ThemedDepartureItemProps) {
    const { theme } = useTheme();
    const { layout } = useLayout();

    const colors = useMemo(
        () => getLineColors(departure.number),
        [departure.number]
    );

    // Utilise le hook pour un rafraîchissement automatique du temps restant
    const { timeRemaining, isApproaching, hasDeparted } = useTimeRemaining(departure.stop.departureTimestamp);

    // Heure de départ formatée HH:MM
    const departureTime = useMemo(() => {
        const date = new Date(departure.stop.departureTimestamp * 1000);
        return date.toLocaleTimeString('fr-CH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [departure.stop.departureTimestamp]);

    // Retard en minutes (l'API renvoie déjà en minutes)
    const delayMinutes = departure.stop.delay || 0;
    const hasDelay = delayMinutes > 0;
    const hasMajorDelay = delayMinutes > 9;

    // Bus annulé
    const isCancelled = departure.stop.status?.toUpperCase() === 'CANCELLED' ||
        departure.stop.status?.toUpperCase() === 'ANNULÉ';

    // Heure d'arrivée estimée (avec retard) pour les gros retards
    const estimatedArrival = useMemo(() => {
        if (!hasMajorDelay) return '';
        const estimatedTimestamp = (departure.stop.departureTimestamp + delayMinutes * 60) * 1000;
        const date = new Date(estimatedTimestamp);
        return date.toLocaleTimeString('fr-CH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [departure.stop.departureTimestamp, delayMinutes, hasMajorDelay]);

    // Ne pas afficher les bus partis (sauf annulés)
    if (hasDeparted && !isCancelled) {
        return null;
    }

    return (
        <div
            style={{
                background: isCancelled
                    ? 'rgba(107, 114, 128, 0.2)'
                    : hasMajorDelay
                        ? 'rgba(220, 38, 38, 0.1)'
                        : theme.colors.surface,
                borderRadius: '8px',
                padding: layout.departures.cardPadding,
                margin: layout.departures.cardMargin,
                minHeight: layout.departures.cardMinHeight,
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                opacity: isCancelled ? 0.6 : 1,
                border: isCancelled ? '2px solid #dc2626' : 'none',
                borderLeft: isCancelled
                    ? '4px solid #dc2626'
                    : departure.stop.isPlatformChanged
                        ? '4px solid #ef4444'
                        : isApproaching
                            ? `4px solid ${theme.colors.success}`
                            : hasMajorDelay
                                ? `4px solid #dc2626`
                                : hasDelay
                                    ? `4px solid ${theme.colors.error}`
                                    : 'none',
                animation: isCancelled
                    ? 'none'
                    : hasMajorDelay
                        ? 'majorDelayPulse 2s ease-in-out infinite'
                        : isApproaching
                            ? 'approachingGlow 3s ease infinite'
                            : 'fadeSlideIn 0.5s ease',
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: layout.departures.gridColumns,
                    alignItems: 'center',
                    gap: layout.departures.gap,
                    width: '100%',
                    textDecoration: isCancelled ? 'line-through' : 'none',
                }}
            >
                {/* Numéro de ligne */}
                <div
                    style={{
                        backgroundColor: colors.background,
                        color: colors.color,
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: layout.departures.fontSize.lineNumber,
                        fontWeight: 'bold',
                        minWidth: layout.departures.lineNumberSize,
                        textAlign: 'center',
                    }}
                >
                    {departure.number}
                </div>

                {/* Heure de départ */}
                <div
                    style={{
                        fontSize: layout.departures.fontSize.time,
                        fontWeight: 500,
                        color: theme.colors.text,
                    }}
                >
                    {departureTime}
                </div>

                {/* Destination */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div
                        style={{
                            fontSize: layout.departures.fontSize.destination,
                            fontWeight: 'bold',
                            color: theme.colors.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {departure.to}
                    </div>
                    {/* Quai */}
                    {departure.stop.platform && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: theme.colors.textSecondary }}>
                                Quai {departure.stop.platform}
                            </span>
                            {/* Changement de quai */}
                            {departure.stop.isPlatformChanged && departure.stop.prognosisPlatform && (
                                <span
                                    className="platform-changed"
                                    style={{
                                        fontSize: '0.75rem',
                                        color: '#ef4444',
                                        fontWeight: '600'
                                    }}
                                >
                                    → Quai {departure.stop.prognosisPlatform}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Temps restant */}
                <div
                    style={{
                        fontSize: isCancelled ? '1rem' : hasMajorDelay ? '0.9rem' : layout.departures.fontSize.minutesLeft,
                        fontWeight: 'bold',
                        color: isCancelled ? '#dc2626' : hasMajorDelay ? '#dc2626' : isApproaching ? theme.colors.success : theme.colors.text,
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: (isCancelled || hasMajorDelay) ? 'column' : 'row',
                        justifyContent: 'flex-end',
                        alignItems: (isCancelled || hasMajorDelay) ? 'flex-end' : 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {isCancelled ? (
                        <span style={{
                            fontSize: '1.1rem',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                        }}>
                            ANNULÉ
                        </span>
                    ) : hasMajorDelay ? (
                        <>
                            <span style={{ fontSize: '0.75rem' }}>Retard arrivée estimée</span>
                            <span style={{ fontSize: '1.1rem' }}>{estimatedArrival}</span>
                        </>
                    ) : (
                        <>
                            <span>{timeRemaining}</span>
                            {hasDelay && (
                                <span style={{ color: theme.colors.error, fontSize: '0.7em' }}>
                                    +{delayMinutes} min
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// THEMED HEADER
// ============================================

interface ThemedHeaderProps {
    stationName: string;
    filteredLines?: string[];
}

export function ThemedHeader({ stationName, filteredLines = [] }: ThemedHeaderProps) {
    const { theme } = useTheme();
    const { layout } = useLayout();

    return (
        <header
            style={{
                padding: '2vh',
                background: theme.colors.background,
                display: 'flex',
                alignItems: 'center',
                gap: '2vw',
                height: layout.header.height,
                minHeight: '60px',
            }}
        >
            {layout.header.showBusIcon && (
                <Link href="/admin" aria-label="Configuration">
                    <span style={{ fontSize: layout.header.iconSize }}>🚌</span>
                </Link>
            )}

            <div style={{ flexGrow: 1 }}>
                <h1
                    style={{
                        fontSize: layout.header.titleSize,
                        marginBottom: filteredLines.length > 0 ? '0.5vh' : 0,
                        color: theme.colors.header,
                    }}
                >
                    {stationName || 'Chargement...'}
                </h1>

                {/* Affichage des lignes filtrées avec leurs couleurs */}
                {filteredLines.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5vh' }}>
                        {filteredLines.map(line => {
                            const colors = getLineColors(line);
                            return (
                                <span
                                    key={line}
                                    style={{
                                        backgroundColor: colors.background,
                                        color: colors.color,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '1.2rem',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {line}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
}

// ============================================
// THEMED FOOTER
// ============================================

interface ThemedFooterProps {
    currentTime: string;
    showCompanyLogo?: boolean;
    showPartnerLogo?: boolean;
}

export function ThemedFooter({ currentTime, showCompanyLogo = true, showPartnerLogo = true }: ThemedFooterProps) {
    const { theme } = useTheme();
    const { layout } = useLayout();

    return (
        <footer
            style={{
                background: theme.colors.footer,
                padding: '0px 20px',
                height: layout.footer.height,
                borderTop: `1px solid ${theme.colors.border}`,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                alignItems: 'center',
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
            }}
        >
            {/* Logo partenaire (gauche) */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {showPartnerLogo && (
                    <Image
                        src="/assets/cff.png"
                        alt="CFF"
                        width={300}
                        height={50}
                        style={{ objectFit: 'contain' }}
                    />
                )}
            </div>

            {/* Horloge (centre) */}
            <div
                style={{
                    textAlign: 'center',
                    fontSize: layout.footer.clockSize,
                    fontWeight: 'bold',
                    color: theme.colors.text,
                    paddingBottom: '10px',
                }}
            >
                {currentTime}
            </div>

            {/* Logo entreprise (droite) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {showCompanyLogo && (
                    <Image
                        src="/assets/logomc.png"
                        alt="MediaCom's"
                        width={150}
                        height={55}
                        style={{ objectFit: 'contain', paddingBottom: '10px' }}
                    />
                )}
            </div>
        </footer>
    );
}

// ============================================
// THEMED DISPLAY WRAPPER
// ============================================

interface ThemedDisplayProps {
    children: React.ReactNode;
}

export function ThemedDisplay({ children }: ThemedDisplayProps) {
    const { theme, isHydrated: themeHydrated } = useTheme();
    const { layout, applyLayoutCSS } = useLayout();

    // Appliquer le CSS du layout
    useEffect(() => {
        if (themeHydrated) {
            applyLayoutCSS();
        }
    }, [themeHydrated, applyLayoutCSS]);

    return (
        <div
            style={{
                background: theme.colors.background,
                color: theme.colors.text,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: layout.footer.height,
            }}
        >
            {children}
        </div>
    );
}

// ============================================
// LOADING & STATES
// ============================================

export function ThemedLoading() {
    const { theme } = useTheme();

    return (
        <div
            style={{
                background: theme.colors.surface,
                padding: '2rem',
                textAlign: 'center',
                borderRadius: '8px',
                margin: '20px',
            }}
        >
            <div
                style={{
                    width: '50px',
                    height: '50px',
                    border: `5px solid ${theme.colors.surfaceHover}`,
                    borderTopColor: theme.colors.accent,
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    animation: 'spin 1s linear infinite',
                }}
            />
            <p style={{ color: theme.colors.textMuted }}>Chargement des horaires...</p>
        </div>
    );
}

export function ThemedError({ message }: { message: string }) {
    const { theme } = useTheme();

    return (
        <div
            style={{
                background: theme.colors.surface,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                margin: '20px',
                borderLeft: `4px solid ${theme.colors.error}`,
            }}
        >
            <p style={{ color: theme.colors.error }}>⚠️ {message}</p>
        </div>
    );
}

export function ThemedNoDepartures() {
    const { theme } = useTheme();

    return (
        <div
            style={{
                background: theme.colors.surface,
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                margin: '20px',
            }}
        >
            <p style={{ color: theme.colors.textMuted }}>Aucun départ à afficher</p>
        </div>
    );
}
