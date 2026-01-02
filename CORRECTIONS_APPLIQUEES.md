# 🔧 Corrections Appliquées - Système de Packs

**Date**: 2 Janvier 2026

---

## ❌ Problèmes Identifiés

### 1. **Erreur SQL**: `column users_1.first_name does not exist`
**Cause**: Les requêtes utilisaient `first_name` et `last_name` mais la table `users` utilise `full_name`.

**Fichier concerné**: [BundleRequestsPage.jsx](apps/admin/src/pages/Bundles/BundleRequestsPage.jsx:1)

**Localisation de l'erreur**:
```javascript
// ❌ AVANT (INCORRECT)
requester:users!bundle_access_requests_requested_by_fkey(id, first_name, last_name, email)
reviewer:users!bundle_access_requests_reviewed_by_fkey(id, first_name, last_name)

// Affichage
{request.requester.first_name} {request.requester.last_name}
```

### 2. **Impossible de créer/modifier/supprimer des packs**
**Cause**: Il n'existe pas encore de page de gestion CRUD des packs. Le "Catalogue Packs" permet uniquement:
- ✅ Activer/Désactiver (changer `is_active`)
- ✅ Assigner à une école
- ❌ Créer un nouveau pack
- ❌ Modifier un pack existant
- ❌ Supprimer un pack

**Solution actuelle**: Gérer les packs directement dans Supabase SQL Editor.

### 3. **Notifications affichent des informations fausses**
**Causes possibles**:
- Tables vides (pas encore de données)
- Erreurs SQL non gérées
- Problèmes RLS empêchant la lecture

---

## ✅ Corrections Appliquées

### Correction 1: Mise à jour des requêtes SQL

**Fichier**: [BundleRequestsPage.jsx](apps/admin/src/pages/Bundles/BundleRequestsPage.jsx:53-62)

**Ligne 53-62** - Requête de chargement des demandes:
```javascript
// ✅ APRÈS (CORRECT)
const { data: requestsData, error: requestsError } = await supabase
  .from('bundle_access_requests')
  .select(`
    *,
    school:schools(id, name),
    requester:users!bundle_access_requests_requested_by_fkey(id, full_name, email),
    reviewer:users!bundle_access_requests_reviewed_by_fkey(id, full_name),
    bundle:bundles(id, name, icon, price_yearly, app_ids)
  `)
  .order('created_at', { ascending: false });
```

**Ligne 146** - Filtre de recherche:
```javascript
// ✅ APRÈS (CORRECT)
const matchesSearch = searchQuery === '' ||
  req.school?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  req.bundle?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  req.requester?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
```

**Ligne 323** - Affichage nom demandeur:
```javascript
// ✅ APRÈS (CORRECT)
{request.requester?.full_name || 'Inconnu'}
```

**Ligne 348** - Affichage nom reviewer:
```javascript
// ✅ APRÈS (CORRECT)
Réponse admin ({request.reviewer?.full_name || 'Inconnu'}):
```

---

## 🧪 Tests à Effectuer

### Test 1: Vérifier que l'erreur SQL est résolue

1. Ouvrez l'application sur `http://localhost:5175/`
2. Connectez-vous en tant qu'admin
3. Allez dans "Demandes Packs" (menu sidebar)
4. **Vérifier**: La page se charge SANS erreur dans la console
5. **Vérifier**: Les demandes s'affichent correctement (si existantes)

**Requête SQL de test** (dans Supabase):
```sql
-- Test de la requête corrigée
SELECT
  bar.*,
  s.name as school_name,
  u_req.full_name as requester_name,
  u_req.email as requester_email,
  b.name as bundle_name,
  u_rev.full_name as reviewer_name
FROM bundle_access_requests bar
LEFT JOIN schools s ON s.id = bar.school_id
LEFT JOIN users u_req ON u_req.id = bar.requested_by
LEFT JOIN bundles b ON b.id = bar.bundle_id
LEFT JOIN users u_rev ON u_rev.id = bar.reviewed_by
ORDER BY bar.created_at DESC;
```

### Test 2: Vérifier les dashboards

**Admin Dashboard**:
1. Connectez-vous en tant qu'admin
2. Dashboard devrait afficher:
   - ✅ Stats GLOBALES (toutes les écoles)
   - ✅ Section Revenus
   - ✅ Demandes en attente (Apps, Packs, Inscriptions)
   - ✅ Actions rapides avec badges

**Principal Dashboard**:
1. Connectez-vous en tant que directeur
2. Dashboard devrait afficher:
   - ✅ Nom de l'école en haut
   - ✅ Stats UNIQUEMENT de son école
   - ❌ PAS de section Revenus
   - ✅ Demandes de son école uniquement

**Requête SQL de test** (vérifier votre rôle):
```sql
-- Vérifier votre rôle
SELECT id, email, role, current_school_id
FROM users
WHERE email = 'VOTRE_EMAIL@example.com';
-- role devrait être 'admin' ou 'principal'
```

### Test 3: Tester le workflow complet d'une demande de pack

**Étape 1 - En tant que Directeur**:
1. Connectez-vous avec compte directeur
2. Allez dans "App Store" → Onglet "Packs"
3. Cliquez "Souscrire" sur un pack
4. Modal s'ouvre avec détails
5. Remplissez un message (optionnel)
6. Cliquez "Envoyer la demande"
7. **Vérifier**: Alert de succès s'affiche
8. **Vérifier**: Modal se ferme

**Vérification SQL après demande**:
```sql
-- Vérifier que la demande a été créée
SELECT *
FROM bundle_access_requests
ORDER BY created_at DESC
LIMIT 1;
-- status devrait être 'pending'
```

**Étape 2 - En tant qu'Admin**:
1. Connectez-vous avec compte admin
2. Allez dans "Demandes Packs"
3. **Vérifier**: La demande du directeur s'affiche
4. **Vérifier**: Nom du demandeur s'affiche correctement (full_name)
5. Cliquez "Approuver"
6. Modal s'ouvre
7. Changez durée à 2 ans
8. Ajoutez message: "Demande approuvée"
9. Cliquez "Confirmer"
10. **Vérifier**: Alert "Pack activé avec X applications"
11. **Vérifier**: Demande passe à "Approuvée"

**Vérification SQL après approbation**:
```sql
-- 1. Vérifier que la demande est approved
SELECT status, review_message, reviewed_at
FROM bundle_access_requests
ORDER BY reviewed_at DESC
LIMIT 1;
-- status devrait être 'approved'

-- 2. Vérifier que l'abonnement pack a été créé
SELECT bundle_id, status, expires_at
FROM school_bundle_subscriptions
ORDER BY created_at DESC
LIMIT 1;
-- status devrait être 'active'
-- expires_at devrait être dans 2 ans

-- 3. Vérifier que les apps ont été activées
SELECT app_id, status, expires_at
FROM school_subscriptions
WHERE school_id = (SELECT school_id FROM bundle_access_requests ORDER BY reviewed_at DESC LIMIT 1)
  AND status = 'active'
ORDER BY created_at DESC;
-- Devrait retourner toutes les apps du pack
```

---

## 📋 Checklist de Vérification Finale

- [ ] Serveur démarre sans erreur sur port 5175
- [ ] Page "Demandes Packs" se charge sans erreur SQL
- [ ] Dashboard Admin montre stats globales + revenus
- [ ] Dashboard Principal montre stats de son école uniquement
- [ ] Menus sidebar corrects pour admin (Catalogue Packs, Demandes Packs visibles)
- [ ] Menus sidebar corrects pour directeur (PAS de Catalogue/Demandes Packs)
- [ ] Modal demande pack s'ouvre correctement
- [ ] Noms des demandeurs s'affichent correctement (full_name)
- [ ] Workflow approbation fonctionne (pack + apps activés)
- [ ] Compte à rebours synchronisé (même expires_at pour pack et apps)

---

## ⚠️ Problèmes Restants à Résoudre

### 1. Gestion CRUD des Packs

**Problème**: Impossible de créer/modifier/supprimer des packs depuis l'interface.

**Solutions possibles**:

**A) Créer une page "Gestion Packs" (Admin)**:
- Formulaire pour créer un nouveau pack
- Liste des apps à cocher pour inclusion
- Calcul automatique des économies
- Édition et suppression

**B) Continuer à gérer dans Supabase** (solution temporaire):
```sql
-- Créer un nouveau pack
INSERT INTO bundles (id, name, description, icon, app_ids, price_yearly, savings, is_recommended, is_active, sort_order)
VALUES (
  'custom-pack',
  'Mon Pack Personnalisé',
  'Description du pack',
  '🎁',
  ARRAY['attendance', 'grades'], -- IDs des apps
  150000,
  50000,
  false,
  true,
  10
);

-- Modifier un pack
UPDATE bundles
SET price_yearly = 200000,
    savings = 80000,
    app_ids = ARRAY['attendance', 'grades', 'finance']
WHERE id = 'custom-pack';

-- Supprimer un pack
DELETE FROM bundles WHERE id = 'custom-pack';
```

### 2. Notifications Dashboard "Fausses"

**Diagnostic nécessaire**:

Exécutez ces requêtes dans Supabase pour voir les vraies valeurs:
```sql
-- Demandes apps pending
SELECT COUNT(*) FROM app_access_requests WHERE status = 'pending';

-- Demandes packs pending
SELECT COUNT(*) FROM bundle_access_requests WHERE status = 'pending';

-- Demandes inscriptions pending
SELECT COUNT(*) FROM enrollment_requests WHERE status = 'pending';
```

**Si les valeurs sont à 0**: C'est normal, il n'y a juste pas de demandes en attente.

**Si les valeurs sont différentes de ce qui s'affiche**: Problème de requête ou RLS.

**Solution**: Vérifier les politiques RLS:
```sql
-- Voir les politiques sur app_access_requests
SELECT * FROM pg_policies WHERE tablename = 'app_access_requests';

-- Voir les politiques sur bundle_access_requests
SELECT * FROM pg_policies WHERE tablename = 'bundle_access_requests';
```

---

## 🚀 Prochaines Étapes Recommandées

### 1. Créer page "Gestion Packs" (CRUD)
- Formulaire création pack
- Sélection multiple apps
- Calcul automatique prix/économies
- Upload icône pack

### 2. Améliorer les notifications
- Notifications temps réel (Supabase Realtime)
- Alertes email quand demande approuvée/rejetée
- Badge de compteur dans sidebar

### 3. Historique et Audit
- Page historique des activations
- Logs des actions admin
- Traçabilité des modifications

### 4. Statistiques Avancées
- Graphiques évolution abonnements
- Top packs les plus demandés
- Taux de conversion demandes → approbations

---

## 📄 Fichiers Modifiés dans cette Correction

- ✅ [BundleRequestsPage.jsx](apps/admin/src/pages/Bundles/BundleRequestsPage.jsx:1) - Corrections requêtes SQL (full_name)

---

## 📄 Fichiers de Diagnostic Créés

- 📋 [CHECK_PACK_SYSTEM.md](CHECK_PACK_SYSTEM.md:1) - Checklist complète de vérification
- 🔍 [TEST_QUERIES.sql](TEST_QUERIES.sql:1) - Requêtes SQL de diagnostic
- 📝 [CORRECTIONS_APPLIQUEES.md](CORRECTIONS_APPLIQUEES.md:1) - Ce document

---

**✨ Les erreurs SQL critiques sont maintenant corrigées !**

Rafraîchissez votre navigateur (Ctrl+Shift+R) et testez la page "Demandes Packs".
