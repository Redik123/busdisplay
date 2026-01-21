'use client';

import { useConfig } from '@/hooks/useConfig';
import { useAvailableLines } from '@/hooks/useDepartures';
import { getLineColors } from '@/lib/utils/line-colors';

/**
 * Composant pour sélectionner les lignes à afficher
 */
export default function LineSelector() {
    const { config, toggleLine, clearFilteredLines } = useConfig();
    const { lines, loading } = useAvailableLines(config.station.name);

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
                Chargement des lignes...
            </div>
        );
    }

    // Pas de lignes disponibles
    if (lines.length === 0) {
        return (
            <div style={{ color: '#9ca3af', fontSize: '0.875rem', padding: '1rem 0' }}>
                Aucune ligne disponible pour cette station
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {config.filteredLines.length === 0
                        ? 'Toutes les lignes affichées'
                        : `${config.filteredLines.length} ligne(s) sélectionnée(s)`}
                </div>

                {config.filteredLines.length > 0 && (
                    <button
                        onClick={clearFilteredLines}
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
                {lines.map(line => {
                    const colors = getLineColors(line);
                    const isSelected = config.filteredLines.includes(line);

                    return (
                        <button
                            key={line}
                            onClick={() => toggleLine(line)}
                            style={{
                                backgroundColor: colors.background,
                                color: colors.color,
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.375rem',
                                border: isSelected ? `2px solid ${colors.background}` : '2px solid transparent',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                opacity: isSelected ? 1 : 0.6,
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.opacity = '0.6';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            {line}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
