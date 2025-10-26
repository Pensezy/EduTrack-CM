# Supabase Configuration - EduTrack-CM

Ce dossier contient la configuration Supabase pour le projet EduTrack-CM, incluant les migrations SQL, les templates email et les paramètres du CLI.

## 📁 Structure

```
supabase/
├── migrations/                    # Migrations SQL Supabase
│   ├── 20250101000000_initial_schema.sql    # Schéma complet (22 tables)
│   └── 20250102000000_auth_trigger.sql      # Trigger d'authentification
├── email-templates/               # Templates d'emails personnalisés
│   ├── confirm-signup.html        # Email de confirmation d'inscription
│   ├── README.md                  # Guide d'utilisation des templates
│   └── CONFIGURATION.md           # Instructions de configuration
└── .temp/                         # Fichiers temporaires Supabase CLI
    ├── project-ref                # Référence du projet
    ├── pooler-url                 # URL de connexion poolée
    └── ...                        # Versions des services
```

## 🗄️ Migrations SQL

### 20250101000000_initial_schema.sql

Crée toutes les **22 tables** du schéma EduTrack-CM :

**Tables principales :**
- `users` - Utilisateurs du système
- `schools` - Établissements scolaires
- `academic_years` - Années académiques
- `classes` - Classes/salles de cours
- `subjects` - Matières enseignées

**Tables de gestion :**
- `teachers` - Enseignants
- `students` - Étudiants
- `parents` - Parents d'élèves
- `secretaries` - Secrétaires

**Tables relationnelles :**
- `parent_student_schools` - Relation N-N-N (parent-étudiant-école)
- `teacher_subjects` - Matières assignées aux enseignants
- `class_subjects` - Matières par classe

**Tables de données :**
- `grades` - Notes des étudiants
- `attendances` - Présences
- `payments` - Paiements
- `notifications` - Notifications système
- `audit_logs` - Journaux d'audit

**Tables de configuration :**
- `evaluation_periods` - Périodes d'évaluation (trimestres/semestres)
- `grade_types` - Types de notes (Devoir, Interrogation, Examen, etc.)
- `attendance_types` - Types de présence (Présent, Absent, Retard, etc.)
- `payment_types` - Types de paiement (Frais de scolarité, Inscription, etc.)
- `user_roles` - Rôles utilisateur avec permissions

### 20250102000000_auth_trigger.sql

Configure le **trigger d'authentification automatique** :

**Fonctionnalités :**
- ✅ Insertion automatique dans `users` après signup Supabase Auth
- ✅ Création automatique de l'école pour les directeurs
- ✅ Génération de l'année académique courante
- ✅ Initialisation des types par défaut (notes, présences, paiements)
- ✅ Configuration des périodes d'évaluation (trimestres/semestres)
- ✅ Création des rôles utilisateur avec permissions

**Configuration technique :**
- `SECURITY DEFINER` - Permissions élevées pour créer dans toutes les tables
- `SET search_path = public, auth` - Accès aux schémas public et auth
- RLS désactivé sur 8 tables pour éviter les conflits
- Gestion des erreurs sans bloquer la création de compte

## 📧 Email Templates

### confirm-signup.html

Template email personnalisé pour la confirmation d'inscription :

**Design :**
- 🎨 Header avec branding EduTrack-CM (gradient bleu)
- 📋 Badge de bienvenue
- 🔘 Bouton CTA proéminent
- 📊 Récapitulatif des informations du compte
- 📚 Liste des fonctionnalités disponibles
- 🔒 Note de sécurité (lien valide 24h)
- 📱 Responsive pour mobile et desktop

**Variables Supabase :**
- `{{ .Name }}` - Nom complet de l'utilisateur
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .ConfirmationURL }}` - Lien de confirmation unique
- `{{ .SiteURL }}` - URL du site
- `{{ .CreatedAt }}` - Date de création du compte

### Configuration dans Supabase

1. **Dashboard Supabase** → Settings → Authentication → Email Templates
2. **Confirm signup** :
   - Subject: `🎓 EduTrack-CM : Confirmez votre compte de directeur d'établissement`
   - Body: Coller le contenu de `confirm-signup.html`
3. **From Name**: `EduTrack-CM`
4. **From Email**: `noreply@votre-domaine.com`

Consultez `email-templates/CONFIGURATION.md` pour les instructions détaillées.

## 🔧 Configuration CLI Supabase

### Fichiers .temp/

Ces fichiers sont générés automatiquement par Supabase CLI :

- `project-ref` - ID du projet Supabase (cgpkhtksdcxtlyprerbj)
- `pooler-url` - URL de connexion poolée (port 6543)
- `postgres-version` - Version PostgreSQL (17.6.1.005)
- `cli-latest` - Version CLI (v2.45.5)
- `gotrue-version` - Version Auth (v2.179.0)
- `rest-version` - Version REST API (v13.0.5)
- `storage-version` - Version Storage

⚠️ **Ne pas commiter ces fichiers** (déjà dans .gitignore)

## 🚀 Utilisation

### Appliquer les migrations

**Option 1 : Via Supabase SQL Editor (Recommandé)**
```sql
-- 1. Copier le contenu de 20250101000000_initial_schema.sql
-- 2. Coller dans SQL Editor et exécuter
-- 3. Copier le contenu de 20250102000000_auth_trigger.sql
-- 4. Coller dans SQL Editor et exécuter
```

**Option 2 : Via Supabase CLI**
```bash
# Initialiser Supabase localement
supabase init

# Lier au projet distant
supabase link --project-ref cgpkhtksdcxtlyprerbj

# Appliquer les migrations
supabase db push
```

### Synchroniser avec Prisma

Après avoir appliqué les migrations Supabase :

```bash
# Récupérer le schéma depuis Supabase
npx prisma db pull

# Générer le client Prisma
npx prisma generate
```

## 🔄 Workflow Complet

### 1. Nouvelle Installation

```bash
# 1. Appliquer les migrations Supabase
# Via SQL Editor : exécuter 20250101000000_initial_schema.sql
# Puis exécuter : 20250102000000_auth_trigger.sql

# 2. Synchroniser Prisma
npx prisma db pull
npx prisma generate

# 3. Configurer les email templates dans Supabase Dashboard
```

### 2. Modifications du Schéma

**Approche recommandée :**

1. **Créer une migration SQL** dans `supabase/migrations/`
   ```sql
   -- 20250103000000_add_new_feature.sql
   ALTER TABLE students ADD COLUMN photo_url TEXT;
   ```

2. **Appliquer dans Supabase SQL Editor**

3. **Synchroniser Prisma**
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

4. **Documenter dans `database/README.md`**

## 📚 Documentation Connexe

- **[database/README.md](../database/README.md)** - Documentation complète des 22 tables
- **[docs/SUPABASE_AUTH.md](../docs/SUPABASE_AUTH.md)** - Configuration de l'authentification
- **[docs/PRISMA_MIGRATION.md](../docs/PRISMA_MIGRATION.md)** - Architecture hybride
- **[prisma/README.md](../prisma/README.md)** - Workflow Prisma

## 🔐 Sécurité

### Row Level Security (RLS)

**État actuel :** Désactivé sur 8 tables en développement

**Tables sans RLS :**
- users, schools, academic_years
- grade_types, attendance_types, payment_types
- evaluation_periods, user_roles

**Avant la production :**
1. Activer RLS sur toutes les tables sensibles
2. Créer les policies appropriées par rôle
3. Tester l'accès pour chaque type d'utilisateur

Consultez `docs/SUPABASE_AUTH.md` pour les détails.

## 🧪 Test

### Vérifier les migrations

```sql
-- Lister toutes les tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Vérifier le trigger
SELECT tgname, tgrelid::regclass, tgfoid::regproc 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Compter les enregistrements
SELECT 
  'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'schools', COUNT(*) FROM schools
UNION ALL
SELECT 'academic_years', COUNT(*) FROM academic_years;
```

### Tester la création de compte

1. Créer un compte directeur via l'interface
2. Vérifier dans Supabase Auth que l'utilisateur existe
3. Vérifier dans la table `users` que l'enregistrement est créé
4. Vérifier que l'école, l'année académique et les types sont créés

## 🤝 Contribution

Pour ajouter de nouvelles migrations :

1. Créer un fichier `YYYYMMDDHHMMSS_description.sql`
2. Documenter les changements dans ce README
3. Tester la migration sur un environnement de dev
4. Appliquer en production
5. Synchroniser Prisma

---

**Dernière mise à jour :** Octobre 2025  
**Version Supabase CLI :** v2.45.5  
**Version PostgreSQL :** 17.6.1.005  
**Projet Supabase :** cgpkhtksdcxtlyprerbj
