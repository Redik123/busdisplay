declare module 'next-pwa' {
    import { NextConfig } from 'next';

    interface RuntimeCachingEntry {
        urlPattern: RegExp | string;
        handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';
        options?: {
            cacheName?: string;
            expiration?: {
                maxEntries?: number;
                maxAgeSeconds?: number;
                purgeOnQuotaError?: boolean;
            };
            networkTimeoutSeconds?: number;
            cacheableResponse?: {
                statuses?: number[];
                headers?: { [key: string]: string };
            };
            matchOptions?: {
                ignoreSearch?: boolean;
                ignoreMethod?: boolean;
                ignoreVary?: boolean;
            };
            fetchOptions?: RequestInit;
            plugins?: unknown[];
        };
    }

    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: RuntimeCachingEntry[];
        publicExcludes?: string[];
        buildExcludes?: (string | RegExp)[];
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
        cacheOnFrontEndNav?: boolean;
        reloadOnOnline?: boolean;
        subdomainPrefix?: string;
        customWorkerDir?: string;
        customWorkerSrc?: string;
        customWorkerWebpack?: (config: unknown) => void;
    }

    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

    export default withPWA;
}
