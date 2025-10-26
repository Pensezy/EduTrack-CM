# EduTrack-CM 🎓

Système de gestion scolaire moderne pour les établissements d'enseignement camerounais, avec support multi-établissements et architecture hybride Prisma + Supabase.

## 🚀 Fonctionnalités

- **Authentification Supabase** - Système d'authentification sécurisé avec création automatique de comptes
- **Multi-Établissements** - Support pour parents et enseignants ayant des enfants/classes dans plusieurs écoles
- **Gestion Complète** - Notes, présences, paiements, emplois du temps, communications
- **Tableaux de Bord** - Interfaces spécifiques pour directeurs, enseignants, parents, étudiants et secrétaires
- **React 18 + Vite** - Interface moderne et performante
- **TailwindCSS** - Design responsive et personnalisable
- **Prisma ORM** - Gestion type-safe de la base de données PostgreSQL
- **Architecture Hybride** - Combinaison de Prisma pour les requêtes et SQL pour les triggers/automation

## 📋 Prérequis

- **Node.js** (v18.x ou supérieur)
- **npm** ou **yarn**
- **Compte Supabase** - Pour la base de données PostgreSQL et l'authentification
- **Prisma CLI** - Installé automatiquement avec les dépendances

## 🛠️ Installation

1. **Cloner le dépôt :**
   ```bash
   git clone <repository-url>
   cd EduTrack-CM
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement :**
   
   Créer un fichier `.env` à la racine avec :
   ```env
   # Supabase
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-anon-key
   
   # Prisma (pour les migrations)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

4. **Initialiser la base de données :**
   
   Exécuter dans Supabase SQL Editor :
   ```bash
   # 1. Créer toutes les tables
   MIGRATION_COMPLETE_22_TABLES.sql
   
   # 2. Configurer le trigger d'authentification
   FIX_TRIGGER_ONLY.sql
   ```

5. **Synchroniser Prisma :**
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

6. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```

## 📁 Structure du Projet

```
EduTrack-CM/
├── database/                    # Documentation de la base de données
│   ├── migrations/             # Migrations SQL
│   └── README.md               # Guide de la structure DB (22 tables)
├── docs/                       # Documentation complète
│   ├── README.md              # Index de la documentation
│   ├── SUPABASE_AUTH.md       # Configuration authentification
│   ├── PRISMA_MIGRATION.md    # Architecture hybride
│   ├── SCHOOL_TYPES.md        # Types d'établissements camerounais
│   ├── DATA_MODE_SYSTEM.md    # Système démo/production
│   ├── NAVIGATION_FLOWS.md    # Flux UX
│   ├── PARENT_MULTI_SCHOOL_GUIDE.md    # Guide parents multi-écoles
│   └── TEACHER_MULTI_SCHOOL_GUIDE.md   # Guide enseignants multi-écoles
├── prisma/
│   ├── schema.prisma          # Schéma Prisma (22+ modèles)
│   ├── migrations/            # Historique migrations Prisma
│   └── README.md              # Guide workflow hybride
├── scripts/
│   ├── seedDemoData.js        # Génération de données de démo
│   ├── archive/               # Fichiers de débogage archivés
│   └── README.md
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants UI (Button, Input, etc.)
│   │   └── ...
│   ├── contexts/              # Contextes React (Auth, etc.)
│   ├── hooks/                 # Hooks personnalisés
│   ├── lib/                   # Configuration (Supabase client)
│   ├── pages/                 # Pages de l'application
│   │   ├── admin-dashboard/
│   │   ├── teacher-dashboard/
│   │   ├── parent-dashboard/
│   │   ├── student-dashboard/
│   │   ├── principal-dashboard/
│   │   ├── secretary-dashboard/
│   │   └── ...
│   ├── services/              # Services API
│   ├── styles/                # Styles globaux
│   ├── utils/                 # Utilitaires
│   ├── App.jsx
│   ├── Routes.jsx
│   └── index.jsx
├── supabase/
│   └── migrations/            # Migrations Supabase
├── FIX_TRIGGER_ONLY.sql      # Trigger d'authentification (solution finale)
├── MIGRATION_COMPLETE_22_TABLES.sql  # Migration complète
└── README.md
```

## 🎯 Démarrage Rapide

### 1. Premier Compte (Directeur)

Créer un compte directeur via l'interface de connexion :
- Le trigger SQL créera automatiquement l'école et toutes les données par défaut
- 22 tables initialisées : écoles, années académiques, types de notes, présences, paiements, etc.

### 2. Données de Démonstration

Générer des données de test avec le système multi-établissements :
```bash
node scripts/seedDemoData.js --reset
```

Cela crée :
- 3 écoles (Yaoundé, Douala, Bafoussam)
- 5 parents avec enfants dans plusieurs écoles
- Étudiants, classes, relations parent-étudiant-école

### 3. Prisma Studio (Optionnel)

Visualiser et modifier les données :
```bash
npx prisma studio
```

## 🗄️ Base de Données

### Architecture Hybride

- **Prisma ORM** : Requêtes type-safe depuis React/Services
- **Triggers SQL** : Automatisation (création de comptes, initialisation)
- **22 Tables** : users, schools, academic_years, classes, subjects, teachers, students, parents, parent_student_schools, payments, attendances, grades, notifications, audit_logs, evaluation_periods, grade_types, user_roles, attendance_types, payment_types, class_subjects, teacher_subjects, secretaries

### Migrations

1. **MIGRATION_COMPLETE_22_TABLES.sql** - Créer toutes les tables
2. **FIX_TRIGGER_ONLY.sql** - Configurer le trigger d'authentification
3. `npx prisma db pull` - Synchroniser le schéma Prisma
4. `npx prisma generate` - Générer le client Prisma

Consultez `database/README.md` pour la documentation complète.

## 🧩 Fonctionnalités Principales

### Système Multi-Établissements

- **Parents** : Un parent peut avoir des enfants dans plusieurs écoles différentes
- **Enseignants** : Un enseignant peut enseigner dans plusieurs établissements
- **Table `parent_student_schools`** : Gère les relations N-N-N (parent-étudiant-école)

### Tableaux de Bord

- **Directeur** : Gestion complète de l'école, enseignants, étudiants, rapports
- **Enseignant** : Classes, notes, présences, emploi du temps
- **Parent** : Suivi des enfants (notes, présences, paiements)
- **Étudiant** : Consultation notes, présences, emploi du temps
- **Secrétaire** : Gestion administrative, paiements, inscriptions

### Gestion des Notes

- Types configurables : Devoirs, Interrogations, Examens, Projets, Participation
- Coefficients personnalisables par école
- Moyennes automatiques par période (trimestre/semestre)

### Système de Présences

- Types : Présent, Absent, Retard, Absent Excusé
- Suivi quotidien par classe
- Rapports de présence

### Gestion des Paiements

- Types : Frais de scolarité, Inscription, Uniforme, Livres, Cantine, Transport
- Suivi des paiements par étudiant
- Relances automatiques

## 🎨 Technologies

- **Frontend** : React 18, Vite, TailwindCSS, React Router v6
- **Backend** : Supabase (PostgreSQL + Auth)
- **ORM** : Prisma
- **State** : React Context API
- **Formulaires** : React Hook Form
- **Visualisation** : Recharts

## 📚 Documentation

Consultez le dossier `docs/` pour la documentation complète :

- **[docs/README.md](docs/README.md)** - Index de toute la documentation
- **[docs/SUPABASE_AUTH.md](docs/SUPABASE_AUTH.md)** - Configuration de l'authentification
- **[docs/PRISMA_MIGRATION.md](docs/PRISMA_MIGRATION.md)** - Architecture hybride Prisma + SQL
- **[database/README.md](database/README.md)** - Structure de la base de données (22 tables)
- **[prisma/README.md](prisma/README.md)** - Workflow Prisma + Supabase

## 🧪 Tests et Débogage

Les scripts de test et de diagnostic ont été archivés dans `scripts/archive/` pour référence historique.

Pour diagnostiquer la base de données :
```bash
# Depuis Supabase SQL Editor
SELECT * FROM users LIMIT 10;
SELECT * FROM schools WHERE status = 'active';
```

## 🚀 Déploiement

```bash
# Build production
npm run build

# Aperçu du build
npm run preview
```

Les fichiers de production seront dans le dossier `dist/`.

## 🤝 Contribution

Ce projet suit le système éducatif camerounais avec support pour :
- Écoles primaires (6 niveaux)
- Collèges (4 niveaux)
- Lycées (3 niveaux)
- Établissements combinés (Collège-Lycée)

Consultez `docs/SCHOOL_TYPES.md` pour plus de détails.

## 📄 Licence

Propriétaire - EduTrack-CM

---

**Dernière mise à jour :** Octobre 2025  
**Version :** 1.0.0  
**Status :** En développement actif
````

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration includes:

- Forms plugin for form styling
- Typography plugin for text styling
- Aspect ratio plugin for responsive elements
- Container queries for component-specific responsive design
- Fluid typography for responsive text
- Animation utilities

## 📱 Responsive Design

The app is built with responsive design using Tailwind CSS breakpoints.


## 📦 Deployment

Build the application for production:

```bash
npm run build
```