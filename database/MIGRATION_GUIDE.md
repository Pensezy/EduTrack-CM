# Guide de Migration EduTrack-CM

## Étapes pour appliquer la migration de base de données

### Option 1: Migration Prisma (Recommandée)
Si la connexion Supabase fonctionne :

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Créer et appliquer la migration
npx prisma migrate dev --name "add_missing_columns_and_tables"

# 3. Synchroniser le schéma si nécessaire
npx prisma db push
```

### Option 2: Migration SQL manuelle
Si la connexion Prisma ne fonctionne pas :

1. **Connectez-vous à votre dashboard Supabase** : https://supabase.com/dashboard
2. **Allez dans l'éditeur SQL** de votre projet
3. **Copiez et exécutez le contenu** du fichier `database/migrations/02_add_missing_columns_and_tables.sql`

### Option 3: Via l'interface web Supabase
1. Ouvrez votre projet Supabase
2. Allez dans "SQL Editor"
3. Collez le contenu du fichier de migration
4. Cliquez sur "Run" pour exécuter

## Changements apportés par cette migration

### Colonnes ajoutées :
- **users.photo** (TEXT) : Pour stocker l'URL/chemin de la photo de profil
- **subjects.category** (TEXT) : Pour catégoriser les matières (général, sciences, langues, etc.)
- **classes.capacity** (INTEGER) : Capacité maximale de la classe
- **classes.current_enrollment** (INTEGER) : Nombre actuel d'élèves inscrits

### Nouvelles tables créées :
- **evaluation_periods** : Gestion des trimestres/semestres
- **grade_types** : Configuration des types de notes (interrogation, devoir, composition)
- **user_roles** : Rôles personnalisés par école
- **attendance_types** : Types de présence personnalisables
- **payment_types** : Types de paiements configurables

### Données par défaut ajoutées :
- Types de notes standards (Interrogation, Devoir, Composition)
- Types de présence (Présent, Absent, Absent Justifié, Retard)
- Rôles utilisateur de base (Directeur, Enseignant, Secrétaire)

## Vérification après migration

Pour vérifier que la migration s'est bien passée, exécutez cette requête :

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('users', 'subjects', 'classes') 
AND column_name IN ('photo', 'category', 'capacity', 'current_enrollment');

-- Vérifier les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('evaluation_periods', 'grade_types', 'user_roles', 'attendance_types', 'payment_types');

-- Compter les données par défaut
SELECT 
    (SELECT COUNT(*) FROM grade_types) as grade_types_count,
    (SELECT COUNT(*) FROM attendance_types) as attendance_types_count,
    (SELECT COUNT(*) FROM user_roles) as user_roles_count;
```

## Résolution des problèmes

### Si la migration échoue :
1. Vérifiez votre connexion Supabase
2. Assurez-vous que vous avez les droits administrateur sur la base
3. Vérifiez que les tables référencées (schools, academic_years, etc.) existent
4. Consultez les logs d'erreur pour identifier le problème spécifique

### Si certaines colonnes existent déjà :
La migration utilise des conditions `IF NOT EXISTS` pour éviter les erreurs si certaines colonnes ou tables existent déjà.

### Pour annuler la migration :
```sql
-- Supprimer les nouvelles tables (ATTENTION: perte de données)
DROP TABLE IF EXISTS payment_types CASCADE;
DROP TABLE IF EXISTS attendance_types CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS grade_types CASCADE;
DROP TABLE IF EXISTS evaluation_periods CASCADE;

-- Supprimer les nouvelles colonnes (ATTENTION: perte de données)
ALTER TABLE users DROP COLUMN IF EXISTS photo;
ALTER TABLE subjects DROP COLUMN IF EXISTS category;
ALTER TABLE classes DROP COLUMN IF EXISTS capacity;
ALTER TABLE classes DROP COLUMN IF EXISTS current_enrollment;
```

## Prochaines étapes

Après avoir appliqué cette migration :

1. **Redémarrez votre application** React pour prendre en compte les changements
2. **Testez les fonctionnalités** qui utilisent ces nouvelles tables/colonnes  
3. **Configurez les données par défaut** selon vos besoins spécifiques
4. **Mettez à jour la documentation** de votre API si nécessaire

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de votre application
2. Consultez les logs Supabase dans le dashboard
3. Assurez-vous que tous les services Supabase sont actifs