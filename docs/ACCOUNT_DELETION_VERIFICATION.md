# ✅ Checklist de Vérification - Suppression de Compte Directeur

## 📋 Checklist Avant Suppression

Avant de supprimer votre compte, vérifiez que vous avez :

- [ ] **Exporté tous les bulletins de notes**
- [ ] **Sauvegardé la liste complète des étudiants**
- [ ] **Exporté l'historique financier (paiements)**
- [ ] **Sauvegardé les coordonnées des parents**
- [ ] **Informé tous les enseignants de la fermeture**
- [ ] **Informé tous les parents de la fermeture**
- [ ] **Sauvegardé les configurations importantes**
- [ ] **Vérifié qu'il n'y a pas d'alternative** (désactivation, transfert)
- [ ] **Lu et compris la liste complète des données supprimées**
- [ ] **Accepté que cette action est IRRÉVERSIBLE**

---

## 🔍 Checklist de Vérification Post-Suppression

Utilisez cette checklist pour vérifier que **TOUTES** les données ont bien été supprimées.

### ✅ À Vérifier dans Supabase Dashboard

#### 1️⃣ Données Transactionnelles

```sql
-- Vérifier qu'il n'y a plus de notes pour cette école
SELECT COUNT(*) FROM grades WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de présences
SELECT COUNT(*) FROM attendances WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de paiements
SELECT COUNT(*) FROM payments WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 2️⃣ Communications & Logs

```sql
-- Vérifier qu'il n'y a plus de notifications
SELECT COUNT(*) FROM notifications WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de logs d'audit
SELECT COUNT(*) FROM audit_logs WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 3️⃣ Relations

```sql
-- Vérifier les relations classes-matières
SELECT COUNT(*) FROM class_subjects WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier les relations enseignants-matières
SELECT COUNT(*) FROM teacher_subjects WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier les relations parents-étudiants
SELECT COUNT(*) FROM parent_student_schools WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 4️⃣ Utilisateurs

```sql
-- Vérifier qu'il n'y a plus d'étudiants
SELECT COUNT(*) FROM students WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus d'enseignants
SELECT COUNT(*) FROM teachers WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de parents liés
SELECT COUNT(*) FROM parents 
WHERE id IN (
  SELECT parent_id FROM parent_student_schools 
  WHERE school_id = 'SCHOOL_ID'
);
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de secrétaires
SELECT COUNT(*) FROM secretaries WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 5️⃣ Configuration

```sql
-- Vérifier qu'il n'y a plus de matières
SELECT COUNT(*) FROM subjects WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de classes
SELECT COUNT(*) FROM classes WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus de périodes d'évaluation
SELECT COUNT(*) FROM evaluation_periods WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier qu'il n'y a plus d'années académiques
SELECT COUNT(*) FROM academic_years WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 6️⃣ Types

```sql
-- Vérifier les types de notes
SELECT COUNT(*) FROM grade_types WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier les types de présences
SELECT COUNT(*) FROM attendance_types WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier les types de paiements
SELECT COUNT(*) FROM payment_types WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier les rôles utilisateurs
SELECT COUNT(*) FROM user_roles WHERE school_id = 'SCHOOL_ID';
-- Résultat attendu : 0
```

#### 7️⃣ École & Directeur

```sql
-- Vérifier que l'école n'existe plus
SELECT COUNT(*) FROM schools WHERE id = 'SCHOOL_ID';
-- Résultat attendu : 0

-- Vérifier que le compte directeur n'existe plus
SELECT COUNT(*) FROM users WHERE id = 'USER_ID';
-- Résultat attendu : 0

-- Vérifier que le compte Auth n'existe plus
SELECT COUNT(*) FROM auth.users WHERE id = 'USER_ID';
-- Résultat attendu : 0
```

---

## 🔎 Requête de Vérification Globale

Utilisez cette requête pour vérifier TOUTES les tables en une seule fois :

```sql
-- Remplacer 'YOUR_SCHOOL_ID' par l'ID de votre école
WITH school_check AS (
  SELECT 'YOUR_SCHOOL_ID' AS school_id,
         'YOUR_USER_ID' AS user_id
)
SELECT 
  'grades' AS table_name,
  COUNT(*) AS remaining_records
FROM grades 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'attendances', COUNT(*) 
FROM attendances 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'payments', COUNT(*) 
FROM payments 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'notifications', COUNT(*) 
FROM notifications 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'audit_logs', COUNT(*) 
FROM audit_logs 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'class_subjects', COUNT(*) 
FROM class_subjects 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'teacher_subjects', COUNT(*) 
FROM teacher_subjects 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'parent_student_schools', COUNT(*) 
FROM parent_student_schools 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'students', COUNT(*) 
FROM students 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'teachers', COUNT(*) 
FROM teachers 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'secretaries', COUNT(*) 
FROM secretaries 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'subjects', COUNT(*) 
FROM subjects 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'classes', COUNT(*) 
FROM classes 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'evaluation_periods', COUNT(*) 
FROM evaluation_periods 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'academic_years', COUNT(*) 
FROM academic_years 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'grade_types', COUNT(*) 
FROM grade_types 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'attendance_types', COUNT(*) 
FROM attendance_types 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'payment_types', COUNT(*) 
FROM payment_types 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'user_roles', COUNT(*) 
FROM user_roles 
WHERE school_id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'schools', COUNT(*) 
FROM schools 
WHERE id = (SELECT school_id FROM school_check)

UNION ALL

SELECT 'users (directeur)', COUNT(*) 
FROM users 
WHERE id = (SELECT user_id FROM school_check);

-- Résultat attendu : 0 pour TOUTES les lignes
```

---

## 📊 Résultat Attendu

Toutes les requêtes ci-dessus doivent retourner **0 enregistrement**.

Si une requête retourne un nombre > 0, cela signifie que :
- ❌ La suppression n'est **pas complète**
- ⚠️ Des données **persistent** dans la base de données
- 🔧 Une **investigation technique** est nécessaire

---

## 🐛 Que Faire en Cas de Problème ?

### Si des données persistent après suppression :

1. **Copier les IDs**
   ```sql
   -- Identifier les enregistrements restants
   SELECT * FROM [table_name] WHERE school_id = 'SCHOOL_ID';
   ```

2. **Vérifier les contraintes**
   ```sql
   -- Vérifier les clés étrangères
   SELECT 
     tc.constraint_name, 
     tc.table_name, 
     kcu.column_name
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
     AND tc.table_name = '[table_name]';
   ```

3. **Suppression manuelle**
   ```sql
   -- ATTENTION : À utiliser UNIQUEMENT en dernier recours
   DELETE FROM [table_name] WHERE school_id = 'SCHOOL_ID';
   ```

4. **Contacter le support technique**
   - Fournir les résultats des requêtes ci-dessus
   - Indiquer les tables problématiques
   - Mentionner le nombre d'enregistrements restants

---

## 🔐 Vérification de Sécurité

### Vérifier que le compte Auth est supprimé

1. **Dans Supabase Dashboard :**
   - Aller dans `Authentication` > `Users`
   - Chercher l'email du directeur
   - Résultat attendu : **Aucun utilisateur trouvé**

2. **Tenter de se reconnecter :**
   - Aller sur la page de connexion
   - Entrer l'email et le mot de passe
   - Résultat attendu : **"Invalid login credentials"**

3. **Vérifier les sessions :**
   ```sql
   SELECT * FROM auth.sessions 
   WHERE user_id = 'USER_ID';
   -- Résultat attendu : 0 enregistrement
   ```

---

## ✅ Validation Finale

Une fois TOUTES les vérifications effectuées :

- [ ] Toutes les requêtes SQL retournent **0**
- [ ] Le compte Auth n'existe plus dans Supabase
- [ ] Impossible de se reconnecter avec l'email
- [ ] L'école n'apparaît plus dans la liste
- [ ] Aucun utilisateur lié n'existe dans la base
- [ ] Aucune donnée transactionnelle ne subsiste
- [ ] Aucune configuration ne persiste

**🎉 Si tous les points sont cochés : La suppression est COMPLÈTE et RÉUSSIE !**

---

## 📈 Statistiques de Suppression

Après une suppression réussie, vous devriez avoir :

```
📊 Statistiques de Suppression
================================

Tables vidées : 22/22 ✅
Utilisateurs supprimés : [N] étudiants + [N] enseignants + [N] parents + [N] secrétaires + 1 directeur
Notes supprimées : [N]
Présences supprimées : [N]
Paiements supprimés : [N]
Classes supprimées : [N]
Matières supprimées : [N]

Temps total : ~[X] secondes
Statut : ✅ SUCCÈS COMPLET
```

---

**Version :** 1.0.0  
**Dernière mise à jour :** 26 Octobre 2025  
**Usage :** Vérification post-suppression uniquement
