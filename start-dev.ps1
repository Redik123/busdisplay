# ============================================
# Script de démarrage automatique (PowerShell)
# Bus Display Next.js - Environnement LOCAL
# ============================================

# Configuration
$ErrorActionPreference = "Stop"
$ProjectName = "Bus Display"
$Port = 3000

# Couleurs
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param(
        [string]$Step,
        [string]$Message
    )
    Write-Host "[$Step] " -NoNewline -ForegroundColor Yellow
    Write-Host $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] " -NoNewline -ForegroundColor Green
    Write-Host $Message
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERREUR] " -NoNewline -ForegroundColor Red
    Write-Host $Message
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARNING] " -NoNewline -ForegroundColor Yellow
    Write-Host $Message
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] " -NoNewline -ForegroundColor Blue
    Write-Host $Message
}

# Banner
Clear-Host
Write-Header "$ProjectName - Démarrage Development"

# Étape 1: Vérifier Node.js
Write-Step "1/5" "Vérification de Node.js..."
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Node.js détecté: $nodeVersion"
    } else {
        throw "Node.js non trouvé"
    }
} catch {
    Write-Error-Custom "Node.js n'est pas installé!"
    Write-Host "Télécharger depuis: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 2: Vérifier npm
Write-Step "2/5" "Vérification de npm..."
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "npm détecté: $npmVersion"
    } else {
        throw "npm non trouvé"
    }
} catch {
    Write-Error-Custom "npm n'est pas installé!"
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}
Write-Host ""

# Étape 3: Vérifier/Installer les dépendances
Write-Step "3/5" "Vérification des dépendances..."
if (-not (Test-Path "node_modules")) {
    Write-Info "Installation des dépendances..."
    Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Échec de l'installation des dépendances!"
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
    Write-Success "Dépendances installées avec succès!"
} else {
    Write-Success "Dépendances déjà installées"
    Write-Info "Pour réinstaller: supprimez le dossier node_modules"
}
Write-Host ""

# Étape 4: Vérifier/Créer .env.local
Write-Step "4/5" "Configuration de l'environnement local..."
$envFile = ".env.local"
$generatedKey = $null

if (-not (Test-Path $envFile)) {
    Write-Info "Création du fichier .env.local..."

    # Générer une clé API sécurisée (32 bytes = 64 caractères hex)
    Write-Info "Génération d'une clé API sécurisée..."
    $bytes = New-Object byte[] 32
    $rng = New-Object Security.Cryptography.RNGCryptoServiceProvider
    $rng.GetBytes($bytes)
    $generatedKey = [BitConverter]::ToString($bytes).Replace('-','').ToLower()

    # Créer le fichier .env.local
    $envContent = @"
# ===========================================
# Configuration Bus Display - DEVELOPPEMENT
# Généré automatiquement par start-dev.ps1
# ===========================================

# Environnement
NODE_ENV=development
PORT=3000

# Sécurité (DEV ONLY - À changer en production)
ADMIN_API_KEY=$generatedKey

# Redis (optionnel)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=bus-display:

# Cache
CACHE_TTL=45000

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# Monitoring
METRICS_ENABLED=true

# CORS (vide = désactivé)
ALLOWED_ORIGINS=

# IP Whitelist (vide = toutes autorisées)
ALLOWED_IPS=
"@

    $envContent | Out-File -FilePath $envFile -Encoding UTF8

    Write-Success "Fichier .env.local créé avec succès!"
    Write-Success "Clé API générée: $generatedKey"
    Write-Host ""

    Write-Header "IMPORTANT - Sauvegardez cette clé!"
    Write-Host "Pour accéder aux endpoints protégés:" -ForegroundColor Yellow
    Write-Host "curl -H ""X-API-Key: $generatedKey"" http://localhost:$Port/api/metrics" -ForegroundColor Gray
    Write-Host ""

} else {
    Write-Success "Fichier .env.local déjà présent"

    # Lire la clé existante
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'ADMIN_API_KEY=(.+)') {
        $existingKey = $matches[1].Trim()
        Write-Info "Clé API actuelle: $existingKey"
        $generatedKey = $existingKey
    }
}
Write-Host ""

# Étape 5: Afficher les informations
Write-Step "5/5" "Démarrage du serveur de développement..."
Write-Host ""

Write-Header "Application prête au démarrage!"

Write-Host "URL de l'application:" -ForegroundColor Yellow
Write-Host "  - Interface:  " -NoNewline
Write-Host "http://localhost:$Port" -ForegroundColor Green
Write-Host "  - Display:    " -NoNewline
Write-Host "http://localhost:$Port/display" -ForegroundColor Green
Write-Host "  - Admin:      " -NoNewline
Write-Host "http://localhost:$Port/admin" -ForegroundColor Green
Write-Host ""

Write-Host "Endpoints API protégés (nécessitent la clé API):" -ForegroundColor Yellow
Write-Host "  - Metrics:    http://localhost:$Port/api/metrics" -ForegroundColor Cyan
Write-Host "  - Health:     http://localhost:$Port/api/health" -ForegroundColor Cyan
Write-Host "  - Cache:      http://localhost:$Port/api/cache-stats" -ForegroundColor Cyan
Write-Host "  - Rate Limit: http://localhost:$Port/api/rate-limit" -ForegroundColor Cyan
Write-Host ""

Write-Host "Endpoints API publics:" -ForegroundColor Yellow
Write-Host "  - Stationboard: http://localhost:$Port/api/stationboard?station=Geneve" -ForegroundColor Cyan
Write-Host "  - Locations:    http://localhost:$Port/api/locations?query=Geneve" -ForegroundColor Cyan
Write-Host ""

# Demander si l'utilisateur veut voir la clé
$showKey = Read-Host "Voulez-vous afficher votre clé API? (o/N)"
if ($showKey -eq "o" -or $showKey -eq "O") {
    Write-Host ""
    Write-Host "Clé API: " -NoNewline -ForegroundColor Yellow
    Write-Host $generatedKey -ForegroundColor White
    Write-Host ""
    Write-Host "Pour tester l'authentification:" -ForegroundColor Yellow
    Write-Host "curl -H ""X-API-Key: $generatedKey"" http://localhost:$Port/api/metrics" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou avec PowerShell:" -ForegroundColor Yellow
    Write-Host "Invoke-RestMethod -Uri http://localhost:$Port/api/metrics -Headers @{""X-API-Key""=""$generatedKey""}" -ForegroundColor Gray
    Write-Host ""
}

Write-Header "Démarrage..."

Write-Host "Démarrage de Next.js en mode développement..." -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lancer npm run dev
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Error-Custom "Erreur lors du démarrage du serveur"
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Header "Serveur arrêté"
Read-Host "Appuyez sur Entrée pour quitter"
