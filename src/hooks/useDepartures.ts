'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Departure } from '@/types/departure';
import { useConfig } from './useConfig';

interface UseDeparturesReturn {
    departures: Departure[];
    loading: boolean;
    error: string | null;
    usedCache: boolean;
    lastUpdate: Date | null;
    refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer et gérer les départs de bus
 * 
 * Fonctionnalités:
 * - Fetch automatique quand la station change
 * - Refresh périodique basé sur refreshInterval
 * - Gestion du cache et mode hors-ligne
 * - Filtrage par lignes et directions
 */
export function useDepartures(): UseDeparturesReturn {
    const { config } = useConfig();
    const [rawDepartures, setRawDepartures] = useState<Departure[]>([]); // Données brutes de l'API
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usedCache, setUsedCache] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Ref pour éviter les double-fetches
    const fetchingRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction de fetch principal
    const fetchDepartures = useCallback(async () => {
        const stationName = config.station.name;

        // Ne pas fetcher si pas de station valide
        if (!stationName || stationName === 'Sélectionnez une station') {
            setRawDepartures([]);
            return;
        }

        // Éviter les fetches multiples
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `/api/stationboard?station=${encodeURIComponent(stationName)}`
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur ${response.status}`);
            }

            // Vérifie le status du cache
            const cacheStatus = response.headers.get('X-Cache-Status');
            setUsedCache(cacheStatus === 'STALE');

            const data = await response.json();

            // Stocke les données brutes sans filtrage
            setRawDepartures(data.stationboard || []);
            setLastUpdate(new Date());
            setError(null);

        } catch (err) {
            console.error('[useDepartures] Erreur:', err);

            // Garde les anciennes données en cas d'erreur
            if (rawDepartures.length === 0) {
                setError(err instanceof Error ? err.message : 'Impossible de récupérer les horaires');
            }
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [config.station.name, rawDepartures.length]);

    // Applique les filtres aux données brutes (mémoïsé avec dépendances directes)
    const departures = React.useMemo(() => {
        let filtered = rawDepartures;

        // Applique le filtre par lignes
        if (config.filteredLines.length > 0) {
            filtered = filtered.filter((d: Departure) =>
                config.filteredLines.includes(d.number)
            );
        }

        // Applique le filtre par directions
        if (config.filteredDirections.length > 0) {
            filtered = filtered.filter((d: Departure) =>
                config.filteredDirections.includes(d.to)
            );
        }

        // Applique le filtre par catégories de transport
        const categories = config.filteredCategories || ['bus'];
        if (!categories.includes('all') && categories.length > 0) {
            filtered = filtered.filter((d: Departure) => {
                const category = (d.category || '').toUpperCase();
                return categories.some(cat => {
                    const catUpper = cat.toUpperCase();
                    // Correspondances selon l'API transport.opendata.ch
                    if (catUpper === 'BUS') {
                        return category === 'BUS' || category === 'B' || category.startsWith('BUS');
                    }
                    if (catUpper === 'TRAM') {
                        return category === 'TRAM' || category === 'T' || category.startsWith('TRAM');
                    }
                    if (catUpper === 'METRO') {
                        return category === 'M' || category.startsWith('M ') || category.includes('METRO');
                    }
                    if (catUpper === 'TRAIN') {
                        return category === 'IC' || category === 'IR' || category === 'RE' ||
                            category === 'S' || category === 'EC' || category === 'TGV' ||
                            category.includes('TRAIN');
                    }
                    if (catUpper === 'SHIP') {
                        return category === 'BAT' || category.includes('SHIP') || category.includes('BOAT');
                    }
                    if (catUpper === 'CABLEWAY') {
                        return category === 'FUN' || category === 'GB' || category.includes('CABLE');
                    }
                    return category.includes(catUpper);
                });
            });
        }

        return filtered;
    }, [rawDepartures, config.filteredLines, config.filteredDirections, config.filteredCategories]);

    // Fetch initial quand la station change
    useEffect(() => {
        fetchDepartures();
    }, [config.station.name, fetchDepartures]);

    // Refresh automatique
    useEffect(() => {
        // Clear l'ancien interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Ne pas démarrer si pas de station
        if (!config.station.id) return;

        // Démarrer le nouveau interval
        intervalRef.current = setInterval(() => {
            fetchDepartures();
        }, config.refreshInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [config.refreshInterval, config.station.id, fetchDepartures]);

    return {
        departures,
        loading,
        error,
        usedCache,
        lastUpdate,
        refetch: fetchDepartures
    };
}

/**
 * Hook simplifié pour récupérer uniquement les lignes disponibles
 */
export function useAvailableLines(stationName: string | null) {
    const [lines, setLines] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stationName || stationName === 'Sélectionnez une station') {
            setLines([]);
            return;
        }

        const fetchLines = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/stationboard?station=${encodeURIComponent(stationName)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const uniqueLines = [...new Set(
                        (data.stationboard || []).map((d: Departure) => d.number)
                    )] as string[];
                    setLines(uniqueLines.sort());
                }
            } catch (err) {
                console.error('[useAvailableLines] Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLines();
    }, [stationName]);

    return { lines, loading };
}

/**
 * Hook simplifié pour récupérer uniquement les directions disponibles
 */
export function useAvailableDirections(stationName: string | null) {
    const [directions, setDirections] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!stationName || stationName === 'Sélectionnez une station') {
            setDirections([]);
            return;
        }

        const fetchDirections = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `/api/stationboard?station=${encodeURIComponent(stationName)}`
                );

                if (response.ok) {
                    const data = await response.json();
                    const uniqueDirections = [...new Set(
                        (data.stationboard || []).map((d: Departure) => d.to)
                    )] as string[];
                    setDirections(uniqueDirections.sort());
                }
            } catch (err) {
                console.error('[useAvailableDirections] Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDirections();
    }, [stationName]);

    return { directions, loading };
}
