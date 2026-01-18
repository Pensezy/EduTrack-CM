# EduTrack-CM 🎓

Système de gestion scolaire moderne pour les établissements d'enseignement camerounais. Architecture monorepo avec support multi-établissements.

## 🚀 Fonctionnalités

- **Multi-Applications** - Admin, Hub public, et futures applications spécialisées
- **Authentification Supabase** - Système d'authentification sécurisé avec gestion des rôles
- **Multi-Établissements** - Support pour parents et enseignants ayant des enfants/classes dans plusieurs écoles
- **App Store Intégré** - Système de souscription aux applications (App Core, App Académique, etc.)
- **Tableaux de Bord** - Interfaces spécifiques pour admin, directeurs, enseignants, parents, étudiants et secrétaires
- **React 18 + Vite** - Interface moderne et performante
- **TailwindCSS** - Design responsive et personnalisable

## 📋 Prérequis

- **Node.js** (v18.x ou supérieur)
- **pnpm** (gestionnaire de paquets recommandé)
- **Compte Supabase** - Pour la base de données PostgreSQL et l'authentification

## 🛠️ Installation

1. **Cloner le dépôt :**
   ```bash
   git clone <repository-url>
   cd EduTrack-CM
   ```

2. **Installer les dépendances :**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement :**

   Créer un fichier `.env` à la racine avec :
   ```env
   # Supabase
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-anon-key
   ```

4. **Lancer le serveur de développement :**
   ```bash
   # Lancer toutes les apps
   pnpm dev

   # Ou lancer une app spécifique
   pnpm --filter @edutrack/admin dev
   pnpm --filter @edutrack/hub dev
   ```

## 📁 Structure du Projet (Monorepo)

```
EduTrack-CM/
├── apps/                        # Applications
│   ├── admin/                   # Dashboard d'administration
│   │   ├── src/
│   │   │   ├── components/      # Composants spécifiques admin
│   │   │   ├── pages/           # Pages (Dashboard, Users, Schools, etc.)
│   │   │   └── services/        # Services API
│   │   └── package.json
│   └── hub/                     # Site public (landing, connexion)
│       └── src/
├── packages/                    # Packages partagés
│   ├── api-client/              # Client API Supabase + hooks
│   ├── ui-components/           # Composants UI réutilisables
│   └── utils/                   # Utilitaires partagés
├── supabase/                    # Configuration Supabase
│   ├── functions/               # Edge Functions
│   └── migrations/              # Migrations SQL
├── database/                    # Scripts SQL et documentation DB
│   ├── sql/                     # Fichiers SQL
│   └── migrations/              # Migrations historiques
├── docs/                        # Documentation
│   ├── changelogs/              # Historique des changements
│   ├── deployment/              # Guides de déploiement
│   ├── features/                # Documentation des fonctionnalités
│   └── fixes/                   # Documentation des corrections
├── scripts/                     # Scripts utilitaires
├── config/                      # Configurations partagées
├── public/                      # Assets statiques
├── _archive/                    # Fichiers archivés (ancienne structure)
├── package.json                 # Configuration monorepo
├── pnpm-workspace.yaml          # Configuration pnpm workspace
└── vercel.json                  # Configuration Vercel
```

## 🎯 Applications

### Admin Dashboard (`apps/admin`)
Interface d'administration complète :
- Gestion des écoles et utilisateurs
- App Store (catalogue et souscriptions)
- Gestion des classes et du personnel
- Demandes d'inscription

### Hub Public (`apps/hub`)
Site public :
- Page d'accueil
- Connexion/Inscription
- Informations générales

## 📦 Packages Partagés

### @edutrack/api (`packages/api-client`)
- Client Supabase configuré
- Hooks d'authentification (`useAuth`)
- Services API partagés

### @edutrack/ui (`packages/ui-components`)
- Composants UI réutilisables (Modal, Button, etc.)
- Thème et styles partagés

### @edutrack/utils (`packages/utils`)
- Fonctions utilitaires (formatage, validation)
- Constantes partagées

## 🚀 Scripts Disponibles

```bash
# Développement
pnpm dev                    # Lancer toutes les apps
pnpm --filter @edutrack/admin dev  # Lancer admin uniquement

# Build
pnpm build                  # Builder toutes les apps
pnpm --filter @edutrack/admin build

# Autres
pnpm lint                   # Linter le code
pnpm clean                  # Nettoyer les node_modules
```

## 🗄️ Base de Données

### Tables Principales
- `users` - Utilisateurs (admin, directeurs, enseignants, parents, élèves, secrétaires)
- `schools` - Établissements scolaires
- `classes` - Classes
- `apps` - Applications disponibles
- `school_subscriptions` - Souscriptions des écoles aux applications
- Et bien d'autres...

### Edge Functions (Supabase)
- `create-staff-account` - Création de comptes utilisateurs
- `update-user-password` - Mise à jour des mots de passe
- `update-student-password` - Mise à jour mot de passe élève

## 🎨 Technologies

- **Frontend** : React 18, Vite, TailwindCSS, React Router v6
- **Backend** : Supabase (PostgreSQL + Auth + Edge Functions)
- **Monorepo** : pnpm workspaces
- **Déploiement** : Vercel

## 📚 Documentation

Consultez le dossier `docs/` pour la documentation complète :

- **[docs/deployment/](docs/deployment/)** - Guides de déploiement (Vercel, etc.)
- **[docs/features/](docs/features/)** - Documentation des fonctionnalités
- **[docs/fixes/](docs/fixes/)** - Documentation des corrections de bugs
- **[docs/changelogs/](docs/changelogs/)** - Historique des changements
- **[database/](database/)** - Structure de la base de données

## 🚀 Déploiement

Le projet est configuré pour Vercel :

```bash
# Build production
pnpm build

# Déploiement via Vercel CLI
vercel --prod
```

Configuration dans `vercel.json` pour le routage des applications.

## 🤝 Contribution

Ce projet suit le système éducatif camerounais avec support pour :
- Maternelles
- Écoles primaires (6 niveaux)
- Collèges (4 niveaux)
- Lycées (3 niveaux)
- Établissements combinés (Collège-Lycée)

## 📄 Licence

Propriétaire - EduTrack-CM

---

**Dernière mise à jour :** Janvier 2026
**Version :** 2.5.1
**Status :** En développement actif
