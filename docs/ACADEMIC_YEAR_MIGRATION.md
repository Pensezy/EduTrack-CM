# 📅 Migration : Année Académique 2024-2025 → Dynamique

## 🎯 Problème Identifié

L'année académique **"2024-2025"** est codée en dur dans plusieurs fichiers, alors que nous sommes en **octobre 2025** et l'année académique devrait être **"2025-2026"**.

## ✅ Solution Implémentée

### 1️⃣ Utilitaire Créé : `src/utils/academicYear.js`

Fonctions disponibles :
- `getCurrentAcademicYear()` → Calcule automatiquement l'année en cours
- `getNextAcademicYear()` → Année suivante
- `getPreviousAcademicYear()` → Année précédente
- `getAcademicYearOptions()` → Liste d'options pour les select
- `isCurrentAcademicYear()` → Vérifier si c'est l'année en cours
- `getAcademicYearDates()` → Dates de début/fin
- `formatAcademicYear()` → Formatage pour affichage

### 2️⃣ Fichiers Mis à Jour

#### ✅ Services
- [x] `src/services/schoolService.js`
  - Import de `getCurrentAcademicYear` et `getAcademicYearDates`
  - Utilisation dynamique lors de la création d'école
  
- [x] `src/services/teacherService.js`
  - Import de `getCurrentAcademicYear`
  - Valeur par défaut dynamique dans `createAssignment`

#### ✅ Pages/Composants
- [x] `src/pages/teacher-assignment-system/index.jsx`
  - Import de `getCurrentAcademicYear` et `getAcademicYearOptions`
  - FormData initialisé dynamiquement
  - Select dynamique avec liste d'années

---

## 📋 Fichiers À Migrer Manuellement

### Contextes
- [ ] `src/contexts/AuthContext.jsx` (ligne 50)
  ```javascript
  // AVANT
  current_year: '2024-2025'
  
  // APRÈS
  import { getCurrentAcademicYear } from '../utils/academicYear';
  current_year: getCurrentAcademicYear()
  ```

### Pages/Composants
- [ ] `src/pages/student-dashboard/index.jsx` (ligne 24)
  ```javascript
  academicYear: getCurrentAcademicYear()
  ```

- [ ] `src/pages/student-profile-management/components/AcademicRecordsSection.jsx` (ligne 11)
  ```javascript
  year: getCurrentAcademicYear()
  ```

- [ ] `src/pages/school-settings/index.jsx` (ligne 33)
  ```javascript
  academicYear: getCurrentAcademicYear()
  ```

- [ ] `src/pages/school-calendar/index.jsx` (ligne 27)
  ```javascript
  // Utiliser getAcademicYearDates() pour calculer les dates
  ```

- [ ] `src/pages/secretary-dashboard/components/DocumentsTab.jsx` (ligne 64)
  ```javascript
  name: `Règlement intérieur ${getCurrentAcademicYear()}`
  ```

- [ ] `src/pages/secretary-dashboard/components/PaymentHistoryModal.jsx` (ligne 271)
  ```javascript
  // Remplacer les options statiques par :
  {getAcademicYearOptions().map(year => (
    <option key={year.value} value={year.value}>{year.label}</option>
  ))}
  ```

- [ ] `src/pages/secretary-dashboard/components/PaymentTab.jsx` (ligne 84)
  ```javascript
  // Remplacer par :
  const yearOptions = getAcademicYearOptions(3, true, false);
  ```

- [ ] `src/pages/secretary-dashboard/components/SchoolYearTab.jsx` (ligne 9)
  ```javascript
  const [currentSchoolYear] = useState(getCurrentAcademicYear());
  ```

- [ ] `src/pages/secretary-dashboard/components/StudentCardTab.jsx` (ligne 578)
  ```javascript
  <p className="font-caption font-caption-normal text-xs opacity-90">
    Année {getCurrentAcademicYear()}
  </p>
  ```

- [ ] `src/pages/principal-dashboard/components/SchoolYearValidationTab.jsx` (ligne 10)
  ```javascript
  const [currentSchoolYear] = useState(getCurrentAcademicYear());
  ```

- [ ] `src/pages/parent-dashboard/index.jsx` (lignes 156, 167)
  ```javascript
  description: `Frais scolaires T1 ${getCurrentAcademicYear()}`
  ```

---

## 🗄️ Base de Données

### ✅ Migrations SQL (Déjà Dynamiques)

Les fichiers SQL suivants **utilisent déjà** `NOW()` et calculent automatiquement l'année :

- ✅ `supabase/migrations/20250101000000_initial_schema.sql`
  ```sql
  current_year := EXTRACT(YEAR FROM NOW())::text;
  next_year := (EXTRACT(YEAR FROM NOW()) + 1)::text;
  -- Génère automatiquement "2025-2026" en octobre 2025
  ```

- ✅ `database/sql/MIGRATION_COMPLETE_22_TABLES.sql`
  - Même logique dynamique

**Aucune modification nécessaire** pour les migrations SQL.

---

## 🧪 Scripts de Test

### À Mettre à Jour
- [ ] `scripts/seedDemoData.js` (ligne 93)
- [ ] `test-service-fix.js` (ligne 61)
- [ ] `scripts/archive/test-service-fix.js` (ligne 61)

**Note :** Ces fichiers sont des scripts de test/seed, la mise à jour n'est pas prioritaire.

---

## 📊 Statistiques de Migration

```
✅ Fichiers mis à jour : 3/25
📋 Fichiers restants : 22
🗄️ Base de données : OK (déjà dynamique)
```

### Par Catégorie
| Catégorie | Total | Migré | Restant |
|-----------|-------|-------|---------|
| Services | 2 | 2 | 0 |
| Pages/Composants | 16 | 1 | 15 |
| Contextes | 1 | 0 | 1 |
| Scripts | 3 | 0 | 3 |
| SQL | 2 | 0 | 0 (déjà OK) |

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Critique (À faire immédiatement)
1. ✅ Créer `utils/academicYear.js`
2. ✅ Mettre à jour `schoolService.js`
3. ✅ Mettre à jour `teacherService.js`
4. ✅ Mettre à jour `teacher-assignment-system/index.jsx`
5. [ ] Mettre à jour `AuthContext.jsx` ← **PRIORITÉ**

### Phase 2 : Important (Cette semaine)
6. [ ] Mettre à jour tous les composants Secretary Dashboard
7. [ ] Mettre à jour Student Dashboard
8. [ ] Mettre à jour Parent Dashboard
9. [ ] Mettre à jour Principal Dashboard

### Phase 3 : Optionnel (Quand possible)
10. [ ] Mettre à jour les scripts de seed/test
11. [ ] Mettre à jour school-settings
12. [ ] Mettre à jour school-calendar

---

## 🧪 Tests de Validation

Après la migration complète, vérifier :

```javascript
// Test 1 : Année actuelle
console.log(getCurrentAcademicYear()); 
// Attendu en octobre 2025 : "2025-2026" ✅

// Test 2 : Création d'école
// Vérifier que l'année académique créée est bien "2025-2026"

// Test 3 : Assignations enseignants
// Vérifier que school_year par défaut = "2025-2026"

// Test 4 : Options de select
console.log(getAcademicYearOptions(5));
// Attendu : Liste incluant 2023-2024, 2024-2025, 2025-2026 (en cours), 2026-2027, 2027-2028
```

---

## 📚 Documentation

### Utilisation de l'Utilitaire

```javascript
import { 
  getCurrentAcademicYear,
  getAcademicYearOptions,
  getAcademicYearDates 
} from '../utils/academicYear';

// Obtenir l'année en cours
const currentYear = getCurrentAcademicYear(); // "2025-2026"

// Pour un select
<select>
  {getAcademicYearOptions(5).map(year => (
    <option key={year.value} value={year.value}>
      {year.label}
    </option>
  ))}
</select>

// Obtenir les dates
const { startDate, endDate } = getAcademicYearDates();
// startDate: 2025-09-01
// endDate: 2026-07-31
```

---

## ⚠️ Points d'Attention

1. **Logique de Calcul**
   - Septembre à décembre → Année commence cette année
   - Janvier à août → Année a commencé l'année précédente

2. **Exemples Concrets**
   - Octobre 2025 → "2025-2026" ✅
   - Mars 2025 → "2024-2025" ✅
   - Septembre 2026 → "2026-2027" ✅

3. **Compatibilité**
   - Les données existantes avec "2024-2025" restent valides
   - Seules les **nouvelles** données utilisent l'année dynamique

---

**Date de migration :** 26 Octobre 2025  
**Version :** 1.0.0  
**Status :** En cours (3/25 fichiers migrés)
