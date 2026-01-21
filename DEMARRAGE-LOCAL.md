# 🚀 Guide de Démarrage Local (Windows)

Ce guide explique comment démarrer rapidement l'application en environnement de développement local sur Windows.

---

## ⚡ Démarrage Rapide

### Option 1: Script Batch (Recommandé pour simplicité)

**Double-cliquez simplement sur** `start-dev.bat`

Ou depuis le terminal:
```cmd
start-dev.bat
```

### Option 2: Script PowerShell (Recommandé pour sécurité)

**Clic-droit sur** `start-dev.ps1` → **Exécuter avec PowerShell**

Ou depuis PowerShell:
```powershell
.\start-dev.ps1
```

> **Note**: Si vous avez une erreur d'exécution de scripts PowerShell, exécutez d'abord:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## 📋 Ce que font les scripts automatiquement

Les scripts `start-dev.bat` et `start-dev.ps1` effectuent automatiquement:

1. ✅ **Vérification de Node.js** et npm
2. ✅ **Installation des dépendances** (`npm install`) si nécessaire
3. ✅ **Création du fichier `.env.local`** avec configuration par défaut
4. ✅ **Génération automatique d'une clé API sécurisée**
5. ✅ **Démarrage du serveur** de développement (`npm run dev`)

Vous n'avez **rien d'autre à faire** !

---

## 🔑 Clé API Générée

Les scripts génèrent automatiquement une clé API sécurisée et l'enregistrent dans `.env.local`.

### Afficher votre clé API

**Option 1**: Lors du démarrage du script
- Le script vous demande si vous voulez voir la clé
- Répondez `o` pour l'afficher

**Option 2**: Consulter le fichier
```cmd
type .env.local | findstr ADMIN_API_KEY
```

Ou avec PowerShell:
```powershell
Select-String -Path .env.local -Pattern "ADMIN_API_KEY"
```

---

## 🌐 URLs Disponibles

Une fois le serveur démarré, accédez à:

### Interface Utilisateur
- **Page d'accueil**: http://localhost:3000
- **Affichage bus**: http://localhost:3000/display
- **Configuration admin**: http://localhost:3000/admin

### API Publique (pas d'authentification)
- **Horaires**: http://localhost:3000/api/stationboard?station=Geneve
- **Recherche stations**: http://localhost:3000/api/locations?query=Geneve
- **Lignes disponibles**: http://localhost:3000/api/available-lines?station=Geneve
- **Directions**: http://localhost:3000/api/directions?station=Geneve

### API Protégée (authentification requise)
- **Métriques Prometheus**: http://localhost:3000/api/metrics
- **Health check**: http://localhost:3000/api/health
- **Stats cache**: http://localhost:3000/api/cache-stats
- **Rate limiting**: http://localhost:3000/api/rate-limit

---

## 🔐 Tester l'Authentification API

### Avec curl (Windows)
```cmd
curl -H "X-API-Key: VOTRE_CLE" http://localhost:3000/api/metrics
```

### Avec PowerShell
```powershell
$headers = @{
    "X-API-Key" = "VOTRE_CLE"
}
Invoke-RestMethod -Uri http://localhost:3000/api/metrics -Headers $headers
```

### Avec votre navigateur
Installez une extension comme "ModHeader" pour ajouter le header `X-API-Key`, puis visitez:
http://localhost:3000/api/metrics

---

## 🛠️ Configuration Avancée

### Modifier la configuration

Éditez le fichier `.env.local` (créé automatiquement):

```env
# Sécurité
ADMIN_API_KEY=votre-cle-generee

# Redis (optionnel - désactivé par défaut)
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

# Cache (en millisecondes)
CACHE_TTL=45000

# Port (optionnel)
PORT=3000
```

### Régénérer la clé API

**Option 1**: Supprimer le fichier et relancer le script
```cmd
del .env.local
start-dev.bat
```

**Option 2**: Générer manuellement avec PowerShell
```powershell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[BitConverter]::ToString($bytes).Replace('-','').ToLower()
```

**Option 3**: Générer avec OpenSSL (si installé)
```cmd
openssl rand -hex 32
```

Puis copiez la clé dans `.env.local`:
```env
ADMIN_API_KEY=nouvelle-cle-ici
```

---

## 🐛 Dépannage

### "Node.js n'est pas installé"

**Solution**: Installez Node.js depuis https://nodejs.org/
- Téléchargez la version LTS (Long Term Support)
- Redémarrez votre terminal après installation

### "npm install" échoue

**Solutions**:
1. Supprimez le dossier `node_modules` et `package-lock.json`
2. Relancez le script
3. Si l'erreur persiste, vérifiez votre connexion internet

### "Le serveur ne démarre pas"

**Solutions**:
1. Vérifiez que le port 3000 n'est pas déjà utilisé:
   ```cmd
   netstat -ano | findstr :3000
   ```
2. Changez le port dans `.env.local`:
   ```env
   PORT=3001
   ```
3. Vérifiez les logs d'erreur dans le terminal

### "Impossible d'exécuter start-dev.ps1"

**Solution**: Autorisez l'exécution de scripts PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Les dépendances sont obsolètes"

**Solution**: Mettez à jour les dépendances
```cmd
npm update
```

---

## 📚 Commandes Utiles

### Démarrage manuel (sans script)
```cmd
npm install
npm run dev
```

### Build de production (test local)
```cmd
npm run build
npm run start
```

### Linter
```cmd
npm run lint
```

### Tests
```cmd
npm test
```

### Nettoyage complet
```cmd
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json
npm install
```

---

## 🔄 Redémarrage

### Arrêter le serveur
Appuyez sur `Ctrl + C` dans le terminal

### Redémarrer
Relancez simplement le script:
```cmd
start-dev.bat
```
ou
```powershell
.\start-dev.ps1
```

---

## 📝 Notes Importantes

### Développement vs Production

⚠️ **Ces scripts sont UNIQUEMENT pour le développement local**

Pour la production:
- Ne PAS utiliser ces scripts
- Générer une clé API sécurisée différente
- Configurer Redis avec authentification
- Voir [SECURITY.md](./SECURITY.md) pour le guide complet

### Fichier .env.local

- ✅ Ce fichier est ignoré par Git (déjà dans `.gitignore`)
- ✅ Il contient des secrets (clé API)
- ❌ Ne JAMAIS commiter ce fichier
- ❌ Ne JAMAIS partager votre clé API

### Mise à jour du code

Après un `git pull`:
```cmd
npm install  # Met à jour les dépendances si nécessaire
npm run dev  # Redémarre le serveur
```

---

## 🎯 Workflow Typique

1. **Premier démarrage**:
   ```cmd
   start-dev.bat
   ```

2. **Ouvrir le navigateur**:
   - http://localhost:3000

3. **Développer**:
   - Modifiez les fichiers dans `src/`
   - Le serveur redémarre automatiquement (hot reload)

4. **Tester les APIs**:
   - Utilisez la clé API affichée au démarrage
   - Testez avec curl ou Postman

5. **Arrêter**:
   - `Ctrl + C` dans le terminal

6. **Redémarrer** (jours suivants):
   ```cmd
   start-dev.bat
   ```

---

## 💡 Astuces

### Raccourci sur le Bureau

**Créer un raccourci**:
1. Clic-droit sur `start-dev.bat`
2. Créer un raccourci
3. Déplacer le raccourci sur le Bureau
4. Renommer: "🚌 Bus Display - Dev"

### Terminal permanent

**Garder le terminal ouvert**:
- Le terminal doit rester ouvert tant que le serveur tourne
- Minimisez-le au lieu de le fermer

### Logs détaillés

Pour des logs plus verbeux:
```cmd
set DEBUG=*
npm run dev
```

---

## 🆘 Besoin d'Aide?

### Documentation
- [README.md](./README.md) - Documentation générale
- [SECURITY.md](./SECURITY.md) - Guide de sécurité
- [CHANGELOG-SECURITY.md](./CHANGELOG-SECURITY.md) - Changements récents

### Support
- Créez une issue sur GitHub
- Consultez les logs d'erreur
- Vérifiez la configuration dans `.env.local`

---

**Bon développement! 🚀**
