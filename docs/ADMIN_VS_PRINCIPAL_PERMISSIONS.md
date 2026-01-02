# Différences Admin vs Directeur (Principal)

**Date :** 2 janvier 2026
**Version :** 2.3.4
**Fichiers modifiés :** Sidebar.jsx, UserFormModal.jsx

---

## 🎯 Vue d'Ensemble

EduTrack Admin possède **deux rôles principaux** avec des permissions et interfaces distinctes :

1. **Administrateur (`admin`)** : Accès complet à toutes les écoles et fonctionnalités
2. **Directeur (`principal`)** : Accès limité à son établissement uniquement

---

## 🔐 Matrice des Permissions

| Fonctionnalité | Admin | Directeur | Notes |
|---------------|-------|-----------|-------|
| **Navigation** |
| Dashboard | ✅ | ✅ | Vue différente selon le rôle |
| Écoles (toutes) | ✅ | ❌ | Admin voit tout, directeur voit sa seule école |
| Utilisateurs (tous) | ✅ | ❌ | Directeur ne voit que personnel/élèves/parents de son école |
| Classes (toutes) | ✅ | ❌ | Filtrage automatique par école pour directeur |
| Demandes d'inscription | ✅ | ❌ | Admin uniquement |
| Personnel global | ✅ | ❌ | Admin uniquement |
| **App Store** | ✅ | ❌ | **Admin uniquement** |
| **Mes Apps** | ✅ | ❌ | **Admin uniquement** |
| Paramètres | ✅ | ✅ | Tous deux |
| **Création d'utilisateurs** |
| Créer Admin | ✅ | ❌ | Admin uniquement |
| Créer Directeur | ✅ | ❌ | Admin uniquement |
| Créer Enseignant | ✅ | ✅ | Directeur limité à son école |
| Créer Secrétaire | ✅ | ✅ | Directeur limité à son école |
| Créer Élève | ✅ | ✅ | Directeur limité à son école |
| Créer Parent | ✅ | ✅ | Directeur limité à son école |
| **Gestion des écoles** |
| Voir toutes les écoles | ✅ | ❌ | Admin voit tout |
| Voir son école | ✅ | ✅ | Directeur voit uniquement la sienne |
| Créer école | ✅ | ❌ | Admin uniquement |
| Modifier école | ✅ | ✅ | Directeur peut modifier sa propre école |
| Supprimer école | ✅ | ❌ | Admin uniquement |
| **Gestion des classes** |
| Voir toutes les classes | ✅ | ❌ | Admin voit tout |
| Voir classes de son école | ✅ | ✅ | Auto-filtré pour directeur |
| Créer classe | ✅ | ✅ | Directeur limité à son école |
| Modifier classe | ✅ | ✅ | Directeur limité à son école |
| Supprimer classe | ✅ | ✅ | Directeur limité à son école |

---

## 📋 Détails des Implémentations

### 1. Navigation (Sidebar.jsx)

#### Configuration Admin
```javascript
const adminOnlyMenus = [
  { name: 'Écoles', href: '/schools', icon: School, roles: ['admin'] },
  { name: 'Utilisateurs', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Classes', href: '/classes', icon: GraduationCap, roles: ['admin'] },
  { name: 'Demandes', href: '/enrollment', icon: FileText, roles: ['admin'] },
  { name: 'Personnel', href: '/personnel', icon: UserCog, roles: ['admin'] },
  { name: 'App Store', href: '/app-store', icon: Store, badge: 'new', roles: ['admin'] },
  { name: 'Mes Apps', href: '/my-apps', icon: Package, roles: ['admin'] },
];
```

#### Configuration Directeur
```javascript
const principalOnlyMenus = [
  { name: 'Mon École', href: '/schools', icon: School, roles: ['principal'] },
  { name: 'Personnel', href: '/users', icon: Users, roles: ['principal'] },
  { name: 'Classes', href: '/classes', icon: GraduationCap, roles: ['principal'] },
  { name: 'Élèves & Parents', href: '/personnel', icon: UserCog, roles: ['principal'] },
];
```

**Titre de l'application :**
- Admin : `EduTrack Admin`
- Directeur : `EduTrack Directeur`

---

### 2. Page Utilisateurs (UsersPage.jsx)

#### Filtrage des données

**Admin :**
```javascript
// Pas de filtre - voit TOUS les utilisateurs
let query = supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false });
```

**Directeur :**
```javascript
// Filtrage strict
if (user?.role === 'principal' && user?.current_school_id) {
  query = query
    .eq('current_school_id', user.current_school_id)
    .in('role', ['teacher', 'secretary', 'student', 'parent']);
}
```

#### Filtres de rôles disponibles

**Admin :**
```jsx
<option value="admin">Administrateur</option>
<option value="principal">Directeur</option>
<option value="teacher">Enseignant</option>
<option value="secretary">Secrétaire</option>
<option value="student">Élève</option>
<option value="parent">Parent</option>
```

**Directeur :**
```jsx
<option value="teacher">Enseignant</option>
<option value="secretary">Secrétaire</option>
<option value="student">Élève</option>
<option value="parent">Parent</option>
```

---

### 3. Création d'Utilisateurs (UserFormModal.jsx)

#### Rôles créables

**Admin :**
```jsx
{currentUser?.role === 'admin' && (
  <>
    <option value="admin">Administrateur</option>
    <option value="principal">Directeur</option>
  </>
)}
<option value="teacher">Enseignant</option>
<option value="secretary">Secrétaire</option>
<option value="student">Élève</option>
<option value="parent">Parent</option>
```

**Directeur :**
```jsx
<option value="teacher">Enseignant</option>
<option value="secretary">Secrétaire</option>
<option value="student">Élève</option>
<option value="parent">Parent</option>
```

#### Gestion du champ "École"

**Pour Admin/Principal (en tant qu'utilisateur créé) :**
```javascript
// L'école n'est PAS requise pour admin/principal
const rolesWithoutSchool = ['admin', 'principal'];
if (!rolesWithoutSchool.includes(formData.role) && !formData.current_school_id) {
  throw new Error('L\'école est requise pour ce type d\'utilisateur');
}

// Si on crée un admin ou principal, retirer l'école (doit être NULL)
if (rolesWithoutSchool.includes(formData.role)) {
  formData.current_school_id = null;
}
```

**Interface :**
```jsx
<label>
  École {!['admin', 'principal'].includes(formData.role) && '*'}
</label>
<select
  required={!['admin', 'principal'].includes(formData.role)}
  disabled={
    currentUser?.role === 'principal' ||
    ['admin', 'principal'].includes(formData.role)
  }
>
  <option value="">
    {['admin', 'principal'].includes(formData.role)
      ? 'Aucune école (accès global)'
      : 'Sélectionner une école'}
  </option>
  {/* ... */}
</select>

{['admin', 'principal'].includes(formData.role) && (
  <p className="text-xs text-blue-600">
    ℹ️ Les {formData.role === 'admin' ? 'administrateurs' : 'directeurs'} ont accès à toutes les écoles
  </p>
)}
```

#### Validation de sécurité

**Pour Directeur créant un utilisateur :**
```javascript
if (currentUser?.role === 'principal') {
  const allowedRoles = ['teacher', 'secretary', 'student', 'parent'];
  if (!allowedRoles.includes(formData.role)) {
    throw new Error('Vous n\'êtes pas autorisé à créer ce type d\'utilisateur');
  }

  // Vérifier que l'école correspond bien à celle du directeur
  if (formData.current_school_id !== currentUser.current_school_id) {
    throw new Error('Vous ne pouvez créer des utilisateurs que pour votre propre école');
  }
}
```

---

### 4. Page Écoles (SchoolsPage.jsx)

**Admin :**
```javascript
// Voit TOUTES les écoles
let query = supabase
  .from('schools')
  .select('*')
  .order('created_at', { ascending: false });
```

**Directeur :**
```javascript
// Voit UNIQUEMENT son école
if (user?.role === 'principal' && user?.current_school_id) {
  query = query.eq('id', user.current_school_id);
}
```

---

### 5. Page Classes (ClassesPage.jsx)

**Admin :**
```javascript
// Voit TOUTES les classes de toutes les écoles
let query = supabase
  .from('classes')
  .select('*')
  .order('level', { ascending: true });
```

**Directeur :**
```javascript
// Voit UNIQUEMENT les classes de son école
if (user?.role === 'principal' && user?.current_school_id) {
  query = query.eq('school_id', user.current_school_id);
}
```

---

## 🎨 Différences Visuelles

### Logo / Titre
- **Admin** : `EduTrack Admin`
- **Directeur** : `EduTrack Directeur`

### Menu Navigation
- **Admin** : 9 items (Dashboard, Écoles, Utilisateurs, Classes, Demandes, Personnel, App Store, Mes Apps, Paramètres)
- **Directeur** : 5 items (Dashboard, Mon École, Personnel, Classes, Élèves & Parents, Paramètres)

### Badge "NEW" sur App Store
- Visible uniquement pour les **admins**

---

## 🔍 Cas d'Usage

### Cas 1 : Création d'un nouvel Admin

**Acteur :** Administrateur existant
**Processus :**
1. Aller sur `/users`
2. Cliquer "Autre" (ou "Nouvelle classe" dans le menu)
3. Sélectionner rôle "Administrateur"
4. ⚠️ Le champ "École" devient **désactivé** et affiche "Aucune école (accès global)"
5. Remplir nom, email, téléphone
6. Sauvegarder → `current_school_id = NULL` dans la BDD

### Cas 2 : Création d'un Directeur

**Acteur :** Administrateur
**Processus :**
1. Aller sur `/users`
2. Cliquer "Autre"
3. Sélectionner rôle "Directeur"
4. ⚠️ Le champ "École" devient **optionnel** (mais peut être renseigné si on veut lier à une école spécifique)
5. Généralement, on laisse `current_school_id = NULL` pour un directeur
6. **Après création**, aller sur `/schools` et assigner le directeur à une école via le bouton "Gérer Admin"

### Cas 3 : Directeur créant un Enseignant

**Acteur :** Directeur
**Processus :**
1. Aller sur `/users` (ne voit que personnel/élèves/parents de son école)
2. Cliquer "Enseignant"
3. Le champ "École" est **pré-sélectionné** et **désactivé** (son école uniquement)
4. Remplir les informations spécifiques enseignant (matières, horaires, etc.)
5. Sauvegarder

### Cas 4 : Admin visualisant toutes les données

**Acteur :** Administrateur
**Processus :**
1. Aller sur `/schools` → Voit **toutes les écoles** du système
2. Aller sur `/users` → Voit **tous les utilisateurs** (admins, directeurs, enseignants, élèves, parents)
3. Peut filtrer par rôle : `admin`, `principal`, `teacher`, etc.
4. Aller sur `/classes` → Voit **toutes les classes** de toutes les écoles
5. Accès à `/app-store` et `/my-apps`

### Cas 5 : Directeur visualisant ses données

**Acteur :** Directeur
**Processus :**
1. Aller sur `/schools` → Voit **uniquement son école**
2. Aller sur `/users` → Voit **uniquement** enseignants, secrétaires, élèves, parents de son école
3. Ne peut PAS filtrer par `admin` ou `principal` (options invisibles)
4. Aller sur `/classes` → Voit **uniquement les classes de son école**
5. **Pas d'accès** à `/app-store` ni `/my-apps` (menus invisibles)

---

## ⚠️ Points de Sécurité

### Backend (Supabase RLS)

Les politiques RLS (Row Level Security) doivent être configurées pour **double-vérifier** ces permissions :

```sql
-- Exemple : Politique RLS pour la table users
CREATE POLICY "Admins can see all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Principals can see only their school users"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users
      WHERE role = 'principal'
      AND current_school_id = users.current_school_id
    )
    AND role IN ('teacher', 'secretary', 'student', 'parent')
  );
```

### Frontend (Validation)

Les validations côté frontend sont **indicatives** mais ne remplacent PAS les politiques RLS. Elles améliorent l'UX en bloquant les actions non autorisées avant l'envoi au serveur.

---

## 📊 Récapitulatif Visuel

### Interface Admin

```
┌─────────────────────────────────────────┐
│ 🎓 EduTrack Admin                       │
├─────────────────────────────────────────┤
│ 📊 Dashboard                            │
│ 🏫 Écoles                     (TOUTES)  │
│ 👥 Utilisateurs              (TOUS)    │
│ 🎓 Classes                    (TOUTES)  │
│ 📄 Demandes                             │
│ 👔 Personnel                            │
│ 🛍️  App Store                    [NEW]  │
│ 📦 Mes Apps                             │
│ ⚙️  Paramètres                          │
└─────────────────────────────────────────┘
```

### Interface Directeur

```
┌─────────────────────────────────────────┐
│ 🎓 EduTrack Directeur                   │
├─────────────────────────────────────────┤
│ 📊 Dashboard                            │
│ 🏫 Mon École              (1 seule)     │
│ 👥 Personnel              (son école)   │
│ 🎓 Classes                (son école)   │
│ 👨‍👩‍👧‍👦 Élèves & Parents    (son école)   │
│ ⚙️  Paramètres                          │
└─────────────────────────────────────────┘
```

---

## 🧪 Tests de Validation

### Test 1 : Admin voit tous les utilisateurs
```
1. Se connecter en tant qu'admin
2. Aller sur /users
3. Vérifier que le filtre contient "Administrateur" et "Directeur"
4. Filtrer par "Administrateur" → Doit voir tous les admins
5. Filtrer par "Directeur" → Doit voir tous les directeurs
```

### Test 2 : Directeur ne voit que son personnel
```
1. Se connecter en tant que directeur
2. Aller sur /users
3. Vérifier que le filtre NE contient PAS "Administrateur" ni "Directeur"
4. Vérifier que tous les utilisateurs affichés ont le même current_school_id
5. Essayer d'accéder à /app-store → Redirection ou 404
```

### Test 3 : Admin crée un nouvel admin
```
1. Se connecter en tant qu'admin
2. Aller sur /users
3. Cliquer "Autre"
4. Sélectionner rôle "Administrateur"
5. Vérifier que le champ "École" est désactivé et affiche "Aucune école"
6. Remplir nom: "Test Admin", email: "test@admin.cm"
7. Sauvegarder
8. Vérifier en BDD que current_school_id = NULL
```

### Test 4 : Directeur ne peut pas créer d'admin
```
1. Se connecter en tant que directeur
2. Aller sur /users
3. Cliquer "Autre"
4. Vérifier que le select "Rôle" ne contient PAS "Administrateur" ni "Directeur"
5. Essayer de créer un enseignant pour une autre école → Erreur bloquée
```

### Test 5 : Menus visibles selon le rôle
```
1. Se connecter en tant qu'admin
2. Vérifier présence de "App Store" et "Mes Apps" dans sidebar
3. Se déconnecter
4. Se connecter en tant que directeur
5. Vérifier ABSENCE de "App Store" et "Mes Apps"
6. Vérifier présence de "Mon École" au lieu de "Écoles"
```

---

## 📝 Notes de Développement

### Variables d'Environnement

Aucune variable spécifique requise. Les permissions sont gérées via le rôle dans `auth.users`.

### Base de Données

**Champs importants :**
- `users.role` : `'admin' | 'principal' | 'teacher' | 'secretary' | 'student' | 'parent'`
- `users.current_school_id` : `UUID | NULL`
  - **NULL pour admin** (accès global)
  - **NULL pour principal** (ou ID de l'école assignée via schools.director_user_id)
  - **Requis pour teacher/secretary/student/parent**

### Hooks et Contextes

- `useAuth()` : Fournit `user.role` et `user.current_school_id`
- Ces valeurs sont utilisées partout pour filtrer les données et contrôler l'UI

---

## 🛍️ Gestion App Store & Bundles (Admin Uniquement)

### Vue d'Ensemble

L'**Admin** a un contrôle complet sur l'écosystème des applications :

1. **App Store** : Catalogue global de toutes les applications disponibles
2. **Mes Apps** : Suivi des abonnements et statistiques d'utilisation
3. **Gestion des Écoles** : Assignation d'apps et de bundles par établissement
4. **Gestion des Apps** : Contrôle du statut de développement (ready, beta, in_development)

Le **Directeur** n'a **AUCUN accès** à ces fonctionnalités.

---

### 1. Permissions App Store

| Action | Admin | Directeur |
|--------|-------|-----------|
| Accéder à /app-store | ✅ | ❌ |
| Accéder à /my-apps | ✅ | ❌ |
| Voir catalogue apps | ✅ | ❌ |
| Souscrire à une app | ✅ | ❌ |
| Annuler abonnement | ✅ | ❌ |
| Démarrer essai gratuit | ✅ | ❌ |
| Voir bundles | ✅ | ❌ |
| Assigner app à école | ✅ | ❌ |
| Changer statut dev | ✅ | ❌ |

### 2. SchoolAdminModal - Gestion par École

**Accès :** Bouton "Gérer Admin" sur [SchoolsPage.jsx:XXX](apps/admin/src/pages/Schools/SchoolsPage.jsx)

**4 Onglets disponibles :**

#### Onglet "Apps"
```jsx
// Liste TOUTES les apps avec toggle par école
{apps.map(app => (
  <div>
    <h4>{app.name}</h4>
    {getDevelopmentBadge(app.development_status)}
    {getStatusBadge(getSubscriptionStatus(app.id))}
    <button onClick={() => handleToggleSubscription(app.id)}>
      <Power className={isActive ? 'text-green-600' : 'text-gray-400'} />
    </button>
  </div>
))}
```

**Actions par app :**
- ✅ Activer/Désactiver pour cette école
- ✅ Changer statut dev : ready, beta, in_development
- ✅ Voir statut abonnement : active, trial, cancelled

#### Onglet "Bundles"
```jsx
// Packs d'applications à prix réduit
<BundleCard
  bundle={bundle}
  onSubscribe={() => handleSubscribeBundle(bundle)}
/>
```

**Actions :**
- ✅ Assigner bundle complet à l'école
- ✅ Voir apps incluses + économie réalisée

#### Onglet "Stats"
```jsx
// Statistiques de l'école
const stats = await supabase.rpc('get_school_stats', {
  p_school_id: school.id
});

// Affiche : total_users, total_students, total_teachers, total_classes
```

### 3. Statuts de Développement

**ready** : ✅ Production, recommandé
**beta** : ⚠️ Phase test, bugs possibles
**in_development** : 🚧 Non recommandé

**Changement de statut :**
```javascript
await supabase
  .from('apps')
  .update({ development_status: 'ready' })
  .eq('id', appId);
```

### 4. Flux : Assigner une App à une École

1. Admin → `/schools`
2. Cliquer "Gérer Admin" sur une école
3. Onglet "Apps"
4. Toggle Power pour activer l'app
5. Crée `school_subscriptions` avec status='active', expires_at=+1 an

---

## 🔄 Historique des Modifications

| Date | Version | Modification |
|------|---------|--------------|
| 2026-01-02 | 2.3.4 | Ajout filtrage navigation selon rôle (Sidebar.jsx) |
| 2026-01-02 | 2.3.4 | Correction UserFormModal pour admin/principal sans école |
| 2026-01-02 | 2.3.4 | Ajout messages d'aide pour champ "École" |
| 2026-01-02 | 2.3.4 | Documentation complète App Store, bundles et gestion apps |

---

**Auteur :** Claude Sonnet 4.5
**Date de création :** 2 janvier 2026
**Dernière mise à jour :** 2 janvier 2026
**Statut :** ✅ Implémenté et documenté
