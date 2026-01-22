'use client';

import Link from 'next/link';
import { useDepartures } from '@/hooks/useDepartures';
import { useConfig, useConfigHydrated } from '@/hooks/useConfig';
import { usePowerSave } from '@/hooks/usePowerSave';
import { useLayout } from '@/hooks/useLayout';
import { useSyncedTime } from '@/hooks/useSyncedTime';
import {
    ThemedDisplay,
    ThemedHeader,
    ThemedFooter,
    ThemedDepartureItem,
    ThemedLoading,
    ThemedError,
    ThemedNoDepartures
} from '@/components/display/ThemedDisplay';

/**
 * Page d'affichage des horaires
 * Utilise le système de thèmes et layouts dynamiques
 */
export default function DisplayPage() {
    const { config } = useConfig();
    const isHydrated = useConfigHydrated();
    const { departures, loading, error, usedCache } = useDepartures();
    const { isPowerSaveActive } = usePowerSave();
    const { layout } = useLayout();

    // Horloge synchronisée avec le serveur
    const currentTime = useSyncedTime();

    // Mode veille - écran noir complet
    if (isPowerSaveActive) {
        return <div style={{ height: '100vh', background: '#000' }} />;
    }

    // Attendre hydratation
    if (!isHydrated) {
        return (
            <ThemedDisplay>
                <ThemedLoading />
            </ThemedDisplay>
        );
    }

    // Pas de station configurée
    if (!config.station.id) {
        return (
            <ThemedDisplay>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚌</div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Aucune station configurée</h1>
                    <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
                        Configurez une station pour voir les horaires
                    </p>
                    <Link
                        href="/admin"
                        style={{
                            padding: '1rem 2rem',
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                        }}
                    >
                        Configurer
                    </Link>
                </div>
            </ThemedDisplay>
        );
    }

    // Nombre max de départs selon le layout
    const maxDepartures = layout.departures.maxVisible;

    return (
        <ThemedDisplay>
            {/* Header */}
            <ThemedHeader stationName={config.station.name} filteredLines={config.filteredLines} />

            {/* Séparateur */}
            <div style={{ height: '1px', background: 'var(--border-color, #333)' }} />

            {/* Indicateur mode hors-ligne */}
            {usedCache && (
                <div
                    style={{
                        background: '#f59e0b',
                        color: '#000',
                        padding: '0.5rem 1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                    }}
                >
                    📡 Mode hors-ligne - Données en cache
                </div>
            )}

            {/* Contenu principal */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                {/* Chargement */}
                {loading && departures.length === 0 && <ThemedLoading />}

                {/* Erreur */}
                {error && departures.length === 0 && <ThemedError message={error} />}

                {/* Aucun départ */}
                {!loading && departures.length === 0 && !error && <ThemedNoDepartures />}

                {/* Liste des départs */}
                {departures.slice(0, maxDepartures).map((departure, index) => (
                    <ThemedDepartureItem
                        key={`${departure.number}-${departure.to}-${departure.stop.departureTimestamp}-${index}`}
                        departure={departure}
                    />
                ))}
            </main>

            {/* Footer avec horloge et logos */}
            <ThemedFooter
                currentTime={currentTime}
                showCompanyLogo={config.logos?.company !== null && config.logos?.company !== ''}
                showPartnerLogo={config.logos?.partner !== null && config.logos?.partner !== ''}
            />
        </ThemedDisplay>
    );
}
