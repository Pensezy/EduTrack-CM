# 📋 Instructions pour appliquer la migration du système hybride élèves

## ⚠️ IMPORTANT - À lire avant de commencer

Cette migration modifie la structure de la table `students` pour supporter le système hybride (primaire sans compte / secondaire avec compte).

**Durée estimée** : 2-5 minutes  
**Impact** : Aucune donnée perdue, ajout de colonnes uniquement

---

## 🎯 Étape 1 : Accéder à Supabase

1. Connectez-vous à https://supabase.com
2. Sélectionnez votre projet **EduTrack-CM**
3. Cliquez sur **SQL Editor** dans le menu de gauche

---

## 📝 Étape 2 : Créer une nouvelle requête

1. Cliquez sur **New query** (en haut à droite)
2. Copiez **TOUT** le contenu du fichier :
   ```
   supabase/migrations/20251130_add_student_hybrid_system.sql
   ```
3. Collez dans l'éditeur SQL

---

## ▶️ Étape 3 : Exécuter la migration

1. Cliquez sur le bouton **Run** (ou appuyez sur `Ctrl+Enter`)
2. Attendez quelques secondes
3. Vérifiez qu'aucune erreur n'apparaît en rouge

**Résultat attendu** :
```
Success. No rows returned
```

---

## ✅ Étape 4 : Vérifier que tout fonctionne

### Vérification 1 : Colonnes ajoutées

```sql
-- Exécutez cette requête pour voir les colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
```

**Vous devriez voir** :
- `matricule` (text, nullable)
- `school_level` (text, nullable)
- `class_id` (uuid, nullable)
- `parent_name` (text, nullable)
- `parent_phone` (text, nullable)
- `parent_email` (text, nullable)

### Vérification 2 : Contrainte user_id

```sql
-- Vérifier que user_id peut être NULL
SELECT is_nullable 
FROM information_schema.columns 
WHERE table_name = 'students' 
AND column_name = 'user_id';
```

**Résultat attendu** : `YES`

### Vérification 3 : Vue créée

```sql
-- Tester la vue
SELECT * FROM students_with_details LIMIT 1;
```

**Résultat attendu** : Aucune erreur (même si 0 lignes)

### Vérification 4 : Trigger activé

```sql
-- Vérifier que le trigger existe
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'validate_student_data_trigger';
```

**Résultat attendu** : 1 ligne avec `INSERT` et `UPDATE`

---

## 🔄 Étape 5 : Migrer les données existantes (si nécessaire)

### Si vous avez DÉJÀ des élèves dans votre base :

```sql
-- 1. Marquer tous les élèves existants comme "primaire" par défaut
UPDATE students 
SET school_level = 'primary' 
WHERE school_level IS NULL;

-- 2. Identifier les classes du secondaire
-- (Adapter selon VOS noms de classes)
UPDATE students 
SET school_level = 'secondary' 
WHERE class_id IN (
  SELECT id FROM classes 
  WHERE name IN ('6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale')
);

-- 3. Vérifier le résultat
SELECT 
  school_level, 
  COUNT(*) as nombre_eleves 
FROM students 
GROUP BY school_level;
```

**⚠️ ATTENTION pour les élèves du secondaire existants** :
- Ils n'auront PAS de matricule automatique (création manuelle nécessaire)
- Leurs `user_id` existants seront conservés
- Les nouveaux élèves secondaires auront tout automatiquement

---

## 🧪 Étape 6 : Tester la création d'élèves

### Test 1 : Élève primaire

1. Allez dans le dashboard du directeur
2. Créez un élève, choisissez **Primaire**
3. Vérifiez dans Supabase :

```sql
SELECT 
  full_name, 
  school_level, 
  matricule, 
  user_id,
  parent_phone
FROM students_with_details
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
- `school_level` = `primary`
- `matricule` = `NULL`
- `user_id` = `NULL`
- `parent_phone` = renseigné

### Test 2 : Élève secondaire

1. Créez un élève, choisissez **Secondaire**
2. Vérifiez dans Supabase :

```sql
SELECT 
  full_name, 
  school_level, 
  matricule, 
  user_id,
  student_email,
  has_account
FROM students_with_details
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
- `school_level` = `secondary`
- `matricule` = `STD2025XXX` (avec numéro)
- `user_id` = UUID valide
- `student_email` = `stdXXX@ecole.edutrack.cm`
- `has_account` = `true`

---

## 🐛 Dépannage

### Erreur : "column already exists"
```
✅ C'est normal si vous avez déjà exécuté la migration
→ Ignorez simplement, les colonnes sont déjà là
```

### Erreur : "violates foreign key constraint"
```
❌ Vérifiez que la table `classes` existe
→ SELECT * FROM classes LIMIT 1;
```

### Erreur : "user_id must be unique"
```
❌ Vous avez des doublons dans user_id
→ SELECT user_id, COUNT(*) FROM students GROUP BY user_id HAVING COUNT(*) > 1;
```

### Les élèves n'apparaissent pas dans la vue
```
✅ Normal si vous n'avez pas encore d'élèves
→ CREATE TABLE students est bien présente
→ Créez un élève via l'interface pour tester
```

---

## 📊 Requêtes utiles pour monitoring

### Voir les statistiques des élèves

```sql
SELECT 
  s.name AS school_name,
  st.school_level,
  COUNT(*) as nombre_eleves,
  COUNT(st.user_id) as avec_compte,
  COUNT(*) - COUNT(st.user_id) as sans_compte
FROM students st
JOIN schools s ON st.school_id = s.id
GROUP BY s.name, st.school_level
ORDER BY s.name, st.school_level;
```

### Voir les élèves sans téléphone parent

```sql
SELECT 
  first_name || ' ' || last_name as nom_complet,
  school_level,
  parent_name,
  parent_phone
FROM students
WHERE parent_phone IS NULL OR parent_phone = ''
ORDER BY created_at DESC;
```

### Voir les élèves du secondaire sans compte

```sql
-- ⚠️ Ceci ne devrait retourner AUCUNE ligne (anomalie)
SELECT 
  first_name || ' ' || last_name as nom_complet,
  matricule,
  user_id
FROM students
WHERE school_level = 'secondary' AND user_id IS NULL;
```

---

## 📞 Support

Si vous rencontrez un problème :

1. **Copiez le message d'erreur complet**
2. **Notez à quelle étape le problème survient**
3. **Vérifiez les logs dans l'onglet "Logs" de Supabase**
4. **Consultez le fichier** : `/docs/STUDENT_HYBRID_SYSTEM.md`

---

## ✅ Checklist finale

Avant de considérer la migration comme terminée, vérifiez :

- [ ] La migration SQL s'est exécutée sans erreur
- [ ] Les colonnes `matricule`, `school_level`, etc. existent
- [ ] La contrainte `user_id NOT NULL` a été supprimée
- [ ] La vue `students_with_details` fonctionne
- [ ] Le trigger `validate_student_data_trigger` est actif
- [ ] Test création élève primaire → OK (sans compte)
- [ ] Test création élève secondaire → OK (avec compte + matricule)
- [ ] Les données existantes ont été migrées (si applicable)

---

**🎉 Félicitations ! Le système hybride est opérationnel.**

Les directeurs peuvent maintenant créer des élèves adaptés à leur niveau scolaire.

---

**Date** : 30 novembre 2025  
**Fichier de migration** : `supabase/migrations/20251130_add_student_hybrid_system.sql`  
**Documentation** : `docs/STUDENT_HYBRID_SYSTEM.md`
