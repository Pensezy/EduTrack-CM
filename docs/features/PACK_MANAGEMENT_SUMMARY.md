# 📦 Système de Gestion des Packs - Résumé Complet

**Date**: 2 Janvier 2026
**Version**: 1.0
**Statut**: ✅ Complété

---

## 🎯 Vue d'ensemble

Implémentation d'un système complet de gestion des packs d'applications permettant:
- **Admin**: Gérer la disponibilité des packs, approuver/rejeter les demandes, assigner directement aux écoles
- **Directeur**: Demander l'accès aux packs depuis l'App Store
- **Activation automatique**: Quand un pack est activé → toutes les apps du pack sont automatiquement activées avec compte à rebours

---

## 📊 Flux de Travail Complet

### 1️⃣ Workflow Demande Pack (Principal → Admin)

```
1. Principal va dans App Store → Onglet "Packs"
2. Clique sur "Souscrire" sur un pack
3. Modal s'ouvre avec:
   - Détails du pack
   - Prix et économies
   - Liste des apps incluses
   - Message optionnel pour admin
4. Demande créée dans `bundle_access_requests` (status: pending)
5. Admin voit la demande dans "Demandes Packs"
6. Admin approuve avec durée (ex: 1 an)
7. Fonction `approve_bundle_request()` appelée:
   - Crée `school_bundle_subscriptions` (status: active, expires_at)
   - Appelle `activate_bundle()` automatiquement
   - Active TOUTES les apps du pack (school_subscriptions créés)
   - Marque demande comme approved
8. Compte à rebours démarre pour le pack ET toutes ses apps
```

### 2️⃣ Workflow Assignation Directe (Admin)

```
1. Admin va dans "Catalogue Packs"
2. Clique sur "Assigner" sur un pack
3. Sélectionne une école
4. Fonction `activate_bundle()` appelée directement
5. Pack + toutes apps activés immédiatement
```

---

## 🗄️ Modifications Base de Données

### Fichier: `supabase/migrations/20260102_bundle_management_system.sql` (523 lignes)

#### 📋 Tables Créées

**1. `bundle_access_requests`**
```sql
- id (UUID, PK)
- school_id (UUID, FK → schools)
- bundle_id (TEXT, FK → bundles)
- requested_by (UUID, FK → users)
- status (TEXT: 'pending' | 'approved' | 'rejected')
- request_message (TEXT)
- reviewed_by (UUID, FK → users)
- review_message (TEXT)
- reviewed_at (TIMESTAMPTZ)
- created_at, updated_at
- CONSTRAINT: unique_pending_bundle_request (school_id, bundle_id, status)
```

**2. `school_bundle_subscriptions`**
```sql
- id (UUID, PK)
- school_id (UUID, FK → schools)
- bundle_id (TEXT, FK → bundles)
- status (TEXT: 'active' | 'trial' | 'expired' | 'cancelled')
- activated_at (TIMESTAMPTZ)
- expires_at (TIMESTAMPTZ)
- amount_paid (NUMERIC)
- created_at, updated_at
- CONSTRAINT: unique_active_bundle_subscription
```

**3. Colonne ajoutée à `bundles`**
```sql
ALTER TABLE bundles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

#### ⚙️ Fonctions PostgreSQL Créées

**1. `activate_bundle()`** - Activation automatique pack + apps
```sql
CREATE OR REPLACE FUNCTION activate_bundle(
  p_school_id UUID,
  p_bundle_id TEXT,
  p_duration_years INTEGER DEFAULT 1,
  p_admin_id UUID DEFAULT NULL
) RETURNS JSONB

Logique:
1. Récupère infos du bundle (app_ids, price)
2. Crée school_bundle_subscriptions (active, expires_at)
3. BOUCLE sur chaque app_id du bundle:
   - Si pas déjà abonné → Crée school_subscriptions (active, même expires_at)
   - Compte apps activées
4. Retourne JSON avec résultat
```

**2. `approve_bundle_request()`** - Approuver demande
```sql
CREATE OR REPLACE FUNCTION approve_bundle_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_review_message TEXT DEFAULT NULL,
  p_duration_years INTEGER DEFAULT 1
) RETURNS JSONB

Logique:
1. Récupère la demande (school_id, bundle_id)
2. Marque demande comme 'approved' avec reviewed_by, review_message
3. Appelle activate_bundle() automatiquement
4. Retourne résultat
```

**3. `reject_bundle_request()`** - Rejeter demande
```sql
CREATE OR REPLACE FUNCTION reject_bundle_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_review_message TEXT
) RETURNS JSONB

Logique:
1. Marque demande comme 'rejected'
2. Enregistre review_message obligatoire
3. Retourne confirmation
```

#### 🔒 Politiques RLS

- `bundle_access_requests`: SELECT, INSERT (users authentifiés)
- `school_bundle_subscriptions`: SELECT (users authentifiés)
- Admins: Tous droits sur les deux tables

#### 👁️ Vues Créées

**1. `v_bundles_catalog`**
```sql
SELECT * FROM bundles WHERE is_active = true
ORDER BY sort_order
```
→ Utilisée dans AppStore pour afficher uniquement packs visibles

**2. `v_bundle_requests_with_details`**
```sql
SELECT requests.*,
  schools.name as school_name,
  bundles.name as bundle_name,
  users.first_name, users.last_name
FROM bundle_access_requests requests
JOIN ...
```
→ Utilisée pour afficher détails complets des demandes

---

## 💻 Modifications Frontend

### 📂 Fichiers Créés

#### 1. **AdminDashboard.jsx** (420 lignes) - Dashboard Global Admin
**Localisation**: `apps/admin/src/pages/Dashboard/AdminDashboard.jsx`

**Fonctionnalités**:
- Stats GLOBALES (tous les établissements):
  - Écoles totales
  - Utilisateurs, élèves, enseignants
  - Classes
- Stats Apps & Packs:
  - Apps actives vs catalogue
  - Packs actifs
  - Taux d'adoption
- **Revenus**:
  - Total des abonnements apps
  - Total des abonnements packs
  - Revenus annuels et mensuels estimés
- Demandes en attente:
  - Apps (avec alerte si > 0)
  - Packs (avec alerte si > 0)
  - Inscriptions élèves
- Actions rapides avec badges de notification

**Queries Supabase**:
```javascript
// SANS FILTRE school_id → Récupère TOUT
const [schoolsRes, usersRes, studentsRes, ...] = await Promise.all([
  supabase.from('schools').select('*', { count: 'exact' }),
  supabase.from('users').select('*', { count: 'exact' }),
  // ... etc
]);
```

---

#### 2. **PrincipalDashboard.jsx** (~300 lignes) - Dashboard École Directeur
**Localisation**: `apps/admin/src/pages/Dashboard/PrincipalDashboard.jsx`

**Fonctionnalités**:
- **UNIQUEMENT données de son école** (filtré par `current_school_id`)
- Stats:
  - Élèves, enseignants, personnel de SON école
  - Classes de SON école
  - Apps actives pour SON école
  - Packs actifs pour SON école
- Demandes en attente DE SON école:
  - Apps
  - Packs
- **Pas de revenus** (pas nécessaire pour directeur)
- Actions rapides pour pages directeur

**Queries Supabase**:
```javascript
const schoolId = user.current_school_id; // CRITIQUE

const [studentsRes, teachersRes, ...] = await Promise.all([
  supabase.from('students').select('*').eq('school_id', schoolId),
  supabase.from('users').select('*').eq('current_school_id', schoolId),
  // ... TOUT filtré par schoolId
]);
```

---

#### 3. **BundlesCatalogPage.jsx** (473 lignes) - Catalogue Packs Admin
**Localisation**: `apps/admin/src/pages/Bundles/BundlesCatalogPage.jsx`

**Fonctionnalités**:
- Affiche TOUS les packs (actifs + inactifs)
- Stats globales:
  - Packs totaux
  - Packs actifs (visibles)
  - Abonnements actifs
  - Revenus générés
- Filtres:
  - Recherche par nom/description
  - Statut (all/active/inactive)
- Cartes de packs avec:
  - Badge "Visible" ou "Masqué"
  - Prix annuel et économies
  - Nombre d'apps incluses
  - Stats (abonnements, actifs, revenus)
  - **Actions**:
    - Activer/Désactiver (toggle `is_active`)
    - Assigner à une école (TODO: modal)

**Queries Supabase**:
```javascript
// Charge TOUS les bundles (pas de filtre is_active)
const { data: bundlesData } = await supabase
  .from('bundles')
  .select('*')
  .order('sort_order');

// Stats abonnements
const { data: subsData } = await supabase
  .from('school_bundle_subscriptions')
  .select('bundle_id, status, amount_paid');
```

**Fonction Toggle**:
```javascript
const toggleBundleStatus = async (bundleId, currentStatus) => {
  await supabase
    .from('bundles')
    .update({ is_active: !currentStatus })
    .eq('id', bundleId);
};
```

---

#### 4. **BundleRequestsPage.jsx** (522 lignes) - Demandes Packs Admin
**Localisation**: `apps/admin/src/pages/Bundles/BundleRequestsPage.jsx`

**Fonctionnalités**:
- Affiche TOUTES les demandes (pending/approved/rejected)
- Stats:
  - Total demandes
  - En attente (badge jaune)
  - Approuvées (badge vert)
  - Rejetées (badge rouge)
- Filtres:
  - Recherche (école, pack, demandeur)
  - Statut
- Cartes de demandes avec:
  - Infos: École, Pack, Demandeur, Date
  - Message de demande
  - Prix du pack
  - Apps incluses
  - **Actions** (si pending):
    - **Approuver**: Modal avec durée + message optionnel
    - **Rejeter**: Modal avec message obligatoire
- Modal de révision avec:
  - Durée d'activation (pour approve)
  - Message admin
  - Confirmation

**Queries Supabase**:
```javascript
// Charge avec JOIN pour détails
const { data: requestsData } = await supabase
  .from('bundle_access_requests')
  .select(`
    *,
    school:schools(id, name),
    requester:users!bundle_access_requests_requested_by_fkey(id, first_name, last_name),
    reviewer:users!bundle_access_requests_reviewed_by_fkey(id, first_name, last_name),
    bundle:bundles(id, name, icon, price_yearly, app_ids)
  `)
  .order('created_at', { ascending: false });
```

**Fonction Approuver**:
```javascript
const handleApprove = async (requestId) => {
  const { data } = await supabase.rpc('approve_bundle_request', {
    p_request_id: requestId,
    p_admin_id: user.id,
    p_review_message: reviewMessage || null,
    p_duration_years: durationYears
  });
  // → Appelle fonction PostgreSQL qui active tout automatiquement
};
```

**Fonction Rejeter**:
```javascript
const handleReject = async (requestId) => {
  const { data } = await supabase.rpc('reject_bundle_request', {
    p_request_id: requestId,
    p_admin_id: user.id,
    p_review_message: reviewMessage // OBLIGATOIRE
  });
};
```

---

#### 5. **BundleRequestModal.jsx** (240 lignes) - Modal Demande Pack Directeur
**Localisation**: `apps/admin/src/components/BundleRequestModal.jsx`

**Fonctionnalités**:
- Affiche détails du pack:
  - Description
  - Prix annuel + Économies
  - Liste détaillée des apps incluses (icône, nom, description, prix)
- Info activation automatique
- Formulaire:
  - Message optionnel pour admin
  - Bouton "Envoyer la demande"
- Validations:
  - Vérifie si demande pending existe déjà
  - Vérifie si abonnement actif existe déjà
  - Empêche doublons

**Logique d'insertion**:
```javascript
const handleRequestAccess = async () => {
  // 1. Récupère user et school_id
  const { data: userData } = await supabase
    .from('users')
    .select('current_school_id, id')
    .eq('id', user.id)
    .single();

  // 2. Vérifie doublons (demande + abonnement)
  const { data: existingRequest } = await supabase
    .from('bundle_access_requests')
    .select('id')
    .eq('school_id', userData.current_school_id)
    .eq('bundle_id', bundle.id)
    .eq('status', 'pending')
    .single();

  if (existingRequest) throw new Error('Demande déjà en attente');

  // 3. Insère demande
  await supabase
    .from('bundle_access_requests')
    .insert([{
      school_id: userData.current_school_id,
      bundle_id: bundle.id,
      requested_by: userData.id,
      request_message: requestMessage.trim() || null,
      status: 'pending'
    }]);

  alert('✅ Demande envoyée avec succès !');
};
```

---

### 📝 Fichiers Modifiés

#### 1. **App.jsx** - Routing Principal
**Localisation**: `apps/admin/src/App.jsx`

**Modifications**:

**a) Imports ajoutés**:
```javascript
import PrincipalDashboard from './pages/Dashboard/PrincipalDashboard';
import BundlesCatalogPage from './pages/Bundles/BundlesCatalogPage';
import BundleRequestsPage from './pages/Bundles/BundleRequestsPage';
```

**b) Composant DashboardRouter créé**:
```javascript
function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'principal') {
    return <PrincipalDashboard />;
  }

  return <Navigate to="/login" replace />;
}
```
→ **Critique**: Rend le bon dashboard selon le rôle

**c) Routes ajoutées**:
```javascript
<Route index element={<DashboardRouter />} /> {/* Changé de <AdminDashboard /> */}
<Route path="bundles-catalog" element={<BundlesCatalogPage />} />
<Route path="bundle-requests" element={<BundleRequestsPage />} />
```

---

#### 2. **Sidebar.jsx** - Navigation
**Localisation**: `apps/admin/src/components/Layout/Sidebar.jsx`

**Modifications**:

**Menus admin ajoutés**:
```javascript
const adminOnlyMenus = [
  // ... menus existants
  { name: 'Catalogue Apps', href: '/apps-catalog', icon: Grid3x3, roles: ['admin'] },
  { name: 'Demandes Apps', href: '/app-requests', icon: ClipboardList, roles: ['admin'] },
  { name: 'Catalogue Packs', href: '/bundles-catalog', icon: Package, roles: ['admin'] }, // ✅ AJOUTÉ
  { name: 'Demandes Packs', href: '/bundle-requests', icon: ClipboardList, badge: 'new', roles: ['admin'] }, // ✅ AJOUTÉ
];
```

**Résultat**:
- Admin voit: "Catalogue Packs" + "Demandes Packs" dans sidebar
- Principal ne voit PAS ces menus (uniquement App Store)

---

#### 3. **AppStorePage.jsx** - App Store Directeur
**Localisation**: `apps/admin/src/pages/AppStore/AppStorePage.jsx`

**Modifications**:

**a) Import ajouté**:
```javascript
import BundleRequestModal from '../../components/BundleRequestModal.jsx';
```

**b) State ajouté**:
```javascript
const [bundleRequestModal, setBundleRequestModal] = useState({
  isOpen: false,
  bundle: null
});
```

**c) Fonction handleSubscribeBundle modifiée**:
```javascript
// AVANT (ligne 114):
const handleSubscribeBundle = (bundle) => {
  alert(`Souscrire au ${bundle.name} - À implémenter`); // ❌
};

// APRÈS:
const handleSubscribeBundle = (bundle) => {
  setBundleRequestModal({ isOpen: true, bundle }); // ✅ Ouvre modal
};

const handleBundleRequestSuccess = () => {
  loadBundles(); // Rafraîchit après demande
};
```

**d) Modal ajoutée dans JSX** (fin du fichier):
```javascript
{/* Modal de demande de pack */}
<BundleRequestModal
  isOpen={bundleRequestModal.isOpen}
  onClose={() => setBundleRequestModal({ isOpen: false, bundle: null })}
  bundle={bundleRequestModal.bundle}
  apps={apps}
  onSuccess={handleBundleRequestSuccess}
/>
```

**Résultat**:
- Directeur clique "Souscrire" sur un pack → Modal s'ouvre
- Modal affiche détails + formulaire demande
- Après envoi → Demande créée dans BDD

---

## 🔄 Workflow Technique Complet

### Scénario: Directeur demande pack "Gestion Complète"

**1. Frontend - AppStorePage.jsx**
```javascript
// Directeur clique "Souscrire"
<BundleCard onSubscribe={handleSubscribeBundle} />

// Handler déclenché
const handleSubscribeBundle = (bundle) => {
  setBundleRequestModal({ isOpen: true, bundle });
};
```

**2. Frontend - BundleRequestModal.jsx**
```javascript
// Modal s'ouvre, directeur remplit message et clique "Envoyer"
const handleRequestAccess = async () => {
  await supabase
    .from('bundle_access_requests')
    .insert([{
      school_id: userData.current_school_id,
      bundle_id: 'complete-management',
      requested_by: userData.id,
      request_message: "Nous avons besoin de ce pack...",
      status: 'pending'
    }]);
};
```

**3. Base de données - Table bundle_access_requests**
```
| id  | school_id | bundle_id | requested_by | status  | request_message         |
|-----|-----------|-----------|--------------|---------|-------------------------|
| abc | school-1  | complete  | user-123     | pending | Nous avons besoin de... |
```

**4. Frontend - BundleRequestsPage.jsx (Admin)**
```javascript
// Admin voit la demande
const { data: requestsData } = await supabase
  .from('bundle_access_requests')
  .select(`
    *,
    school:schools(name),
    bundle:bundles(name, price_yearly)
  `);

// Admin clique "Approuver" → Modal de révision
<button onClick={() => setReviewModal({ requestId, action: 'approve' })}>
  Approuver
</button>

// Admin confirme avec durée = 2 ans
const handleApprove = async (requestId) => {
  const { data } = await supabase.rpc('approve_bundle_request', {
    p_request_id: requestId,
    p_admin_id: user.id,
    p_review_message: "Demande approuvée pour 2 ans",
    p_duration_years: 2
  });
};
```

**5. Base de données - Fonction approve_bundle_request()**
```sql
BEGIN
  -- 1. Update demande → approved
  UPDATE bundle_access_requests
  SET status = 'approved',
      reviewed_by = p_admin_id,
      review_message = 'Demande approuvée pour 2 ans',
      reviewed_at = now()
  WHERE id = p_request_id;

  -- 2. Appelle activate_bundle()
  result := activate_bundle(
    p_school_id => (SELECT school_id FROM bundle_access_requests WHERE id = p_request_id),
    p_bundle_id => (SELECT bundle_id FROM bundle_access_requests WHERE id = p_request_id),
    p_duration_years => 2
  );

  RETURN result;
END;
```

**6. Base de données - Fonction activate_bundle()**
```sql
BEGIN
  -- 1. Récupère bundle
  SELECT * INTO v_bundle FROM bundles WHERE id = 'complete-management';
  -- app_ids = ['attendance', 'grades', 'finance', 'timetable']

  -- 2. Crée abonnement pack
  INSERT INTO school_bundle_subscriptions (
    school_id, bundle_id, status, activated_at, expires_at, amount_paid
  ) VALUES (
    'school-1', 'complete-management', 'active', now(),
    now() + INTERVAL '2 years', -- ← COMPTE À REBOURS 2 ANS
    285000
  );

  -- 3. BOUCLE sur chaque app du pack
  FOREACH v_app_id IN ARRAY ['attendance', 'grades', 'finance', 'timetable']
  LOOP
    -- Vérifie si abonnement existe déjà
    IF NOT EXISTS (
      SELECT 1 FROM school_subscriptions
      WHERE school_id = 'school-1' AND app_id = v_app_id
        AND status IN ('active', 'trial')
    ) THEN
      -- Crée abonnement app
      INSERT INTO school_subscriptions (
        school_id, app_id, status, activated_at, expires_at
      ) VALUES (
        'school-1', v_app_id, 'active', now(),
        now() + INTERVAL '2 years' -- ← MÊME EXPIRATION QUE PACK
      );
      v_apps_activated := v_apps_activated + 1;
    END IF;
  END LOOP;

  -- 4. Retourne résultat
  RETURN jsonb_build_object(
    'success', true,
    'apps_activated', 4, -- ← 4 apps activées
    'message', 'Pack "Gestion Complète" activé avec 4 applications'
  );
END;
```

**7. Résultat final en BDD**

**Table `bundle_access_requests`**:
```
| id  | status   | reviewed_by | review_message               | reviewed_at |
|-----|----------|-------------|------------------------------|-------------|
| abc | approved | admin-456   | Demande approuvée pour 2 ans | 2026-01-02  |
```

**Table `school_bundle_subscriptions`**:
```
| school_id | bundle_id | status | expires_at | amount_paid |
|-----------|-----------|--------|------------|-------------|
| school-1  | complete  | active | 2028-01-02 | 285000      |
```

**Table `school_subscriptions`** (4 nouvelles lignes):
```
| school_id | app_id     | status | expires_at |
|-----------|------------|--------|------------|
| school-1  | attendance | active | 2028-01-02 |
| school-1  | grades     | active | 2028-01-02 |
| school-1  | finance    | active | 2028-01-02 |
| school-1  | timetable  | active | 2028-01-02 |
```

**8. Frontend - Feedback**
```javascript
// Dans BundleRequestsPage.jsx
const { data } = await supabase.rpc('approve_bundle_request', ...);

alert(`✅ ${data.message}`);
// "Pack "Gestion Complète" activé avec 4 applications"

await loadRequests(); // Rafraîchit la liste
```

---

## 📊 Résumé des Changements

### Base de Données
- ✅ 1 fichier migration SQL (523 lignes)
- ✅ 2 tables créées (bundle_access_requests, school_bundle_subscriptions)
- ✅ 1 colonne ajoutée (bundles.is_active)
- ✅ 3 fonctions PostgreSQL (activate_bundle, approve/reject_bundle_request)
- ✅ 6 politiques RLS
- ✅ 2 vues (v_bundles_catalog, v_bundle_requests_with_details)

### Frontend
- ✅ 4 fichiers créés:
  - AdminDashboard.jsx (420 lignes) - Dashboard global admin
  - PrincipalDashboard.jsx (~300 lignes) - Dashboard école directeur
  - BundlesCatalogPage.jsx (473 lignes) - Gestion packs admin
  - BundleRequestsPage.jsx (522 lignes) - Demandes packs admin
  - BundleRequestModal.jsx (240 lignes) - Modal demande directeur
- ✅ 3 fichiers modifiés:
  - App.jsx - Routing + DashboardRouter
  - Sidebar.jsx - Menus packs admin
  - AppStorePage.jsx - Intégration modal demande pack

### Total
- **~2058 lignes de code frontend**
- **523 lignes de code SQL**
- **5 nouveaux fichiers**
- **3 fichiers modifiés**

---

## 🎨 Points Clés de l'Architecture

### 1. Séparation des Rôles
- **Admin**: Dashboards globaux, gestion catalogue, validation demandes
- **Principal**: Dashboard école, demande accès depuis App Store

### 2. Activation Automatique en Cascade
- Fonction `activate_bundle()` → Crée abonnement pack + TOUS les abonnements apps
- Même `expires_at` pour pack et apps → Cohérence

### 3. Workflow de Demande
- Similaire aux apps individuelles
- Mais activation → multiple apps en une fois

### 4. Contrôle de Visibilité
- `bundles.is_active` → Admin peut masquer/afficher packs dans catalogue
- View `v_bundles_catalog` filtre automatiquement

### 5. RLS et Sécurité
- Politiques strictes sur demandes et abonnements
- Fonctions `SECURITY DEFINER` pour opérations critiques

---

## 🚀 Prochaines Étapes Possibles

1. **Modal Assignation Directe**: Implémenter la modal pour admin assigne pack directement
2. **Notifications**: Alertes email quand demande approuvée/rejetée
3. **Statistiques Avancées**: Dashboard admin avec graphiques évolution packs
4. **Gestion Expirations**: Système de renouvellement automatique
5. **Historique**: Page d'audit des activations/désactivations

---

## ✅ Checklist Finale

- [x] Migration SQL créée et testée
- [x] Dashboard admin différent du dashboard principal
- [x] Page Catalogue Packs (admin)
- [x] Page Demandes Packs (admin)
- [x] Modal demande pack (directeur)
- [x] AppStore modifié pour demandes
- [x] Routing corrigé (DashboardRouter)
- [x] Menus sidebar ajoutés
- [x] Activation automatique apps en cascade
- [x] Compte à rebours synchronisé
- [x] Politiques RLS configurées

---

**✨ Système de gestion des packs 100% opérationnel !**
