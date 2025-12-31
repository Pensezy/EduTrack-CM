# 🎯 PLAN D'ACTION DÉTAILLÉ - SYSTÈME MODULAIRE EDUTRACK

> **Date de création** : 31 décembre 2025
> **Statut** : En planification
> **Objectif** : Transformer EduTrack d'un monolithe en un système modulaire évolutif

---

## 📋 SYNTHÈSE DES DÉCISIONS

### 🎨 Design & Apparence

| Aspect | Décision |
|--------|----------|
| **Design System** | ✅ Unifié pour toutes les apps (UX cohérente) |
| **Palette** | ✅ Conserver les couleurs actuelles |
| **Mode sombre** | 🔮 Amélioration future |
| **Responsive** | ✅ Mobile & Desktop simultanément |
| **Framework UI** | ✅ À déterminer selon adaptabilité modulaire |
| **Navigation principale** | ✅ Dashboard avec cartes cliquables |
| **Transitions** | ✅ Même fenêtre avec transitions fluides |
| **Breadcrumbs** | ✅ Fil d'Ariane activé |
| **Notifications** | ✅ Selon besoin (à déterminer par app) |
| **Profil utilisateur** | ✅ Accessible uniformément partout |

### 🏗️ Architecture Technique

| Aspect | Décision |
|--------|----------|
| **Structure** | ✅ Monorepo avec gestion séparée par app |
| **Package manager** | ✅ À déterminer (npm/yarn/pnpm) |
| **Packages partagés** | ✅ `@edutrack/ui-components` |
| | ✅ `@edutrack/utils` |
| | ✅ `@edutrack/api-client` |
| **Supabase** | ✅ Instance unique centralisée |
| **RLS** | ✅ Renforcement avec politiques par app |
| **API Gateway** | ✅ Couche intermédiaire à créer |
| **Sessions** | ✅ SSO partagé entre apps (expérience fluide) |
| **Communication inter-apps** | ✅ Système d'événements/webhooks |

### 🚀 Méthodologie & Migration

| Aspect | Décision |
|--------|----------|
| **Approche** | ✅ Migration progressive app par app |
| **Ordre** | ✅ Admin → Académique → Finance → Autres |
| **Coexistence** | ✅ Minimale (le moins de temps possible) |
| **Données test** | ❌ Pas de données test, amélioration directe de la BDD |
| **Formation** | ✅ Documentation par app avant déploiement |
| **Versioning** | ✅ Sémantique par app indépendamment |
| **CI/CD** | 🔮 Plus tard |
| **Tests** | ✅ À déterminer (type le plus pertinent) |
| **Environnements** | ✅ À déterminer selon envergure projet |
| **Hébergement** | ✅ Vercel pour le moment |

---

## 🏛️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│                      EDUTRACK HUB (Dashboard)                    │
│              Navigation centrale - SSO - Profil global           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
        ┌───────▼───────┐ ┌──────▼──────┐ ┌───────▼───────┐
        │  App Admin    │ │ App Académie│ │  App Finance  │
        │   (Phase 1)   │ │  (Phase 2)  │ │   (Phase 3)   │
        └───────┬───────┘ └──────┬──────┘ └───────┬───────┘
                │                │                 │
                └────────────────┼─────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    API GATEWAY LAYER    │
                    │  (Couche intermédiaire) │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   SUPABASE CENTRALISÉ   │
                    │   (BDD + Auth + RLS)    │
                    └─────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
        ┌───────▼───────┐ ┌─────▼──────┐ ┌──────▼──────┐
        │@edutrack/ui   │ │@edutrack/  │ │@edutrack/   │
        │  components   │ │   utils    │ │ api-client  │
        └───────────────┘ └────────────┘ └─────────────┘
```

---

## 📦 STRUCTURE MONOREPO

```
edutrack-monorepo/
├── apps/
│   ├── hub/                    # Application centrale (dashboard)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── admin/                  # App Admin (Phase 1)
│   │   ├── src/
│   │   │   ├── features/       # Gestion écoles, utilisateurs, backup
│   │   │   ├── pages/
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── academic/               # App Académique (Phase 2)
│   │   ├── src/
│   │   │   ├── features/       # Notes, bulletins, emploi du temps
│   │   │   ├── pages/
│   │   │   └── App.jsx
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── finance/                # App Finance (Phase 3)
│       ├── src/
│       │   ├── features/       # Paiements, factures, comptabilité
│       │   ├── pages/
│       │   └── App.jsx
│       ├── package.json
│       └── vite.config.js
│
├── packages/
│   ├── ui-components/          # @edutrack/ui
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Modal/
│   │   │   ├── Form/
│   │   │   ├── Table/
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── utils/                  # @edutrack/utils
│   │   ├── src/
│   │   │   ├── formatters/     # Dates, nombres, devise
│   │   │   ├── validators/     # Email, téléphone, matricule
│   │   │   ├── calculators/    # Moyennes, statistiques
│   │   │   └── index.js
│   │   └── package.json
│   │
│   ├── api-client/             # @edutrack/api
│   │   ├── src/
│   │   │   ├── gateway/        # Couche API Gateway
│   │   │   ├── services/       # Services métier
│   │   │   ├── supabase/       # Client Supabase configuré
│   │   │   └── index.js
│   │   └── package.json
│   │
│   └── shared-types/           # @edutrack/types (TypeScript)
│       ├── src/
│       │   ├── models/         # Types BDD
│       │   ├── api/            # Types API
│       │   └── index.ts
│       └── package.json
│
├── config/
│   ├── tailwind.config.js      # Config Tailwind partagée
│   ├── eslint.config.js        # ESLint partagé
│   └── tsconfig.base.json      # TypeScript base
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # Configuration workspace
└── README.md
```

---

## 🔐 API GATEWAY - COUCHE INTERMÉDIAIRE

### Rôle de l'API Gateway

```javascript
// @edutrack/api/src/gateway/index.js

/**
 * API Gateway - Couche d'abstraction entre les apps et Supabase
 *
 * Avantages :
 * ✅ Centralisation de la logique métier
 * ✅ Cache et optimisation des requêtes
 * ✅ Validation des données avant insertion
 * ✅ Gestion centralisée des erreurs
 * ✅ Logging et monitoring
 * ✅ Transformation des données pour les apps
 */

class ApiGateway {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.cache = new Map();
    this.eventBus = new EventEmitter();
  }

  // Exemple : Récupérer les notes d'un élève
  async getStudentGrades(studentId, options = {}) {
    // 1. Vérification cache
    const cacheKey = `grades:${studentId}`;
    if (this.cache.has(cacheKey) && !options.forceRefresh) {
      return this.cache.get(cacheKey);
    }

    try {
      // 2. Requête Supabase avec RLS
      const { data, error } = await this.supabase
        .from('grades')
        .select(`
          *,
          subject:subjects(*),
          teacher:teachers(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 3. Transformation des données
      const formattedData = this.formatGradesData(data);

      // 4. Mise en cache
      this.cache.set(cacheKey, formattedData);

      // 5. Émission d'événement (pour analytics)
      this.eventBus.emit('grades:fetched', { studentId, count: data.length });

      return formattedData;

    } catch (error) {
      // 6. Gestion centralisée des erreurs
      this.handleError('getStudentGrades', error);
      throw error;
    }
  }

  // Invalidation du cache lors de modifications
  async createGrade(gradeData) {
    const { data, error } = await this.supabase
      .from('grades')
      .insert(gradeData)
      .select()
      .single();

    if (error) throw error;

    // Invalider le cache de l'élève
    this.cache.delete(`grades:${gradeData.student_id}`);

    // Émettre événement pour notifier les autres apps
    this.eventBus.emit('grade:created', data);

    return data;
  }
}

export const apiGateway = new ApiGateway();
```

### Architecture de l'API Gateway

```
┌─────────────────────────────────────────────────────────┐
│                     APP (Academic)                       │
│  import { apiGateway } from '@edutrack/api'             │
│  const grades = await apiGateway.getStudentGrades(...)  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API GATEWAY                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Validation   │  │   Caching    │  │   Events     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Transform    │  │    Logging   │  │   Security   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│         (Auth + BDD + RLS + Realtime)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 SYSTÈME D'ÉVÉNEMENTS INTER-APPS

### Event Bus Centralisé

```javascript
// @edutrack/api/src/events/EventBus.js

/**
 * Event Bus - Communication asynchrone entre applications
 * Permet aux apps de réagir aux actions des autres apps sans couplage direct
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // Souscrire à un événement
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Retourner fonction de désabonnement
    return () => this.off(event, callback);
  }

  // Se désabonner
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  // Émettre un événement
  emit(event, data) {
    if (!this.listeners.has(event)) return;

    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });

    // Logger l'événement
    this.logEvent(event, data);
  }

  // Logging des événements
  logEvent(event, data) {
    console.log(`[EVENT] ${event}`, {
      timestamp: new Date().toISOString(),
      data
    });
  }
}

export const eventBus = new EventBus();
```

### Exemples de Communication Inter-Apps

```javascript
// Exemple 1 : Paiement validé → Notification académique

// Dans App Finance
import { eventBus } from '@edutrack/api';

async function validatePayment(paymentId) {
  const payment = await apiGateway.updatePayment(paymentId, { status: 'paid' });

  // Émettre événement
  eventBus.emit('payment:validated', {
    studentId: payment.student_id,
    amount: payment.amount,
    type: payment.fee_type
  });
}

// Dans App Académique
import { eventBus } from '@edutrack/api';

eventBus.on('payment:validated', async (data) => {
  // Débloquer l'accès aux bulletins si paiement scolarité
  if (data.type === 'tuition') {
    await unlockReportCard(data.studentId);
    showNotification('Paiement reçu - Bulletin disponible');
  }
});
```

```javascript
// Exemple 2 : Note publiée → Notification parent

// Dans App Académique
eventBus.emit('grade:published', {
  studentId: '123',
  subjectId: '456',
  grade: 15,
  coefficient: 2
});

// Dans App Communication (si créée ultérieurement)
eventBus.on('grade:published', async (data) => {
  const student = await apiGateway.getStudent(data.studentId);
  const parent = await apiGateway.getParent(student.parent_id);

  // Envoyer notification au parent
  await sendParentNotification(parent.id, {
    type: 'NEW_GRADE',
    message: `Nouvelle note publiée pour ${student.full_name}`,
    data: data
  });
});
```

---

## 🎨 DESIGN SYSTEM UNIFIÉ

### Palette de Couleurs (Conservée)

```javascript
// config/tailwind.config.js - Partagé par toutes les apps

export default {
  theme: {
    extend: {
      colors: {
        // Couleurs primaires EduTrack (conservées)
        primary: {
          DEFAULT: '#2563eb',  // Bleu principal
          50: '#eff6ff',
          100: '#dbeafe',
          // ... autres nuances
          900: '#1e3a8a'
        },
        secondary: {
          DEFAULT: '#7c3aed',  // Violet secondaire
          50: '#faf5ff',
          // ...
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif']
      }
    }
  }
}
```

### Composants UI Partagés

```
@edutrack/ui-components/
├── Button/
│   ├── Button.jsx
│   ├── Button.stories.jsx     # Storybook
│   └── Button.test.jsx
├── Modal/
│   ├── Modal.jsx
│   ├── ModalHeader.jsx
│   ├── ModalBody.jsx
│   └── ModalFooter.jsx
├── Form/
│   ├── Input.jsx
│   ├── Select.jsx
│   ├── Checkbox.jsx
│   ├── DatePicker.jsx
│   └── FormGroup.jsx
├── Table/
│   ├── Table.jsx
│   ├── TableHeader.jsx
│   ├── TableBody.jsx
│   └── TablePagination.jsx
├── Card/
│   ├── Card.jsx
│   ├── CardHeader.jsx
│   └── CardContent.jsx
└── Navigation/
    ├── Breadcrumb.jsx
    ├── Tabs.jsx
    └── Sidebar.jsx
```

---

## 📱 NAVIGATION & UX FLUIDE

### Hub Central (Dashboard Principal)

```javascript
// apps/hub/src/pages/Dashboard.jsx

/**
 * Hub Central - Point d'entrée unique
 * Navigation vers les différentes applications
 */

export default function HubDashboard() {
  const { user } = useAuth();

  const apps = [
    {
      id: 'admin',
      name: 'Administration',
      description: 'Gestion des écoles, utilisateurs et paramètres',
      icon: 'Settings',
      color: 'blue',
      route: '/admin',
      roles: ['admin', 'principal']
    },
    {
      id: 'academic',
      name: 'Académique',
      description: 'Notes, bulletins, emploi du temps',
      icon: 'GraduationCap',
      color: 'green',
      route: '/academic',
      roles: ['admin', 'principal', 'teacher', 'student', 'parent']
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Paiements, factures, comptabilité',
      icon: 'DollarSign',
      color: 'yellow',
      route: '/finance',
      roles: ['admin', 'principal', 'secretary', 'parent']
    }
  ];

  const availableApps = apps.filter(app =>
    app.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec profil global */}
      <Header user={user} />

      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Accueil', path: '/' }]} />

      {/* Dashboard avec cartes cliquables */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-heading font-bold mb-8">
          Bienvenue, {user.full_name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableApps.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onClick={() => navigateToApp(app.route)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Transitions Fluides entre Apps

```javascript
// apps/hub/src/utils/navigation.js

import { useNavigate } from 'react-router-dom';
import { eventBus } from '@edutrack/api';

/**
 * Navigation fluide avec transitions
 * L'utilisateur ne se rend pas compte qu'il change d'app
 */

export function useAppNavigation() {
  const navigate = useNavigate();

  const navigateToApp = async (appRoute, transition = 'slide') => {
    // 1. Émettre événement de navigation
    eventBus.emit('navigation:start', { to: appRoute });

    // 2. Appliquer transition CSS
    applyTransition(transition);

    // 3. Naviguer (React Router)
    await navigate(appRoute);

    // 4. Émettre événement de fin
    eventBus.emit('navigation:complete', { to: appRoute });
  };

  const applyTransition = (type) => {
    const root = document.getElementById('root');

    switch (type) {
      case 'slide':
        root.classList.add('slide-transition');
        break;
      case 'fade':
        root.classList.add('fade-transition');
        break;
      default:
        break;
    }

    // Retirer après animation
    setTimeout(() => {
      root.classList.remove('slide-transition', 'fade-transition');
    }, 300);
  };

  return { navigateToApp };
}
```

```css
/* Transitions CSS */
.slide-transition {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fade-transition {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### SSO - Session Partagée

```javascript
// @edutrack/api/src/auth/sso.js

/**
 * Single Sign-On - Session unique partagée
 * L'utilisateur se connecte une fois, accède à toutes les apps
 */

import { supabase } from '../supabase/client';

class SSOManager {
  constructor() {
    this.sessionKey = 'edutrack_session';
  }

  // Connexion unique
  async login(email, pin) {
    const { data, error } = await supabase.rpc('verify_pin', {
      identifier: email,
      pin_input: pin
    });

    if (error) throw error;

    // Stocker session globale
    this.setSession(data.session);

    // Émettre événement
    eventBus.emit('auth:login', { user: data.user });

    return data;
  }

  // Récupérer session active
  getSession() {
    const sessionData = localStorage.getItem(this.sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  // Sauvegarder session
  setSession(session) {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));

    // Synchroniser avec Supabase
    supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    const session = this.getSession();
    if (!session) return false;

    // Vérifier expiration
    const expiresAt = new Date(session.expires_at);
    return expiresAt > new Date();
  }

  // Déconnexion globale
  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem(this.sessionKey);

    eventBus.emit('auth:logout');
  }

  // Rafraîchir le token automatiquement
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      this.logout();
      throw error;
    }

    this.setSession(data.session);
    return data.session;
  }
}

export const ssoManager = new SSOManager();
```

---

## 🚀 PLAN DE MIGRATION PROGRESSIVE

### Phase 1 : App Admin (Priorité 1) - Semaines 1-4

**Périmètre** :
- Gestion des écoles
- Gestion des utilisateurs (comptes, rôles, permissions)
- Paramètres système
- Sauvegardes et exports
- Logs et audit

**Raisons de commencer par Admin** :
1. ✅ Base solide pour les autres apps (utilisateurs, écoles, permissions)
2. ✅ Moins de dépendances métier complexes
3. ✅ Permet de tester l'architecture modulaire
4. ✅ Setup du monorepo et des packages partagés
5. ✅ Établir les patterns de développement

**Livrables Phase 1** :
- [ ] Structure monorepo fonctionnelle
- [ ] Packages `@edutrack/ui`, `@edutrack/utils`, `@edutrack/api` créés
- [ ] API Gateway opérationnel
- [ ] App Admin déployée sur Vercel
- [ ] SSO fonctionnel
- [ ] Documentation technique complète

### Phase 2 : App Académique (Priorité 2) - Semaines 5-10

**Périmètre** :
- Gestion des notes et évaluations
- Bulletins scolaires
- Emploi du temps
- Absences et retards
- Cahier de textes
- Classes et matières

**Raisons** :
1. ✅ Cœur métier de l'établissement
2. ✅ Réutilise l'infrastructure de la Phase 1
3. ✅ Beaucoup d'utilisateurs concernés (élèves, parents, profs)
4. ✅ Valeur business immédiate

**Livrables Phase 2** :
- [ ] App Académique déployée
- [ ] Intégration avec App Admin (utilisateurs, écoles)
- [ ] Système d'événements inter-apps testé
- [ ] Notifications aux parents opérationnelles
- [ ] Tests utilisateurs avec vraies données

### Phase 3 : App Finance (Priorité 3) - Semaines 11-14

**Périmètre** :
- Gestion des paiements
- Frais scolaires
- Factures et reçus
- Comptabilité
- Relances automatiques

**Raisons** :
1. ✅ Dépend de l'App Admin (utilisateurs) et Académique (élèves)
2. ✅ Logique métier bien définie
3. ✅ Peut fonctionner de manière assez indépendante

**Livrables Phase 3** :
- [ ] App Finance déployée
- [ ] Intégration avec App Académique (déblocage bulletins)
- [ ] Génération automatique des reçus
- [ ] Synchronisation événements (paiement → accès bulletin)

### Phase 4 : Consolidation & Optimisation - Semaines 15-16

**Objectifs** :
- [ ] Refactoring et optimisation
- [ ] Amélioration des performances
- [ ] Corrections de bugs
- [ ] Documentation utilisateur complète
- [ ] Formation des utilisateurs finaux
- [ ] Migration complète des données
- [ ] Décommissionnement de l'ancien système

---

## 🧪 STRATÉGIE DE TESTS

### Recommandation : Tests d'Intégration + Tests E2E Critiques

**Pourquoi** :
- ✅ Projet avec plusieurs apps interconnectées
- ✅ Tests d'intégration valident la communication entre apps
- ✅ Tests E2E assurent les parcours utilisateurs critiques
- ✅ Équilibre entre couverture et temps de développement

### Tests d'Intégration

```javascript
// packages/api-client/__tests__/integration/student-grades.test.js

import { apiGateway } from '@edutrack/api';
import { eventBus } from '@edutrack/api/events';

describe('Student Grades Integration', () => {

  test('Creating a grade emits event and invalidates cache', async () => {
    const studentId = 'student-123';

    // 1. Préremplir le cache
    await apiGateway.getStudentGrades(studentId);

    // 2. Écouter l'événement
    const eventPromise = new Promise(resolve => {
      eventBus.on('grade:created', resolve);
    });

    // 3. Créer une note
    const gradeData = {
      student_id: studentId,
      subject_id: 'math-101',
      grade: 15,
      coefficient: 2
    };

    await apiGateway.createGrade(gradeData);

    // 4. Vérifier que l'événement a été émis
    const event = await eventPromise;
    expect(event.student_id).toBe(studentId);

    // 5. Vérifier que le cache a été invalidé
    // (nouvelle requête doit aller en BDD)
    const freshGrades = await apiGateway.getStudentGrades(studentId);
    expect(freshGrades).toContainEqual(expect.objectContaining(gradeData));
  });

});
```

### Tests E2E Critiques

```javascript
// apps/academic/__tests__/e2e/publish-grades.spec.js

import { test, expect } from '@playwright/test';

test.describe('Grade Publication Flow', () => {

  test('Teacher publishes grade → Parent receives notification', async ({ page, context }) => {

    // 1. Login as teacher
    await page.goto('/staff-login');
    await page.fill('[name="email"]', 'teacher@school.cm');
    await page.fill('[name="pin"]', '123456');
    await page.click('button[type="submit"]');

    // 2. Navigate to grades
    await page.click('text=Académique');
    await page.click('text=Gestion des notes');

    // 3. Add a new grade
    await page.click('text=Nouvelle note');
    await page.selectOption('[name="student"]', 'Marie Dubois');
    await page.selectOption('[name="subject"]', 'Mathématiques');
    await page.fill('[name="grade"]', '15');
    await page.click('button:has-text("Publier")');

    // 4. Verify success message
    await expect(page.locator('text=Note publiée avec succès')).toBeVisible();

    // 5. Open new tab as parent
    const parentPage = await context.newPage();
    await parentPage.goto('/staff-login');
    await parentPage.fill('[name="email"]', 'parent@school.cm');
    await parentPage.fill('[name="pin"]', '654321');
    await parentPage.click('button[type="submit"]');

    // 6. Check notifications
    await parentPage.click('[aria-label="Notifications"]');

    // 7. Verify notification received
    await expect(
      parentPage.locator('text=Nouvelle note publiée pour Marie Dubois')
    ).toBeVisible();
  });

});
```

### Environnements de Test

**Recommandation : 3 environnements**

1. **Development (Local)** :
   - Développement quotidien
   - Base Supabase locale ou projet dev
   - Hot reload activé

2. **Staging (Vercel Preview)** :
   - Tests avant production
   - Base Supabase dédiée staging
   - Tests E2E automatiques
   - Déploiement automatique sur chaque PR

3. **Production (Vercel)** :
   - Utilisateurs finaux
   - Base Supabase production
   - Monitoring et analytics
   - Déploiement manuel après validation

---

## 🛠️ CHOIX TECHNOLOGIQUES RECOMMANDÉS

### Package Manager : **pnpm** ✅

**Raisons** :
- ⚡ Plus rapide que npm/yarn (installation, résolution dépendances)
- 💾 Économie d'espace disque (hard links vers store global)
- 🔒 Isolation stricte des dépendances (pas de phantom dependencies)
- 📦 Support natif des workspaces
- 🎯 Parfait pour monorepos

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json (root)
{
  "name": "edutrack-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter \"./apps/**\" dev",
    "dev:hub": "pnpm --filter hub dev",
    "dev:admin": "pnpm --filter admin dev",
    "dev:academic": "pnpm --filter academic dev",
    "build": "pnpm --filter \"./apps/**\" build",
    "test": "pnpm --filter \"./packages/**\" test"
  }
}
```

### Framework UI : **Shadcn/UI + Tailwind CSS** ✅

**Raisons** :
- ✅ Composants copiés dans votre codebase (pas de dépendance externe)
- ✅ Personnalisation totale
- ✅ Compatible Tailwind (déjà utilisé)
- ✅ Accessible (ARIA compliant)
- ✅ Design moderne et professionnel
- ✅ Communauté active

```bash
# Installation dans @edutrack/ui-components
npx shadcn-ui@latest init

# Ajouter des composants
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
```

### State Management : **Zustand** (si nécessaire)

Pour l'état global partagé entre apps :

```javascript
// @edutrack/utils/src/store/useUserStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      currentSchool: null,

      setUser: (user) => set({ user }),
      setCurrentSchool: (school) => set({ currentSchool: school }),

      logout: () => set({ user: null, currentSchool: null })
    }),
    {
      name: 'edutrack-user-storage'
    }
  )
);
```

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Phase 1 (App Admin)

- [ ] Temps de chargement < 2s
- [ ] 100% des utilisateurs migrés
- [ ] 0 erreur critique en production
- [ ] SSO fonctionnel (100% taux de succès login)

### KPIs Phase 2 (App Académique)

- [ ] Publication de notes < 1s
- [ ] Génération bulletin < 3s
- [ ] 95% satisfaction utilisateurs (enseignants)
- [ ] Événements inter-apps < 500ms latence

### KPIs Phase 3 (App Finance)

- [ ] Validation paiement < 2s
- [ ] Génération reçu < 1s
- [ ] 100% synchronisation avec App Académique
- [ ] 0 erreur de facturation

---

## 📅 TIMELINE GLOBALE

```
Semaine 1-2   : Setup monorepo + packages partagés
Semaine 3-4   : App Admin (CRUD écoles/utilisateurs)
Semaine 5-6   : API Gateway + Event Bus
Semaine 7-8   : App Académique (notes, bulletins)
Semaine 9-10  : App Académique (absences, emploi du temps)
Semaine 11-12 : App Finance (paiements, factures)
Semaine 13-14 : App Finance (comptabilité, relances)
Semaine 15    : Tests d'intégration globaux
Semaine 16    : Migration finale + déploiement

TOTAL : 4 mois (16 semaines)
```

---

## ✅ CHECKLIST DE DÉMARRAGE

### Avant de coder

- [ ] Valider ce plan avec l'équipe
- [ ] Créer le repository Git
- [ ] Configurer Vercel pour multi-apps
- [ ] Préparer l'instance Supabase (RLS renforcé)
- [ ] Installer pnpm globalement
- [ ] Créer la structure des dossiers

### Semaine 1 : Setup Infrastructure

- [ ] Initialiser monorepo avec pnpm workspaces
- [ ] Créer `apps/hub` (React + Vite)
- [ ] Créer `apps/admin` (React + Vite)
- [ ] Créer `packages/ui-components` (Shadcn/UI + Tailwind)
- [ ] Créer `packages/utils`
- [ ] Créer `packages/api-client`
- [ ] Configurer Tailwind partagé
- [ ] Configurer ESLint + Prettier

### Semaine 2 : Bases de l'API Gateway

- [ ] Implémenter client Supabase configuré
- [ ] Créer couche API Gateway basique
- [ ] Implémenter cache simple
- [ ] Créer Event Bus
- [ ] Implémenter SSO Manager
- [ ] Tester authentication flow

---

## 🎯 PROCHAINES ÉTAPES

1. **Valider ce plan** avec toutes les parties prenantes
2. **Ajuster si nécessaire** selon vos contraintes
3. **Créer les tickets/issues** pour chaque phase
4. **Commencer le setup** du monorepo (Semaine 1)

---

## 📞 CONTACT & SUPPORT

Pour toute question sur ce plan :
- Créer une issue dans le repo
- Contacter l'architecte technique
- Consulter la documentation `/docs`

---

**Document vivant** - Mis à jour régulièrement selon l'avancement du projet.
