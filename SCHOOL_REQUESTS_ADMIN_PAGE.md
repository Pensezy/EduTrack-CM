# 📋 Page de Gestion des Demandes d'Établissements (Admin)

## 📍 Vue d'ensemble

Création complète d'une interface admin pour gérer les demandes de création d'établissements scolaires soumises par les utilisateurs avec abonnement payant.

**Route:** `/schools/requests`
**Accès:** Administrateurs uniquement
**Date:** 04 Janvier 2026
**Version:** 2.5.0

---

## 🎯 Fonctionnalités

### 1. **Liste des Demandes**
- Affichage de toutes les demandes avec informations clés
- Support des 3 statuts: pending, approved, rejected
- Recherche multi-critères (nom, code, ville, région, directeur)
- Filtrage par statut
- Tri par date de création (plus récentes en premier)

### 2. **Détails des Demandes**
Chaque carte affiche:
- **Établissement:** Nom, code, type, statut (privé/public)
- **Localisation:** Région, département, ville
- **Directeur:** Nom complet, email
- **Demandeur:** Qui a fait la demande et quand
- **État:** Badge de statut coloré

### 3. **Actions Administratives**

#### A. Voir les Détails
- Modal affichant toutes les informations de la demande
- Justification complète fournie par le demandeur

#### B. Approuver une Demande (Status: Pending)
- Modal de confirmation avec champ de notes optionnel
- Appel à la fonction SQL `approve_school_request()`
- Actions automatiques:
  - Création du compte directeur (ou liaison si existe)
  - Création de l'établissement
  - Activation de l'App Core gratuite
  - Mise à jour du status → 'approved'
  - Notification au demandeur (succès)
  - Enregistrement de l'admin qui a approuvé + date

#### C. Rejeter une Demande (Status: Pending)
- Modal avec champ de raison obligatoire
- Appel à la fonction SQL `reject_school_request()`
- Actions automatiques:
  - Mise à jour du status → 'rejected'
  - Notification au demandeur avec raison
  - Enregistrement de l'admin qui a rejeté + date

### 4. **Affichage Post-Traitement**
Pour les demandes approved/rejected:
- Affichage du revieweur (nom de l'admin)
- Date de la décision
- Notes/raison fournie
- Pour les approuvées: lien vers l'établissement créé

---

## 🗂️ Structure des Fichiers

### Fichiers Créés

#### 1. **SchoolRequestsPage.jsx** (550 lignes)
**Localisation:** `apps/admin/src/pages/SchoolRequests/SchoolRequestsPage.jsx`

**Composants inclus:**
- `SchoolRequestsPage` (composant principal)
- `ViewRequestModal` (modal de visualisation détaillée)
- `ApproveRequestModal` (modal d'approbation)
- `RejectRequestModal` (modal de rejet)

**States:**
```javascript
const [requests, setRequests] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [searchQuery, setSearchQuery] = useState('');
const [filterStatus, setFilterStatus] = useState('all');

const [viewModal, setViewModal] = useState({ isOpen: false, request: null });
const [approveModal, setApproveModal] = useState({ isOpen: false, request: null });
const [rejectModal, setRejectModal] = useState({ isOpen: false, request: null });
```

**Requête principale:**
```javascript
const { data, error } = await supabase
  .from('school_creation_requests')
  .select(`
    *,
    requester:requester_user_id(id, full_name, email, phone),
    reviewer:reviewed_by_user_id(id, full_name, email),
    created_school:created_school_id(id, name, code)
  `)
  .order('created_at', { ascending: false });
```

#### 2. **index.js**
**Localisation:** `apps/admin/src/pages/SchoolRequests/index.js`

```javascript
export { default } from './SchoolRequestsPage.jsx';
```

### Fichiers Modifiés

#### 1. **App.jsx**
**Localisation:** `apps/admin/src/App.jsx`

**Ligne 8:** Ajout de l'import
```javascript
import SchoolRequestsPage from './pages/SchoolRequests';
```

**Ligne 119:** Ajout de la route
```javascript
<Route path="schools/requests" element={<SchoolRequestsPage />} />
```

#### 2. **Sidebar.jsx**
**Localisation:** `apps/admin/src/components/Layout/Sidebar.jsx`

**Ligne 21:** Ajout de l'icône
```javascript
import { ..., FileCheck } from 'lucide-react';
```

**Ligne 40:** Ajout du lien dans le groupe "Gestion Écoles"
```javascript
{
  id: 'schools-management',
  label: 'Gestion Écoles',
  icon: Building2,
  defaultOpen: true,
  items: [
    { name: 'Écoles', href: '/schools', icon: School },
    { name: 'Demandes Établissements', href: '/schools/requests', icon: FileCheck }, // ✅ NOUVEAU
    { name: 'Utilisateurs', href: '/users', icon: Users },
    { name: 'Classes', href: '/classes', icon: GraduationCap },
    { name: 'Personnel', href: '/personnel', icon: UserCog },
    { name: 'Demandes Inscription', href: '/enrollment', icon: FileText },
  ]
},
```

---

## 🎨 Interface Utilisateur

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Demandes de Création d'Établissements                         │
│  12 demandes au total                                           │
├─────────────────────────────────────────────────────────────────┤
│  [🔍 Rechercher...]              [Filtre: Tous les statuts ▼]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏫 École Primaire Bilingue de Yaoundé    [⏱ En attente]  │ │
│  │ Code: EPB-YAO-001 • Primaire • Privé                      │ │
│  │                                                            │ │
│  │ 📍 Localisation: Centre, Yaoundé                          │ │
│  │ 👤 Directeur: Marie NGUEMA (marie@ecole.cm)               │ │
│  │                                                            │ │
│  │ Demandé par Jean DUPONT • 03/01/2026                      │ │
│  │                                                            │ │
│  │ [👁️ Voir détails] [👍 Approuver] [👎 Rejeter]             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🏫 Collège Moderne du Littoral         [✅ Approuvée]     │ │
│  │ Code: CM-DLA-002 • Collège • Public                       │ │
│  │                                                            │ │
│  │ 📍 Localisation: Littoral, Douala                         │ │
│  │ 👤 Directeur: Paul ESSOMBA (paul@college.cm)              │ │
│  │                                                            │ │
│  │ Demandé par Sophie MARTIN • 02/01/2026                    │ │
│  │                                                            │ │
│  │ Approuvée par Admin Claude • 02/01/2026                   │ │
│  │ Notes: Dossier complet, validation immédiate              │ │
│  │ École créée: Collège Moderne du Littoral (CM-DLA-002)     │ │
│  │                                                            │ │
│  │ [👁️ Voir détails]                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Badges de Statut

| Statut   | Couleur | Icône      | Texte       |
|----------|---------|------------|-------------|
| pending  | Jaune   | Clock      | En attente  |
| approved | Vert    | CheckCircle| Approuvée   |
| rejected | Rouge   | XCircle    | Rejetée     |

---

## 🔐 Sécurité

### Protection de la Route
```javascript
if (user?.role !== 'admin') {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Refusé</h2>
        <p className="text-gray-600">Cette page est réservée aux administrateurs.</p>
      </div>
    </div>
  );
}
```

### RLS Policies (Base de données)
Les policies RLS déjà en place dans la migration `20260104_school_creation_requests.sql`:
- **SELECT:** Seuls les admins voient toutes les demandes
- **UPDATE:** Seuls les admins peuvent approuver/rejeter
- **DELETE:** Seuls les admins peuvent supprimer

---

## 🧪 Tests Recommandés

### Test 1: Accès à la Page
- [ ] Se connecter en tant qu'admin
- [ ] Aller dans "Gestion Écoles" → "Demandes Établissements"
- [ ] Vérifier que l'URL est `/schools/requests`
- [ ] Vérifier que toutes les demandes s'affichent

### Test 2: Recherche
- [ ] Taper "Yaoundé" dans la recherche
- [ ] Vérifier que seules les demandes de Yaoundé apparaissent
- [ ] Taper un code d'établissement
- [ ] Vérifier le filtrage correct

### Test 3: Filtrage par Statut
- [ ] Sélectionner "En attente"
- [ ] Vérifier que seules les demandes pending s'affichent
- [ ] Sélectionner "Approuvées"
- [ ] Vérifier que seules les demandes approved s'affichent

### Test 4: Approbation
- [ ] Cliquer "Approuver" sur une demande pending
- [ ] Remplir les notes (optionnel): "Dossier validé"
- [ ] Cliquer "Approuver"
- [ ] Vérifier:
  - Établissement créé dans la table `schools`
  - Directeur créé/lié dans `users`
  - App Core activée dans `school_subscriptions`
  - Demande marquée 'approved'
  - Notification envoyée au demandeur
  - Badge passe de "En attente" à "Approuvée"

### Test 5: Rejet
- [ ] Cliquer "Rejeter" sur une demande pending
- [ ] Saisir la raison: "Code établissement déjà utilisé"
- [ ] Cliquer "Rejeter"
- [ ] Vérifier:
  - Demande marquée 'rejected'
  - Notification avec raison envoyée au demandeur
  - Badge passe à "Rejetée"
  - Raison affichée dans la carte

### Test 6: Vérification SQL
```sql
-- Vérifier qu'une approbation a bien tout créé
SELECT
  r.school_name,
  r.status,
  r.reviewed_by_user_id,
  r.reviewed_at,
  s.id as school_id,
  s.director_user_id,
  u.full_name as director_name
FROM school_creation_requests r
LEFT JOIN schools s ON r.created_school_id = s.id
LEFT JOIN users u ON s.director_user_id = u.id
WHERE r.id = 'uuid-de-la-demande';
```

### Test 7: Protection Accès
- [ ] Se connecter en tant que directeur
- [ ] Tenter d'accéder à `/schools/requests`
- [ ] Vérifier message "Accès Refusé"

---

## 📊 Workflow Complet

### Scénario Complet: De la Demande à l'Approbation

```
1. UTILISATEUR (avec abonnement payant)
   ├─ Va sur /schools
   ├─ Clique "Demander un Établissement"
   ├─ Rempli le formulaire SchoolRequestModal
   │  ├─ Informations établissement
   │  ├─ Localisation (région, département, ville)
   │  ├─ Informations directeur
   │  └─ Justification
   ├─ Soumet la demande
   └─ Demande créée avec status='pending'
        ↓
2. NOTIFICATION AUTOMATIQUE
   ├─ Envoyée à TOUS les admins
   ├─ Titre: "Nouvelle demande d'établissement"
   └─ Action: Lien vers /schools/requests
        ↓
3. ADMIN
   ├─ Reçoit notification
   ├─ Clique sur le lien → /schools/requests
   ├─ Consulte la liste des demandes
   ├─ Clique "Voir détails" sur la nouvelle demande
   │  └─ Modal avec toutes les informations + justification
   ├─ Décision:
   │
   ├─ OPTION A: APPROUVER
   │  ├─ Clique "Approuver"
   │  ├─ Saisit notes optionnelles
   │  ├─ Confirme
   │  ├─ Fonction approve_school_request() s'exécute:
   │  │  ├─ Vérifie que admin est bien admin ✓
   │  │  ├─ Vérifie que demande est pending ✓
   │  │  ├─ Crée/récupère compte directeur
   │  │  ├─ Crée l'établissement
   │  │  ├─ Lie directeur à l'école
   │  │  ├─ Active App Core gratuite
   │  │  ├─ Met à jour demande → 'approved'
   │  │  └─ Notifie le demandeur (succès)
   │  └─ Badge devient "Approuvée" ✅
   │
   └─ OPTION B: REJETER
      ├─ Clique "Rejeter"
      ├─ Saisit raison obligatoire
      ├─ Confirme
      ├─ Fonction reject_school_request() s'exécute:
      │  ├─ Vérifie que admin est bien admin ✓
      │  ├─ Vérifie que demande est pending ✓
      │  ├─ Met à jour demande → 'rejected'
      │  └─ Notifie le demandeur avec raison
      └─ Badge devient "Rejetée" ❌
```

---

## 💡 Améliorations Futures (Optionnelles)

### 1. Statistiques en Haut de Page
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <StatCard label="Total" value={requests.length} color="blue" />
  <StatCard label="En attente" value={pendingCount} color="yellow" />
  <StatCard label="Approuvées" value={approvedCount} color="green" />
  <StatCard label="Rejetées" value={rejectedCount} color="red" />
</div>
```

### 2. Filtres Avancés
- Par région (liste déroulante)
- Par type d'établissement (maternelle, primaire, etc.)
- Par plage de dates
- Par demandeur

### 3. Export des Demandes
- Bouton "Exporter" → Excel/CSV/PDF
- Export filtré selon les critères actifs
- Inclure toutes les informations pertinentes

### 4. Historique des Actions
- Journal des approbations/rejets
- Qui a fait quoi et quand
- Notes/raisons fournies

### 5. Notifications Push
- Notification temps réel quand nouvelle demande arrive
- Badge de compteur sur l'icône du menu

### 6. Assignation de Demandes
- Possibilité d'assigner une demande à un admin spécifique
- Filtrer "Mes demandes assignées"

### 7. Modal de Détails Amélioré
Actuellement, `ViewRequestModal` affiche juste le JSON. Améliorer avec:
```jsx
<div className="space-y-4">
  <Section title="Établissement">
    <Field label="Nom" value={request.school_name} />
    <Field label="Code" value={request.school_code} />
    <Field label="Type" value={getSchoolTypeLabel(request.school_type)} />
    <Field label="Statut" value={getOwnershipLabel(request.ownership_type)} />
  </Section>

  <Section title="Localisation">
    <Field label="Région" value={request.region} />
    <Field label="Département" value={request.department} />
    <Field label="Ville" value={request.city} />
    <Field label="Adresse" value={request.address} />
  </Section>

  <Section title="Directeur">
    <Field label="Nom complet" value={request.director_full_name} />
    <Field label="Email" value={request.director_email} />
    <Field label="Téléphone" value={request.director_phone} />
  </Section>

  <Section title="Justification">
    <TextArea value={request.justification} readOnly />
  </Section>
</div>
```

---

## 🔄 Intégration avec le Système Existant

### Liens avec Autres Pages

1. **SchoolsPage** (`/schools`)
   - Bouton "Demander un Établissement" pour non-admins
   - Ouvre `SchoolRequestModal`
   - Après soumission → demande visible dans `/schools/requests`

2. **Notifications**
   - Nouvelle demande → notification à tous les admins
   - Approbation → notification au demandeur
   - Rejet → notification au demandeur avec raison

3. **Base de données**
   - Table: `school_creation_requests`
   - Fonctions: `approve_school_request()`, `reject_school_request()`
   - Triggers: notifications automatiques

---

## 📝 Résumé des Changements

### Fichiers Créés (2)
1. `apps/admin/src/pages/SchoolRequests/SchoolRequestsPage.jsx` (550 lignes)
2. `apps/admin/src/pages/SchoolRequests/index.js` (1 ligne)

### Fichiers Modifiés (2)
1. `apps/admin/src/App.jsx`
   - Ligne 8: Import SchoolRequestsPage
   - Ligne 119: Route `/schools/requests`

2. `apps/admin/src/components/Layout/Sidebar.jsx`
   - Ligne 21: Import icône FileCheck
   - Ligne 40: Lien "Demandes Établissements" dans menu admin

### Lignes de Code
- **Total ajouté:** ~600 lignes
- **Composants:** 4 (page + 3 modals)
- **Fonctions RPC utilisées:** 2 (approve, reject)

---

**Date:** 04 Janvier 2026
**Version:** 2.5.0
**Statut:** ✅ COMPLÉTÉ ET INTÉGRÉ

**Prochaines étapes:**
- Tester l'approbation/rejet en environnement de développement
- Améliorer le modal de détails (actuellement affiche JSON brut)
- Ajouter des statistiques en haut de page
- Implémenter l'export des demandes
