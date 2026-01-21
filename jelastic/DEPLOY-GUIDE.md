# 🚀 Guide de Déploiement Rapide - Jelastic

## ✅ Le nouveau ZIP est prêt !

**Fichier** : `jelastic-deploy.zip`  
**Contenu** :
- ✅ `package.json` (avec script `npm start` → `node server.js`)
- ✅ `package-lock.json` (pour `npm ci`)
- ✅ `.next/standalone/` (serveur standalone)
- ✅ `.next/static/` (assets)
- ✅ `public/` (fichiers publics)
- ✅ `ecosystem.config.js` (PM2)

---

## 📦 Déploiement

### 1. Uploadez le ZIP
1. Dashboard Jelastic → **Deploy** → **Archive**
2. Uploadez `jelastic-deploy.zip`
3. Jelastic installera automatiquement les dépendances avec `npm ci`

### 2. Configurez les variables
**Environment** → **Variables** :
```
NODE_ENV=production
PORT=3000
ADMIN_API_KEY=votre-clé-secrète
REDIS_ENABLED=false
```

### 3. L'application démarre !
Jelastic lancera automatiquement `npm start` → `node server.js`

---

## 🔍 Vérification

```bash
# Testez l'endpoint ping
curl https://votre-env.jcloud.ik-server.com/api/ping
# Réponse attendue : pong
```

---

## 🛠 Commandes utiles (SSH)

```bash
# Voir les logs
pm2 logs

# Redémarrer
pm2 restart all

# Statut
pm2 status
```
