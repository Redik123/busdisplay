#!/usr/bin/env node
/**
 * Script post-build pour Next.js standalone
 *
 * Next.js standalone ne copie pas automatiquement les fichiers statiques.
 * Ce script copie:
 * - .next/static -> .next/standalone/.next/static
 * - public -> .next/standalone/public
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const STANDALONE = path.join(ROOT, '.next', 'standalone');
const STATIC_SRC = path.join(ROOT, '.next', 'static');
const STATIC_DEST = path.join(STANDALONE, '.next', 'static');
const PUBLIC_SRC = path.join(ROOT, 'public');
const PUBLIC_DEST = path.join(STANDALONE, 'public');

/**
 * Copie récursive d'un dossier
 */
function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`⚠️  Source n'existe pas: ${src}`);
        return false;
    }

    // Créer le dossier destination
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }

    return true;
}

console.log('📦 Post-build: Copie des fichiers statiques pour standalone...\n');

// Vérifier que le build standalone existe
if (!fs.existsSync(STANDALONE)) {
    console.error('❌ Erreur: Le dossier .next/standalone n\'existe pas.');
    console.error('   Assurez-vous que next.config.ts contient: output: "standalone"');
    process.exit(1);
}

// Copier .next/static
console.log('📁 Copie de .next/static...');
if (copyDir(STATIC_SRC, STATIC_DEST)) {
    console.log('   ✅ .next/static copié vers .next/standalone/.next/static');
} else {
    console.error('   ❌ Échec de la copie de .next/static');
    process.exit(1);
}

// Copier public
console.log('📁 Copie de public...');
if (copyDir(PUBLIC_SRC, PUBLIC_DEST)) {
    console.log('   ✅ public copié vers .next/standalone/public');
} else {
    console.log('   ⚠️  Dossier public non trouvé (optionnel)');
}

// Créer le dossier logs s'il n'existe pas
const LOGS_DIR = path.join(ROOT, 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
    console.log('📁 Dossier logs créé');
}

console.log('\n✅ Post-build terminé avec succès!');
console.log('\n📋 Pour démarrer l\'application:');
console.log('   NODE_ENV=production pm2 start ecosystem.config.js');
