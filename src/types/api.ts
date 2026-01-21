// Types pour les réponses API

export interface LocationResult {
    id: string;
    name: string;
    score: number;
    coordinate?: {
        x: number;
        y: number;
    };
}

export interface LocationsResponse {
    stations: LocationResult[];
}

export interface AvailableLinesResponse {
    lines: string[];
}

export interface DirectionsResponse {
    directions: string[];
}

export interface HealthResponse {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    cache: {
        backend: 'redis' | 'local-map';
        redisConnected: boolean;
        redisKeys?: number;
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

export interface CacheStats {
    backend: 'redis' | 'local-map';
    redisConnected: boolean;
    redisKeys?: number;
    localMapKeys: number;
}

export interface ApiError {
    error: string;
    code?: string;
    details?: string;
}

// Type générique pour les réponses API
export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: ApiError };

// Headers de cache
export interface CacheHeaders {
    'X-Cache-Status': 'HIT' | 'MISS' | 'STALE';
    'Cache-Control'?: string;
}
