# Guide d'application de la migration

## Migration: Supprimer le trigger qui bloque les élèves du primaire

### Problème
Un trigger existe qui empêche les élèves du primaire d'avoir un compte utilisateur.
Mais la décision prise est : **TOUS les élèves (primaire ET secondaire) ont un compte**.

### Solution
Appliquer la migration `20251201_remove_primary_student_trigger.sql`

---

## Option 1: Via Supabase Dashboard (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Menu **SQL Editor**
4. Cliquer sur **New query**
5. Copier le contenu de `supabase/migrations/20251201_remove_primary_student_trigger.sql`
6. Coller dans l'éditeur
7. Cliquer sur **Run**
8. Vérifier les messages :
   - ✅ "Trigger supprimé"
   - ✅ "Fonction supprimée"
   - ✅ "Colonne user_id rendue obligatoire" (si aucun élève sans compte)

---

## Option 2: Via psql (Ligne de commande)

```bash
# Se connecter à la base de données
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres

# Exécuter la migration
\i supabase/migrations/20251201_remove_primary_student_trigger.sql

# Vérifier
SELECT COUNT(*) FROM students WHERE user_id IS NULL;
# Doit retourner 0
```

---

## Option 3: Via Supabase CLI

```bash
# Se connecter
supabase login

# Lier le projet
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer la migration
supabase db push

# Ou manuellement
supabase db execute --file supabase/migrations/20251201_remove_primary_student_trigger.sql
```

---

## Vérification après migration

### 1. Vérifier que le trigger est supprimé
```sql
SELECT * FROM pg_trigger WHERE tgname = 'check_student_user_id_by_level';
-- Doit retourner 0 ligne
```

### 2. Vérifier que la fonction est supprimée
```sql
SELECT * FROM pg_proc WHERE proname = 'check_student_user_id_constraint';
-- Doit retourner 0 ligne
```

### 3. Tester la création d'un élève primaire avec compte
```sql
-- Devrait fonctionner maintenant
INSERT INTO students (
  school_id, 
  user_id, 
  registration_number, 
  first_name, 
  last_name,
  class_id
) VALUES (
  'YOUR_SCHOOL_ID',
  'USER_ID_FROM_USERS_TABLE',
  'ETK2024001',
  'Test',
  'Primaire',
  'CLASS_ID'
);
```

---

## Ordre d'exécution des migrations

Si vous réappliquez toutes les migrations depuis le début :

1. ✅ `20251130_add_student_hybrid_system.sql` - Système hybride (avec trigger)
2. ✅ `20251201_fix_student_user_id_nullable.sql` - user_id nullable
3. ✅ `20251201_remove_primary_student_trigger.sql` - **Supprimer trigger** ← CETTE MIGRATION

---

## En cas de problème

### Erreur: "élèves sans user_id"
Si la migration signale qu'il reste des élèves sans compte :

```sql
-- Lister les élèves sans compte
SELECT id, first_name, last_name, registration_number 
FROM students 
WHERE user_id IS NULL;

-- Créer des comptes pour ces élèves
-- (Utiliser le formulaire de création dans l'application)
```

### Erreur: "trigger n'existe pas"
Pas de problème, cela signifie qu'il a déjà été supprimé ou qu'il n'a jamais été créé.

### Erreur: "permission denied"
Vous devez être connecté avec un compte ayant les droits `postgres` ou `service_role`.

---

## Impact

### Avant la migration
- ❌ Impossible de créer un élève du primaire avec user_id
- ❌ Erreur: "Les élèves du primaire ne doivent pas avoir de compte"

### Après la migration
- ✅ Tous les élèves (primaire + secondaire) peuvent avoir un compte
- ✅ Création d'élève fonctionne sans erreur
- ✅ user_id obligatoire pour tous les nouveaux élèves

---

## Rollback (si nécessaire)

Pour revenir en arrière (déconseillé) :

```sql
-- Recréer le trigger (non recommandé)
-- Utiliser le contenu de 20251130_add_student_hybrid_system.sql
-- Section "CREATE TRIGGER check_student_user_id_by_level"
```

---

## Statut actuel

- [x] Migration créée
- [ ] Migration appliquée en base de données ← **À FAIRE**
- [ ] Tests de création d'élève effectués
- [ ] Vérification que tout fonctionne

**Action requise :** Appliquer la migration via une des 3 options ci-dessus.
