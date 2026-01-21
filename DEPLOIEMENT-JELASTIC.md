# Déploiement sur Jelastic Cloud

Guide complet de déploiement de Bus Display sur Jelastic (Infomaniak ou autre).

---

## Architecture recommandée

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Nginx 1.28+    │────▶│  Node.js 25+    │────▶│  Redis 7.2+     │
│  (Load Balancer)│     │  (Application)  │     │  (Cache)        │
│  Port 443 → 3000│     │  Port 3000      │     │  Port 6379      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Étape 1 : Créer l'environnement Jelastic

### 1.1 Nouvelle topologie

1. Connectez-vous à votre panneau Jelastic
2. Cliquez sur **New Environment**
3. Configurez la topologie :

| Couche | Type | Version | Cloudlets |
|--------|------|---------|-----------|
| **Balancer** | Nginx | 1.28+ | 1-5 |
| **Application** | Node.js | 25+ | 4-8 |
| **NoSQL** | Redis | 7.2+ | 1-4 |

4. Activez **SSL** (Let's Encrypt)
5. Nommez l'environnement (ex: `bus-display`)
6. Cliquez **Create**

### 1.2 Noter les informations importantes

Après création, notez :
- **IP interne Node.js** : `10.100.XX.XX` (visible dans le dashboard)
- **IP interne Redis** : `10.100.YY.YY`
- **Mot de passe Redis** : Cliquez sur le noeud Redis → **Info** → **Admin Password**

---

## Étape 2 : Déployer le code

### Option A : Déploiement via Git (recommandé)

1. Cliquez sur **Deploy** sur le noeud Node.js
2. Sélectionnez **Git/SVN**
3. Entrez :
   - URL : `https://github.com/VOTRE_USER/busdisplay.git`
   - Branch : `main`
4. Cliquez **Deploy**

### Option B : Déploiement via Archive

1. Téléchargez le ZIP depuis GitHub
2. Cliquez **Deploy** → **Archive**
3. Uploadez le fichier
4. Cliquez **Deploy**

---

## Étape 3 : Configuration de l'application

### 3.1 Accéder au serveur Node.js

Cliquez sur **Web SSH** sur le noeud Node.js, ou utilisez SSH :

```bash
ssh [nodeid]-[env]@gate.[region].jelastic.com
```

### 3.2 Se placer dans le bon dossier

```bash
cd /home/jelastic/ROOT
```

### 3.3 Créer le fichier de configuration

```bash
cp env.example.txt .env.local
nano .env.local
```

Modifiez les valeurs suivantes :

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Redis - Remplacez avec vos valeurs
REDIS_ENABLED=true
REDIS_URL=redis://admin:VOTRE_MOT_DE_PASSE_REDIS@10.100.YY.YY:6379
REDIS_PREFIX=bus-display:

# Sécurité - Générez une nouvelle clé
ADMIN_API_KEY=VOTRE_CLE_SECRETE
```

> **Générer une clé sécurisée** : `openssl rand -hex 32`

### 3.4 Installer les dépendances et builder

```bash
npm ci
npm run build
```

Le script de build copie automatiquement les fichiers statiques.

### 3.5 Créer le dossier de logs

```bash
mkdir -p logs
```

### 3.6 Démarrer l'application

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## Étape 4 : Configurer Nginx (IMPORTANT)

Par défaut, Nginx route vers le port 80, mais notre app écoute sur le port 3000.

### 4.1 Accéder au serveur Nginx

Cliquez sur **Web SSH** sur le noeud Nginx (Load Balancer).

### 4.2 Modifier la configuration

```bash
# Trouver l'IP du noeud Node.js
IP_NODEJS="10.100.XX.XX"  # Remplacez par l'IP réelle

# Modifier le fichier de configuration
sudo sed -i "s/server ${IP_NODEJS};/server ${IP_NODEJS}:3000;/g" /etc/nginx/nginx-jelastic.conf
sudo sed -i "s/${IP_NODEJS}\\\\:80/${IP_NODEJS}:3000/g" /etc/nginx/nginx-jelastic.conf

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo nginx -s reload
```

### 4.3 Vérifier la configuration

```bash
grep -A5 "upstream" /etc/nginx/nginx-jelastic.conf
```

Vous devez voir `server 10.100.XX.XX:3000;`

---

## Étape 5 : Vérification

### 5.1 Tester localement (depuis le noeud Node.js)

```bash
curl http://localhost:3000/api/ping
# Réponse attendue : pong
```

### 5.2 Tester depuis l'extérieur

```bash
curl https://votre-env.jcloud.ik-server.com/api/ping
# Réponse attendue : pong

curl https://votre-env.jcloud.ik-server.com/api/locations?query=Lausanne
# Réponse attendue : liste des stations
```

### 5.3 Vérifier Redis

```bash
pm2 logs --lines 20
# Cherchez : [REDIS] Connecté et prêt
```

---

## Commandes utiles

### PM2

```bash
pm2 list              # Liste des processus
pm2 logs              # Logs en temps réel
pm2 logs --lines 50   # Dernières 50 lignes
pm2 restart all       # Redémarrer
pm2 reload all        # Reload gracieux (0 downtime)
pm2 monit             # Monitoring CPU/RAM
pm2 delete all        # Arrêter et supprimer
```

### Mise à jour de l'application

```bash
cd /home/jelastic/ROOT
git pull origin main
npm ci
npm run build
pm2 reload all
```

---

## Dépannage

### Problème : 502 Bad Gateway

**Cause** : Nginx ne peut pas atteindre Node.js

**Solution** :
1. Vérifiez que l'app tourne : `pm2 list`
2. Vérifiez le port : `netstat -tlnp | grep 3000`
3. Vérifiez la config Nginx : voir Étape 4

### Problème : EADDRINUSE (port déjà utilisé)

**Solution** :
```bash
fuser -k 3000/tcp
pm2 delete all
pm2 start ecosystem.config.js
```

### Problème : Fichiers JS 404

**Cause** : Fichiers statiques non copiés

**Solution** :
```bash
npm run build  # Le postbuild copie automatiquement
pm2 restart all
```

### Problème : Redis non connecté

**Vérifiez** :
1. L'IP Redis est correcte dans `.env.local`
2. Le mot de passe Redis est correct
3. Redis est accessible : `redis-cli -h 10.100.YY.YY -a VOTRE_MOT_DE_PASSE ping`

---

## Configuration SSL personnalisé

Pour un domaine personnalisé (ex: `bus.monentreprise.ch`) :

1. Dans Jelastic → **Settings** → **Custom Domains**
2. Ajoutez votre domaine
3. Configurez le DNS (CNAME vers `votre-env.jcloud.ik-server.com`)
4. Installez Let's Encrypt : **Add-ons** → **Let's Encrypt Free SSL**

---

## Résumé des fichiers

| Fichier | Description |
|---------|-------------|
| `ecosystem.config.js` | Configuration PM2 (charge `.env.local` automatiquement) |
| `env.example.txt` | Template de configuration à copier vers `.env.local` |
| `scripts/postbuild.js` | Script qui copie les fichiers statiques après le build |
| `.env.local` | Configuration locale (à créer, non versionné) |

---

## Checklist de déploiement

- [ ] Environnement Jelastic créé (Nginx + Node.js + Redis)
- [ ] Code déployé via Git ou Archive
- [ ] `.env.local` créé avec les bonnes valeurs
- [ ] `npm ci && npm run build` exécuté
- [ ] Nginx configuré pour router vers le port 3000
- [ ] PM2 démarré et sauvegardé
- [ ] Test `/api/ping` réussi
- [ ] SSL activé (Let's Encrypt)
