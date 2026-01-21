const fs = require('fs');
const path = require('path');

/**
 * Charge les variables d'environnement depuis un fichier .env
 * @param {string} filePath - Chemin vers le fichier .env
 * @returns {Object} - Variables d'environnement
 */
function loadEnvFile(filePath) {
    const env = {};

    if (!fs.existsSync(filePath)) {
        return env;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
        // Ignorer les commentaires et lignes vides
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Parser KEY=VALUE
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();

            // Retirer les guillemets si présents
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            env[key] = value;
        }
    }

    return env;
}

// Charger les variables depuis .env.local (prioritaire) ou .env
const envLocal = loadEnvFile(path.join(__dirname, '.env.local'));
const envDefault = loadEnvFile(path.join(__dirname, '.env'));
const envVars = { ...envDefault, ...envLocal };

// Configuration par défaut avec fallback
const config = {
    NODE_ENV: envVars.NODE_ENV || 'production',
    PORT: envVars.PORT || '3000',
    HOSTNAME: envVars.HOSTNAME || '0.0.0.0',

    // Redis
    REDIS_ENABLED: envVars.REDIS_ENABLED || 'false',
    REDIS_URL: envVars.REDIS_URL || 'redis://localhost:6379',
    REDIS_PREFIX: envVars.REDIS_PREFIX || 'bus-display:',

    // Cache
    CACHE_TTL: envVars.CACHE_TTL || '45000',

    // API & Sécurité
    ADMIN_API_KEY: envVars.ADMIN_API_KEY || 'change-me-in-production',
    METRICS_ENABLED: envVars.METRICS_ENABLED || 'true',

    // Next.js
    NEXT_TELEMETRY_DISABLED: '1'
};

module.exports = {
    apps: [{
        name: 'bus-display',
        script: '.next/standalone/server.js',
        cwd: __dirname,

        // Variables d'environnement chargées depuis .env.local
        env: config,

        // Logs
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,

        // Gestion des processus
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',

        // Redémarrage gracieux
        kill_timeout: 5000,
        listen_timeout: 10000,
        wait_ready: true,

        // Exponential backoff restart
        exp_backoff_restart_delay: 100,
        max_restarts: 10,
        restart_delay: 1000
    }]
};
