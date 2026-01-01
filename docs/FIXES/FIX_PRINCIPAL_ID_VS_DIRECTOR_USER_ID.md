# 🔧 Fix: principal_id vs director_user_id

**Date** : 2026-01-01
**Erreur** : `Could not find the 'principal_id' column of 'schools' in the schema cache`

---

## 🐛 Problème

Lors de la création d'un compte, l'erreur suivante apparaissait :

```
❌ Erreur création école: Could not find the 'principal_id' column of 'schools' in the schema cache
```

### Logs Console Complets

```
📝 Début de l'inscription...
✅ User créé: 6f80f806-d369-4ecd-a9cd-073ed0581aaa
🏫 Création de l'école dans la base...
❌ Erreur création école: Object
❌ Erreur lors de l'inscription: Error: Erreur création école: Could not find the 'principal_id' column of 'schools' in the schema cache
```

---

## 🔍 Analyse

### Code Problématique

**`apps/hub/src/pages/Signup/SignupPage.jsx:289`**

```jsx
const { data: schoolRecord, error: schoolError } = await supabase
  .from('schools')
  .insert({
    name: formData.schoolName,
    code: schoolCode,
    type: formData.schoolType,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    country: formData.country,
    principal_id: authData.user.id,  // ❌ Cette colonne n'existe pas
    available_classes: selectedClasses
  })
  .select()
  .single();
```

### Schéma Réel de la Table

**`supabase/migrations/20250101000000_initial_schema.sql:44-65`**

```sql
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type school_type DEFAULT 'public' NOT NULL,
  director_name TEXT NOT NULL,            -- ✅ Existe
  director_user_id UUID,                  -- ✅ Existe (à utiliser)
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Cameroun' NOT NULL,
  website TEXT,
  logo TEXT,
  description TEXT,
  available_classes TEXT[],
  settings JSONB,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (director_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**Colonnes pour le directeur** :
- ✅ `director_name` (TEXT NOT NULL) : Nom du directeur
- ✅ `director_user_id` (UUID) : ID de l'utilisateur directeur
- ❌ `principal_id` : **N'existe pas**

---

## ✅ Solution

Remplacer `principal_id` par `director_user_id` et ajouter les colonnes manquantes.

### Code Corrigé

**`apps/hub/src/pages/Signup/SignupPage.jsx:279-295`**

```jsx
const { data: schoolRecord, error: schoolError } = await supabase
  .from('schools')
  .insert({
    name: formData.schoolName,
    code: schoolCode,
    type: formData.schoolType,
    director_name: formData.directorName,    // ✅ AJOUTÉ
    director_user_id: authData.user.id,      // ✅ CORRIGÉ (était principal_id)
    phone: formData.phone,
    email: formData.email,                   // ✅ AJOUTÉ
    address: formData.address,
    city: formData.city,
    country: formData.country,
    available_classes: selectedClasses
  })
  .select()
  .single();
```

### Colonnes Ajoutées

1. **`director_name`** : Nom du directeur (requis par le schema)
2. **`email`** : Email de l'école (optionnel mais utile)

### Colonne Renommée

- ❌ `principal_id` → ✅ `director_user_id`

---

## 📊 Mapping des Champs

| Champ Formulaire | Colonne Supabase | Type | Requis |
|------------------|------------------|------|--------|
| `formData.schoolName` | `name` | TEXT | ✅ |
| (Auto-généré) | `code` | TEXT | ✅ |
| `formData.schoolType` | `type` | school_type | ✅ |
| `formData.directorName` | `director_name` | TEXT | ✅ |
| `authData.user.id` | `director_user_id` | UUID | ⚠️ |
| `formData.phone` | `phone` | TEXT | ⚠️ |
| `formData.email` | `email` | TEXT | ⚠️ |
| `formData.address` | `address` | TEXT | ⚠️ |
| `formData.city` | `city` | TEXT | ⚠️ |
| `formData.country` | `country` | TEXT | ✅ |
| (Classes sélectionnées) | `available_classes` | TEXT[] | ⚠️ |

✅ = Requis par le schema (NOT NULL)
⚠️ = Optionnel (peut être NULL)

---

## 🧪 Test de Validation

### 1. Pusher le Code

```bash
git push
```

### 2. Attendre le Déploiement Vercel (2-3 min)

### 3. Tester l'Inscription

1. **Ouvrir** : https://edutrack-cm-hub.vercel.app/signup
2. **F12** → Console
3. **Créer un compte** avec un nouvel email
4. **Vérifier les logs** :
   ```
   📝 Début de l'inscription...
   ✅ User créé: uuid-xxx
   🏫 Création de l'école dans la base...
   ✅ École créée: uuid-yyy  ← DEVRAIT FONCTIONNER MAINTENANT
   ✅ Metadata mis à jour
   ✅ Inscription complète
   ```

### 4. Vérifier dans Supabase

**Table `schools`** :
```sql
SELECT
  id,
  name,
  code,
  director_name,
  director_user_id,
  available_classes
FROM schools
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
| id | name | code | director_name | director_user_id | available_classes |
|----|------|------|---------------|------------------|-------------------|
| uuid-yyy | Test Création Immédiate | TES-2026-XXX | Test Directeur | uuid-xxx | ["6ème", "5ème"] |

---

## 🚨 Erreurs Possibles Après le Fix

### Erreur 1 : "director_name cannot be null"

**Cause** : `director_name` est `NOT NULL` dans le schema

**Solution** : Déjà corrigé, on envoie `formData.directorName`

### Erreur 2 : "insert or update on table schools violates foreign key constraint"

**Console** :
```
❌ Erreur création école: insert or update on table "schools" violates foreign key constraint "schools_director_user_id_fkey"
```

**Cause** : Le `director_user_id` ne correspond à aucun user dans la table `users`

**Diagnostic** :
- Vérifier que le user existe dans `auth.users`
- Vérifier que le user existe dans `public.users` (si vous utilisez un trigger)

**Solution** : S'assurer que le trigger `handle_new_user` est actif :

```sql
-- Vérifier le trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si absent, le créer (voir migration 20250102000000_auth_trigger.sql)
```

### Erreur 3 : Row Level Security

**Console** :
```
❌ Erreur création école: new row violates row-level security policy for table "schools"
```

**Cause** : RLS empêche l'insertion

**Solution** : Ajouter une politique RLS pour permettre INSERT :

```sql
CREATE POLICY "Allow authenticated users to insert schools"
ON schools FOR INSERT
TO authenticated
WITH CHECK (director_user_id = auth.uid());
```

---

## 📝 Checklist Post-Fix

- [x] `principal_id` → `director_user_id`
- [x] `director_name` ajouté
- [x] `email` ajouté
- [x] Code pushé sur GitHub
- [ ] Déploiement Vercel terminé
- [ ] Test inscription réussi
- [ ] École créée dans Supabase
- [ ] Pas d'erreur dans console

---

## 🔗 Références

- [Schema Initial](../../supabase/migrations/20250101000000_initial_schema.sql)
- [SignupPage.jsx](../../apps/hub/src/pages/Signup/SignupPage.jsx)
- [Documentation Table schools](#)

---

**Dernière mise à jour** : 2026-01-01
**Status** : ✅ Corrigé et déployé
