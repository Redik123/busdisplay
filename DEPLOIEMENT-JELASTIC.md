# Déploiement sur Jelastic Cloud

Guide complet de déploiement de Bus Display sur Jelastic (Infomaniak ou autre).

---

## Architecture (4 noeuds avec load balancing)

```
                                    ┌─────────────────┐
                                ┌──▶│  Node.js #1     │──┐
                                │   │  Port 3000      │  │
┌─────────────────┐             │   └─────────────────┘  │
│  Nginx 1.28+    │             │   ┌─────────────────┐  │     ┌─────────────────┐
│  (Load Balancer)│─────────────┼──▶│  Node.js #2     │──┼────▶│  Redis 7.2+     │
│  Port 443       │             │   │  Port 3000      │  │     │  (Cache partagé)│
│  Round Robin    │             │   └─────────────────┘  │     │  Port 6379      │
└─────────────────┘             │   ┌─────────────────┐  │     └─────────────────┘
                                ├──▶│  Node.js #3     │──┤
                                │   │  Port 3000      │  │
                                │   └─────────────────┘  │
                                │   ┌─────────────────┐  │
                                └──▶│  Node.js #4     │──┘
                                    │  Port 3000      │
                                    └─────────────────┘
```

**Avantages de cette architecture :**
- Répartition de charge entre 4 noeuds
- Réduction de la consommation API (cache Redis partagé)
- Haute disponibilité (si un noeud tombe, les autres prennent le relais)

---

## Étape 1 : Créer l'environnement Jelastic

### 1.1 Nouvelle topologie

1. Connectez-vous à votre panneau Jelastic
2. Cliquez sur **New Environment**
3. Configurez la topologie :

| Couche | Type | Version | Cloudlets | **Nodes** |
|--------|------|---------|-----------|-----------|
| **Balancer** | Nginx | 1.28+ | 1-5 | 1 |
| **Application** | Node.js | 25+ | 4-8 | **4** |
| **NoSQL** | Redis | 7.2+ | 1-4 | 1 |

> **Important** : Définissez **4 noeuds** pour Node.js (horizontal scaling)

4. Activez **SSL** (Let's Encrypt)
5. Nommez l'environnement (ex: `bus-display`)
6. Cliquez **Create**

### 1.2 Noter les informations importantes

Après création, notez :
- **IPs internes Node.js** : `10.100.XX.1`, `10.100.XX.2`, `10.100.XX.3`, `10.100.XX.4`
- **IP interne Redis** : `10.100.YY.YY`
- **Mot de passe Redis** : Cliquez sur le noeud Redis → **Info** → **Admin Password**

> **Redis est OBLIGATOIRE** avec plusieurs noeuds pour partager le cache entre toutes les instances

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

> **IMPORTANT** : Les étapes 3.1 à 3.6 doivent être effectuées sur **CHAQUE noeud Node.js** (4 fois au total)

### 3.1 Accéder au serveur Node.js

Cliquez sur **Web SSH** sur le **premier noeud Node.js**, ou utilisez SSH :

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

# Redis - OBLIGATOIRE pour partager le cache entre les 4 noeuds
REDIS_ENABLED=true
REDIS_URL=redis://admin:VOTRE_MOT_DE_PASSE_REDIS@10.100.YY.YY:6379
REDIS_PREFIX=bus-display:

# Sécurité - Générez une nouvelle clé (même clé sur tous les noeuds)
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

### 3.7 Répéter sur les autres noeuds

**Répétez les étapes 3.1 à 3.6 sur les 3 autres noeuds Node.js.**

> **Astuce** : Utilisez le même `.env.local` sur tous les noeuds (copiez-le)

---

## Étape 4 : Configurer Nginx (IMPORTANT)

Par défaut, Nginx route vers le port 80, mais notre app écoute sur le port 3000.
Avec 4 noeuds, il faut configurer les 4 backends.

### 4.1 Accéder au serveur Nginx

Cliquez sur **Web SSH** sur le noeud Nginx (Load Balancer).

### 4.2 Modifier la configuration pour les 4 noeuds

```bash
# Liste des IPs des 4 noeuds Node.js (remplacez par les vraies IPs)
IP_NODE1="10.100.XX.1"
IP_NODE2="10.100.XX.2"
IP_NODE3="10.100.XX.3"
IP_NODE4="10.100.XX.4"

# Modifier chaque backend pour utiliser le port 3000
for IP in $IP_NODE1 $IP_NODE2 $IP_NODE3 $IP_NODE4; do
    sudo sed -i "s/server ${IP};/server ${IP}:3000;/g" /etc/nginx/nginx-jelastic.conf
    sudo sed -i "s/${IP}\\\\:80/${IP}:3000/g" /etc/nginx/nginx-jelastic.conf
done

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo nginx -s reload
```

### 4.3 Vérifier la configuration

```bash
grep -A10 "upstream" /etc/nginx/nginx-jelastic.conf | grep "server"
```

Vous devez voir les 4 serveurs avec le port 3000 :
```
server 10.100.XX.1:3000;
server 10.100.XX.2:3000;
server 10.100.XX.3:3000;
server 10.100.XX.4:3000;
```

> **Note** : Nginx utilise le load balancing round-robin par défaut

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

## Checklist de déploiement (4 noeuds)

- [ ] Environnement Jelastic créé (1 Nginx + **4 Node.js** + 1 Redis)
- [ ] Code déployé via Git ou Archive sur les 4 noeuds
- [ ] `.env.local` créé sur **chaque noeud** (même configuration)
- [ ] `npm ci && npm run build` exécuté sur **chaque noeud**
- [ ] PM2 démarré sur **chaque noeud** (`pm2 start && pm2 save`)
- [ ] Nginx configuré pour router vers les **4 backends** sur le port 3000
- [ ] Redis connecté (vérifier dans les logs PM2)
- [ ] Test `/api/ping` réussi depuis l'extérieur
- [ ] SSL activé (Let's Encrypt)

---

## Vérification du load balancing

Pour vérifier que les 4 noeuds reçoivent du trafic :

```bash
# Sur chaque noeud Node.js, regarder les logs
pm2 logs --lines 5

# Depuis l'extérieur, faire plusieurs requêtes
for i in {1..10}; do curl -s https://votre-env/api/ping; echo; done
```

Les requêtes doivent être réparties entre les 4 noeuds (visible dans les logs).
