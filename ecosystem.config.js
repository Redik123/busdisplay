module.exports = {
    apps: [{
        name: 'bus-display',
        script: '.next/standalone/server.js',

        // Environnement
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },

        // Logs
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',

        // Gestion des processus
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',

        // Redémarrage gracieux
        kill_timeout: 5000,
        listen_timeout: 10000,

        // Healthcheck
        health_check_path: '/api/ping'
    }]
};
