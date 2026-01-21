'use client';

import { useLayout } from '@/hooks/useLayout';
import { layoutsList, type LayoutId } from '@/lib/themes';

interface LayoutSelectorProps {
    showLabels?: boolean;
    compact?: boolean;
}

/**
 * Composant pour sélectionner le layout
 */
export default function LayoutSelector({ showLabels = true, compact = false }: LayoutSelectorProps) {
    const { layoutId, setLayout } = useLayout();

    if (compact) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                    value={layoutId}
                    onChange={(e) => setLayout(e.target.value as LayoutId)}
                    style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        color: '#111827',
                        cursor: 'pointer',
                    }}
                >
                    {layoutsList.map(layout => (
                        <option key={layout.id} value={layout.id}>
                            {layout.emoji} {layout.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {layoutsList.map(layout => {
                const isSelected = layoutId === layout.id;

                return (
                    <button
                        key={layout.id}
                        onClick={() => setLayout(layout.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'white',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {/* Emoji */}
                        <span style={{ fontSize: '1.5rem' }}>{layout.emoji}</span>

                        {/* Texte */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: '#111827' }}>
                                {layout.name}
                            </div>
                            {showLabels && (
                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                    {layout.description}
                                </div>
                            )}
                        </div>

                        {/* Indicateur sélection */}
                        {isSelected && (
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
