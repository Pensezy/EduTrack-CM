# � Base de Données EduTrack CM

## 📁 Structure du dossier

```
database/
├── sql/                       # Scripts SQL principaux
│   ├── FIX_TRIGGER_ONLY.sql              # Trigger d'authentification (10.5 KB)
│   ├── MIGRATION_COMPLETE_22_TABLES.sql  # Schéma complet (31.8 KB)
│   └── README.md                         # Documentation SQL
├── migrations/
│   └── 01_initial_setup.sql   # Version propre du trigger
└── README.md                  # Ce fichier
```

## � Installation de la Base de Données

### Première Installation

1. **Exécuter le schéma complet** dans Supabase SQL Editor :
   ```sql
   -- Copier le contenu de sql/MIGRATION_COMPLETE_22_TABLES.sql
   -- Exécuter dans Supabase SQL Editor
   ```

2. **Configurer le trigger d'authentification** :
   ```sql
   -- Copier le contenu de sql/FIX_TRIGGER_ONLY.sql
   -- Exécuter dans Supabase SQL Editor
   ```

3. **Synchroniser Prisma** :
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

Consultez `sql/README.md` pour plus de détails sur les scripts SQL.

## �🔍 Diagnostic de la Base de Données

### Vérifier l'état actuel

Pour diagnostiquer votre base de données Supabase :

1. Ouvrez **Supabase SQL Editor** : https://supabase.com/dashboard
2. Copiez-collez le contenu de `diagnostics/database_check.sql`
3. Exécutez le script

### Informations affichées

Le script de diagnostic vous montrera :

- ✅ **Tables existantes** dans le schéma `public`
- ✅ **Colonnes détaillées** des tables principales (users, schools, subjects, classes)
- ✅ **Tables manquantes** par rapport au schéma complet
- ✅ **Politiques RLS** actives
- ✅ **Contenu des écoles** (10 dernières créées)
- ✅ **Statistiques générales** (nombre d'enregistrements par table)

## 🗄️ Schéma de Base de Données

### Tables principales (22 tables)

#### Core
- `users` - Utilisateurs (directeurs, enseignants, secrétaires, élèves, parents)
- `schools` - Établissements scolaires
- `academic_years` - Années académiques

#### Académique
- `classes` - Classes (6ème, 5ème, etc.)
- `subjects` - Matières enseignées
- `teachers` - Enseignants
- `students` - Élèves
- `class_subjects` - Association classes ↔ matières
- `teacher_subjects` - Association enseignants ↔ matières

#### Évaluation
- `grades` - Notes des élèves
- `grade_types` - Types de notes (Devoir, Interrogation, Examen, etc.)
- `evaluation_periods` - Périodes d'évaluation (Trimestres/Semestres)

#### Présence
- `attendances` - Présences/absences
- `attendance_types` - Types de présence (Présent, Absent, Retard, Excusé)

#### Finance
- `payments` - Paiements effectués
- `payment_types` - Types de paiements (Scolarité, Inscription, Uniforme, etc.)

#### Relations
- `parents` - Informations des parents
- `parent_student_schools` - Liaison parents ↔ élèves ↔ écoles (multi-école)

#### Administration
- `secretaries` - Secrétaires
- `user_roles` - Rôles utilisateur personnalisés
- `notifications` - Notifications système
- `audit_logs` - Journal d'audit

## � Configuration Automatique

Lors de la création d'un compte directeur, le système initialise automatiquement :

### 📅 Année académique
- Format : `2025-2026`
- Dates : 01 septembre → 31 juillet

### 📝 Types de notes (5 types)
| Type | Code | Coefficient |
|------|------|-------------|
| Devoir | HOMEWORK | 0.3 |
| Interrogation | QUIZ | 0.2 |
| Examen | EXAM | 0.5 |
| Projet | PROJECT | 0.4 |
| Participation | PARTICIPATION | 0.1 |

### 👥 Types de présence (4 types)
- Present
- Absent
- Retard
- Absent Excusé

### 💰 Types de paiement (6 types)
- Frais de scolarité
- Frais d'inscription
- Uniforme
- Livres
- Cantine
- Transport

### 📊 Périodes d'évaluation
**Primaire/Collège** : 3 trimestres
- 1er Trimestre : 01 sept → 15 déc
- 2e Trimestre : 16 déc → 31 mars
- 3e Trimestre : 01 avril → 15 juillet

**Lycée** : 2 semestres
- 1er Semestre : 01 sept → 31 janvier
- 2e Semestre : 01 février → 15 juillet

### 🔐 Rôles utilisateur (6 rôles)
- Administrateur (tous les droits)
- Directeur (gestion école, enseignants, élèves, rapports)
- Enseignant (gestion classes, notes, consultation élèves)
- Secrétaire (gestion élèves, paiements, rapports)
- Parent (consultation enfants, notes, présences)
- Élève (consultation notes personnelles, présences)

## 🔒 Sécurité

- **RLS (Row Level Security)** : Désactivé en développement
- **Trigger automatique** : `on_auth_user_created` avec `SECURITY DEFINER`
- **Validation des données** : Contraintes UNIQUE, NOT NULL, FOREIGN KEY

## 🚀 Maintenance

### En cas de problème

1. Exécutez `diagnostics/database_check.sql` pour identifier le problème
2. Vérifiez les logs Supabase
3. Consultez la documentation Supabase

### Scripts de référence

Les scripts de migration complets sont disponibles à la racine du projet :
- `MIGRATION_COMPLETE_22_TABLES.sql` - Migration complète (nouveau projet)
- `FIX_TRIGGER_ONLY.sql` - Correction du trigger automatique (projet existant)

---

**Base de données opérationnelle et prête pour la production ! ✅**