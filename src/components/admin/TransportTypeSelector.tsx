'use client';

import { useConfig } from '@/hooks/useConfig';
import { TRANSPORT_TYPES, type TransportType } from '@/types/config';

/**
 * Sélecteur de types de transport (bus, tram, metro, etc.)
 */
export default function TransportTypeSelector() {
    const { config, updateConfig } = useConfig();
    const selectedCategories = config.filteredCategories || ['bus'];

    const toggleCategory = (category: TransportType) => {
        if (category === 'all') {
            // Si "Tous" est sélectionné, on met ['all']
            updateConfig({ filteredCategories: ['all'] });
            return;
        }

        let newCategories: TransportType[];

        // Retirer 'all' si on sélectionne une catégorie spécifique
        const currentCategories = selectedCategories.filter(c => c !== 'all');

        if (currentCategories.includes(category)) {
            // Désélectionner la catégorie
            newCategories = currentCategories.filter(c => c !== category);
            // Si aucune catégorie, revenir à 'all'
            if (newCategories.length === 0) {
                newCategories = ['all'];
            }
        } else {
            // Ajouter la catégorie
            newCategories = [...currentCategories, category];
        }

        updateConfig({ filteredCategories: newCategories });
    };

    const isSelected = (category: TransportType) => {
        if (category === 'all') {
            return selectedCategories.includes('all');
        }
        return selectedCategories.includes(category) && !selectedCategories.includes('all');
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
            }}>
                {TRANSPORT_TYPES.map(type => {
                    const selected = isSelected(type.id);
                    return (
                        <button
                            key={type.id}
                            onClick={() => toggleCategory(type.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '0.5rem',
                                border: selected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                background: selected ? 'rgba(59, 130, 246, 0.1)' : 'white',
                                color: selected ? '#1d4ed8' : '#374151',
                                cursor: 'pointer',
                                fontWeight: selected ? 600 : 400,
                                fontSize: '0.875rem',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <span>{type.emoji}</span>
                            <span>{type.label}</span>
                            {selected && <span style={{ marginLeft: '0.25rem' }}>✓</span>}
                        </button>
                    );
                })}
            </div>

            <p style={{
                marginTop: '0.75rem',
                fontSize: '0.75rem',
                color: '#6b7280',
                fontStyle: 'italic',
            }}>
                {selectedCategories.includes('all')
                    ? 'Affichage de tous les types de transport'
                    : `Affichage: ${selectedCategories.join(', ')}`
                }
            </p>
        </div>
    );
}
