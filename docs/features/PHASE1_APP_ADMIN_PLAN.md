# 🎯 PHASE 1 - APP ADMIN - PLAN DE DÉVELOPPEMENT

> **Date de démarrage** : 31 décembre 2025
> **Statut** : En développement
> **Objectif** : Créer l'application d'administration complète pour EduTrack

---

## 📊 VUE D'ENSEMBLE

L'**App Admin** est la première application du système modulaire EduTrack. Elle centralise toutes les fonctionnalités d'administration et de gestion d'établissement.

### Rôles cibles
- ✅ **Directeur** (Principal) - Gestion complète de son école
- ✅ **Secrétaire** (Secretary) - Gestion administrative quotidienne
- ✅ **Admin Système** (Super Admin) - Gestion multi-écoles

---

## 🎯 FONCTIONNALITÉS CORE

### 1. **Dashboard Admin** (Page d'accueil)
- Métriques principales (élèves, enseignants, classes, revenus)
- Graphiques de synthèse
- Demandes en attente (inscriptions, transferts)
- Notifications système

### 2. **Gestion des Écoles** (Multi-écoles)
- Liste des écoles
- Créer/Modifier/Désactiver une école
- Informations école (nom, code, type, adresse, contact)
- Configuration école (classes disponibles, frais, cycles)
- Affectation directeur

### 3. **Gestion des Utilisateurs**
- **Directeurs** : Créer comptes, assigner écoles
- **Enseignants** : Profils, matières, assignations classes
- **Secrétaires** : Comptes, permissions
- **Élèves** : Inscription, profils, classes, parents
- **Parents** : Comptes, liaison enfants

### 4. **Gestion des Classes**
- Créer/Modifier classes par école
- Assigner enseignants par matière
- Capacité et effectifs
- Classes actives/archivées

### 5. **Demandes d'Inscription**
- Liste des demandes (nouvelles inscriptions, redoublements, transferts)
- Validation/Rejet avec motifs
- Génération matricules
- Création automatique comptes élèves/parents

### 6. **Gestion du Personnel**
- Liste enseignants/secrétaires par école
- Fiches individuelles (coordonnées, matières, classes)
- Historique embauche
- Statut actif/inactif

### 7. **Années Scolaires**
- Créer années scolaires
- Trimestres/Semestres
- Dates clés (rentrée, fin année, vacances)
- Année active

### 8. **Paramètres Système**
- Configuration générale
- Templates (bulletins, certificats, reçus)
- Frais scolaires par niveau
- Codes PIN et sécurité

---

## 🏗️ ARCHITECTURE APP ADMIN

```
apps/admin/
├── src/
│   ├── main.jsx                      # Point d'entrée
│   ├── App.jsx                       # App principale avec routing
│   │
│   ├── pages/                        # Pages de l'app
│   │   ├── Dashboard/
│   │   │   └── AdminDashboard.jsx
│   │   ├── Schools/
│   │   │   ├── SchoolsList.jsx
│   │   │   ├── SchoolDetail.jsx
│   │   │   └── SchoolForm.jsx
│   │   ├── Users/
│   │   │   ├── UsersList.jsx        # Tous utilisateurs
│   │   │   ├── TeachersList.jsx
│   │   │   ├── StudentsList.jsx
│   │   │   └── ParentsList.jsx
│   │   ├── Classes/
│   │   │   ├── ClassesList.jsx
│   │   │   └── ClassForm.jsx
│   │   ├── Enrollment/
│   │   │   ├── EnrollmentRequests.jsx
│   │   │   └── RequestDetail.jsx
│   │   ├── Personnel/
│   │   │   ├── PersonnelList.jsx
│   │   │   └── PersonnelDetail.jsx
│   │   ├── Settings/
│   │   │   ├── GeneralSettings.jsx
│   │   │   ├── AcademicYears.jsx
│   │   │   └── FeesSettings.jsx
│   │   └── Auth/
│   │       └── Login.jsx
│   │
│   ├── components/                   # Composants spécifiques Admin
│   │   ├── Layout/
│   │   │   ├── AdminLayout.jsx      # Layout principal
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopBar.jsx
│   │   ├── Dashboard/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   └── RecentActivity.jsx
│   │   ├── Schools/
│   │   │   └── SchoolCard.jsx
│   │   ├── Users/
│   │   │   ├── UserTable.jsx
│   │   │   └── UserForm.jsx
│   │   └── Enrollment/
│   │       ├── RequestCard.jsx
│   │       └── ValidationModal.jsx
│   │
│   ├── hooks/                        # Hooks spécifiques Admin
│   │   ├── useSchools.js
│   │   ├── useUsers.js
│   │   ├── useEnrollmentRequests.js
│   │   └── usePersonnel.js
│   │
│   ├── utils/                        # Utilitaires Admin
│   │   ├── permissions.js
│   │   └── navigation.js
│   │
│   ├── index.css                     # Styles Tailwind
│   └── routes.jsx                    # Configuration routing
│
├── public/
│   └── index.html
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🛣️ ROUTES DE L'APPLICATION

```javascript
const routes = {
  '/': Dashboard,
  '/login': Login,

  // Écoles
  '/schools': SchoolsList,
  '/schools/:id': SchoolDetail,
  '/schools/new': SchoolForm,
  '/schools/:id/edit': SchoolForm,

  // Utilisateurs
  '/users': UsersList,
  '/users/teachers': TeachersList,
  '/users/students': StudentsList,
  '/users/parents': ParentsList,
  '/users/:id': UserDetail,

  // Classes
  '/classes': ClassesList,
  '/classes/new': ClassForm,
  '/classes/:id/edit': ClassForm,

  // Demandes
  '/enrollment': EnrollmentRequests,
  '/enrollment/:id': RequestDetail,

  // Personnel
  '/personnel': PersonnelList,
  '/personnel/:id': PersonnelDetail,

  // Paramètres
  '/settings': GeneralSettings,
  '/settings/academic-years': AcademicYears,
  '/settings/fees': FeesSettings
}
```

---

## 📦 PACKAGES UTILISÉS

### Packages EduTrack (workspace)
- `@edutrack/api` - Services (dashboardService, authService)
- `@edutrack/utils` - Utilitaires (formatters, validators, constants)
- `@edutrack/ui` - Composants UI (Button, Card)

### Packages externes
- `react-router-dom` - Navigation ✅ (déjà installé)
- `lucide-react` - Icônes (via @edutrack/ui)
- `date-fns` - Dates (via @edutrack/utils)
- `react-hook-form` - Formulaires (à installer)
- `zod` - Validation schémas (à installer)
- `recharts` - Graphiques (à installer)

---

## 📋 PLAN D'IMPLÉMENTATION

### **Sprint 1 : Infrastructure (Jour 1-2)**
- [ ] Configurer React Router avec routes
- [ ] Créer AdminLayout (Sidebar + TopBar)
- [ ] Intégrer AuthContext de @edutrack/api
- [ ] Page Login fonctionnelle
- [ ] Protected routes (redirection si non authentifié)
- [ ] Navigation sidebar complète

### **Sprint 2 : Dashboard (Jour 3-4)**
- [ ] Page Dashboard avec métriques
- [ ] Utiliser dashboardService de @edutrack/api
- [ ] Cartes métriques (élèves, enseignants, classes, revenus)
- [ ] Graphiques basiques (présence, moyennes)
- [ ] Actions rapides
- [ ] Notifications/Alertes

### **Sprint 3 : Gestion Écoles (Jour 5-7)**
- [ ] Page liste écoles
- [ ] Formulaire créer/modifier école
- [ ] Page détails école
- [ ] Intégration dashboardService.getSchoolDetails
- [ ] Validation formulaires (react-hook-form + zod)

### **Sprint 4 : Gestion Utilisateurs (Jour 8-11)**
- [ ] Liste enseignants (avec recherche/filtres)
- [ ] Liste élèves (avec recherche/filtres)
- [ ] Liste parents
- [ ] Formulaires création utilisateurs
- [ ] Assignation classes/matières enseignants

### **Sprint 5 : Demandes Inscription (Jour 12-14)**
- [ ] Liste demandes (tri par statut/priorité)
- [ ] Détails demande
- [ ] Validation/Rejet modal
- [ ] Génération matricule auto
- [ ] Création compte élève + parent

### **Sprint 6 : Classes & Personnel (Jour 15-16)**
- [ ] Gestion classes
- [ ] Liste personnel
- [ ] Assignations enseignants/classes

### **Sprint 7 : Paramètres (Jour 17-18)**
- [ ] Années scolaires
- [ ] Configuration frais
- [ ] Paramètres généraux

### **Sprint 8 : Tests & Documentation (Jour 19-20)**
- [ ] Tests de navigation
- [ ] Tests d'intégration API
- [ ] Documentation utilisateur
- [ ] Déploiement Vercel

---

## 🎨 DESIGN SYSTEM

### Palette de couleurs (conservée)
```javascript
{
  primary: '#2563eb',      // Bleu
  secondary: '#7c3aed',    // Violet
  success: '#10b981',      // Vert
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Rouge
  info: '#06b6d4'          // Cyan
}
```

### Composants réutilisables
- Button (de @edutrack/ui)
- Card (de @edutrack/ui)
- Input, Select, Checkbox (à créer si besoin)
- Table, Modal, Toast (à créer si besoin)

---

## 🔐 SÉCURITÉ & PERMISSIONS

### Niveaux d'accès
- **Admin Système** : Accès complet multi-écoles
- **Directeur** : Accès complet à son école
- **Secrétaire** : Gestion administrative (pas de suppression)

### Protection des routes
```javascript
const protectedRoute = {
  '/schools': ['admin'],
  '/schools/:id': ['admin', 'principal'],
  '/users': ['admin', 'principal', 'secretary'],
  '/enrollment': ['admin', 'principal', 'secretary'],
  '/settings': ['admin', 'principal']
}
```

---

## 📊 MÉTRIQUES DE SUCCÈS

- [ ] Toutes les routes fonctionnelles
- [ ] Authentification robuste
- [ ] CRUD complet écoles
- [ ] CRUD complet utilisateurs
- [ ] Validation demandes inscription
- [ ] Performance : < 2s chargement page
- [ ] Responsive mobile & desktop
- [ ] Documentation complète

---

## 🚀 PROCHAINE ÉTAPE IMMÉDIATE

**Commencer Sprint 1 : Infrastructure**

1. Configurer React Router
2. Créer AdminLayout
3. Intégrer AuthContext
4. Page Login

**Prêt à démarrer ?** 🎯
