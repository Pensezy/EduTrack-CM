# EduTrack Admin Application

## Scope de l'application Admin

L'application Admin est le centre de contrôle de la plateforme EduTrack. Elle permet aux administrateurs système et aux responsables pédagogiques de :

### Gestion des Utilisateurs
- Créer, modifier et supprimer les comptes utilisateurs (étudiants, enseignants, administrateurs)
- Attribuer les rôles et permissions
- Gérer les résets de mots de passe
- Consulter l'historique des activités

### Gestion des Établissements
- Créer et configurer les établissements scolaires
- Gérer les informations de contact et les documents
- Attribuer les administrateurs locaux par établissement

### Gestion Académique
- Superviser les années académiques, semestres et périodes scolaires
- Gérer les niveaux d'études et les classes
- Consulter les données académiques consolidées

### Gestion Financière
- Accéder à un tableau de bord financier global
- Consulter les rapports de paiement et encaissements
- Analyser les tendances financières par établissement

### Audit et Sécurité
- Consulter les logs système
- Monitorer les connexions et activités des utilisateurs
- Gérer les sessions actives
- Exporter les données pour audit

### Configuration Système
- Paramètres de la plateforme
- Gestion des variables d'environnement
- Configuration des intégrations externes
- Maintenance et backups

## Stack Technique

- **Framework**: React 18.2.0
- **Router**: React Router DOM 6.20.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.4.0
- **Dépendances Workspace**:
  - `@edutrack/ui`: Composants UI réutilisables
  - `@edutrack/utils`: Utilitaires et helpers
  - `@edutrack/api`: Client API et services

## Installation et Démarrage

```bash
# Installation des dépendances (depuis la racine du monorepo)
npm install

# Démarrage du serveur de développement
npm run dev --workspace=admin

# Build pour la production
npm run build --workspace=admin

# Prévisualisation du build
npm run preview --workspace=admin
```

## Structure du Projet

```
apps/admin/
├── src/
│   ├── main.jsx              # Point d'entrée React
│   ├── App.jsx               # Composant racine
│   ├── index.css             # Styles globaux
│   ├── components/           # Composants réutilisables
│   ├── pages/                # Pages de l'application
│   ├── hooks/                # Hooks personnalisés
│   ├── services/             # Services et appels API
│   └── utils/                # Utilitaires locaux
├── index.html                # Template HTML
├── vite.config.js            # Configuration Vite
├── package.json              # Dépendances
└── README.md                 # Cette documentation
```

## Phases de Développement

### Phase 1 (Actuelle)
- Initialisation du projet
- Configuration Vite et Tailwind
- Structure de base avec React Router

### Phase 2
- Authentification et autorisation
- Dashboard administrateur
- Gestion des utilisateurs

### Phase 3
- Gestion des établissements
- Configuration système
- Audit et logs

### Phase 4
- Analytics et reporting
- Intégrations externes
- Performance et optimisations

## Considérations de Sécurité

- Authentification requise pour toutes les routes
- Autorisation basée sur les rôles (RBAC)
- Audit de toutes les actions sensibles
- Protection contre CSRF et XSS
- Chiffrement des données sensibles en transit et au repos

## Contribution

Pour contribuer à cette application, veuillez :
1. Créer une branche feature à partir de `master`
2. Respecter les conventions de code du projet
3. Ajouter des tests pour les nouvelles fonctionnalités
4. Soumettre une pull request avec une description détaillée
