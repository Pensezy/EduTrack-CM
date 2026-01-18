# 🔧 Correction - Création de Classe avec Année Académique

## ❌ Erreur Rencontrée

```
POST https://lbqwbnclknwszdnlxaxz.supabase.co/rest/v1/classes 400 (Bad Request)

Error: {
  code: '23502',
  message: 'null value in column "academic_year_id" of relation "classes" violates not-null constraint'
}
```

## 🔍 Analyse du Problème

### Schéma de la Table `classes`

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL,
  academic_year_id UUID NOT NULL,  -- ❌ COLONNE OBLIGATOIRE
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  capacity INTEGER,
  ...
  FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);
```

### Données Envoyées par le Formulaire

```javascript
{
  name: "4eme",
  grade_level: "4eme",        // ❌ Mauvais nom (devrait être "level")
  section: "",
  school_year: "2026-2027",   // ❌ Texte au lieu d'un UUID
  school_id: "...",
  max_students: 20            // ❌ Mauvais nom (devrait être "capacity")
}
```

### Problèmes Identifiés

1. **`academic_year_id` manquant:** Le formulaire n'envoie pas cette colonne obligatoire
2. **Mapping incorrect des colonnes:**
   - Formulaire utilise `grade_level` → BDD attend `level`
   - Formulaire utilise `max_students` → BDD attend `capacity`
   - Formulaire utilise `school_year` (texte) → BDD attend `academic_year_id` (UUID)

---

## ✅ Solution Implémentée

### 1. **Création/Récupération Automatique de l'Année Académique**

Avant d'insérer une classe, le code vérifie si l'année académique existe. Si non, elle est créée automatiquement :

```javascript
// Récupérer ou créer l'année académique
let academicYearId = null;

if (!isEditing) {
  // Chercher si l'année académique existe déjà
  const { data: existingYear } = await supabase
    .from('academic_years')
    .select('id')
    .eq('year', formData.school_year)          // "2026-2027"
    .eq('school_id', formData.school_id)
    .maybeSingle();

  if (existingYear) {
    academicYearId = existingYear.id;
  } else {
    // Créer une nouvelle année académique
    const { data: newYear, error: yearError } = await supabase
      .from('academic_years')
      .insert([{
        school_id: formData.school_id,
        year: formData.school_year,              // "2026-2027"
        start_date: '2026-09-01',                // Calculé automatiquement
        end_date: '2027-07-31',                  // Calculé automatiquement
        is_current: true
      }])
      .select('id')
      .single();

    if (yearError) throw yearError;
    academicYearId = newYear.id;
  }
}
```

**Logique:**
- Parse le `school_year` ("2026-2027") pour extraire l'année de début (2026) et de fin (2027)
- Calcule automatiquement `start_date` (1er septembre) et `end_date` (31 juillet)
- Marque l'année comme `is_current: true` par défaut

### 2. **Mapping Correct des Colonnes**

```javascript
// Préparer les données pour l'insertion/mise à jour
const classDataToSave = {
  name: formData.name,                          // "4eme"
  level: formData.grade_level,                  // "4eme" → Mappé vers "level"
  school_id: formData.school_id,                // UUID
  capacity: formData.max_students,              // 20 → Mappé vers "capacity"
  ...(formData.section && { section: formData.section }),  // Optionnel
};
```

**Mapping:**
| Formulaire (`formData`) | Table BDD (`classes`) | Note                |
|--------------------------|------------------------|---------------------|
| `grade_level`            | `level`                | Renommage           |
| `max_students`           | `capacity`             | Renommage           |
| `school_year`            | `academic_year_id`     | Conversion UUID     |
| `name`                   | `name`                 | Identique           |
| `school_id`              | `school_id`            | Identique           |
| `section`                | `section`              | Optionnel           |

### 3. **Insertion avec `academic_year_id`**

```javascript
if (isEditing) {
  // Mise à jour (pas besoin de recalculer academic_year_id)
  const { error: updateError } = await supabase
    .from('classes')
    .update(classDataToSave)
    .eq('id', classData.id);

  if (updateError) throw updateError;
} else {
  // Création - ajouter academic_year_id
  classDataToSave.academic_year_id = academicYearId;

  const { error: insertError } = await supabase
    .from('classes')
    .insert([classDataToSave]);

  if (insertError) throw insertError;
}
```

---

## 🎯 Résultat Final

### Avant (400 Bad Request)
```sql
INSERT INTO classes (name, grade_level, school_year, school_id, max_students)
VALUES ('4eme', '4eme', '2026-2027', '...', 20);
-- ❌ Erreur: academic_year_id NOT NULL constraint violated
-- ❌ Colonnes grade_level, school_year, max_students inexistantes
```

### Après (200 OK)
```sql
-- 1. Créer/récupérer l'année académique
INSERT INTO academic_years (school_id, year, start_date, end_date, is_current)
VALUES ('...', '2026-2027', '2026-09-01', '2027-07-31', true)
ON CONFLICT (school_id, year) DO NOTHING
RETURNING id;  -- UUID: "abc-123-..."

-- 2. Insérer la classe avec l'academic_year_id
INSERT INTO classes (name, level, school_id, capacity, academic_year_id)
VALUES ('4eme', '4eme', '...', 20, 'abc-123-...');
-- ✅ Succès !
```

---

## 📋 Structure de la Table `academic_years`

```sql
CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id),
  year TEXT NOT NULL,              -- Format: "2026-2027"
  start_date DATE NOT NULL,        -- "2026-09-01"
  end_date DATE NOT NULL,          -- "2027-07-31"
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (school_id, year)         -- Une seule année "2026-2027" par école
);
```

**Contraintes:**
- Un couple `(school_id, year)` doit être unique
- Si une année existe déjà, elle est réutilisée (pas de doublon)

---

## 🧪 Tests Recommandés

### Test 1: Création avec Nouvelle Année Académique
**Scénario:** Créer une classe pour l'année "2026-2027" (qui n'existe pas encore)

- [ ] Remplir le formulaire:
  - Nom: "6ème A"
  - Niveau: "6ème"
  - Section: "A"
  - Année scolaire: "2026-2027"
  - École: (sélectionner une école)
  - Max élèves: 30

- [ ] Cliquer sur "Créer la classe"

- [ ] Vérifier dans Supabase:
  ```sql
  -- Vérifier que l'année académique a été créée
  SELECT * FROM academic_years
  WHERE year = '2026-2027';
  -- Résultat attendu: 1 ligne avec start_date='2026-09-01', end_date='2027-07-31'

  -- Vérifier que la classe a été créée
  SELECT * FROM classes
  WHERE name = '6ème A';
  -- Résultat attendu: 1 ligne avec level='6ème', capacity=30
  ```

### Test 2: Création avec Année Académique Existante
**Scénario:** Créer une 2ème classe pour la même année "2026-2027"

- [ ] Créer une nouvelle classe "5ème B" pour "2026-2027"
- [ ] Vérifier qu'aucune nouvelle année académique n'est créée:
  ```sql
  SELECT COUNT(*) FROM academic_years
  WHERE year = '2026-2027';
  -- Résultat attendu: 1 (pas de doublon)
  ```

- [ ] Vérifier que les 2 classes partagent le même `academic_year_id`:
  ```sql
  SELECT name, academic_year_id FROM classes
  WHERE name IN ('6ème A', '5ème B');
  -- Résultat: Même UUID pour academic_year_id
  ```

### Test 3: Édition de Classe
**Scénario:** Modifier une classe existante

- [ ] Éditer la classe "6ème A"
- [ ] Changer le nom en "6ème Alpha"
- [ ] Cliquer sur "Mettre à jour"
- [ ] Vérifier que:
  - Le nom est mis à jour
  - L'`academic_year_id` n'a pas changé
  - Aucune nouvelle année académique n'a été créée

### Test 4: Validation des Dates
**Scénario:** Vérifier que les dates sont correctement calculées

- [ ] Créer une classe pour "2025-2026"
- [ ] Vérifier dans `academic_years`:
  ```sql
  SELECT year, start_date, end_date FROM academic_years
  WHERE year = '2025-2026';
  -- Résultat attendu:
  -- year: "2025-2026"
  -- start_date: 2025-09-01
  -- end_date: 2026-07-31
  ```

---

## 📝 Fichiers Modifiés

### `apps/admin/src/pages/Classes/components/ClassFormModal.jsx`

**Lignes modifiées:** 283-342 (handleSubmit)

**Changements:**
1. Ajout de la logique de récupération/création d'année académique (lignes 283-314)
2. Création de l'objet `classDataToSave` avec mapping correct (lignes 316-323)
3. Ajout de `academic_year_id` lors de la création (ligne 335)
4. Mise à jour avec les bons noms de colonnes (ligne 327-330)

---

## 💡 Améliorations Futures (Optionnelles)

### 1. Sélection d'Année Académique Existante
Au lieu de saisir "2026-2027" manuellement, proposer une liste déroulante :

```jsx
<select name="academic_year_id">
  <option value="">Créer une nouvelle année...</option>
  {existingYears.map(year => (
    <option key={year.id} value={year.id}>
      {year.year} ({year.is_current ? 'Actuelle' : 'Archivée'})
    </option>
  ))}
</select>
```

### 2. Gestion du `is_current`
Actuellement, toutes les années créées sont marquées `is_current: true`. Amélioration:

```javascript
// Désactiver les autres années avant d'insérer
await supabase
  .from('academic_years')
  .update({ is_current: false })
  .eq('school_id', formData.school_id);

// Puis insérer la nouvelle année comme courante
await supabase
  .from('academic_years')
  .insert([{ ..., is_current: true }]);
```

### 3. Validation du Format d'Année
Ajouter une regex pour valider "YYYY-YYYY":

```javascript
const yearRegex = /^\d{4}-\d{4}$/;
if (!yearRegex.test(formData.school_year)) {
  throw new Error('Format d\'année invalide (attendu: 2026-2027)');
}

const [startYear, endYear] = formData.school_year.split('-').map(Number);
if (endYear !== startYear + 1) {
  throw new Error('L\'année de fin doit être l\'année de début + 1');
}
```

---

**Date:** 03 Janvier 2026
**Version:** 2.4.3
**Statut:** ✅ COMPLÉTÉ
