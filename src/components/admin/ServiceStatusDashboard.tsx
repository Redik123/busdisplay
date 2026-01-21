'use client';

import { useState, useEffect } from 'react';
import { useServiceStatus, formatBytes, formatUptime } from '@/hooks/useServiceStatus';

interface ServerInfo {
    ip: string;
    hostname: string;
    nodeVersion: string;
}

/**
 * Composant dashboard de monitoring pour l'admin
 * Affiche le statut des services, cache, mémoire et statistiques API
 */
export default function ServiceStatusDashboard() {
    const { health, rateLimit, apiStats, clients, isLoading, error, lastUpdate, refetch } = useServiceStatus();
    const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);

    // Récupérer les infos du serveur (IP du noeud)
    useEffect(() => {
        const fetchServerInfo = async () => {
            try {
                const res = await fetch('/api/server-info');
                if (res.ok) {
                    const data = await res.json();
                    setServerInfo(data);
                }
            } catch {
                // Ignorer les erreurs silencieusement
            }
        };

        fetchServerInfo();
    }, []);

    if (isLoading && !health) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                Chargement du statut...
            </div>
        );
    }

    const isHealthy = health?.status === 'healthy';

    // Calcul du pourcentage de rate limit
    const stationboardUsage = rateLimit?.usage?.stationboard;
    const getRateLimitColor = (percentage: number) => {
        if (percentage >= 90) return '#ef4444';
        if (percentage >= 70) return '#eab308';
        return '#22c55e';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Status global avec IP du noeud */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: isHealthy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                border: `1px solid ${isHealthy ? '#22c55e' : '#ef4444'}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isHealthy ? '#22c55e' : '#ef4444',
                        animation: isHealthy ? 'none' : 'pulse 2s infinite',
                    }} />
                    <span style={{
                        fontWeight: 600,
                        color: isHealthy ? '#166534' : '#dc2626',
                    }}>
                        {isHealthy ? 'Tous les services opérationnels' : 'Services dégradés'}
                    </span>
                    {serverInfo && (
                        <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid #3b82f6',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            color: '#1d4ed8',
                            fontWeight: 500,
                            fontFamily: 'monospace',
                        }}>
                            🖥️ {serverInfo.ip}
                        </span>
                    )}
                </div>
                <button
                    onClick={refetch}
                    style={{
                        padding: '0.375rem 0.75rem',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                    }}
                >
                    🔄 Rafraîchir
                </button>
            </div>

            {error && (
                <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                }}>
                    ⚠️ Erreur: {error}
                </div>
            )}

            {/* Rate Limit - Barre de progression */}
            {stationboardUsage && (
                <div style={{
                    padding: '0.75rem 1rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                    }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            📊 Quota API journalier (Stationboard)
                        </span>
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: getRateLimitColor(stationboardUsage.percentage),
                        }}>
                            {stationboardUsage.current} / {stationboardUsage.limit.toLocaleString()}
                        </span>
                    </div>
                    <div style={{
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.min(stationboardUsage.percentage, 100)}%`,
                            background: getRateLimitColor(stationboardUsage.percentage),
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                        }} />
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.375rem',
                        fontSize: '0.625rem',
                        color: '#9ca3af',
                    }}>
                        <span>{stationboardUsage.percentage}% utilisé</span>
                        <span>Reste: {stationboardUsage.remaining.toLocaleString()} • Reset à minuit</span>
                    </div>
                </div>
            )}

            {/* Grille des métriques - Affiche seulement les infos disponibles */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem',
            }}>
                {/* Clients connectés */}
                {clients && (
                    <MetricCard
                        label="Clients connectés"
                        value={clients.total.toString()}
                        icon="👥"
                        color="#3b82f6"
                        subtitle={`${Object.keys(clients.byStation).length} station(s)`}
                    />
                )}

                {/* Uptime - masqué car non disponible dans status public */}
                {health && health.uptime > 0 && (
                    <MetricCard
                        label="Uptime"
                        value={formatUptime(health.uptime)}
                        icon="⏱️"
                        color="#3b82f6"
                    />
                )}

                {/* Cache - masqué car info non disponible */}
                {health && health.cache.backend !== 'unknown' && (
                    <MetricCard
                        label="Cache"
                        value={health.cache.backend}
                        icon={health.cache.redisConnected ? "🟢" : "🟡"}
                        color={health.cache.redisConnected ? '#22c55e' : '#eab308'}
                        subtitle={`${health.cache.localMapKeys || 0} entrées`}
                    />
                )}

                {/* Mémoire - masqué car info non disponible */}
                {health && health.memory.heapUsed > 0 && (
                    <MetricCard
                        label="Mémoire"
                        value={formatBytes(health.memory.heapUsed)}
                        icon="💾"
                        color="#8b5cf6"
                        subtitle={`/ ${formatBytes(health.memory.heapTotal)}`}
                    />
                )}

                {/* Temps réponse */}
                <MetricCard
                    label="Temps réponse"
                    value={`${apiStats.avgResponseTime}ms`}
                    icon="⚡"
                    color={apiStats.avgResponseTime < 200 ? '#22c55e' : apiStats.avgResponseTime < 500 ? '#eab308' : '#ef4444'}
                />

                {/* API Status */}
                <MetricCard
                    label="API Status"
                    value="Opérationnel"
                    icon="✅"
                    color="#22c55e"
                    subtitle={`${apiStats.totalCalls} appels`}
                />
            </div>

            {/* Dernière mise à jour */}
            <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                textAlign: 'right',
            }}>
                Dernière mise à jour: {lastUpdate?.toLocaleTimeString('fr-CH') || '-'}
            </div>
        </div>
    );
}

/**
 * Carte de métrique individuelle
 */
function MetricCard({
    label,
    value,
    icon,
    color,
    subtitle
}: {
    label: string;
    value: string;
    icon: string;
    color: string;
    subtitle?: string;
}) {
    return (
        <div style={{
            padding: '0.75rem',
            background: 'white',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                color: '#6b7280',
            }}>
                <span>{icon}</span>
                <span>{label}</span>
            </div>
            <div style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: color,
            }}>
                {value}
            </div>
            {subtitle && (
                <div style={{
                    fontSize: '0.625rem',
                    color: '#9ca3af',
                }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}
