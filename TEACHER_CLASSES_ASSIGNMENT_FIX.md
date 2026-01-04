# 🔧 Correction - Assignation d'Enseignants sur Classes Réelles

## ❌ Problème Identifié

### Liste de classes incorrecte dans TeacherFormModal

**Symptôme:**
Lors de la création/édition d'un enseignant, la liste des classes assignables affichait des noms génériques (PS, MS, GS pour maternelle, CP, CE1, CE2 pour primaire, etc.) au lieu des classes réellement créées par l'utilisateur dans la table `classes`.

**Cause:**
Le code chargeait les classes depuis le champ `schools.available_classes` qui contient une liste statique par défaut selon le type d'école, au lieu de charger les classes depuis la table `classes`.

**Ligne problématique (79):**
```javascript
// ❌ AVANT
const classes = schoolData.available_classes || getDefaultClassesByType(schoolData.type);
setAvailableClasses(classes);
```

**Conséquence:**
- Un directeur qui crée des classes "4ème A", "4ème B", "3ème Scientifique" dans la table `classes`
- Ne peut pas assigner ses enseignants sur ces classes spécifiques
- À la place, il voit uniquement la liste générique: ["6ème", "5ème", "4ème", "3ème"]
- Impossible de différencier les sections ou les spécialités

---

## ✅ Solution Implémentée

### Charger les classes depuis la table `classes`

**Fichier:** `apps/admin/src/pages/Users/components/TeacherFormModal.jsx`

**Lignes modifiées:** 78-92

**Code AVANT:**
```javascript
if (error) throw error;

// Charger les classes depuis available_classes ou utiliser les classes par défaut
const classes = schoolData.available_classes || getDefaultClassesByType(schoolData.type);
setAvailableClasses(classes);
```

**Code APRÈS:**
```javascript
if (error) throw error;

// Charger les classes RÉELLEMENT CRÉÉES depuis la table classes
const { data: realClasses, error: classesError } = await supabase
  .from('classes')
  .select('id, name, level, section')
  .eq('school_id', schoolId)
  .order('level');

if (classesError) throw classesError;

// Utiliser les noms des classes réelles, ou les classes par défaut si aucune classe créée
const classNames = realClasses && realClasses.length > 0
  ? realClasses.map(c => c.section ? `${c.level} ${c.section}` : c.level)
  : (schoolData.available_classes || getDefaultClassesByType(schoolData.type));

setAvailableClasses(classNames);
```

### Logique de la Solution

1. **Requête Supabase:**
   ```javascript
   const { data: realClasses } = await supabase
     .from('classes')
     .select('id, name, level, section')
     .eq('school_id', schoolId)
     .order('level');
   ```
   - Récupère TOUTES les classes créées pour l'école sélectionnée
   - Filtre par `school_id` pour s'assurer que seules les classes de cette école sont chargées
   - Tri par `level` pour affichage ordonné

2. **Formation des noms de classes:**
   ```javascript
   realClasses.map(c => c.section ? `${c.level} ${c.section}` : c.level)
   ```
   - Si la classe a une section: affiche "4ème A", "3ème Scientifique"
   - Sinon: affiche juste le niveau "6ème"

3. **Fallback si aucune classe créée:**
   ```javascript
   realClasses.length > 0
     ? realClasses.map(...)
     : (schoolData.available_classes || getDefaultClassesByType(schoolData.type))
   ```
   - Si l'école a créé des classes → utiliser les vraies classes
   - Sinon → utiliser la liste par défaut comme avant

---

## 🎨 Comportement Avant/Après

### Exemple: École Collège avec Classes Créées

**Table `classes` (base de données):**
| id | school_id | level | section | name |
|----|-----------|-------|---------|------|
| 1  | abc-123   | 6ème  | A       | 6ème A |
| 2  | abc-123   | 6ème  | B       | 6ème B |
| 3  | abc-123   | 5ème  | Scientifique | 5ème Scientifique |
| 4  | abc-123   | 4ème  | null    | 4ème |
| 5  | abc-123   | 3ème  | A       | 3ème A |

---

### Avant (Liste Générique)

```
┌─────────────────────────────────────────┐
│  Nouvel Enseignant                [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Classes assignées (optionnel)          │
│  ┌───────────────────────────────────┐  │
│  │ ☐ 6ème                            │  │  ❌ Générique
│  │ ☐ 5ème                            │  │  ❌ Pas de sections
│  │ ☐ 4ème                            │  │  ❌ Pas de spécialités
│  │ ☐ 3ème                            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Annuler]  [Créer l'enseignant]       │
└─────────────────────────────────────────┘
```

**Problème:** Impossible de sélectionner "6ème A" vs "6ème B"

---

### Après (Classes Réelles)

```
┌─────────────────────────────────────────┐
│  Nouvel Enseignant                [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Classes assignées (optionnel)          │
│  ┌───────────────────────────────────┐  │
│  │ ☐ 6ème A                          │  │  ✅ Classe réelle
│  │ ☐ 6ème B                          │  │  ✅ Section spécifique
│  │ ☐ 5ème Scientifique               │  │  ✅ Spécialité
│  │ ☐ 4ème                            │  │  ✅ Sans section
│  │ ☐ 3ème A                          │  │  ✅ Section spécifique
│  └───────────────────────────────────┘  │
│                                         │
│  [Annuler]  [Créer l'enseignant]       │
└─────────────────────────────────────────┘
```

**Résultat:** Assignation précise sur les vraies classes créées

---

## 🔄 Workflow Complet

### Scénario: Directeur crée un enseignant de mathématiques

```
1. Directeur va sur /personnel
   ↓
2. Clique "Nouvel Enseignant"
   ↓
3. Modal TeacherFormModal s'ouvre
   ↓
4. Code charge l'école du directeur (current_school_id)
   ↓
5. Fonction loadSchoolDetails() s'exécute:
   ├─ Charge les infos de l'école (type, matières custom)
   └─ ✅ NOUVEAU: Charge les classes depuis la table classes
       ↓
6. Requête Supabase:
   SELECT id, name, level, section
   FROM classes
   WHERE school_id = 'abc-123'
   ORDER BY level
       ↓
7. Transformation des résultats:
   ['6ème A', '6ème B', '5ème Scientifique', '4ème', '3ème A']
       ↓
8. setAvailableClasses(classNames)
   ↓
9. Affichage dans le formulaire:
   - ☐ 6ème A
   - ☐ 6ème B
   - ☐ 5ème Scientifique
   - ☐ 4ème
   - ☐ 3ème A
       ↓
10. Directeur sélectionne "6ème A" et "6ème B"
    ↓
11. Soumet le formulaire
    ↓
12. Enseignant créé avec classes = ["6ème A", "6ème B"]
```

---

## 🧪 Tests Recommandés

### Test 1: École avec Classes Créées
**Pré-requis:** Créer au moins 3 classes dans la page `/classes`

- [ ] Créer les classes suivantes:
  - 6ème A
  - 6ème B
  - 5ème Scientifique
- [ ] Aller sur `/personnel`
- [ ] Cliquer "Nouvel Enseignant"
- [ ] Vérifier que la section "Classes assignées" affiche:
  - ✅ "6ème A" (pas juste "6ème")
  - ✅ "6ème B" (section B visible)
  - ✅ "5ème Scientifique" (spécialité visible)
- [ ] Sélectionner "6ème A" et "6ème B"
- [ ] Créer l'enseignant
- [ ] Vérifier dans la BDD que `classes = ["6ème A", "6ème B"]`

### Test 2: École sans Classes Créées (Fallback)
**Pré-requis:** École nouvelle sans aucune classe dans la table `classes`

- [ ] Se connecter en tant que directeur d'une école vide
- [ ] Cliquer "Nouvel Enseignant"
- [ ] Vérifier que le fallback fonctionne:
  - ✅ Affiche les classes par défaut selon le type d'école
  - ✅ Si école primaire → ["CP", "CE1", "CE2", "CM1", "CM2"]
  - ✅ Si école collège → ["6ème", "5ème", "4ème", "3ème"]

### Test 3: Admin Sélectionnant une École
**Pré-requis:** Compte admin, plusieurs écoles avec classes

- [ ] Se connecter en tant qu'admin
- [ ] Cliquer "Nouvel Enseignant"
- [ ] Sélectionner "École A" dans la liste
- [ ] Vérifier que les classes de l'École A s'affichent
- [ ] Changer pour "École B"
- [ ] Vérifier que les classes changent pour celles de l'École B

### Test 4: Classes avec et sans Section
**Pré-requis:** Créer un mix de classes

- [ ] Créer:
  - 4ème (sans section)
  - 4ème A (avec section)
  - 4ème B (avec section)
- [ ] Ouvrir formulaire enseignant
- [ ] Vérifier affichage:
  - ✅ "4ème" (sans section)
  - ✅ "4ème A" (avec section)
  - ✅ "4ème B" (avec section)
  - ✅ Pas de doublon "4ème"

---

## 📝 Fichiers Modifiés

### `apps/admin/src/pages/Users/components/TeacherFormModal.jsx`

**Lignes modifiées:** 78-92 (15 lignes)

**Avant:**
```javascript
if (error) throw error;

const classes = schoolData.available_classes || getDefaultClassesByType(schoolData.type);
setAvailableClasses(classes);

// Charger les matières...
```

**Après:**
```javascript
if (error) throw error;

// Charger les classes RÉELLEMENT CRÉÉES depuis la table classes
const { data: realClasses, error: classesError } = await supabase
  .from('classes')
  .select('id, name, level, section')
  .eq('school_id', schoolId)
  .order('level');

if (classesError) throw classesError;

// Utiliser les noms des classes réelles, ou les classes par défaut si aucune classe créée
const classNames = realClasses && realClasses.length > 0
  ? realClasses.map(c => c.section ? `${c.level} ${c.section}` : c.level)
  : (schoolData.available_classes || getDefaultClassesByType(schoolData.type));

setAvailableClasses(classNames);

// Charger les matières...
```

**Changements:**
- +1 requête Supabase (`from('classes')`)
- +1 gestion d'erreur (`classesError`)
- +1 transformation des données (map avec condition section)
- +1 fallback conditionnel (si `realClasses.length > 0`)

**Total:** ~10 lignes ajoutées, 2 lignes remplacées

---

## 💡 Améliorations Futures (Optionnelles)

### 1. Afficher le Nombre d'Élèves par Classe
```javascript
const classNames = realClasses.map(c => {
  const label = c.section ? `${c.level} ${c.section}` : c.level;
  const count = c.student_count || 0;
  return `${label} (${count} élèves)`;
});
```

**Affichage:**
- ☐ 6ème A (28 élèves)
- ☐ 6ème B (25 élèves)
- ☐ 5ème Scientifique (30 élèves)

### 2. Grouper par Niveau
```jsx
<div className="space-y-3">
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-2">6ème</h4>
    <div className="ml-4 space-y-1">
      <label><input type="checkbox" /> 6ème A</label>
      <label><input type="checkbox" /> 6ème B</label>
    </div>
  </div>
  <div>
    <h4 className="text-sm font-medium text-gray-700 mb-2">5ème</h4>
    <div className="ml-4 space-y-1">
      <label><input type="checkbox" /> 5ème Scientifique</label>
    </div>
  </div>
</div>
```

### 3. Sauvegarder l'ID au Lieu du Nom
**Problème actuel:** On sauvegarde `["6ème A", "6ème B"]` (texte)

**Amélioration:** Sauvegarder les IDs `[uuid-1, uuid-2]`

**Avantage:** Si on renomme "6ème A" → "6ème Alpha", le lien reste intact

**Modification requise:**
```javascript
// Créer une table de liaison
CREATE TABLE teacher_classes (
  teacher_id UUID REFERENCES users(id),
  class_id UUID REFERENCES classes(id),
  PRIMARY KEY (teacher_id, class_id)
);

// Au lieu de
users.classes = ["6ème A", "6ème B"]  // ❌ Fragile

// Utiliser
teacher_classes:
  - (teacher-uuid, class-uuid-1)
  - (teacher-uuid, class-uuid-2)  // ✅ Robuste
```

---

## 🔗 Cohérence avec le Reste de l'Application

Cette correction garantit que:

1. **Page Classes** crée des classes dans la table `classes`
2. **Page Personnel (TeacherFormModal)** utilise ces classes pour assignation
3. **Pas de désynchronisation** entre les classes affichées et les classes existantes

**Flux cohérent:**
```
Directeur crée classe "4ème A"
         ↓
    Table classes
         ↓
TeacherFormModal charge depuis classes
         ↓
Affiche "4ème A" dans la liste
         ↓
Directeur assigne enseignant sur "4ème A"
         ✅ COHÉRENCE GARANTIE
```

---

## 📊 Impact

### Avant
- ❌ Liste statique déconnectée de la réalité
- ❌ Impossible de gérer plusieurs sections d'un même niveau
- ❌ Pas de spécialités (Scientifique, Littéraire, etc.)
- ❌ Confusion pour les utilisateurs

### Après
- ✅ Liste dynamique basée sur les classes réelles
- ✅ Support des sections (A, B, C...)
- ✅ Support des spécialités (Scientifique, Littéraire...)
- ✅ Fallback intelligent si aucune classe créée
- ✅ UX claire et cohérente

---

**Date:** 04 Janvier 2026
**Version:** 2.5.2
**Statut:** ✅ COMPLÉTÉ
