# 📦 GUIDE DE MIGRATION VERS LE MONOREPO

> **Date** : 31 décembre 2025
> **Objectif** : Migrer intelligemment le code existant vers la structure modulaire

---

## 📊 ÉTAT DES LIEUX

### Code Existant à Migrer
- **154 fichiers** (components, hooks, services, contexts)
- **17 composants UI** dans `src/components/ui/`
- **7 hooks** dans `src/hooks/`
- **26 services** dans `src/services/`
- **1 contexte** principal (`AuthContext`)

---

## 🎯 STRATÉGIE DE MIGRATION

### Principe : Migration Progressive et Testée

1. **Copier** le code dans les packages appropriés
2. **Adapter** les imports et dépendances
3. **Tester** que tout fonctionne
4. **Nettoyer** l'ancien code progressivement

### Ordre de Migration

```
1. Services Supabase → @edutrack/api
2. Utilitaires → @edutrack/utils
3. Composants UI → @edutrack/ui
4. Hooks → packages appropriés
5. Contextes → @edutrack/api (ou app spécifique)
```

---

## 📦 PLAN DE MIGRATION DÉTAILLÉ

### PHASE 1 : Services API → @edutrack/api

**Objectif** : Centraliser tous les services Supabase

**Fichiers à migrer** (26 services) :

#### Services Production (à migrer)
```
src/services/
├── productionDataService.js          → api/src/services/dashboardService.js
├── studentProductionDataService.js   → api/src/services/studentService.js
├── parentProductionDataService.js    → api/src/services/parentService.js
├── teacherService.js                 → api/src/services/teacherService.js
├── absenceService.js                 → api/src/services/absenceService.js
├── paymentService.js                 → api/src/services/paymentService.js
├── planningService.js                → api/src/services/planningService.js
├── schoolYearService.js              → api/src/services/schoolYearService.js
├── cardService.js                    → api/src/services/cardService.js
├── gradeService.js                   → api/src/services/gradeService.js
├── communicationService.js           → api/src/services/communicationService.js
├── documentService.js                → api/src/services/documentService.js
├── reportService.js                  → api/src/services/reportService.js
├── passwordHashService.js            → api/src/services/authService.js (intégrer)
├── parentMultiSchoolService.js       → api/src/services/parentService.js (fusionner)
└── teacherMultiSchoolService.js      → api/src/services/teacherService.js (fusionner)
```

#### Services à NE PAS migrer (déjà supprimés ou obsolètes)
- ❌ Tous les services démo (supprimés)
- ❌ Services backup (productionDataService.js.backup)

**Actions** :
1. Créer `packages/api-client/src/services/` directory
2. Migrer chaque service avec adaptations :
   - Utiliser `getSupabaseClient()` au lieu d'import direct
   - Intégrer avec ApiGateway pour le cache
   - Ajouter EventBus pour les événements
3. Créer un index.js pour exporter tous les services

---

### PHASE 2 : Utilitaires → @edutrack/utils

**Fichiers à identifier et migrer** :

```
Rechercher dans src/ :
├── Fonctions de formatage (dates, nombres, devises)
├── Fonctions de validation (email, téléphone, matricule)
├── Fonctions de calcul (moyennes, statistiques)
├── Constants et enums
└── Helpers divers
```

**Structure cible** :
```
packages/utils/src/
├── formatters/
│   ├── dateFormatter.js      ✅ (déjà créé)
│   ├── numberFormatter.js    → À créer
│   ├── currencyFormatter.js  → À créer
│   └── nameFormatter.js      → À créer
├── validators/
│   ├── emailValidator.js     ✅ (déjà créé)
│   ├── phoneValidator.js     → À créer
│   ├── matriculeValidator.js → À créer
│   └── gradeValidator.js     → À créer
├── calculators/
│   ├── gradeCalculator.js    → À créer
│   ├── averageCalculator.js  → À créer
│   └── statsCalculator.js    → À créer
└── constants/
    ├── roles.js              → À créer
    ├── schoolLevels.js       → À créer
    └── paymentTypes.js       → À créer
```

---

### PHASE 3 : Composants UI → @edutrack/ui

**Composants existants à migrer** (17 composants) :

```
src/components/ui/
├── Header.jsx                → ui/src/Header/Header.jsx
├── Footer.jsx                → ui/src/Footer/Footer.jsx
├── Icon.jsx                  → ui/src/Icon/Icon.jsx
├── NotificationCenter.jsx    → ui/src/Notification/NotificationCenter.jsx
├── Modal.jsx                 → ui/src/Modal/Modal.jsx
├── Table.jsx                 → ui/src/Table/Table.jsx
├── Form components/          → ui/src/Form/
├── Layout components/        → ui/src/Layout/
└── ... (autres composants)
```

**Composants déjà créés** :
- ✅ Button.jsx
- ✅ Card.jsx (avec variants)

**Actions** :
1. Analyser chaque composant UI existant
2. Nettoyer les dépendances (supprimer références à useDataMode, etc.)
3. Adapter pour utiliser Tailwind config partagé
4. Documenter props et usage
5. Ajouter dans ui/src/index.js

---

### PHASE 4 : Hooks → Packages Appropriés

**Hooks existants** (7 hooks nettoyés) :

```
src/hooks/
├── useDashboardData.js       → api/src/hooks/useDashboardData.js
├── useStudentDashboardData.js → api/src/hooks/useStudentData.js
├── useParentDashboardData.js → api/src/hooks/useParentData.js
├── useEduTrackData.js        → api/src/hooks/useEduTrackData.js
├── useUserProfile.js         → api/src/hooks/useUserProfile.js
├── useStudentData.js         → api/src/hooks/useStudent.js
└── (autres hooks custom)     → Selon la logique métier
```

**Décision par hook** :
- **Hooks liés aux données** → `@edutrack/api/src/hooks/`
- **Hooks UI génériques** → `@edutrack/ui/src/hooks/`
- **Hooks utilitaires** → `@edutrack/utils/src/hooks/`

---

### PHASE 5 : Contextes → Localisation Appropriée

**AuthContext** :
```
src/contexts/AuthContext.jsx → Plusieurs options :

Option A : packages/api-client/src/contexts/AuthContext.jsx
  ✅ Centralisé, disponible pour toutes les apps
  ✅ Cohérent avec les services auth

Option B : apps/hub/src/contexts/AuthContext.jsx
  ✅ Au niveau du Hub (point d'entrée)
  ✅ Propagé aux autres apps

Recommandation : Option A (dans @edutrack/api)
```

---

## 🔧 ADAPTATIONS NÉCESSAIRES

### 1. **Imports Supabase**

**Avant** (ancien système) :
```javascript
import { supabase } from '../lib/supabase';
```

**Après** (monorepo) :
```javascript
import { getSupabaseClient } from '@edutrack/api';
const supabase = getSupabaseClient();
```

### 2. **Imports de Composants UI**

**Avant** :
```javascript
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
```

**Après** :
```javascript
import { Button, Card } from '@edutrack/ui';
```

### 3. **Imports d'Utilitaires**

**Avant** :
```javascript
import { formatDate } from '../utils/dateFormatter';
import { validateEmail } from '../utils/validators';
```

**Après** :
```javascript
import { formatDate, validateEmail } from '@edutrack/utils';
```

### 4. **Imports de Services**

**Avant** :
```javascript
import productionDataService from '../services/productionDataService';
import teacherService from '../services/teacherService';
```

**Après** :
```javascript
import { dashboardService, teacherService } from '@edutrack/api/services';
```

---

## 📋 CHECKLIST DE MIGRATION

### Pour Chaque Fichier Migré

- [ ] Fichier copié dans le bon package
- [ ] Imports adaptés (workspace packages)
- [ ] Dépendances ajoutées dans package.json si nécessaire
- [ ] Code nettoyé (références démo supprimées)
- [ ] Documentation ajoutée (JSDoc)
- [ ] Exporté dans index.js du package
- [ ] Testé que ça fonctionne
- [ ] Ancien fichier marqué pour suppression (après validation)

---

## 🚀 ORDRE D'EXÉCUTION

### Semaine 1-2 : Migration des Fondations

**Jour 1-2** :
- Migrer les services Supabase critiques (auth, dashboard)
- Créer la structure services dans @edutrack/api

**Jour 3-4** :
- Migrer les utilitaires de base (formatters, validators)
- Créer les calculators nécessaires

**Jour 5** :
- Migrer AuthContext
- Tester l'authentification

### Semaine 3 : Migration UI et Hooks

**Jour 1-3** :
- Migrer les composants UI les plus utilisés
- Adapter Header, Footer, Icon

**Jour 4-5** :
- Migrer les hooks personnalisés
- Tester les hooks avec les apps

### Semaine 4 : Finalisation et Tests

**Jour 1-3** :
- Migrer les services restants
- Compléter les composants UI

**Jour 4-5** :
- Tests d'intégration complets
- Documentation finale
- Nettoyage de l'ancien code

---

## 🧪 STRATÉGIE DE TESTS

### Tests par Package

**@edutrack/api** :
- Tester chaque service isolément
- Vérifier ApiGateway avec cache
- Tester EventBus

**@edutrack/utils** :
- Tests unitaires des formatters
- Tests des validators
- Tests des calculators

**@edutrack/ui** :
- Tests visuels des composants
- Tests d'accessibilité
- Tests de responsive

---

## ⚠️ POINTS D'ATTENTION

### Dépendances Circulaires
- Éviter que @edutrack/ui importe de @edutrack/api
- Respecter la hiérarchie : api > utils > ui

### Chemins Relatifs
- Utiliser `workspace:*` pour les packages internes
- Ne pas utiliser de chemins relatifs entre packages

### État Global
- AuthContext doit être unique (dans @edutrack/api)
- Éviter la duplication d'état

---

## 📊 MÉTRIQUES DE SUCCÈS

- [ ] 100% des services migrés vers @edutrack/api
- [ ] Tous les composants UI réutilisables dans @edutrack/ui
- [ ] Zéro duplication de code entre packages
- [ ] Build réussi pour toutes les apps
- [ ] Tests passent à 100%
- [ ] Documentation complète

---

**Prêt pour commencer la migration !** 🚀
