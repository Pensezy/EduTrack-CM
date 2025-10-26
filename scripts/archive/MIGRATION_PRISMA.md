# 🚀 Migration Prisma pour EduTrack-CM

## Problème de connexion résolu

Le problème de connexion Prisma à Supabase est souvent causé par :
1. **Firewall/Réseau** : Certains réseaux bloquent les connexions directes à Supabase
2. **Caractères spéciaux** dans le mot de passe (comme `#`)
3. **Configuration DNS** ou problèmes de résolution d'hôte

## 🎯 Solution : Migration manuelle via Dashboard Supabase

### Étape 1: Accéder au Dashboard Supabase
1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet `vrjdglwowrileoyrhoof`
4. Cliquez sur **"SQL Editor"** dans le menu de gauche

### Étape 2: Appliquer la migration
1. Dans l'éditeur SQL, **collez le contenu** du fichier :
   ```
   prisma/migrations/20250125000000_add_missing_columns_and_tables/migration.sql
   ```
2. Cliquez sur **"Run"** pour exécuter la migration

### Étape 3: Vérifier la migration
Après exécution, lancez cette requête pour vérifier :

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'subjects', 'classes') 
AND column_name IN ('photo', 'category', 'capacity', 'current_enrollment')
ORDER BY table_name, column_name;

-- Vérifier les nouvelles tables
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('evaluation_periods', 'grade_types', 'user_roles', 'attendance_types', 'payment_types')
ORDER BY table_name;

-- Compter les enregistrements (devrait être 0 pour l'instant)
SELECT 
    'evaluation_periods' as table_name, COUNT(*) as count FROM evaluation_periods
UNION ALL
SELECT 'grade_types', COUNT(*) FROM grade_types
UNION ALL  
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'attendance_types', COUNT(*) FROM attendance_types
UNION ALL
SELECT 'payment_types', COUNT(*) FROM payment_types;
```

## 🛠 Alternative : Script PowerShell (si psql installé)

Si vous avez PostgreSQL installé localement, vous pouvez utiliser :

```powershell
.\apply-migration.ps1
```

## 📋 Contenu de la migration

Cette migration ajoute :

### Nouvelles colonnes :
- `users.photo` (TEXT) - Photo de profil utilisateur
- `subjects.category` (TEXT DEFAULT 'general') - Catégorie de matière  
- `classes.capacity` (INTEGER) - Capacité maximale de la classe
- `classes.current_enrollment` (INTEGER DEFAULT 0) - Nombre d'élèves inscrits

### Nouvelles tables :
- `evaluation_periods` - Périodes d'évaluation (trimestres/semestres)
- `grade_types` - Types de notes configurables
- `user_roles` - Rôles utilisateur personnalisés
- `attendance_types` - Types de présence configurables  
- `payment_types` - Types de paiements configurables

### Relations et contraintes :
- Clés étrangères vers `schools` et `academic_years`
- Index pour optimiser les performances
- Contraintes uniques pour éviter les doublons

## ✅ Après la migration

1. **Redémarrez l'application** React
2. **Testez la création d'école** - les nouvelles configurations seront automatiquement initialisées
3. **Vérifiez les dashboards** - ils devraient maintenant afficher les vraies données

## 🆘 Support

Si la migration échoue :
1. Vérifiez les logs d'erreur dans Supabase
2. Assurez-vous que votre compte a les droits administrateur
3. Contactez le support si les tables de base (`schools`, `users`, etc.) n'existent pas

La migration utilise `IF NOT EXISTS` pour être sûre - elle ne cassera rien si certaines colonnes/tables existent déjà.