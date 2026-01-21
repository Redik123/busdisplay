@echo off
setlocal enabledelayedexpansion

:: ============================================
:: Script de démarrage automatique (Windows)
:: Bus Display Next.js - Environnement LOCAL
:: ============================================

echo.
echo ========================================
echo   Bus Display - Demarrage Development
echo ========================================
echo.

:: Couleurs (si supporté)
color 0A

:: Vérifier Node.js
echo [1/5] Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe!
    echo Telecharger depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detecte:
node --version
echo.

:: Vérifier npm
echo [2/5] Verification de npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe!
    pause
    exit /b 1
)
echo [OK] npm detecte:
npm --version
echo.

:: Vérifier/Installer les dépendances
echo [3/5] Verification des dependances...
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERREUR] Echec de l'installation des dependances!
        pause
        exit /b 1
    )
    echo [OK] Dependances installees avec succes!
) else (
    echo [OK] Dependances deja installees
    echo [INFO] Pour reinstaller: supprimez le dossier node_modules
)
echo.

:: Vérifier/Créer .env.local
echo [4/5] Configuration de l'environnement local...
if not exist ".env.local" (
    echo [INFO] Creation du fichier .env.local...

    :: Générer une clé API sécurisée (32 bytes = 64 caractères hexa)
    echo [INFO] Generation d'une cle API securisee...

    :: Méthode 1: PowerShell (plus sécurisé)
    powershell -Command "$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); $key = [BitConverter]::ToString($bytes).Replace('-','').ToLower(); Write-Output $key" > temp_key.txt 2>nul

    if exist temp_key.txt (
        set /p GENERATED_KEY=<temp_key.txt
        del temp_key.txt
    ) else (
        :: Fallback: Générer une clé moins sécurisée mais fonctionnelle
        set "GENERATED_KEY=%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%%RANDOM%"
        echo [WARNING] Utilisation d'une cle de fallback - moins securisee
    )

    :: Créer le fichier .env.local
    (
        echo # ===========================================
        echo # Configuration Bus Display - DEVELOPPEMENT
        echo # Genere automatiquement par start-dev.bat
        echo # ===========================================
        echo.
        echo # Environnement
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # Securite ^(DEV ONLY - A changer en production^)
        echo ADMIN_API_KEY=!GENERATED_KEY!
        echo.
        echo # Redis ^(optionnel^)
        echo REDIS_ENABLED=false
        echo REDIS_URL=redis://localhost:6379
        echo REDIS_PREFIX=bus-display:
        echo.
        echo # Cache
        echo CACHE_TTL=45000
        echo.
        echo # API
        echo NEXT_PUBLIC_API_URL=http://localhost:3000
        echo.
        echo # Monitoring
        echo METRICS_ENABLED=true
        echo.
        echo # CORS ^(vide = desactive^)
        echo ALLOWED_ORIGINS=
        echo.
        echo # IP Whitelist ^(vide = toutes autorisees^)
        echo ALLOWED_IPS=
    ) > .env.local

    echo [OK] Fichier .env.local cree avec succes!
    echo [OK] Cle API generee: !GENERATED_KEY!
    echo.
    echo ========================================
    echo   IMPORTANT - Sauvegardez cette cle!
    echo ========================================
    echo.
    echo Pour acceder aux endpoints proteges:
    echo curl -H "X-API-Key: !GENERATED_KEY!" http://localhost:3000/api/metrics
    echo.
) else (
    echo [OK] Fichier .env.local deja present

    :: Lire la clé existante
    findstr /C:"ADMIN_API_KEY=" .env.local > temp_key_line.txt 2>nul
    if exist temp_key_line.txt (
        set /p KEY_LINE=<temp_key_line.txt
        set "EXISTING_KEY=!KEY_LINE:*ADMIN_API_KEY=!"
        echo [INFO] Cle API actuelle: !EXISTING_KEY!
        del temp_key_line.txt
    )
)
echo.

:: Afficher les informations de démarrage
echo [5/5] Demarrage du serveur de developpement...
echo.
echo ========================================
echo   Application prete au demarrage!
echo ========================================
echo.
echo URL de l'application:
echo   - Interface:  http://localhost:3000
echo   - Display:    http://localhost:3000/display
echo   - Admin:      http://localhost:3000/admin
echo.
echo Endpoints API proteges ^(necessitent la cle API^):
echo   - Metrics:    http://localhost:3000/api/metrics
echo   - Health:     http://localhost:3000/api/health
echo   - Cache:      http://localhost:3000/api/cache-stats
echo   - Rate Limit: http://localhost:3000/api/rate-limit
echo.
echo Endpoints API publics:
echo   - Stationboard: http://localhost:3000/api/stationboard?station=Geneve
echo   - Locations:    http://localhost:3000/api/locations?query=Geneve
echo.
echo ========================================
echo.

:: Demander si l'utilisateur veut voir la clé
set /p SHOW_KEY="Voulez-vous afficher votre cle API? (o/N): "
if /i "!SHOW_KEY!"=="o" (
    echo.
    if defined GENERATED_KEY (
        echo Cle API: !GENERATED_KEY!
    ) else if defined EXISTING_KEY (
        echo Cle API: !EXISTING_KEY!
    ) else (
        echo [INFO] Cle presente dans .env.local
    )
    echo.
    echo Pour tester l'authentification:
    if defined GENERATED_KEY (
        echo curl -H "X-API-Key: !GENERATED_KEY!" http://localhost:3000/api/metrics
    ) else if defined EXISTING_KEY (
        echo curl -H "X-API-Key: !EXISTING_KEY!" http://localhost:3000/api/metrics
    )
    echo.
)

:: Lancer le serveur
echo Demarrage de Next.js en mode developpement...
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
echo ========================================
echo.

:: Démarrer npm run dev
call npm run dev

:: Si le serveur s'arrête
echo.
echo ========================================
echo   Serveur arrete
echo ========================================
echo.
pause
