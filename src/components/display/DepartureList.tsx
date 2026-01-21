'use client';

import { useDepartures } from '@/hooks/useDepartures';
import { useConfig, useConfigHydrated } from '@/hooks/useConfig';
import DepartureItem from './DepartureItem';

/**
 * Composant liste des départs
 * Affiche tous les départs filtrés pour la station configurée
 */
export default function DepartureList() {
    const { config } = useConfig();
    const isHydrated = useConfigHydrated();
    const { departures, loading, error, usedCache, lastUpdate } = useDepartures();

    // Attendre l'hydratation pour éviter les problèmes SSR
    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-gray-400">
                    Chargement de la configuration...
                </div>
            </div>
        );
    }

    // Pas de station configurée
    if (!config.station.id) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-8">
                <div className="text-6xl mb-4">🚌</div>
                <div className="text-gray-400 text-xl text-center">
                    Aucune station configurée
                </div>
                <p className="text-gray-500 mt-2 text-center">
                    Allez dans les <a href="/admin" className="text-blue-400 hover:underline">paramètres</a> pour sélectionner une station
                </p>
            </div>
        );
    }

    // Chargement initial
    if (loading && departures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                <div className="text-gray-400">
                    Chargement des horaires...
                </div>
            </div>
        );
    }

    // Erreur sans données
    if (error && departures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <div className="text-red-400 text-xl text-center">
                    {error}
                </div>
                <p className="text-gray-500 mt-2 text-center">
                    Vérifiez votre connexion internet
                </p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Indicateur mode hors-ligne */}
            {usedCache && (
                <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">📡</span>
                    <div>
                        <div className="text-yellow-400 font-medium">Mode hors-ligne</div>
                        <div className="text-yellow-500/80 text-sm">
                            Données potentiellement obsolètes
                        </div>
                    </div>
                </div>
            )}

            {/* En-tête avec nom de station */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                    {config.station.name}
                </h2>
                {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                )}
            </div>

            {/* Filtres actifs */}
            {(config.filteredLines.length > 0 || config.filteredDirections.length > 0) && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {config.filteredLines.map(line => (
                        <span
                            key={`line-${line}`}
                            className="px-2 py-1 bg-blue-600/30 text-blue-400 rounded text-sm"
                        >
                            Ligne {line}
                        </span>
                    ))}
                    {config.filteredDirections.map(dir => (
                        <span
                            key={`dir-${dir}`}
                            className="px-2 py-1 bg-purple-600/30 text-purple-400 rounded text-sm"
                        >
                            → {dir}
                        </span>
                    ))}
                </div>
            )}

            {/* Liste des départs */}
            <div className="space-y-2">
                {departures.length > 0 ? (
                    departures.slice(0, 10).map((departure, index) => (
                        <DepartureItem
                            key={`${departure.number}-${departure.to}-${departure.stop.departureTimestamp}-${index}`}
                            departure={departure}
                            index={index}
                        />
                    ))
                ) : (
                    <div className="text-gray-400 text-center py-8">
                        <div className="text-4xl mb-2">🔍</div>
                        Aucun départ à afficher
                    </div>
                )}
            </div>

            {/* Dernière mise à jour */}
            {lastUpdate && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                    Dernière mise à jour : {lastUpdate.toLocaleTimeString('fr-CH')}
                </div>
            )}
        </div>
    );
}
