# 🔍 Validation : Mapping Table `schools`

**Objectif** : Vérifier que tous les champs envoyés correspondent au schéma Supabase

---

## 📊 Schéma Supabase : Table `schools`

```sql
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                              -- ✅ REQUIS
  code TEXT UNIQUE NOT NULL,                        -- ✅ REQUIS
  type school_type DEFAULT 'public' NOT NULL,       -- ✅ REQUIS (enum)
  director_name TEXT NOT NULL,                      -- ✅ REQUIS
  director_user_id UUID,                            -- ⚠️ Optionnel
  phone TEXT,                                       -- ⚠️ Optionnel
  email TEXT,                                       -- ⚠️ Optionnel
  address TEXT,                                     -- ⚠️ Optionnel
  city TEXT,                                        -- ⚠️ Optionnel
  country TEXT DEFAULT 'Cameroun' NOT NULL,         -- ✅ REQUIS (DEFAULT)
  website TEXT,                                     -- ⚠️ Optionnel
  logo TEXT,                                        -- ⚠️ Optionnel
  description TEXT,                                 -- ⚠️ Optionnel
  available_classes TEXT[],                         -- ⚠️ Optionnel (array)
  settings JSONB,                                   -- ⚠️ Optionnel
  status TEXT DEFAULT 'active' NOT NULL,            -- ✅ REQUIS (DEFAULT)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (director_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 📝 Code Actuel : SignupPage.jsx

**Ligne 280-294**

```jsx
const { data: schoolRecord, error: schoolError } = await supabase
  .from('schools')
  .insert({
    name: formData.schoolName,              // ✅ TEXT NOT NULL
    code: schoolCode,                       // ✅ TEXT UNIQUE NOT NULL
    type: formData.schoolType,              // ✅ school_type NOT NULL
    director_name: formData.directorName,   // ✅ TEXT NOT NULL
    director_user_id: authData.user.id,     // ✅ UUID
    phone: formData.phone,                  // ✅ TEXT
    email: formData.email,                  // ✅ TEXT
    address: formData.address,              // ✅ TEXT
    city: formData.city,                    // ✅ TEXT
    country: formData.country,              // ✅ TEXT NOT NULL
    available_classes: selectedClasses      // ✅ TEXT[]
  })
  .select()
  .single();
```

---

## ✅ Validation Champ par Champ

| Colonne Supabase | Type SQL | Requis ? | Code Envoyé | Source Données | Status |
|------------------|----------|----------|-------------|----------------|--------|
| `id` | UUID | Auto | - | gen_random_uuid() | ✅ OK |
| `name` | TEXT | **OUI** | `formData.schoolName` | Étape 1 | ✅ OK |
| `code` | TEXT | **OUI** | `schoolCode` | Auto-généré | ✅ OK |
| `type` | school_type | **OUI** | `formData.schoolType` | Étape 1 | ✅ OK |
| `director_name` | TEXT | **OUI** | `formData.directorName` | Étape 2 | ✅ OK |
| `director_user_id` | UUID | Non | `authData.user.id` | Auth | ✅ OK |
| `phone` | TEXT | Non | `formData.phone` | Étape 2 | ✅ OK |
| `email` | TEXT | Non | `formData.email` | Étape 2 | ✅ OK |
| `address` | TEXT | Non | `formData.address` | Étape 1 | ✅ OK |
| `city` | TEXT | Non | `formData.city` | Étape 1 | ✅ OK |
| `country` | TEXT | **OUI** | `formData.country` | Étape 1 | ✅ OK |
| `website` | TEXT | Non | ❌ Pas envoyé | - | ⚠️ NULL |
| `logo` | TEXT | Non | ❌ Pas envoyé | - | ⚠️ NULL |
| `description` | TEXT | Non | ❌ Pas envoyé | - | ⚠️ NULL |
| `available_classes` | TEXT[] | Non | `selectedClasses` | Étape 3 | ✅ OK |
| `settings` | JSONB | Non | ❌ Pas envoyé | - | ⚠️ NULL |
| `status` | TEXT | **OUI** | - | DEFAULT 'active' | ✅ OK |
| `created_at` | TIMESTAMP | **OUI** | - | DEFAULT NOW() | ✅ OK |
| `updated_at` | TIMESTAMP | **OUI** | - | DEFAULT NOW() | ✅ OK |

---

## 🔍 Analyse Détaillée

### Champs REQUIS (NOT NULL)

| Colonne | Fourni ? | Comment ? |
|---------|----------|-----------|
| `name` | ✅ OUI | `formData.schoolName` |
| `code` | ✅ OUI | Auto-généré : `PREFIX-YEAR-RANDOM` |
| `type` | ✅ OUI | `formData.schoolType` (enum valide) |
| `director_name` | ✅ OUI | `formData.directorName` |
| `country` | ✅ OUI | `formData.country` (sélectionné) |
| `status` | ✅ OUI | DEFAULT 'active' (auto) |
| `created_at` | ✅ OUI | DEFAULT NOW() (auto) |
| `updated_at` | ✅ OUI | DEFAULT NOW() (auto) |

**Résultat** : ✅ Tous les champs requis sont fournis ou ont des valeurs par défaut.

---

### Champs Optionnels Non Envoyés

| Colonne | Pourquoi NULL ? | Impact |
|---------|-----------------|--------|
| `website` | Pas demandé dans formulaire | ⚠️ Sera NULL (OK) |
| `logo` | Pas demandé dans formulaire | ⚠️ Sera NULL (OK) |
| `description` | Pas demandé dans formulaire | ⚠️ Sera NULL (OK) |
| `settings` | Pas configuré | ⚠️ Sera NULL (OK) |

**Résultat** : ⚠️ Ces champs seront NULL mais c'est acceptable car ils sont optionnels.

---

## 🔎 Vérification du Type `country`

### Valeurs Possibles dans le Formulaire

**`apps/hub/src/pages/Signup/SignupPage.jsx:49-65`**

```jsx
const countryData = {
  'cameroon': {
    label: 'Cameroun',
    phoneCode: '+237',
    cities: [...]
  },
  'france': {
    label: 'France',
    phoneCode: '+33',
    cities: [...]
  },
  'senegal': {
    label: 'Sénégal',
    phoneCode: '+221',
    cities: [...]
  }
};
```

### Valeur Envoyée

```jsx
country: formData.country  // 'cameroon', 'france', ou 'senegal'
```

### Schéma Supabase

```sql
country TEXT DEFAULT 'Cameroun' NOT NULL
```

**⚠️ ATTENTION** :
- Le schéma attend un **TEXT** (pas d'enum, donc flexible)
- DEFAULT = `'Cameroun'` (avec majuscule)
- Nous envoyons `'cameroon'` (minuscule, anglais)

**Impact** :
- ✅ Pas de problème car c'est un TEXT (accepte n'importe quoi)
- ⚠️ Mais incohérent :
  - DEFAULT = `'Cameroun'` (français, majuscule)
  - Envoyé = `'cameroon'` (anglais, minuscule)

---

## 🔧 Recommandations

### 1️⃣ Normaliser le Pays (Optionnel)

**Problème** : Incohérence français/anglais

**Solution A** : Envoyer le label français

```jsx
// AVANT
country: formData.country  // 'cameroon'

// APRÈS
country: countryData[formData.country]?.label || formData.country  // 'Cameroun'
```

**Solution B** : Accepter l'anglais (garder tel quel)

Garder `'cameroon'` est acceptable car la colonne est TEXT (pas d'enum).

---

### 2️⃣ Vérification Type Enum `school_type`

**Valeurs Valides** (du schéma) :
```
'public', 'prive', 'maternelle', 'primaire', 'college', 'lycee',
'college_lycee', 'universite', 'formation_professionnelle'
```

**Valeurs Envoyées** (du code actuel) :
```jsx
{ value: 'primaire', label: 'École Primaire', ... },      // ✅ OK
{ value: 'college', label: 'Collège', ... },               // ✅ OK
{ value: 'lycee', label: 'Lycée', ... },                   // ✅ OK
{ value: 'college_lycee', label: 'Secondaire Complet', ... }, // ✅ OK
{ value: 'formation_professionnelle', label: 'Institut', ... }, // ✅ OK
{ value: 'universite', label: 'Université', ... }          // ✅ OK
```

**Résultat** : ✅ Toutes les valeurs correspondent à l'enum.

**⚠️ Manquant** : Les types `'public'`, `'prive'`, `'maternelle'` ne sont pas proposés dans le formulaire.

---

### 3️⃣ Vérification Type Array `available_classes`

**Schéma** : `TEXT[]` (array de strings)

**Code actuel** :
```jsx
const selectedClasses = formData.availableClasses
  .filter(cls => cls.isActive)
  .map(cls => cls.level);  // ['6ème', '5ème', '4ème']
```

**Résultat** : ✅ Correct, c'est bien un array de strings.

---

## 📋 Checklist Finale

### Champs Requis
- [x] `name` : ✅ Fourni
- [x] `code` : ✅ Auto-généré
- [x] `type` : ✅ Fourni (enum valide)
- [x] `director_name` : ✅ Fourni
- [x] `country` : ✅ Fourni (⚠️ incohérence français/anglais)
- [x] `status` : ✅ DEFAULT 'active'

### Champs Optionnels Fournis
- [x] `director_user_id` : ✅ UUID du user
- [x] `phone` : ✅ Téléphone
- [x] `email` : ✅ Email
- [x] `address` : ✅ Adresse
- [x] `city` : ✅ Ville
- [x] `available_classes` : ✅ Array de classes

### Champs Optionnels Non Fournis (OK)
- [ ] `website` : NULL (pas demandé)
- [ ] `logo` : NULL (pas demandé)
- [ ] `description` : NULL (pas demandé)
- [ ] `settings` : NULL (pas configuré)

---

## 🎯 Conclusion

### ✅ Tout est OK !

Tous les champs requis sont fournis et tous les types correspondent au schéma.

### ⚠️ Améliorations Possibles (Non Bloquantes)

1. **Normaliser `country`** : Envoyer `'Cameroun'` au lieu de `'cameroon'` pour cohérence
2. **Ajouter types manquants** : `'public'`, `'prive'`, `'maternelle'` au formulaire (si besoin)
3. **Ajouter champs optionnels** : `website`, `description` au formulaire (si besoin)

---

**Dernière vérification** : 2026-01-01
**Status** : ✅ Schema compatible - Prêt pour production
