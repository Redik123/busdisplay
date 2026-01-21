# 🚌 Déploiement sur Jelastic Cloud Infomaniak

Guide de déploiement de Bus Display sur Node.js natif Jelastic.

---

## Méthode Rapide : Node.js natif (recommandée)

### 1. Créer l'environnement

1. Connectez-vous à [jpc.infomaniak.com](https://jpc.infomaniak.com)
2. **New Environment** → Onglet **Node.js**
3. Configuration :
   - **Version** : Node.js 20
   - **Cloudlets** : 8-16
   - Cochez **SSL** pour HTTPS

### 2. Déployer via Git

1. Cliquez sur **Deploy** → **Git/SVN**
2. Entrez l'URL de votre repository
3. Branch : `main`
4. Cliquez **Deploy**

### 3. Build de l'application

Connectez-vous en **SSH** (Web SSH dans Jelastic) :

```bash
cd /var/www/webroot/ROOT
npm ci
npm run build
```

### 4. Variables d'environnement

Dans Jelastic → **Variables** :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `ADMIN_API_KEY` | `votre-clé-secrète` |

> 💡 Générer une clé : `openssl rand -hex 32`

### 5. Démarrer avec PM2

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Ajouter Redis (optionnel)

1. **Environnement** → **Change Topology**
2. Ajoutez un nœud **Redis**
3. Ajoutez les variables :

```env
REDIS_ENABLED=true
REDIS_URL=redis://[IP_REDIS]:6379
```

4. Redémarrez : `pm2 restart bus-display`

---

## Activer SSL

1. **Add-ons** → **Let's Encrypt Free SSL**
2. Entrez votre domaine
3. Certificat renouvelé automatiquement

---

## Vérification

```bash
curl https://votre-env.jcloud.ik-server.com/api/ping
# Réponse : pong
```

---

## Commandes PM2 utiles

```bash
pm2 list          # Voir les processus
pm2 logs          # Voir les logs en temps réel
pm2 restart all   # Redémarrer
pm2 monit         # Monitoring
```

---

## Fichiers fournis

| Fichier | Usage |
|---------|-------|
| `ecosystem.config.js` | Configuration PM2 |
| `jelastic/manifest.yaml` | Déploiement automatisé |
| `jelastic/env.production.example` | Template variables |
