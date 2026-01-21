'use client';

import { useTheme, type ThemeId } from '@/hooks/useTheme';
import { themesList } from '@/lib/themes';

interface ThemeSelectorProps {
    showLabels?: boolean;
}

/**
 * Sélecteur de thème V2 - Design amélioré
 */
export default function ThemeSelector({ showLabels = true }: ThemeSelectorProps) {
    const { themeId, autoSeasonal, setTheme, setAutoSeasonal } = useTheme();

    return (
        <div>
            {/* Option Auto-saisonnier */}
            <label
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    borderRadius: '0.5rem',
                    border: autoSeasonal ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    background: autoSeasonal ? 'rgba(59, 130, 246, 0.1)' : 'white',
                    cursor: 'pointer',
                }}
            >
                <input
                    type="checkbox"
                    checked={autoSeasonal}
                    onChange={(e) => setAutoSeasonal(e.target.checked)}
                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                />
                <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>🗓️ Auto-saisonnier</div>
                    {showLabels && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Change automatiquement selon la saison
                        </div>
                    )}
                </div>
            </label>

            {/* Grille des thèmes */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    opacity: autoSeasonal ? 0.5 : 1,
                    pointerEvents: autoSeasonal ? 'none' : 'auto',
                }}
            >
                {themesList.map(theme => {
                    const isSelected = !autoSeasonal && themeId === theme.id;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => setTheme(theme.id as ThemeId)}
                            disabled={autoSeasonal}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'white',
                                cursor: autoSeasonal ? 'not-allowed' : 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {/* Emoji */}
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                                {theme.emoji}
                            </div>

                            {/* Nom */}
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}>
                                {theme.name}
                            </div>

                            {/* Preview couleurs */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '2px',
                                    marginTop: '0.5rem',
                                    justifyContent: 'center',
                                }}
                            >
                                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: theme.colors.background }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: theme.colors.surface }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: theme.colors.primary }} />
                                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: theme.colors.accent }} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
