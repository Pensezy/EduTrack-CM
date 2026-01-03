# Améliorations du Formulaire de Création de Classes

## 🎯 Objectif

Ajouter des vérifications et limitations pour respecter les restrictions du pack gratuit (App Core) lors de la création de classes.

---

## ✅ Problèmes Résolus

### 1. **Pas de vérification des limites du pack gratuit**

**Problème Initial:**
- Le formulaire permettait de créer un nombre illimité de classes
- Aucune vérification côté frontend avant soumission
- L'utilisateur découvrait l'erreur seulement après soumission (via trigger SQL)

**Solutions Apportées:**

#### A. Vérification de la limite de classes (1 classe max pour App Core)

1. **Chargement automatique des infos de l'école et décompte des classes:**
   ```javascript
   const loadSchoolInfo = async (schoolId) => {
     // Récupère les infos de l'école + ses subscriptions
     const { data: school } = await supabase
       .from('schools')
       .select(`*, school_subscriptions!inner(app_id, status, expires_at)`)
       .eq('id', schoolId)
       .single();

     // Compte les classes existantes
     const { count } = await supabase
       .from('classes')
       .select('*', { count: 'exact', head: true })
       .eq('school_id', schoolId);

     setSchoolInfo(school);
     setClassCount(count || 0);
   };
   ```

2. **Fonction pour vérifier l'accès à l'App Académique:**
   ```javascript
   const hasAcademicApp = () => {
     if (!schoolInfo?.school_subscriptions) return false;

     const academicSub = schoolInfo.school_subscriptions.find(
       sub => sub.app_id === 'academic' &&
              ['trial', 'active'].includes(sub.status) &&
              (!sub.expires_at || new Date(sub.expires_at) > new Date())
     );

     return !!academicSub;
   };
   ```

3. **Fonction pour obtenir les limites:**
   ```javascript
   const getClassLimitInfo = () => {
     const hasAcademic = hasAcademicApp();

     if (hasAcademic) {
       return {
         limit: null, // Illimité
         canCreate: true,
         message: 'Classes illimitées (App Académique)',
         type: 'success',
         maxStudentsPerClass: null,
       };
     } else {
       // App Core: 1 classe max, 20 élèves max
       const maxClasses = 1;
       const maxStudentsTotal = 20;
       const canCreate = classCount < maxClasses;

       return {
         limit: maxClasses,
         current: classCount,
         canCreate: canCreate,
         message: canCreate
           ? `${classCount}/${maxClasses} classe utilisée`
           : `Limite atteinte: ${classCount}/${maxClasses} classe`,
         type: canCreate ? 'warning' : 'error',
         maxStudentsPerClass: maxStudentsTotal,
         maxStudentsTotal: maxStudentsTotal,
       };
     }
   };
   ```

4. **Affichage visuel des limites:**
   - Zone d'information colorée sous le champ "École"
   - 3 états visuels:
     - ✅ **Vert** (succès): App Académique, classes illimitées
     - ⚠️ **Jaune** (warning): App Core, 0/1 classe utilisée
     - 🚫 **Rouge** (erreur): App Core, limite atteinte (1/1 classe)
   - Message d'encouragement à souscrire si limite atteinte

5. **Validation avant soumission:**
   ```javascript
   if (!isEditing) {
     const limitInfo = getClassLimitInfo();

     if (limitInfo && !limitInfo.canCreate) {
       throw new Error(
         'Vous avez atteint la limite de classes pour le pack gratuit (1 classe maximum). ' +
         'Souscrivez à l\'App Académique pour créer des classes illimitées.'
       );
     }
   }
   ```

6. **Désactivation du bouton "Créer" si limite atteinte:**
   ```javascript
   <button
     type="submit"
     disabled={
       loading ||
       (!isEditing && formData.school_id && schoolInfo && !getClassLimitInfo()?.canCreate)
     }
   >
     {loading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la classe'}
   </button>
   ```

#### B. Vérification de la limite d'élèves par classe (20 max pour App Core)

1. **Validation du nombre max d'élèves:**
   ```javascript
   if (limitInfo && limitInfo.maxStudentsPerClass && formData.max_students > limitInfo.maxStudentsPerClass) {
     throw new Error(
       `Avec l'App Core gratuite, vous ne pouvez pas créer une classe de plus de ${limitInfo.maxStudentsPerClass} élèves.` +
       'Souscrivez à l\'App Académique pour débloquer jusqu\'à 500 élèves.'
     );
   }
   ```

2. **Indicateur visuel sur le champ "Nombre maximum d'élèves":**
   - Affiche un message sous le champ si App Core
   - Message d'avertissement jaune si ≤ 20 élèves
   - Message d'erreur rouge si > 20 élèves
   - Exemple: "⚠️ App Core gratuite: Maximum 20 élèves au total"

#### C. Chargement automatique pour les directeurs

**Amélioration UX:**
- Lorsqu'un directeur ouvre le formulaire, ses infos d'école et les limites se chargent automatiquement
- Plus besoin d'attendre la sélection de l'école (qui est pré-sélectionnée)

```javascript
useEffect(() => {
  if (isOpen) {
    loadSchools();

    // Pour les directeurs, charger immédiatement les infos de leur école
    if (user?.role === 'principal' && user?.current_school_id && !isEditing) {
      loadSchoolInfo(user.current_school_id);
    }
  }
}, [isOpen, user, isEditing]);
```

---

## 📦 Migration SQL - Colonnes Manquantes

**Problème Détecté:**
Le formulaire utilise les colonnes `grade_level`, `section`, `school_year`, `max_students`, mais le schéma initial de la table `classes` ne les contient pas forcément.

**Solution:**
Création de la migration `20260103_add_classes_custom_fields.sql` pour ajouter ces colonnes si elles n'existent pas.

### Colonnes Ajoutées

1. **`grade_level` (TEXT):**
   - Niveau de la classe (6eme, CM1, seconde, PS, etc.)
   - Permet un filtrage plus précis que `level`

2. **`section` (TEXT):**
   - Section ou série (A, B, C, S, L, etc.)
   - Optionnel

3. **`school_year` (TEXT):**
   - Année scolaire au format "YYYY-YYYY"
   - Exemple: "2024-2025", "2025-2026"

4. **`max_students` (INTEGER, DEFAULT 40):**
   - Nombre maximum d'élèves autorisés dans cette classe
   - Valeur par défaut: 40

### Migration des Données

- Si la colonne `level` existe, ses valeurs sont copiées dans `grade_level`
- Assure la compatibilité avec les anciennes données

### Index Créés

- `idx_classes_school_year`: Améliore les performances des requêtes par année scolaire
- `idx_classes_grade_level`: Améliore les performances des requêtes par niveau

---

## 🎨 Améliorations UX

### Avant
- ❌ Aucune indication de limite
- ❌ Erreur découverte uniquement après soumission
- ❌ Pas de guidance pour l'utilisateur App Core

### Après
- ✅ **Indicateur visuel clair** des limites
- ✅ **Validation en temps réel** (dès la saisie)
- ✅ **Messages d'erreur détaillés** avec solutions (souscription)
- ✅ **Bouton désactivé** si limite atteinte
- ✅ **Chargement automatique** pour les directeurs
- ✅ **Guidance commerciale** (encouragement à souscrire)

---

## 📊 Logique de Vérification

### Diagramme de Décision

```
Utilisateur ouvre le formulaire
        ↓
  Sélectionne une école
        ↓
  Chargement school_subscriptions
        ↓
┌─────────────────────────┐
│ École a App Académique? │
└─────────────────────────┘
       /            \
     OUI            NON
      ↓              ↓
┌──────────────┐  ┌──────────────────────┐
│ Classes: ∞   │  │ Classes: Max 1       │
│ Élèves: 500  │  │ Élèves: Max 20 total │
│ Type: Succès │  │ Type: Warning/Error  │
└──────────────┘  └──────────────────────┘
                         ↓
              ┌─────────────────────┐
              │ Classe déjà créée?  │
              └─────────────────────┘
                   /         \
                 OUI         NON
                  ↓           ↓
          ┌──────────────┐  ┌──────────────────┐
          │ Bouton       │  │ Peut créer       │
          │ désactivé    │  │ si max_students  │
          │ Message:     │  │ ≤ 20             │
          │ Limite       │  └──────────────────┘
          │ atteinte     │
          └──────────────┘
```

---

## 🧪 Tests Recommandés

### Scénario 1: École avec App Core (Gratuit)

**Test 1.1 - Aucune classe existante:**
- [ ] Ouvrir le formulaire
- [ ] Sélectionner une école avec App Core uniquement
- [ ] Vérifier l'affichage: "0/1 classe utilisée (App Core Gratuite)" en jaune
- [ ] Saisir "Nombre max d'élèves" = 25
- [ ] Vérifier le message: "🚫 App Core gratuite: Maximum 20 élèves au total" en rouge
- [ ] Réduire à 20 → Message passe à jaune avec ⚠️
- [ ] Réduire à 15 → OK
- [ ] Créer la classe → Devrait réussir

**Test 1.2 - 1 classe déjà existante:**
- [ ] Ouvrir le formulaire
- [ ] Sélectionner une école avec App Core ET 1 classe existante
- [ ] Vérifier l'affichage: "Limite atteinte: 1/1 classe (App Core Gratuite)" en rouge
- [ ] Vérifier message de souscription affiché
- [ ] Vérifier bouton "Créer la classe" désactivé
- [ ] Tenter de soumettre → Devrait afficher erreur

### Scénario 2: École avec App Académique

**Test 2.1 - Classes illimitées:**
- [ ] Ouvrir le formulaire
- [ ] Sélectionner une école avec App Académique active
- [ ] Vérifier l'affichage: "Classes illimitées (App Académique)" en vert
- [ ] Saisir "Nombre max d'élèves" = 50
- [ ] Vérifier qu'aucun message de limite ne s'affiche
- [ ] Créer la classe → Devrait réussir

### Scénario 3: Directeur d'école

**Test 3.1 - Chargement automatique:**
- [ ] Se connecter en tant que directeur
- [ ] Ouvrir le formulaire "Nouvelle Classe"
- [ ] Vérifier que l'école est pré-sélectionnée
- [ ] Vérifier que les limites s'affichent immédiatement (sans action manuelle)
- [ ] Vérifier que l'école est disabled (non modifiable)

### Scénario 4: Édition de classe existante

**Test 4.1 - Pas de vérification de limite:**
- [ ] Éditer une classe existante
- [ ] Vérifier qu'aucun message de limite ne s'affiche (édition autorisée)
- [ ] Modifier le nom → Devrait réussir

---

## 📝 Fichiers Modifiés

### 1. `apps/admin/src/pages/Classes/components/ClassFormModal.jsx`

**Lignes ajoutées: ~100**

**Changements:**
- Ajout des states `schoolInfo` et `classCount`
- Fonction `loadSchoolInfo()` pour charger école + subscriptions
- Fonction `hasAcademicApp()` pour vérifier accès App Académique
- Fonction `getClassLimitInfo()` pour calculer les limites
- Modification de `handleChange()` pour charger infos école
- Modification de `handleSubmit()` pour valider les limites
- Ajout de useEffect pour chargement auto (directeurs)
- Ajout de zones d'avertissement visuelles dans le JSX
- Désactivation du bouton si limite atteinte

### 2. `supabase/migrations/20260103_add_classes_custom_fields.sql` (NOUVEAU)

**Lignes: 85**

**Contenu:**
- Scripts `DO $$` pour ajouter colonnes si elles n'existent pas
- Migration des données `level` → `grade_level`
- Création d'index pour performances
- Commentaires SQL pour documentation

---

## 🔐 Cohérence avec les Triggers SQL

Les vérifications côté frontend complètent les triggers SQL existants:

### Trigger: `enforce_class_limit_core` (Ligne 101 - [20260102_update_core_limits.sql](supabase/migrations/20260102_update_core_limits.sql#L101))

**Fonction:**
- Bloque l'insertion de classe si App Core ET >= 1 classe existante
- Message: "Limite de 1 classe atteinte avec App Core gratuite..."

**Avantage du frontend:**
- L'utilisateur est averti AVANT de remplir le formulaire
- Évite les soumissions inutiles
- Meilleure UX avec guidance commerciale

---

## 💡 Améliorations Futures (Optionnelles)

### 1. Compteur d'élèves en temps réel
Afficher le nombre total d'élèves inscrits dans l'école pour App Core:
```
⚠️ 12/20 élèves utilisés (App Core gratuite)
```

### 2. Projection de la limite
Calculer si l'ajout de la classe dépasserait la limite totale:
```
⚠️ Cette classe de 15 élèves porterait le total à 27/20 élèves (limite dépassée)
```

### 3. Bouton "Souscrire" direct
Ajouter un bouton CTA qui redirige vers la page de souscription:
```jsx
<button onClick={() => navigate('/bundles')}>
  Débloquer App Académique
</button>
```

### 4. Prévision de surcharge
Afficher un avertissement si `max_students` + élèves actuels > limite totale

---

## 🎯 Impact Business

### Avant
- Utilisateurs App Core frustrés par erreurs surprises
- Pas de guidance vers l'upsell (App Académique)
- Mauvaise expérience utilisateur

### Après
- ✅ Utilisateurs informés en amont des limitations
- ✅ Messages commerciaux clairs et non intrusifs
- ✅ Encouragement naturel à souscrire
- ✅ Réduction des tickets support liés aux erreurs

---

## 📚 Documentation Technique

### Structure des Subscriptions

```typescript
interface SchoolSubscription {
  app_id: string;        // 'core', 'academic', 'financial', etc.
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  expires_at: string | null; // ISO date ou null si illimité
}

interface School {
  id: string;
  name: string;
  school_subscriptions: SchoolSubscription[];
}
```

### Limites par App

| App ID      | Max Classes | Max Élèves | Max Enseignants | Secrétaires |
|-------------|-------------|------------|-----------------|-------------|
| `core`      | 1           | 20         | 3               | 0           |
| `academic`  | ∞           | 500        | ∞               | ∞           |

---

**Date:** 03 Janvier 2026
**Version:** 2.4.1
**Statut:** ✅ COMPLÉTÉ
