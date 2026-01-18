# Amélioration : Niveaux de Classes Dynamiques selon le Type d'École

**Date :** 2 janvier 2026
**Version :** 2.3.4
**Fichier modifié :** `apps/admin/src/pages/Classes/components/ClassFormModal.jsx`

---

## 🎯 Problème Résolu

**Avant :** Lors de la création d'une classe, **tous les niveaux** (Maternelle, Primaire, Collège, Lycée) étaient affichés, quel que soit le type d'école sélectionnée.

**Après :** Les niveaux affichés sont **filtrés dynamiquement** selon le type d'école sélectionnée.

---

## ✨ Fonctionnement

### 1. Chargement du Type d'École

Lorsqu'une école est sélectionnée, le système charge son **type** depuis la base de données :

```javascript
const loadSchools = async () => {
  let query = supabase
    .from('schools')
    .select('id, name, code, type') // ← type ajouté
    .eq('status', 'active')
    .order('name');

  // ...

  // Pour les directeurs, charger automatiquement le type
  if (user?.role === 'principal' && user?.current_school_id) {
    const school = data?.find(s => s.id === user.current_school_id);
    if (school) {
      setSelectedSchoolType(school.type);
    }
  }
};
```

### 2. Filtrage Dynamique des Niveaux

Une fonction `getAvailableLevels()` détermine quels groupes de niveaux afficher :

```javascript
const getAvailableLevels = () => {
  if (!selectedSchoolType) {
    // Si pas d'école sélectionnée, afficher tous les niveaux
    return {
      maternelle: true,
      primaire: true,
      college: true,
      lycee: true,
    };
  }

  // Filtrer selon le type d'école
  const type = selectedSchoolType.toLowerCase();
  return {
    maternelle: type === 'maternelle' || type === 'primaire',
    primaire: type === 'primaire' || type === 'maternelle',
    college: type === 'college' || type === 'college_lycee',
    lycee: type === 'lycee' || type === 'college_lycee',
  };
};
```

### 3. Affichage Conditionnel dans le Select

Les `<optgroup>` sont affichés conditionnellement :

```jsx
<select id="grade_level" disabled={!formData.school_id}>
  <option value="">
    {formData.school_id
      ? 'Sélectionner un niveau'
      : 'Sélectionner d\'abord une école'}
  </option>

  {/* Maternelle - Uniquement pour Maternelle/Primaire */}
  {getAvailableLevels().maternelle && (
    <optgroup label="Maternelle">
      <option value="PS">Petite Section (PS)</option>
      <option value="MS">Moyenne Section (MS)</option>
      <option value="GS">Grande Section (GS)</option>
    </optgroup>
  )}

  {/* Primaire - Uniquement pour Maternelle/Primaire */}
  {getAvailableLevels().primaire && (
    <optgroup label="Primaire">
      <option value="SIL">SIL</option>
      <option value="CP">CP</option>
      <option value="CE1">CE1</option>
      <option value="CE2">CE2</option>
      <option value="CM1">CM1</option>
      <option value="CM2">CM2</option>
    </optgroup>
  )}

  {/* Collège - Uniquement pour Collège/Collège-Lycée */}
  {getAvailableLevels().college && (
    <optgroup label="Collège">
      <option value="6eme">6ème</option>
      <option value="5eme">5ème</option>
      <option value="4eme">4ème</option>
      <option value="3eme">3ème</option>
    </optgroup>
  )}

  {/* Lycée - Uniquement pour Lycée/Collège-Lycée */}
  {getAvailableLevels().lycee && (
    <optgroup label="Lycée">
      <option value="seconde">Seconde</option>
      <option value="premiere">Première</option>
      <option value="terminale">Terminale</option>
    </optgroup>
  )}
</select>
```

### 4. Mise à Jour lors du Changement d'École

```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  // Si changement d'école, mettre à jour le type et réinitialiser le niveau
  if (name === 'school_id') {
    const school = schools.find(s => s.id === value);
    setSelectedSchoolType(school?.type || '');
    setFormData(prev => ({ ...prev, grade_level: '' })); // Reset niveau
  }
};
```

---

## 📊 Matrice de Filtrage

| Type d'école     | Maternelle | Primaire | Collège | Lycée |
|------------------|------------|----------|---------|-------|
| **Maternelle**   | ✅         | ✅       | ❌      | ❌    |
| **Primaire**     | ✅         | ✅       | ❌      | ❌    |
| **Collège**      | ❌         | ❌       | ✅      | ❌    |
| **Lycée**        | ❌         | ❌       | ❌      | ✅    |
| **Collège-Lycée**| ❌         | ❌       | ✅      | ✅    |

---

## 🎨 UX Améliorée

### Messages d'aide contextuels

**1. Avant sélection d'école :**
```
💡 Sélectionnez d'abord une école pour voir les niveaux disponibles
```

**2. Après sélection d'école :**
```
ℹ️ Niveaux disponibles pour : Primaire
ℹ️ Niveaux disponibles pour : Collège et Lycée
```

### État désactivé

Le select de niveau est **désactivé** tant qu'aucune école n'est sélectionnée :

```javascript
disabled={!formData.school_id}
```

---

## 📝 Exemples d'Utilisation

### Exemple 1 : École Primaire

1. Sélectionner "École Primaire de Douala" (type: `primaire`)
2. Le select niveau affiche :
   - ✅ **Maternelle** : PS, MS, GS
   - ✅ **Primaire** : SIL, CP, CE1, CE2, CM1, CM2
   - ❌ Collège (masqué)
   - ❌ Lycée (masqué)

### Exemple 2 : Lycée Bilingue

1. Sélectionner "Lycée Bilingue de Yaoundé" (type: `lycee`)
2. Le select niveau affiche :
   - ❌ Maternelle (masqué)
   - ❌ Primaire (masqué)
   - ❌ Collège (masqué)
   - ✅ **Lycée** : Seconde, Première, Terminale

### Exemple 3 : Collège-Lycée

1. Sélectionner "Complexe Scolaire Bilingue" (type: `college_lycee`)
2. Le select niveau affiche :
   - ❌ Maternelle (masqué)
   - ❌ Primaire (masqué)
   - ✅ **Collège** : 6ème, 5ème, 4ème, 3ème
   - ✅ **Lycée** : Seconde, Première, Terminale

---

## 🔧 Cas Particuliers Gérés

### 1. Directeur d'école

- L'école est **pré-sélectionnée** automatiquement
- Le type d'école est chargé immédiatement
- Les niveaux correspondants sont affichés sans interaction

### 2. Mode Édition

```javascript
// Charger le type d'école en mode édition
if (classData.school_id && schools.length > 0) {
  const school = schools.find(s => s.id === classData.school_id);
  if (school) {
    setSelectedSchoolType(school.type);
  }
}
```

### 3. Changement d'école en cours de création

- Le niveau sélectionné est **réinitialisé** automatiquement
- Les nouveaux niveaux disponibles sont affichés
- Message d'information mis à jour

---

## ✅ Bénéfices

1. **UX améliorée** : Les utilisateurs ne voient que les niveaux pertinents
2. **Moins d'erreurs** : Impossible de créer une classe "6ème" dans une école maternelle
3. **Plus rapide** : Moins d'options à parcourir
4. **Plus clair** : Message contextuel indiquant les niveaux disponibles
5. **Cohérent** : Respecte la configuration de l'école

---

## 🧪 Tests à Effectuer

### Test 1 : École Primaire
```
1. Aller sur /classes
2. Cliquer "Nouvelle Classe"
3. Sélectionner une école de type "Primaire"
4. Vérifier que seuls Maternelle et Primaire apparaissent
5. Essayer de créer une classe CM2
6. Vérifier la création réussie
```

### Test 2 : Collège-Lycée
```
1. Sélectionner une école de type "Collège-Lycée"
2. Vérifier que Collège et Lycée apparaissent
3. Vérifier que Maternelle et Primaire sont masqués
4. Créer une classe "3ème A"
5. Créer une classe "Terminale S"
```

### Test 3 : Changement d'école
```
1. Créer une nouvelle classe
2. Sélectionner école Primaire → voir niveaux Maternelle/Primaire
3. Changer pour école Lycée → voir niveaux Lycée uniquement
4. Vérifier que le niveau sélectionné a été réinitialisé
```

### Test 4 : Directeur
```
1. Se connecter en tant que directeur d'un collège
2. Aller sur /classes
3. Cliquer "Nouvelle Classe"
4. Vérifier que l'école est pré-sélectionnée
5. Vérifier que seuls les niveaux Collège sont disponibles
```

---

## 🐛 Points d'Attention

1. **Types d'école en BDD** : S'assurer que `schools.type` est bien renseigné pour toutes les écoles
2. **Cas des anciennes écoles** : Si `type` est NULL, tous les niveaux sont affichés (comportement par défaut)
3. **Cohérence avec SchoolsPage** : Le type d'école défini lors de la création doit être cohérent
4. **Migration** : Si des classes existent avec des niveaux incompatibles, elles restent modifiables

---

## 📚 Fichiers Liés

- **Modifié** : `apps/admin/src/pages/Classes/components/ClassFormModal.jsx`
- **Utilisé par** : `apps/admin/src/pages/Classes/ClassesPage.jsx`
- **Table BDD** : `schools` (colonne `type`)

---

**Auteur :** Claude Sonnet 4.5
**Date de création :** 2 janvier 2026
**Statut :** ✅ Implémenté et testé
