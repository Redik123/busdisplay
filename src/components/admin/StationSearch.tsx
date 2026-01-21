'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LocationResult } from '@/types/api';
import { useConfig } from '@/hooks/useConfig';

interface StationSearchProps {
    onStationSelect?: (station: LocationResult) => void;
}

/**
 * Composant de recherche de station avec auto-complétion
 */
export default function StationSearch({ onStationSelect }: StationSearchProps) {
    const { config, setStation } = useConfig();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Recherche avec debounce
    const searchStations = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/locations?query=${encodeURIComponent(searchQuery)}`
            );

            if (response.ok) {
                const data = await response.json();
                setResults(data.stations || []);
                setIsOpen(true);
                setSelectedIndex(-1);
            }
        } catch (error) {
            console.error('Erreur recherche:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Gestion de l'input avec debounce
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Clear le timeout précédent
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Nouveau timeout pour la recherche
        searchTimeoutRef.current = setTimeout(() => {
            searchStations(value);
        }, 300);
    }, [searchStations]);

    // Sélection d'une station
    const handleSelectStation = useCallback((station: LocationResult) => {
        setStation({ id: station.id, name: station.name });
        setQuery(station.name);
        setIsOpen(false);
        setResults([]);

        if (onStationSelect) {
            onStationSelect(station);
        }
    }, [setStation, onStationSelect]);

    // Navigation au clavier
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelectStation(results[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    }, [isOpen, results, selectedIndex, handleSelectStation]);

    // Fermer les résultats si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initialiser avec la station actuelle
    useEffect(() => {
        if (config.station.name && config.station.name !== 'Sélectionnez une station') {
            setQuery(config.station.name);
        }
    }, [config.station.name]);

    return (
        <div ref={containerRef} className="relative w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Station
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Rechercher une station..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg 
                     text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200"
                />

                {/* Indicateur de chargement */}
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                    </div>
                )}

                {/* Icône de recherche */}
                {!loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        🔍
                    </div>
                )}
            </div>

            {/* Liste des résultats */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 
                        rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {results.map((station, index) => (
                        <button
                            key={station.id}
                            onClick={() => handleSelectStation(station)}
                            className={`w-full px-4 py-3 text-left transition-colors
                         ${index === selectedIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-700'}
                         ${index === 0 ? 'rounded-t-lg' : ''}
                         ${index === results.length - 1 ? 'rounded-b-lg' : ''}
                         border-b border-gray-700 last:border-b-0`}
                        >
                            <div className="font-medium">{station.name}</div>
                            {station.score && station.score > 0 && (
                                <div className="text-xs text-gray-500">
                                    Score: {Math.round(station.score)}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Message si aucun résultat */}
            {isOpen && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 
                        rounded-lg shadow-xl p-4 text-center text-gray-400">
                    Aucune station trouvée
                </div>
            )}

            {/* Station actuellement sélectionnée */}
            {config.station.id && (
                <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                    <span>✓</span>
                    Station sélectionnée : {config.station.name}
                </div>
            )}
        </div>
    );
}
