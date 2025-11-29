# 📁 Organisation du Projet EduTrack-CM

**Date:** 27 Octobre 2025  
**Version:** 2.0 - Documentation complète  
**Nettoyage effectué:** Organisation complète des migrations, scripts SQL et documentation

---

## 🗂️ Structure Complète du Projet

### 📂 **Racine du projet** `/`
Fichiers essentiels uniquement :
```
├── .env                          # 🔐 Configuration environnement (NE PAS COMMITER)
├── .gitignore                    # Git ignore
├── package.json                  # Dépendances NPM
├── package-lock.json             # Lock des dépendances
├── vite.config.mjs              # ⚡ Configuration Vite
├── tailwind.config.js           # 🎨 Configuration Tailwind CSS
├── postcss.config.js            # PostCSS
├── jsconfig.json                # Configuration JavaScript
├── index.html                   # Point d'entrée HTML
├── favicon.ico                  # Icône du site
├── README.md                    # 📚 DOCUMENTATION PRINCIPALE
└── PROJECT_ORGANIZATION.md      # 📋 Ce fichier
```

---

## 📚 Documentation (`/docs/`) - 20+ fichiers

### 📄 Index Documentation
- **`README.md`** - Index et guide de la documentation

### 🔧 Corrections & Nettoyage
- **`CORRECTIONS_GESTION_CLASSES.md`** - Fix bouton suppression classes + import supabase
- **`CLEANUP_SUMMARY.md`** - Résumé du nettoyage de projet

### 👥 Gestion des Comptes (6 fichiers)
- **`ACCOUNT_DELETION.md`** - Système général de suppression
- **`ACCOUNT_DELETION_ANALYTICS.md`** - Analytiques de suppression
- **`ACCOUNT_DELETION_AUDIT.md`** - Piste d'audit
- **`ACCOUNT_DELETION_COMPLETE_GUIDE.md`** - Guide complet
- **`ACCOUNT_DELETION_DATA_EXPORT.md`** - Export de données
- **`ACCOUNT_DELETION_TEACHER.md`** - Suppression enseignants

### 🎓 Système d'Année Scolaire
- **`ACADEMIC_YEAR_FIX_SUMMARY.md`** - Corrections année scolaire
- **`ACADEMIC_YEAR_MIGRATION.md`** - Guide de migration

### 🏫 Système Multi-Écoles
- **`MULTI_SCHOOL_PARENT_GUIDE.md`** - Guide parents multi-écoles
- **`MULTI_SCHOOL_TEACHER_GUIDE.md`** - Guide enseignants multi-écoles

### ⚙️ Systèmes Techniques
- **`DATA_MODE_SYSTEM.md`** - Système démo/production
- **`SCHOOL_TYPES.md`** - Types d'établissements camerounais

---

## 🗄️ Base de Données (`/database/`)

### 📄 Documentation Base de Données
- **`README.md`** - Guide structure et utilisation base de données
- **`MIGRATION_GUIDE.md`** - Guide d'application des migrations

### 📂 Migrations SQL (`/database/migrations/`) - 6 fichiers

#### Migrations Numérotées (à appliquer dans l'ordre)
1. **`01_initial_setup.sql`** 
   - Configuration initiale du schéma
   - Tables de base: schools, users, academic_years, classes

2. **`02_add_missing_columns_and_tables.sql`**
   - Ajout colonnes manquantes
   - Tables supplémentaires

3. **`03_create_enrollment_requests_table.sql`** ✅ NOUVEAU
   - Table enrollment_requests (29 colonnes)
   - 6 indexes de performance
   - 4 politiques RLS
   - Trigger auto-update

4. **`03_multi_school_parents_management.sql`**
   - Gestion parents multi-écoles
   - Relations parent-école

#### Migrations Spéciales
5. **`APPLY_THIS_IN_SUPABASE.sql`** 🔥 À APPLIQUER
   - Version simplifiée migration enrollment_requests
   - Prêt pour copier-coller dans Supabase SQL Editor

6. **`complete_edutrack_schema.sql`**
   - Schéma complet 23+ tables
   - Backup du schéma complet

### � Scripts SQL Utilitaires (`/database/sql/`) - 3 fichiers
- **`README.md`** - Guide scripts SQL
- **`FIX_TRIGGER_ONLY.sql`** - Fix trigger unique
- **`MIGRATION_COMPLETE_22_TABLES.sql`** - Migration complète 22 tables

### 📂 Diagnostics (`/database/diagnostics/`)
Scripts de diagnostic base de données

---

## � Scripts (`/scripts/`)

### 📄 Documentation Scripts
- **`README.md`** - Guide d'utilisation des scripts

### 📂 Archive (`/scripts/archive/`) - 10+ fichiers SQL archivés

#### Documentation Archive
- **`README.md`** - Index scripts archivés

#### Scripts d'Authentification
- **`auto_sync_supabase_auth.sql`** - Sync auto auth Supabase
- **`SOLUTION_RADICALE_AUTH.sql`** - Solution radicale auth
- **`SOLUTION_FINALE_SANS_RLS.sql`** - Solution sans RLS
- **`SOLUTION_DEFENSIVE.sql`** - Solution défensive
- **`SOLUTION_MINIMALE.sql`** - Solution minimale

#### Scripts de Permissions
- **`FIX_PERMISSIONS_403.sql`** - Fix erreurs 403
- **`fix_permissions_final.sql`** - Fix final permissions

#### Scripts de Diagnostic
- **`DIAGNOSTIC_TABLES.sql`** - Diagnostic tables
- **`DIAGNOSTIC_COMPLET.sql`** - Diagnostic complet
- **`DIAGNOSTIC_COLONNES.sql`** - Diagnostic colonnes

---

## 🔐 Supabase (`/supabase/`)

### 📄 Documentation Supabase
- **`README.md`** - Configuration et utilisation Supabase

### ⚙️ Configuration
- **`config.toml`** - Configuration Supabase locale

### 📂 Migrations Supabase (`/supabase/migrations/`) - 2 fichiers
- **`20250101000000_initial_schema.sql`** - Schéma initial Supabase
- **`20250102000000_auth_trigger.sql`** - Triggers authentification

### 📧 Templates Email (`/supabase/email-templates/`)
- **`README.md`** - Guide templates emails

---

## 🔷 Prisma (`/prisma/`)

### 📄 Documentation Prisma
- **`README.md`** - Configuration Prisma (si utilisé)

### ⚙️ Configuration
- **`schema.prisma`** - Schéma Prisma

### � Migrations Prisma (`/prisma/migrations/`)
- **`20250125000000_add_missing_columns_and_tables/migration.sql`**

---

## 💻 Code Source (`/src/`)

## 💻 Code Source (`/src/`)

### 📂 Components (`/src/components/`)
#### UI Components (`/src/components/ui/`)
- **`Button.jsx`** - Bouton réutilisable
- **`Input.jsx`** - Input avec validation
- **`Select.jsx`** - Select personnalisé
- **`Checkbox.jsx`** - Checkbox stylisé
- **`Header.jsx`** - En-tête application
- **`Sidebar.jsx`** - Menu latéral
- **`NotificationCenter.jsx`** - Centre de notifications
- **`AccessibilityControls.jsx`** - Contrôles accessibilité

#### Composants Généraux
- **`AppIcon.jsx`** - Icônes application
- **`AppImage.jsx`** - Images optimisées
- **`ErrorBoundary.jsx`** - Gestion erreurs React
- **`ScrollToTop.jsx`** - Scroll auto en haut

### 📂 Pages (`/src/pages/`)
#### Dashboard Directeur (`/src/pages/principal-dashboard/`)
- **`index.jsx`** - Page principale ✅ FIX: import supabase + refresh()
- **`components/SchoolYearValidationTab.jsx`** - ✅ Système enrollment_requests
- **`components/AnalyticsDashboard.jsx`** - Analytiques
- **`components/UserManagement.jsx`** - Gestion utilisateurs
- **`components/SystemConfiguration.jsx`** - Configuration
- **`components/SystemHealthMetrics.jsx`** - Métriques système
- **`components/AuditTrail.jsx`** - Piste d'audit
- **`components/SecurityMonitoring.jsx`** - Monitoring sécurité

#### Autres Dashboards
- **`admin-dashboard/`** - Dashboard administrateur
- **`teacher-dashboard/`** - Dashboard enseignant
- **`student-dashboard/`** - Dashboard élève
- **`parent-dashboard/`** - Dashboard parent
- **`secretary-dashboard/`** - Dashboard secrétaire

#### Systèmes de Gestion
- **`document-management-hub/`** - Gestion documents
- **`grade-management-system/`** - Gestion notes
- **`student-profile-management/`** - Profils élèves
- **`teacher-account-management/`** - Comptes enseignants
- **`teacher-assignment-system/`** - Affectations enseignants

#### Authentification
- **`login-authentication/`** - Système de connexion

### 📂 Services (`/src/services/`)
- **`productionDataService.js`** - ✅ Service Supabase principal (437 lignes)
  - Fonctions enrollment_requests (5 nouvelles)
- **`edutrackService.js`** - Service général EduTrack
- **`teacherService.js`** - Service enseignants
- **`documentService.js`** - Service documents

### 📂 Contexts (`/src/contexts/`)
- **`AuthContext.jsx`** - Contexte authentification

### 📂 Hooks (`/src/hooks/`)
- **`useEduTrackData.js`** - Hook données EduTrack

### 📂 Library (`/src/lib/`)
- **`supabase.js`** - Client Supabase configuré

### 📂 Styles (`/src/styles/`)
- **`index.css`** - Styles principaux
- **`tailwind.css`** - Import Tailwind

### 📂 Utils (`/src/utils/`)
- **`cn.js`** - Utilitaire classNames

---

## 📦 Public (`/public/`)

```
├── manifest.json              # Manifest PWA
├── robots.txt                 # Robots SEO
├── EduTrack-CM.ico           # Icône principale
└── assets/
    └── images/
        ├── mon_logo.png      # Logo EduTrack
        └── no_image.png      # Image placeholder
```

---

## 🎯 Fichiers Récemment Déplacés

| Fichier | Ancien emplacement | Nouvel emplacement | Date |
|---------|-------------------|-------------------|------|
| `APPLY_THIS_IN_SUPABASE.sql` | `/` | `/database/migrations/` | 27/10/2025 |
| `CLEANUP_SUMMARY.md` | `/` | `/docs/` | 27/10/2025 |
| `CORRECTIONS_GESTION_CLASSES.md` | `/` | `/docs/` | 27/10/2025 |

---

## 📋 README.md - Index Complet

### 📚 README Principal
**`/README.md`** - Documentation principale du projet EduTrack-CM
- Vue d'ensemble du projet
- Installation et configuration
- Architecture technique
- Guide de démarrage rapide

### 📚 README par Section

#### Base de Données
- **`/database/README.md`** - Structure et gestion de la base de données
- **`/database/sql/README.md`** - Scripts SQL utilitaires

#### Documentation
- **`/docs/README.md`** - Index de toute la documentation technique

#### Scripts
- **`/scripts/README.md`** - Guide d'utilisation des scripts
- **`/scripts/archive/README.md`** - Index des scripts archivés

#### Supabase
- **`/supabase/README.md`** - Configuration et utilisation Supabase
- **`/supabase/email-templates/README.md`** - Templates emails

#### Prisma
- **`/prisma/README.md`** - Configuration Prisma (si utilisé)

---

## ✅ Règles d'Organisation

### ❌ À NE PAS mettre dans la racine
- ❌ Fichiers de documentation (`.md`) → `/docs/`
- ❌ Scripts SQL (`.sql`) → `/database/migrations/` ou `/database/sql/`
- ❌ Scripts de test ou diagnostic → `/scripts/` ou `/scripts/archive/`
- ❌ Fichiers temporaires
- ❌ Fichiers de backup

### ✅ Seuls les fichiers essentiels en racine
- ✅ Configuration de build (vite, tailwind, postcss)
- ✅ Configuration package (package.json)
- ✅ Point d'entrée (index.html)
- ✅ README principal
- ✅ Variables d'environnement (.env)
- ✅ Git (.gitignore)

### 📂 Où mettre les nouveaux fichiers ?

| Type de fichier | Destination | Exemple |
|----------------|-------------|---------|
| Migration SQL | `/database/migrations/` | `04_add_new_table.sql` |
| Script SQL diagnostic | `/database/sql/` | `fix_data_issue.sql` |
| Documentation technique | `/docs/` | `NEW_FEATURE_GUIDE.md` |
| Script Node.js | `/scripts/` | `migrate-data.js` |
| Script obsolète | `/scripts/archive/` | `old_fix.sql` |
| Composant React | `/src/components/` | `NewComponent.jsx` |
| Service API | `/src/services/` | `newService.js` |
| Hook personnalisé | `/src/hooks/` | `useNewFeature.js` |
| Image/Asset | `/public/assets/` | `logo.png` |

---

## 📊 Statistiques du Projet

### 🗄️ Base de Données
- **23+ tables** dans Supabase
- **6 migrations** numérotées
- **3 scripts SQL** utilitaires
- **10+ scripts** archivés

### 📚 Documentation
- **20+ fichiers** de documentation
- **8 README.md** dans différents dossiers
- **6 guides** de gestion de comptes
- **2 guides** multi-écoles

### 💻 Code Source
- **50+ composants** React
- **10+ pages** application
- **4 services** API
- **3 hooks** personnalisés
- **8 dashboards** différents

### 🔐 Sécurité
- **RLS activé** sur toutes les tables
- **4 politiques** sur enrollment_requests
- **Filtrage** par school_id automatique
- **Authentification** Supabase Auth

---

## 🚀 Guide pour Développeurs

### Ajouter une nouvelle migration
1. Créer fichier: `/database/migrations/0X_description.sql`
2. Numéroter dans l'ordre (04, 05, etc.)
3. Documenter dans `/database/MIGRATION_GUIDE.md`
4. Tester en dev avant production

### Ajouter de la documentation
1. Créer fichier: `/docs/FEATURE_NAME.md`
2. Ajouter dans `/docs/README.md`
3. Utiliser format markdown
4. Inclure exemples de code

### Ajouter un script
1. Si actif: `/scripts/nom-script.js`
2. Si obsolète: `/scripts/archive/nom-script.js`
3. Documenter dans `/scripts/README.md`
4. Ajouter instructions d'utilisation

### Workflow Git
```bash
# Vérifier fichiers non trackés
git status

# Ajouter uniquement code source
git add src/

# Ne PAS commiter
git add .env              # ❌ Jamais
git add node_modules/     # ❌ Jamais
```

---

## 📝 Notes Importantes

### 🔥 Migrations en Attente
- ⚠️ **`APPLY_THIS_IN_SUPABASE.sql`** - À appliquer dans Supabase SQL Editor
- Crée table `enrollment_requests` avec 29 colonnes
- Ajoute 6 indexes et 4 politiques RLS
- **REQUIS** pour système de demandes d'inscription

### ✅ Corrections Récentes
- Fix bouton suppression classes (import supabase + refresh())
- Système enrollment_requests complet (table + services + UI)
- Remplacement données fictives par "En développement"
- Organisation fichiers racine

### 📌 Prochaines Étapes
- [ ] Tester système enrollment_requests en production
- [ ] Implémenter "Passages de classe"
- [ ] Implémenter "Configuration année"
- [ ] Ajouter export demandes validées

---

**Dernière mise à jour:** 27 Octobre 2025  
**Mainteneur:** EduTrack-CM Development Team

---

## 📖 Vue d'Ensemble Arborescente Complète

```
EduTrack-CM/
│
├── 📄 Configuration & Build
│   ├── .env                          # 🔐 Variables environnement (NON VERSIONNÉ)
│   ├── .gitignore
│   ├── package.json                  # Dépendances NPM
│   ├── package-lock.json
│   ├── vite.config.mjs              # ⚡ Vite
│   ├── tailwind.config.js           # 🎨 Tailwind
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── index.html
│   └── favicon.ico
│
├── 📚 Documentation Racine
│   ├── README.md                     # 📚 DOCUMENTATION PRINCIPALE
│   └── PROJECT_ORGANIZATION.md       # 📋 Ce document
│
├── 📂 docs/                          # 📚 TOUTE LA DOCUMENTATION
│   ├── README.md
│   │
│   ├── 🔧 Corrections
│   │   ├── CORRECTIONS_GESTION_CLASSES.md
│   │   └── CLEANUP_SUMMARY.md
│   │
│   ├── 👥 Comptes (6 fichiers)
│   │   ├── ACCOUNT_DELETION.md
│   │   ├── ACCOUNT_DELETION_ANALYTICS.md
│   │   ├── ACCOUNT_DELETION_AUDIT.md
│   │   ├── ACCOUNT_DELETION_COMPLETE_GUIDE.md
│   │   ├── ACCOUNT_DELETION_DATA_EXPORT.md
│   │   └── ACCOUNT_DELETION_TEACHER.md
│   │
│   ├── 🎓 Année Scolaire
│   │   ├── ACADEMIC_YEAR_FIX_SUMMARY.md
│   │   └── ACADEMIC_YEAR_MIGRATION.md
│   │
│   ├── 🏫 Multi-Écoles
│   │   ├── MULTI_SCHOOL_PARENT_GUIDE.md
│   │   └── MULTI_SCHOOL_TEACHER_GUIDE.md
│   │
│   └── ⚙️ Systèmes
│       ├── DATA_MODE_SYSTEM.md
│       └── SCHOOL_TYPES.md
│
├── 📂 database/                      # 🗄️ GESTION BASE DE DONNÉES
│   ├── README.md
│   ├── MIGRATION_GUIDE.md
│   │
│   ├── 📂 migrations/               # 🔥 MIGRATIONS SQL (6 fichiers)
│   │   ├── 01_initial_setup.sql
│   │   ├── 02_add_missing_columns_and_tables.sql
│   │   ├── 03_create_enrollment_requests_table.sql    # ✅ NOUVEAU
│   │   ├── 03_multi_school_parents_management.sql
│   │   ├── APPLY_THIS_IN_SUPABASE.sql                # 🔥 À APPLIQUER
│   │   └── complete_edutrack_schema.sql
│   │
│   ├── 📂 sql/                      # Scripts SQL utilitaires
│   │   ├── README.md
│   │   ├── FIX_TRIGGER_ONLY.sql
│   │   └── MIGRATION_COMPLETE_22_TABLES.sql
│   │
│   └── 📂 diagnostics/              # Scripts diagnostic
│
├── 📂 scripts/                       # 🔧 SCRIPTS UTILITAIRES
│   ├── README.md
│   │
│   └── 📂 archive/                  # Scripts archivés (10+ fichiers)
│       ├── README.md
│       ├── auto_sync_supabase_auth.sql
│       ├── FIX_PERMISSIONS_403.sql
│       ├── fix_permissions_final.sql
│       ├── DIAGNOSTIC_TABLES.sql
│       ├── DIAGNOSTIC_COMPLET.sql
│       ├── DIAGNOSTIC_COLONNES.sql
│       ├── SOLUTION_MINIMALE.sql
│       ├── SOLUTION_FINALE_SANS_RLS.sql
│       ├── SOLUTION_RADICALE_AUTH.sql
│       └── SOLUTION_DEFENSIVE.sql
│
├── 📂 supabase/                      # 🔐 CONFIGURATION SUPABASE
│   ├── README.md
│   ├── config.toml
│   │
│   ├── 📂 migrations/
│   │   ├── 20250101000000_initial_schema.sql
│   │   └── 20250102000000_auth_trigger.sql
│   │
│   └── 📂 email-templates/
│       └── README.md
│
├── 📂 prisma/                        # 🔷 CONFIGURATION PRISMA
│   ├── README.md
│   ├── schema.prisma
│   │
│   └── 📂 migrations/
│       └── 20250125000000_add_missing_columns_and_tables/
│           └── migration.sql
│
├── 📂 src/                           # 💻 CODE SOURCE
│   ├── index.jsx
│   ├── App.jsx
│   ├── Routes.jsx
│   │
│   ├── 📂 components/               # Composants réutilisables
│   │   ├── AppIcon.jsx
│   │   ├── AppImage.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ScrollToTop.jsx
│   │   │
│   │   └── 📂 ui/                   # UI Components
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       ├── Checkbox.jsx
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       ├── NotificationCenter.jsx
│   │       └── AccessibilityControls.jsx
│   │
│   ├── 📂 pages/                    # Pages application
│   │   ├── NotFound.jsx
│   │   ├── login-authentication/
│   │   │
│   │   ├── 📂 principal-dashboard/  # ✅ FIX RÉCENTS
│   │   │   ├── index.jsx            # Fix import supabase + refresh()
│   │   │   └── components/
│   │   │       ├── SchoolYearValidationTab.jsx  # ✅ enrollment_requests
│   │   │       ├── AnalyticsDashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── SystemConfiguration.jsx
│   │   │       ├── SystemHealthMetrics.jsx
│   │   │       ├── AuditTrail.jsx
│   │   │       └── SecurityMonitoring.jsx
│   │   │
│   │   ├── admin-dashboard/
│   │   ├── teacher-dashboard/
│   │   ├── student-dashboard/
│   │   ├── parent-dashboard/
│   │   ├── secretary-dashboard/
│   │   ├── document-management-hub/
│   │   ├── document-management-center/
│   │   ├── grade-management-system/
│   │   ├── student-profile-management/
│   │   ├── teacher-account-management/
│   │   └── teacher-assignment-system/
│   │
│   ├── 📂 services/                 # Services API
│   │   ├── productionDataService.js    # ✅ +5 fonctions enrollment
│   │   ├── edutrackService.js
│   │   ├── teacherService.js
│   │   └── documentService.js
│   │
│   ├── 📂 contexts/
│   │   └── AuthContext.jsx
│   │
│   ├── 📂 hooks/
│   │   └── useEduTrackData.js
│   │
│   ├── 📂 lib/
│   │   └── supabase.js              # Client Supabase
│   │
│   ├── 📂 styles/
│   │   ├── index.css
│   │   └── tailwind.css
│   │
│   └── 📂 utils/
│       └── cn.js
│
└── 📂 public/                        # 📦 RESSOURCES STATIQUES
    ├── manifest.json
    ├── robots.txt
    ├── EduTrack-CM.ico
    └── assets/
        └── images/
            ├── mon_logo.png
            └── no_image.png
```
- Configuration du projet (`package.json`, `vite.config.mjs`, etc.)
- Point d'entrée (`index.html`)
- README principal
- Configuration environnement (`.env`, `.gitignore`)

---

## 📝 Dernières Modifications

### 27 Octobre 2025
- ✅ Nettoyage du dossier racine
- ✅ Déplacement documentation vers `/docs/`
- ✅ Déplacement migrations SQL vers `/database/migrations/`
- ✅ Création table `enrollment_requests` dans Supabase
- ✅ Mise à jour `productionDataService.js` avec fonctions enrollment
- ✅ Modification `SchoolYearValidationTab.jsx` pour utiliser vraies données
- ✅ Masquage des onglets fictifs (Passages, Configuration)

---

## 🚀 Pour les Développeurs

### Ajouter une migration SQL
```bash
# 1. Créer le fichier dans database/migrations/
# 2. Nommer avec numéro séquentiel: 04_nom_migration.sql
# 3. Appliquer dans Supabase SQL Editor
# 4. Documenter dans ce README
```

### Ajouter de la documentation
```bash
# 1. Créer le .md dans docs/
# 2. Utiliser un nom descriptif en MAJUSCULES
# 3. Ajouter une entrée dans ce README
```

### Créer un script de maintenance
```bash
# 1. Créer le .js dans scripts/
# 2. Ajouter les dépendances dans package.json si nécessaire
# 3. Documenter l'usage dans scripts/README.md
```

---

## 📊 Statistiques du Projet

- **Tables Supabase:** 23+ (incluant enrollment_requests)
- **Composants React:** 50+
- **Pages:** 10+
- **Fichiers de documentation:** 20+
- **Migrations SQL:** 6

---

**Maintenu par:** GitHub Copilot  
**Dernière mise à jour:** 27 Octobre 2025
