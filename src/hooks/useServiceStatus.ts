'use client';

import { useState, useEffect, useCallback } from 'react';

interface HealthData {
    status: string;
    timestamp: string;
    cache: {
        backend: string;
        redisConnected: boolean;
        redisKeys: number;
        localMapKeys: number;
    };
    uptime: number;
    memory: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
}

interface RateLimitData {
    date: string;
    usage: {
        stationboard: { current: number; limit: number; percentage: number; remaining: number };
        connections: { current: number; limit: number; percentage: number; remaining: number };
        locations: { current: number; limit: number; percentage: number; remaining: number };
    };
    warnings: string[];
}

interface ApiStats {
    totalCalls: number;
    lastCallTime: Date | null;
    errors: number;
    avgResponseTime: number;
}

interface ClientsData {
    total: number;
    byStation: Record<string, number>;
}

interface ServiceStatus {
    health: HealthData | null;
    rateLimit: RateLimitData | null;
    apiStats: ApiStats;
    clients: ClientsData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdate: Date | null;
}

/**
 * Hook pour récupérer le statut des services
 */
export function useServiceStatus() {
    const [status, setStatus] = useState<ServiceStatus>({
        health: null,
        rateLimit: null,
        apiStats: {
            totalCalls: 0,
            lastCallTime: null,
            errors: 0,
            avgResponseTime: 0
        },
        clients: null,
        isLoading: true,
        error: null,
        lastUpdate: null
    });

    // Compteurs locaux pour les stats API
    const [callCounter, setCallCounter] = useState(0);
    const [errorCounter, setErrorCounter] = useState(0);
    const [responseTimes, setResponseTimes] = useState<number[]>([]);

    const fetchHealth = useCallback(async () => {
        const startTime = Date.now();

        try {
            // Fetch status et clients en parallèle
            const [statusRes, clientsRes] = await Promise.all([
                fetch('/api/status'),
                fetch('/api/clients').catch(() => null)
            ]);

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            if (!statusRes.ok) {
                throw new Error(`HTTP ${statusRes.status}`);
            }

            const statusData = await statusRes.json();
            const clientsData = clientsRes?.ok ? await clientsRes.json() : null;

            // Crée un objet health simplifié à partir du status
            const healthData: HealthData = {
                status: statusData.status === 'operational' ? 'healthy' : 'unhealthy',
                timestamp: statusData.timestamp,
                cache: {
                    backend: 'unknown', // Info non disponible dans status public
                    redisConnected: false,
                    redisKeys: 0,
                    localMapKeys: 0
                },
                uptime: 0, // Info non disponible
                memory: {
                    rss: 0,
                    heapTotal: 0,
                    heapUsed: 0,
                    external: 0
                }
            };

            const rateLimitData: RateLimitData = {
                date: statusData.date,
                usage: statusData.usage,
                warnings: statusData.warnings
            };

            // Met à jour les stats
            setCallCounter(prev => prev + 1);
            setResponseTimes(prev => [...prev.slice(-9), responseTime]);

            setStatus(prev => ({
                ...prev,
                health: healthData,
                rateLimit: rateLimitData,
                clients: clientsData?.success ? clientsData.data : null,
                apiStats: {
                    totalCalls: callCounter + 1,
                    lastCallTime: new Date(),
                    errors: errorCounter,
                    avgResponseTime: responseTimes.length > 0
                        ? Math.round([...responseTimes, responseTime].reduce((a, b) => a + b, 0) / (responseTimes.length + 1))
                        : responseTime
                },
                isLoading: false,
                error: null,
                lastUpdate: new Date()
            }));
        } catch (err) {
            setErrorCounter(prev => prev + 1);
            setStatus(prev => ({
                ...prev,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Erreur de connexion',
                apiStats: {
                    ...prev.apiStats,
                    errors: errorCounter + 1
                }
            }));
        }
    }, [callCounter, errorCounter, responseTimes]);

    // Fetch initial et refresh toutes les 30 secondes
    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { ...status, refetch: fetchHealth };
}

/**
 * Formatte les bytes en unité lisible
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Formatte l'uptime en durée lisible
 */
export function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}
