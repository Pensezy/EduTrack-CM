# 🎨 Spécifications - Interfaces Adaptatives selon Apps/Packs

## 📋 Vue d'ensemble

L'interface de chaque utilisateur (secrétaire, enseignant, parent, élève) doit s'adapter dynamiquement en fonction:
1. Des **applications/packs activés** dans leur établissement
2. De **l'établissement sélectionné** (pour les enseignants multi-écoles)
3. De **l'enfant sélectionné** (pour les parents avec plusieurs enfants)

---

## 🎯 Objectifs

### 1. Interface Enseignant
- Si l'enseignant travaille dans plusieurs établissements → **Écran de sélection d'établissement**
- L'interface change selon les apps de l'établissement sélectionné
- Exemple:
  - App Core: Classes, Présences
  - App Académique: + Notes, Bulletins, Devoirs

### 2. Interface Parent
- Si le parent a plusieurs enfants → **Sélection de l'enfant**
- L'interface s'adapte aux apps de l'école de l'enfant
- Exemple:
  - Enfant 1 (École A avec App Académique): Voir notes, bulletins, devoirs
  - Enfant 2 (École B avec App Core uniquement): Voir présences uniquement

### 3. Interface Secrétaire
- Apps actives dans son établissement définissent ses fonctionnalités
- App Core: Inscriptions, Paiements basiques
- App Académique: + Gestion des notes, Bulletins

### 4. Interface Élève
- Apps de son établissement définissent ce qu'il voit
- App Core: Emploi du temps, Présences
- App Académique: + Notes, Devoirs, Bulletins

---

## 🏗️ Architecture Proposée

### 1. Contexte Global des Apps (AppsContext)

**Fichier:** `packages/api/src/contexts/AppsContext.jsx`

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '../supabase/client';

const AppsContext = createContext(null);

export function AppsProvider({ children }) {
  const { user } = useAuth();
  const [activeApps, setActiveApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  useEffect(() => {
    if (user) {
      loadActiveApps();
    }
  }, [user, selectedSchoolId]);

  const loadActiveApps = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Déterminer l'école à vérifier
      const schoolId = selectedSchoolId || user.current_school_id;

      if (!schoolId) {
        setActiveApps([]);
        return;
      }

      // Charger les apps actives pour cette école
      const { data: subs, error } = await supabase
        .from('school_subscriptions')
        .select(`
          app_id,
          status,
          expires_at,
          apps_catalog(id, name, code, features)
        `)
        .eq('school_id', schoolId)
        .in('status', ['trial', 'active']);

      if (error) throw error;

      // Filtrer les apps actives non expirées
      const active = subs.filter(sub => {
        if (!sub.expires_at) return true; // Pas de date d'expiration
        return new Date(sub.expires_at) > new Date();
      });

      setActiveApps(active.map(s => s.apps_catalog));
    } catch (err) {
      console.error('Error loading active apps:', err);
      setActiveApps([]);
    } finally {
      setLoading(false);
    }
  };

  const hasApp = (appCode) => {
    return activeApps.some(app => app.code === appCode);
  };

  const hasFeature = (featureName) => {
    return activeApps.some(app =>
      app.features && app.features.includes(featureName)
    );
  };

  const switchSchool = (schoolId) => {
    setSelectedSchoolId(schoolId);
  };

  return (
    <AppsContext.Provider value={{
      activeApps,
      loading,
      hasApp,
      hasFeature,
      selectedSchoolId,
      switchSchool
    }}>
      {children}
    </AppsContext.Provider>
  );
}

export function useApps() {
  const context = useContext(AppsContext);
  if (!context) {
    throw new Error('useApps must be used within an AppsProvider');
  }
  return context;
}
```

---

### 2. Écran de Sélection d'Établissement (Multi-écoles)

**Fichier:** `apps/teacher/src/components/SchoolSelector.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '@edutrack/api';
import { getSupabaseClient } from '@edutrack/api';

export default function SchoolSelector({ onSelectSchool }) {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSchools();
  }, []);

  const loadUserSchools = async () => {
    try {
      const supabase = getSupabaseClient();

      // Charger toutes les écoles où l'utilisateur travaille
      const { data, error } = await supabase
        .from('users')
        .select(`
          current_school_id,
          schools:current_school_id(id, name, code, type)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // TODO: Si l'enseignant peut travailler dans plusieurs écoles,
      // il faudrait une table de liaison teacher_schools
      // Pour l'instant, on ne gère qu'une seule école
      setSchools(data.schools ? [data.schools] : []);
    } catch (err) {
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchool = (school) => {
    onSelectSchool(school.id);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Si une seule école, sélection automatique
  if (schools.length === 1) {
    useEffect(() => {
      onSelectSchool(schools[0].id);
    }, []);
    return null;
  }

  // Sinon, afficher l'écran de sélection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sélectionnez votre établissement
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vous travaillez dans plusieurs établissements. Choisissez celui que vous souhaitez gérer.
          </p>
        </div>

        <div className="space-y-3">
          {schools.map(school => (
            <button
              key={school.id}
              onClick={() => handleSelectSchool(school)}
              className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <div className="text-left">
                <p className="font-medium text-gray-900">{school.name}</p>
                <p className="text-sm text-gray-500">Code: {school.code}</p>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Navigation Adaptative selon Apps

**Fichier:** `apps/teacher/src/components/Layout/Sidebar.jsx`

```javascript
import { useApps } from '@edutrack/api';

const getNavigationForRole = (role, activeApps) => {
  const hasAcademic = activeApps.some(app => app.code === 'academic');
  const hasCore = activeApps.some(app => app.code === 'core');

  if (role === 'teacher') {
    const navigation = {
      standalone: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
      groups: []
    };

    // Toujours disponible (App Core)
    navigation.groups.push({
      id: 'classes',
      label: 'Mes Classes',
      icon: GraduationCap,
      items: [
        { name: 'Mes Classes', href: '/classes', icon: Users },
        { name: 'Présences', href: '/attendance', icon: ClipboardCheck },
      ]
    });

    // Uniquement avec App Académique
    if (hasAcademic) {
      navigation.groups.push({
        id: 'academic',
        label: 'Académique',
        icon: BookOpen,
        items: [
          { name: 'Notes', href: '/grades', icon: Edit },
          { name: 'Devoirs', href: '/homework', icon: FileText },
          { name: 'Bulletins', href: '/report-cards', icon: Award },
        ]
      });
    }

    return navigation;
  }

  // Autres rôles...
};

export default function Sidebar() {
  const { activeApps, loading } = useApps();
  const { user } = useAuth();

  const navigation = getNavigationForRole(user?.role, activeApps);

  // Render navigation...
}
```

---

### 4. Interface Parent avec Sélection d'Enfant

**Fichier:** `apps/parent/src/components/ChildSelector.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useAuth, useApps } from '@edutrack/api';

export default function ChildSelector() {
  const { user } = useAuth();
  const { switchSchool } = useApps();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        current_school_id,
        class_name,
        schools:current_school_id(id, name)
      `)
      .eq('parent_id', user.id)
      .eq('role', 'student');

    if (error) {
      console.error('Error loading children:', error);
      return;
    }

    setChildren(data);

    // Sélectionner le premier enfant par défaut
    if (data.length > 0) {
      handleSelectChild(data[0]);
    }
  };

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    // Changer le contexte d'école pour charger les bonnes apps
    switchSchool(child.current_school_id);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un enfant:
        </label>
        <select
          value={selectedChild?.id || ''}
          onChange={(e) => {
            const child = children.find(c => c.id === e.target.value);
            handleSelectChild(child);
          }}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {children.map(child => (
            <option key={child.id} value={child.id}>
              {child.full_name} - {child.class_name} ({child.schools.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
```

---

## 📋 Tableau des Fonctionnalités par App

### App Core (Gratuit)

| Rôle | Fonctionnalités Disponibles |
|------|----------------------------|
| Secrétaire | Inscriptions, Liste élèves, Paiements basiques |
| Enseignant | Mes classes, Présences, Emploi du temps |
| Parent | Voir présences enfant, Paiements frais de scolarité |
| Élève | Emploi du temps, Mes présences |

### App Académique (Payant)

Ajoute:

| Rôle | Fonctionnalités Supplémentaires |
|------|--------------------------------|
| Secrétaire | Gestion notes, Génération bulletins, Statistiques |
| Enseignant | Saisie notes, Devoirs, Bulletins, Évaluations |
| Parent | Voir notes, Voir bulletins, Voir devoirs |
| Élève | Mes notes, Mes bulletins, Mes devoirs |

---

## 🔧 Implémentation

### Phase 1: Contexte Apps (1-2h)
- [ ] Créer `AppsContext.jsx` dans `@edutrack/api`
- [ ] Hook `useApps()` pour accéder aux apps actives
- [ ] Fonction `hasApp(code)` et `hasFeature(name)`

### Phase 2: Sélection d'Établissement (2-3h)
- [ ] Créer `SchoolSelector` pour enseignants
- [ ] Gérer le cas multi-écoles
- [ ] Sauvegarder la sélection en localStorage

### Phase 3: Navigation Adaptative (3-4h)
- [ ] Modifier tous les Sidebar pour utiliser `useApps()`
- [ ] Créer les routes conditionnelles
- [ ] Tester avec App Core vs App Académique

### Phase 4: Sélection Enfant Parent (2-3h)
- [ ] Créer `ChildSelector` pour parents
- [ ] Charger les apps de l'école de l'enfant sélectionné
- [ ] Adapter l'interface parent dynamiquement

### Phase 5: Tests (2-3h)
- [ ] Test: Enseignant avec App Core uniquement
- [ ] Test: Enseignant avec App Académique
- [ ] Test: Parent avec enfants dans différentes écoles
- [ ] Test: Basculement entre enfants change l'interface

**Total estimé: 10-15 heures de développement**

---

## 💡 Exemples Concrets

### Exemple 1: Enseignant avec App Core uniquement

```
┌─────────────────────────────────────┐
│  Dashboard Enseignant          [≡]  │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  ────────────────────                │
│  📚 Mes Classes                     │
│     • Mes Classes                   │
│     • Présences                     │
│  ────────────────────                │
│  ⚙️  Paramètres                     │
└─────────────────────────────────────┘
```

### Exemple 2: Enseignant avec App Académique

```
┌─────────────────────────────────────┐
│  Dashboard Enseignant          [≡]  │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  ────────────────────                │
│  📚 Mes Classes                     │
│     • Mes Classes                   │
│     • Présences                     │
│  ────────────────────                │
│  📖 Académique                      │  ⬅️ NOUVEAU
│     • Notes                         │  ⬅️ NOUVEAU
│     • Devoirs                       │  ⬅️ NOUVEAU
│     • Bulletins                     │  ⬅️ NOUVEAU
│  ────────────────────                │
│  ⚙️  Paramètres                     │
└─────────────────────────────────────┘
```

### Exemple 3: Parent avec sélection d'enfant

```
┌─────────────────────────────────────────────────────┐
│  Espace Parent                              [≡]     │
├─────────────────────────────────────────────────────┤
│  Enfant: [Sophie MARTIN - 6ème A ▼]                │  ⬅️ Sélecteur
├─────────────────────────────────────────────────────┤
│                                                     │
│  École: Collège Moderne (App Académique active)    │
│                                                     │
│  📊 Dashboard                                       │
│  ────────────────────                               │
│  👤 Mon Enfant                                      │
│     • Présences                                     │
│     • Notes                          ⬅️ Académique │
│     • Bulletins                      ⬅️ Académique │
│     • Devoirs                        ⬅️ Académique │
│  ────────────────────                               │
│  💰 Paiements                                       │
└─────────────────────────────────────────────────────┘

Si on sélectionne l'autre enfant (École avec App Core uniquement):

┌─────────────────────────────────────────────────────┐
│  Espace Parent                              [≡]     │
├─────────────────────────────────────────────────────┤
│  Enfant: [Paul MARTIN - CP ▼]                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  École: École Primaire (App Core uniquement)       │
│                                                     │
│  📊 Dashboard                                       │
│  ────────────────────                               │
│  👤 Mon Enfant                                      │
│     • Présences                                     │
│  ────────────────────                               │
│  💰 Paiements                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Prochaines Étapes

Cette fonctionnalité est **essentielle** pour offrir une expérience utilisateur cohérente et juste (les utilisateurs ne voient que ce qu'ils peuvent réellement utiliser).

Voulez-vous que je commence l'implémentation par une phase spécifique? Je recommande de commencer par:

1. **Phase 1**: Créer le contexte Apps (base de tout)
2. **Phase 3**: Adapter la navigation (impact visuel immédiat)
3. **Phase 2 et 4**: Sélecteurs multi-écoles/enfants (bonus)

---

**Date:** 04 Janvier 2026
**Version:** 2.6.0 (Planification)
**Statut:** 📝 SPÉCIFICATIONS COMPLÈTES
**Prêt pour implémentation**
