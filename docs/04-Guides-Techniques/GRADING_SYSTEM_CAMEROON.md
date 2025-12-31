# 📊 SYSTÈME DE NOTATION CAMEROUNAIS - DOCUMENTATION COMPLÈTE

## 🎯 Vue d'ensemble

Le système de notation a été entièrement refactorisé pour s'adapter au système éducatif camerounais avec ses **séquences** et **trimesters** au lieu du système français générique.

---

## 🔄 Modifications apportées

### 1. **Structure des évaluations**

#### Séquences (6 par an)
- **Séquence 1 et 2** → 1er Trimestre
- **Séquence 3 et 4** → 2ème Trimestre  
- **Séquence 5 et 6** → 3ème Trimestre

#### Auto-calcul du trimestre
Le trimestre est maintenant calculé automatiquement en fonction de la séquence sélectionnée :
```javascript
useEffect(() => {
  const sequence = parseInt(gradeForm.sequence);
  let trimester = '1';
  if (sequence === 1 || sequence === 2) trimester = '1';
  else if (sequence === 3 || sequence === 4) trimester = '2';
  else if (sequence === 5 || sequence === 6) trimester = '3';
  
  setGradeForm(prev => ({ ...prev, trimester }));
}, [gradeForm.sequence]);
```

---

### 2. **Types d'évaluation selon le niveau scolaire**

Le système détecte automatiquement le type d'établissement depuis la base de données et propose des évaluations contextuelles.

#### 🎨 Maternelle
- Observation en classe
- Activité pratique
- Participation
- Autonomie

#### 📝 Primaire
- Évaluation continue
- Composition
- Exercice
- Interrogation écrite
- Interrogation orale

#### 📚 Secondaire (Collège/Lycée)
- Évaluation de séquence
- Devoir surveillé
- Composition trimestrielle
- Interrogation écrite
- Travaux Pratiques (TP)
- Travaux Pratiques Encadrés (TPE)
- Exposé

**Code:**
```javascript
useEffect(() => {
  const loadSchoolType = async () => {
    if (classData?.school_id) {
      const { data, error } = await supabase
        .from('schools')
        .select('type')
        .eq('id', classData.school_id)
        .single();
      
      if (!error && data) {
        setSchoolType(data.type || 'secondaire');
      }
    }
  };
  loadSchoolType();
}, [classData]);
```

---

### 3. **Notes variables (pas seulement /20)**

#### Avant (système générique)
- Note fixe sur 20

#### Après (système flexible)
- **Note** : de 0 à la note maximale (avec pas de 0.25)
- **Sur** : note maximale configurable (10 à 100)
- **Coef.** : coefficient de 1 à 6

**Exemples réalistes:**
- Interrogation écrite : 15/30 avec coef. 2
- Devoir surveillé : 18/25 avec coef. 3
- Composition trimestrielle : 16/20 avec coef. 5

---

### 4. **Calcul de moyenne pondérée**

Les moyennes sont maintenant calculées avec **coefficients** et **normalisation** :

```javascript
const getStudentAverage = (studentId) => {
  const studentGrades = students
    .find(s => s.id === studentId)
    ?.recentGrades || [];
  
  if (studentGrades.length === 0) return null;
  
  // Calcul pondéré avec normalisation sur /20
  let totalPoints = 0;
  let totalCoefficients = 0;
  
  studentGrades.forEach(grade => {
    const normalizedGrade = (grade.grade / grade.max_grade) * 20; // Normaliser sur /20
    const coefficient = grade.coefficient || 1;
    totalPoints += normalizedGrade * coefficient;
    totalCoefficients += coefficient;
  });
  
  return totalCoefficients > 0 
    ? (totalPoints / totalCoefficients).toFixed(2) 
    : null;
};
```

**Exemple de calcul:**
- Interrogation 1 : 15/30 × coef. 2 = (15/30×20) × 2 = 10 × 2 = 20 points
- Devoir 1 : 18/25 × coef. 3 = (18/25×20) × 3 = 14.4 × 3 = 43.2 points
- Total : (20 + 43.2) / (2 + 3) = 63.2 / 5 = **12.64/20**

---

### 5. **Champs de formulaire adaptés**

#### Ancienne structure
```jsx
<input label="Note /20" type="number" max="20" />
```

#### Nouvelle structure (3 colonnes)
```jsx
<div className="grid grid-cols-3 gap-3">
  <div>
    <label>Note *</label>
    <input 
      type="number" 
      min="0" 
      max={gradeForm.max_grade}
      step="0.25"
      placeholder="15.5"
    />
  </div>
  
  <div>
    <label>Sur</label>
    <input 
      type="number" 
      min="10" 
      max="100"
      value={gradeForm.max_grade}
      placeholder="20"
    />
  </div>
  
  <div>
    <label>Coef.</label>
    <select value={gradeForm.coefficient}>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
    </select>
  </div>
</div>
```

#### Sélection Séquence/Trimestre
```jsx
<div className="grid grid-cols-2 gap-3">
  <div>
    <label>Séquence *</label>
    <select value={gradeForm.sequence}>
      <option value="1">Séquence 1</option>
      <option value="2">Séquence 2</option>
      <option value="3">Séquence 3</option>
      <option value="4">Séquence 4</option>
      <option value="5">Séquence 5</option>
      <option value="6">Séquence 6</option>
    </select>
  </div>
  
  <div>
    <label>Trimestre</label>
    <select value={gradeForm.trimester} disabled>
      <option value="1">1er Trimestre (Séq. 1-2)</option>
      <option value="2">2ème Trimestre (Séq. 3-4)</option>
      <option value="3">3ème Trimestre (Séq. 5-6)</option>
    </select>
  </div>
</div>
```

---

## 📋 Migration de base de données

### Fichier créé
`supabase/migrations/20251201_add_sequence_trimester_grades.sql`

### Colonnes ajoutées à `grades`
```sql
ALTER TABLE grades
  ADD COLUMN IF NOT EXISTS sequence INTEGER CHECK (sequence >= 1 AND sequence <= 6),
  ADD COLUMN IF NOT EXISTS trimester INTEGER CHECK (trimester >= 1 AND trimester <= 3);

CREATE INDEX IF NOT EXISTS idx_grades_sequence ON grades(sequence);
CREATE INDEX IF NOT EXISTS idx_grades_trimester ON grades(trimester);
CREATE INDEX IF NOT EXISTS idx_grades_sequence_trimester ON grades(sequence, trimester);
```

### Colonnes déjà existantes (migration précédente)
- `grade` DECIMAL(5, 2) - synchronisée avec `value`
- `max_grade` DECIMAL(5, 2) - synchronisée avec `max_value`
- `coefficient` DECIMAL(3, 2)
- `grade_type` TEXT - synchronisée avec `type`
- `comment` TEXT - synchronisée avec `description`

---

## 🔧 Intégration technique

### Insertion de note dans Supabase

**Code mis à jour:**
```javascript
const { data, error } = await supabase
  .from('grades')
  .insert({
    student_id: gradeForm.student,
    school_id: classData?.school_id || selectedStudentData?.school_id,
    academic_year_id: classData?.academic_year_id,
    class_id: selectedStudentData?.class_id,
    subject_id: classData?.subject_id,
    teacher_id: classData?.teacher_id,
    grade: gradeValue,
    max_grade: maxGrade,
    grade_type: gradeForm.type,
    coefficient: parseFloat(gradeForm.coefficient),
    description: gradeForm.description || null,
    sequence: parseInt(gradeForm.sequence),
    trimester: parseInt(trimester),
    date: gradeForm.date
  })
  .select();
```

### Données transmises dans `classData`

Le composant parent (`teacher-dashboard/index.jsx`) transmet maintenant tous les IDs nécessaires:

```javascript
assignedClasses: (assignments || []).map(assignment => ({
  id: assignment.id,
  name: assignment.class_name,
  subject: assignment.subject_name,
  school_id: assignment.school_id,
  subject_id: assignment.subject_id,
  class_id: assignment.class_id,
  teacher_id: teacherInfo.id,
  academic_year_id: academicYear?.id || null
}))
```

---

## ✅ Avantages du nouveau système

### 1. **Réalisme pédagogique**
- Conforme au système camerounais (6 séquences, 3 trimestres)
- Types d'évaluation adaptés au niveau scolaire
- Coefficients reflétant l'importance des évaluations

### 2. **Flexibilité**
- Notes variables (pas limité à /20)
- Adaptation automatique selon le type d'établissement
- Coefficient configurable par évaluation

### 3. **Précision des calculs**
- Normalisation des notes pour calculs de moyenne
- Pondération par coefficient
- Moyennes justes même avec notes sur barèmes différents

### 4. **Expérience utilisateur**
- Auto-calcul du trimestre (moins d'erreurs)
- Interface claire avec 3 colonnes (Note/Sur/Coef)
- Sélecteur de séquence avec labels explicites
- Trimestre désactivé (auto-calculé, pas de confusion)

---

## 🧪 Tests à effectuer

### 1. Enregistrement de note
- [ ] Note simple : 15/20 coef. 1 séquence 1
- [ ] Note variable : 18/30 coef. 3 séquence 4
- [ ] Note avec description
- [ ] Vérifier que trimester = 1 pour séquence 1-2
- [ ] Vérifier que trimester = 2 pour séquence 3-4
- [ ] Vérifier que trimester = 3 pour séquence 5-6

### 2. Types d'évaluation
- [ ] École maternelle → voir observations/activités
- [ ] École primaire → voir évaluations continues/compositions
- [ ] École secondaire → voir séquences/TP/exposés

### 3. Calcul de moyenne
- [ ] 1 note : moyenne = note normalisée
- [ ] 2 notes même barème : moyenne arithmétique
- [ ] 2 notes barèmes différents : moyenne normalisée
- [ ] 3 notes avec coefficients : moyenne pondérée correcte

### 4. Base de données
- [ ] Appliquer migration SQL
- [ ] Vérifier colonnes sequence/trimester créées
- [ ] Vérifier index créés
- [ ] Insérer note test et vérifier les valeurs

---

## 📝 Notes techniques

### Colonnes synchronisées
Le système utilise un trigger Postgres pour synchroniser les anciennes et nouvelles colonnes :
- `value` ↔️ `grade`
- `max_value` ↔️ `max_grade`
- `type` ↔️ `grade_type`
- `description` ↔️ `comment`

### Validation
- Séquence : 1-6 (contrainte CHECK)
- Trimestre : 1-3 (contrainte CHECK)
- Note : 0 à max_grade (validation frontend)
- Coefficient : 1-6 (validation frontend)

---

## 🔮 Améliorations futures

### Court terme
- [ ] Saisie groupée fonctionnelle (actuellement juste un bouton)
- [ ] Affichage historique des notes par séquence
- [ ] Génération bulletins trimestriels
- [ ] Statistiques par séquence (moyenne classe, min, max)

### Moyen terme
- [ ] Champ "Appréciation" textuel (feedback qualitatif)
- [ ] Calcul rang de l'élève dans la classe
- [ ] Export Excel des notes par trimestre
- [ ] Graphiques d'évolution par élève

### Long terme
- [ ] Module de délibération (conseil de classe)
- [ ] Calcul moyennes générales annuelles
- [ ] Passage automatique classe supérieure (si moyenne ≥ 10)
- [ ] Intégration avec système de bulletins imprimables

---

## 📄 Fichiers modifiés

```
src/pages/teacher-dashboard/
├── components/
│   └── GradeEntryPanel.jsx        ← MODIFIÉ (refactoring complet)
└── index.jsx                       ← MODIFIÉ (ajout IDs pour notes)

supabase/migrations/
└── 20251201_add_sequence_trimester_grades.sql  ← NOUVEAU
```

---

## 🚀 Déploiement

### Étapes de déploiement

1. **Appliquer la migration SQL**
   ```bash
   # Via Supabase dashboard ou CLI
   supabase db push
   ```

2. **Vérifier les colonnes**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'grades' 
   AND column_name IN ('sequence', 'trimester', 'grade', 'max_grade', 'coefficient');
   ```

3. **Tester l'enregistrement**
   - Ouvrir dashboard enseignant
   - Sélectionner une classe
   - Onglet "Notes"
   - Remplir formulaire complet
   - Vérifier insertion dans Supabase

4. **Vérifier calculs**
   - Ajouter plusieurs notes avec coefficients différents
   - Vérifier moyenne pondérée affichée

---

## ❓ FAQ

**Q: Les anciennes notes (sans séquence/trimestre) fonctionnent-elles encore ?**  
R: Oui, les colonnes sont NULL par défaut. Les anciennes notes restent accessibles.

**Q: Peut-on avoir des notes supérieures à 20 ?**  
R: Non, la note maximale est limitée à 100, mais après normalisation, toutes les moyennes sont sur /20.

**Q: Le trimestre peut-il être modifié manuellement ?**  
R: Non, le champ est désactivé (disabled) car calculé automatiquement depuis la séquence.

**Q: Que se passe-t-il si l'école n'a pas d'année académique active ?**  
R: `academic_year_id` sera NULL. L'insertion fonctionne toujours mais la note ne sera pas liée à une année.

**Q: Les coefficients sont-ils obligatoires ?**  
R: Non, valeur par défaut = 1. Mais dans le formulaire, l'utilisateur doit sélectionner explicitement.

---

**Date de création** : 2025-12-01  
**Auteur** : GitHub Copilot  
**Version** : 1.0  
**Statut** : ✅ Implémenté, en attente de tests utilisateurs
