'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useConfig } from '@/hooks/useConfig';
import { useTheme, type ThemeId } from '@/hooks/useTheme';
import { useLayout } from '@/hooks/useLayout';
import { themesList, layoutsList, type LayoutId } from '@/lib/themes';
import { TRANSPORT_TYPES, type TransportType } from '@/types/config';
import ServiceStatusDashboard from '@/components/admin/ServiceStatusDashboard';
import LineSelector from '@/components/admin/LineSelector';
import DirectionSelector from '@/components/admin/DirectionSelector';

/**
 * Page d'administration V2 - Design moderne et fonctionnel
 */
export default function AdminPage() {
    const { config, updateConfig, resetConfig } = useConfig();
    const { themeId, autoSeasonal, setTheme, setAutoSeasonal } = useTheme();
    const { layoutId, setLayout } = useLayout();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{ id: string, name: string }>>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Recherche de station
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/locations?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSearchResults(data.stations || []);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const selectStation = (station: { id: string, name: string }) => {
        updateConfig({ station });
        setSearchQuery(station.name);
        setSearchResults([]);
    };

    return (
        <div
            className="admin-page"
            style={{
                minHeight: '100vh',
                background: '#f3f4f6',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                overflow: 'auto',
                height: 'auto',
            }}
        >
            {/* Header */}
            <header style={{
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        ⚙️ Configuration de l&apos;affichage
                    </h1>
                    <Link href="/display" style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}>
                        ← Retour à l&apos;affichage
                    </Link>
                </div>
                <button
                    onClick={() => alert('Configuration sauvegardée automatiquement!')}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '0.625rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                    }}
                >
                    ✓ Sauvegarder
                </button>
            </header>

            {/* Contenu principal */}
            <main style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>

                {/* Dashboard de monitoring */}
                <Card title="📊 Statut des services">
                    <ServiceStatusDashboard />
                </Card>

                <div style={{ marginTop: '1.5rem' }} />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    alignItems: 'start',
                }}>

                    {/* COLONNE 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Station */}
                        <Card title="🚏 Sélection de la station">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Rechercher une station..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                }}
                            />

                            {/* Résultats */}
                            {searchResults.length > 0 && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }}>
                                    {searchResults.map((station) => (
                                        <button
                                            key={station.id}
                                            onClick={() => selectStation(station)}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                textAlign: 'left',
                                                border: 'none',
                                                borderBottom: '1px solid #f3f4f6',
                                                background: 'white',
                                                cursor: 'pointer',
                                                color: '#111827',
                                            }}
                                        >
                                            {station.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {isSearching && (
                                <div style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                    Recherche...
                                </div>
                            )}

                            {config.station.id && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: '#dcfce7',
                                    borderRadius: '0.5rem',
                                    color: '#166534',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    ✓ Station sélectionnée: <strong>{config.station.name}</strong>
                                </div>
                            )}
                        </Card>

                        {/* Mode veille */}
                        <Card title="🌙 Mode veille">
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '1rem',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={config.sleepMode?.enabled || false}
                                    onChange={(e) => updateConfig({
                                        sleepMode: {
                                            ...config.sleepMode,
                                            enabled: e.target.checked
                                        }
                                    })}
                                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                                />
                                <span style={{ color: '#374151' }}>Activer le mode veille horaire</span>
                            </label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                        Début
                                    </label>
                                    <input
                                        type="time"
                                        value={config.sleepMode?.startTime || '22:00'}
                                        onChange={(e) => updateConfig({
                                            sleepMode: {
                                                ...config.sleepMode,
                                                startTime: e.target.value
                                            }
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                        Fin
                                    </label>
                                    <input
                                        type="time"
                                        value={config.sleepMode?.endTime || '06:00'}
                                        onChange={(e) => updateConfig({
                                            sleepMode: {
                                                ...config.sleepMode,
                                                endTime: e.target.value
                                            }
                                        })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Intervalle */}
                        <Card title="⏱️ Intervalle de rafraîchissement">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <input
                                    type="number"
                                    value={config.refreshInterval / 1000}
                                    onChange={(e) => updateConfig({
                                        refreshInterval: Math.max(30, Math.min(300, parseInt(e.target.value) || 60)) * 1000
                                    })}
                                    min={30}
                                    max={300}
                                    style={{
                                        width: '80px',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        textAlign: 'center',
                                    }}
                                />
                                <span style={{ color: '#6b7280' }}>secondes</span>

                                {[30, 60, 180].map(sec => (
                                    <button
                                        key={sec}
                                        onClick={() => updateConfig({ refreshInterval: sec * 1000 })}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            background: config.refreshInterval === sec * 1000 ? '#3b82f6' : '#e5e7eb',
                                            color: config.refreshInterval === sec * 1000 ? 'white' : '#374151',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* COLONNE 2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Thèmes */}
                        <Card title="🎨 Thème">
                            {/* Auto-saisonnier */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                marginBottom: '1rem',
                                borderRadius: '0.5rem',
                                border: autoSeasonal ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                background: autoSeasonal ? 'rgba(59, 130, 246, 0.1)' : 'white',
                                cursor: 'pointer',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={autoSeasonal}
                                    onChange={(e) => setAutoSeasonal(e.target.checked)}
                                    style={{ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>🗓️ Auto-saisonnier</div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        Change selon la saison
                                    </div>
                                </div>
                            </label>

                            {/* Grille thèmes */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '0.5rem',
                                opacity: autoSeasonal ? 0.5 : 1,
                            }}>
                                {themesList.map(theme => {
                                    const isSelected = !autoSeasonal && themeId === theme.id;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => !autoSeasonal && setTheme(theme.id as ThemeId)}
                                            disabled={autoSeasonal}
                                            style={{
                                                padding: '0.75rem 0.5rem',
                                                borderRadius: '0.5rem',
                                                border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'white',
                                                cursor: autoSeasonal ? 'not-allowed' : 'pointer',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <div style={{ fontSize: '1.25rem' }}>{theme.emoji}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151', marginTop: '0.25rem' }}>
                                                {theme.name}
                                            </div>
                                            {/* Preview couleurs */}
                                            <div style={{ display: 'flex', gap: '2px', marginTop: '0.375rem', justifyContent: 'center' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: theme.colors.background, border: '1px solid #ddd' }} />
                                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: theme.colors.surface }} />
                                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: theme.colors.primary }} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Layouts */}
                        <Card title="📐 Disposition">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {layoutsList.map(layout => {
                                    const isSelected = layoutId === layout.id;
                                    return (
                                        <button
                                            key={layout.id}
                                            onClick={() => setLayout(layout.id as LayoutId)}
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
                                                width: '100%',
                                            }}
                                        >
                                            <span style={{ fontSize: '1.25rem' }}>{layout.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: '#111827' }}>{layout.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{layout.description}</div>
                                            </div>
                                            {isSelected && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* COLONNE 3 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Types de transport */}
                        <Card title="🚌 Types de transport">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {TRANSPORT_TYPES.map(type => {
                                    const categories = config.filteredCategories || ['bus'];
                                    const isSelected = type.id === 'all'
                                        ? categories.includes('all')
                                        : categories.includes(type.id) && !categories.includes('all');

                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                if (type.id === 'all') {
                                                    updateConfig({ filteredCategories: ['all'] });
                                                } else {
                                                    const current = (config.filteredCategories || ['bus']).filter((c: TransportType) => c !== 'all');
                                                    const newCats = current.includes(type.id)
                                                        ? current.filter((c: TransportType) => c !== type.id)
                                                        : [...current, type.id];
                                                    updateConfig({
                                                        filteredCategories: newCats.length === 0 ? ['all'] : newCats
                                                    });
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                padding: '0.5rem 0.75rem',
                                                borderRadius: '0.375rem',
                                                border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
                                                background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'white',
                                                color: isSelected ? '#1d4ed8' : '#374151',
                                                cursor: 'pointer',
                                                fontWeight: isSelected ? 600 : 400,
                                                fontSize: '0.875rem',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = '#9ca3af';
                                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = '#d1d5db';
                                                    e.currentTarget.style.backgroundColor = 'white';
                                                }
                                            }}
                                        >
                                            <span>{type.emoji}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Lignes - Composant interactif */}
                        <Card title="🚏 Lignes à afficher">
                            <LineSelector />
                        </Card>

                        {/* Directions - Composant interactif */}
                        <Card title="🎯 Directions à afficher">
                            <DirectionSelector />
                        </Card>

                        {/* Logos */}
                        <Card title="🏢 Logos et Partenaires">
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    Logo entreprise
                                </label>
                                <select style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    boxSizing: 'border-box',
                                }}>
                                    <option value="mc">Logo MediaCom&apos;s</option>
                                    <option value="">Aucun</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                                    Partenaire
                                </label>
                                <select style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    boxSizing: 'border-box',
                                }}>
                                    <option value="cff">CFF</option>
                                    <option value="">Aucun</option>
                                </select>
                            </div>
                        </Card>

                        {/* App mobile */}
                        <Card title="📱 Application mobile">
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                Téléchargez l&apos;application Android
                            </p>
                            <button style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}>
                                📥 Télécharger l&apos;APK
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                                Version 1.2.4
                            </p>
                        </Card>

                        {/* Reset */}
                        <button
                            onClick={() => {
                                if (confirm('Réinitialiser toute la configuration ?')) {
                                    resetConfig();
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            🗑️ Réinitialiser la configuration
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ============================================
// Composant Card
// ============================================

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
            <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#111827',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid #f3f4f6',
            }}>
                {title}
            </h2>
            {children}
        </div>
    );
}
