# 🌙 Rapport d'Audit - Mode Veille

**Date:** 12 janvier 2026
**Version:** Bus Display Next.js
**Statut:** ⚠️ Partiellement fonctionnel - Nécessite correction

---

## 📋 Résumé Exécutif

Le mode veille est **partiellement implémenté** et présente une **fonctionnalité non implémentée** qui pourrait induire en erreur les utilisateurs.

### ✅ Points Positifs
- Interface utilisateur complète et fonctionnelle
- Logique de détection des plages horaires correcte
- Système de détection d'inactivité opérationnel
- CSS pour l'extinction d'écran présent
- Gestion des événements utilisateur correcte

### ❌ Problème Critique Identifié
**L'option "Arrêter les requêtes API pendant la veille" (`stopRequests`) n'est PAS implémentée.**

---

## 🔍 Analyse Détaillée

### 1. Configuration du Mode Veille (`src/types/config.ts`)

```typescript
export interface SleepMode {
  enabled: boolean;
  startTime: string;  // Format "HH:mm" ✅
  endTime: string;    // Format "HH:mm" ✅
  stopRequests: boolean; // ⚠️ NON IMPLÉMENTÉ
}
```

**Valeurs par défaut:**
- `enabled`: false
- `startTime`: "23:00"
- `endTime`: "05:00"
- `stopRequests`: false ⚠️

**Verdict:** Structure correcte mais `stopRequests` non utilisé.

---

### 2. Interface Utilisateur (`src/components/admin/SleepModeConfig.tsx`)

**Fonctionnalités UI:**
- ✅ Toggle ON/OFF fonctionnel
- ✅ Sélecteur d'heure de début (time picker)
- ✅ Sélecteur d'heure de fin (time picker)
- ✅ Checkbox "Arrêter les requêtes API"
- ✅ Aperçu de la plage horaire
- ✅ États disabled/enabled corrects

**Code de la checkbox problématique:**
```tsx
<input
    type="checkbox"
    id="stopRequests"
    checked={sleepMode.stopRequests}
    onChange={(e) => updateSleepMode({ stopRequests: e.target.checked })}
    // La valeur est bien stockée dans Zustand ✅
    // MAIS elle n'est jamais utilisée dans le hook useDepartures ❌
/>
```

**Verdict:** L'interface fonctionne et persiste la valeur, mais celle-ci n'a aucun effet.

---

### 3. Hook de Gestion (`src/hooks/usePowerSave.ts`)

**Fonctionnement actuel:**

#### Activation du mode veille
Le mode veille s'active quand **DEUX conditions** sont réunies:
1. ✅ On est dans la plage horaire configurée (ex: 23:00 - 05:00)
2. ✅ L'utilisateur est inactif depuis 15 secondes

**Événements surveillés:**
```typescript
const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'touchmove', 'scroll'];
```

#### Comportement visuel
Quand le mode veille est actif:
```typescript
// Dans usePowerSave.ts
document.body.classList.add('power-save-mode');

// Dans globals.css
body.power-save-mode {
  opacity: 0;           // Écran invisible
  pointer-events: none; // Aucune interaction possible
}

// Dans display/page.tsx
if (isPowerSaveActive) {
    return <div style={{ height: '100vh', background: '#000' }} />;
}
```

**Verdict:** La logique d'activation et l'effet visuel fonctionnent correctement. ✅

---

### 4. Utilitaire de Temps (`src/lib/utils/time.ts`)

**Fonction `isWithinTimeRange()`:**
```typescript
export function isWithinTimeRange(startTime: string, endTime: string): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    // Gère correctement les plages qui passent minuit ✅
    if (startMinutes <= endMinutes) {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    }

    // Ex: 23:00 - 05:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}
```

**Tests de cas:**
- ✅ 23:00 - 05:00 (passe minuit)
- ✅ 08:00 - 17:00 (même jour)
- ✅ 00:00 - 06:00 (début de journée)

**Verdict:** Implémentation correcte avec gestion des cas limites. ✅

---

### 5. Hook de Récupération des Données (`src/hooks/useDepartures.ts`)

**PROBLÈME CRITIQUE:**

```typescript
export function useDepartures(): UseDeparturesReturn {
    const { config } = useConfig();

    // Aucune vérification de config.sleepMode.stopRequests ❌
    // Les requêtes continuent même si l'option est activée

    const fetchDepartures = useCallback(async () => {
        // ... fetch sans condition de veille
        const response = await fetch(`/api/stationboard?station=...`);
        // ...
    }, [config.station.name, rawDepartures.length]);

    // Refresh automatique toutes les X secondes
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            fetchDepartures(); // ❌ S'exécute même en mode veille
        }, config.refreshInterval);
    }, [config.refreshInterval, config.station.id, fetchDepartures]);
}
```

**Ce qui devrait être fait:**
```typescript
const fetchDepartures = useCallback(async () => {
    // Vérifier si on doit arrêter les requêtes
    if (config.sleepMode.enabled &&
        config.sleepMode.stopRequests &&
        isWithinTimeRange(config.sleepMode.startTime, config.sleepMode.endTime)) {
        console.log('[useDepartures] Mode veille actif - Requêtes suspendues');
        return; // ⛔ Ne pas faire de requête
    }

    // ... reste du code fetch
}, [config.station.name, config.sleepMode, rawDepartures.length]);
```

**Verdict:** ❌ Fonctionnalité `stopRequests` non implémentée.

---

## 🎯 Plan de Correction

### Option 1: Implémenter la fonctionnalité (Recommandé)

**Modifications requises:**

1. **Importer l'utilitaire dans useDepartures.ts:**
```typescript
import { isWithinTimeRange } from '@/lib/utils/time';
```

2. **Ajouter la condition dans fetchDepartures:**
```typescript
const fetchDepartures = useCallback(async () => {
    const stationName = config.station.name;

    // Ne pas fetcher si pas de station valide
    if (!stationName || stationName === 'Sélectionnez une station') {
        setRawDepartures([]);
        return;
    }

    // ⭐ NOUVEAU: Vérifier le mode veille
    if (config.sleepMode.enabled &&
        config.sleepMode.stopRequests &&
        isWithinTimeRange(config.sleepMode.startTime, config.sleepMode.endTime)) {
        console.log('[useDepartures] Mode veille - Requêtes suspendues');
        return;
    }

    // Éviter les fetches multiples
    if (fetchingRef.current) return;
    // ... reste du code
}, [config.station.name, config.sleepMode, rawDepartures.length]);
```

3. **Ajouter la dépendance dans useEffect:**
```typescript
useEffect(() => {
    fetchDepartures();
}, [config.station.name, config.sleepMode, fetchDepartures]);
```

**Avantages:**
- ✅ Économie de bande passante
- ✅ Économie de quota API
- ✅ Respecte les attentes utilisateur
- ✅ Cohérent avec l'interface

**Effort estimé:** 15 minutes

---

### Option 2: Retirer l'option de l'interface

**Si vous ne voulez pas implémenter `stopRequests`:**

Supprimer les lignes 74-92 de `src/components/admin/SleepModeConfig.tsx`:
```tsx
{/* Option pour arrêter les requêtes */}
<div className="flex items-center gap-3">
    {/* ... */}
    <label>Arrêter les requêtes API pendant la veille</label>
</div>
```

**Avantages:**
- ✅ Pas de fonctionnalité trompeuse
- ✅ UI cohérente avec l'implémentation

**Inconvénients:**
- ❌ Perte d'une fonctionnalité utile
- ❌ Requêtes API inutiles la nuit

**Effort estimé:** 2 minutes

---

## 📊 Tests Recommandés

### Test 1: Mode veille visuel
1. Activer le mode veille (toggle ON)
2. Configurer 00:00 - 23:59 (toute la journée)
3. Attendre 15 secondes sans bouger la souris
4. **Résultat attendu:** Écran noir
5. Bouger la souris
6. **Résultat attendu:** Écran revient

**Statut actuel:** ✅ Fonctionne

---

### Test 2: Plage horaire passant minuit
1. Configurer 23:00 - 05:00
2. Tester à 23:30
3. **Résultat attendu:** Mode veille après 15s
4. Tester à 02:00
5. **Résultat attendu:** Mode veille après 15s
6. Tester à 12:00
7. **Résultat attendu:** Mode veille inactif

**Statut actuel:** ✅ Fonctionne

---

### Test 3: Arrêt des requêtes API (ÉCHEC)
1. Activer mode veille
2. ✅ Cocher "Arrêter les requêtes API"
3. Configurer plage horaire actuelle
4. Ouvrir DevTools → Network
5. Attendre 15s pour activation
6. Observer les requêtes `/api/stationboard`

**Résultat actuel:** ❌ Les requêtes continuent
**Résultat attendu:** ⛔ Aucune requête pendant la veille

---

## 🔧 Impact et Risques

### Impact actuel
- **Quota API:** Consommation inutile la nuit
- **Bande passante:** Gaspillage réseau
- **UX:** Option affichée mais non fonctionnelle

### Risque de la correction
- **Faible:** Changement isolé dans un seul hook
- **Aucune régression:** Ajout d'une simple condition

---

## ✅ Recommandation Finale

**Je recommande l'Option 1 (Implémentation)** pour les raisons suivantes:

1. La fonctionnalité est déjà promise dans l'UI
2. L'implémentation est simple et sans risque
3. Économise des ressources (API, bande passante)
4. Cohérence entre UI et comportement

**Priorité:** 🟡 Moyenne (fonctionnalité trompeuse mais pas critique)

---

## 📝 Checklist de Correction

```
[ ] Importer isWithinTimeRange dans useDepartures.ts
[ ] Ajouter condition stopRequests dans fetchDepartures
[ ] Ajouter config.sleepMode dans les dépendances useCallback
[ ] Tester avec mode veille activé et stopRequests=true
[ ] Vérifier dans DevTools que les requêtes s'arrêtent
[ ] Tester la reprise des requêtes hors plage horaire
[ ] Documenter le comportement dans le README
```

---

## 📚 Documentation Additionnelle

### Configuration par défaut
```json
{
  "sleepMode": {
    "enabled": false,
    "startTime": "23:00",
    "endTime": "05:00",
    "stopRequests": false
  }
}
```

### Comportement attendu
| Condition | Écran | Requêtes API |
|-----------|-------|--------------|
| Mode OFF | ✅ Visible | ✅ Actives |
| Mode ON + Hors plage | ✅ Visible | ✅ Actives |
| Mode ON + Dans plage + Actif | ✅ Visible | ✅ Actives |
| Mode ON + Dans plage + Inactif 15s | ⚫ Noir | ⚠️ Actives (BUG) |
| Mode ON + stopRequests + Veille active | ⚫ Noir | ❌ Suspendues (À IMPLÉMENTER) |

---

**Fin du rapport**
