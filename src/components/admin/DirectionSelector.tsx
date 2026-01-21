'use client';

import { useConfig } from '@/hooks/useConfig';
import { useAvailableDirections } from '@/hooks/useDepartures';

/**
 * Composant pour sélectionner les directions à afficher
 */
export default function DirectionSelector() {
    const { config, toggleDirection, clearFilteredDirections } = useConfig();
    const { directions, loading } = useAvailableDirections(config.station.name);

    // Pas de station sélectionnée
    if (!config.station.id) {
        return (
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '1rem 0' }}>
                Sélectionnez d&apos;abord une station
            </div>
        );
    }

    // Chargement
    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', padding: '1rem 0' }}>
                <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '2px solid #3b82f6',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                Chargement des directions...
            </div>
        );
    }

    // Pas de directions disponibles
    if (directions.length === 0) {
        return (
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '1rem 0' }}>
                Aucune direction disponible pour cette station
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {config.filteredDirections.length === 0
                        ? 'Toutes les directions affichées'
                        : `${config.filteredDirections.length} direction(s) sélectionnée(s)`}
                </div>

                {config.filteredDirections.length > 0 && (
                    <button
                        onClick={clearFilteredDirections}
                        style={{
                            fontSize: '0.75rem',
                            color: '#3b82f6',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                        }}
                    >
                        Tout afficher
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {directions.map(direction => {
                    const isSelected = config.filteredDirections.includes(direction);

                    return (
                        <button
                            key={direction}
                            onClick={() => toggleDirection(direction)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                backgroundColor: isSelected ? '#7c3aed' : '#e5e7eb',
                                color: isSelected ? 'white' : '#374151',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 600 : 400,
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = '#d1d5db';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                                }
                            }}
                        >
                            → {direction}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
