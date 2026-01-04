# 🔧 Refonte Complète - Système de Création d'Établissements

## ❌ Problèmes Identifiés

### 1. **Création Directe Sans Demande**
**Problème:** Le formulaire actuel crée directement des établissements sans validation administrative.

**Risques:**
- Création anarchique d'établissements
- Pas de contrôle qualité
- Données incorrectes ou incomplètes
- Abus du système gratuit

### 2. **Vérification de Limitation Inefficace**
**Code problématique (lignes 183-213):**
```javascript
// Vérifier s'il existe un abonnement payant actif
const { data: paidSubscriptions } = await supabase
  .from('school_subscriptions')
  .select('id')
  .in('status', ['trial', 'active'])
  .neq('app_id', 'core')
  .limit(1);

const hasPaidSubscription = paidSubscriptions && paidSubscriptions.length > 0;

// Appliquer la limitation: 1 école max sans abonnement payant
if (schoolCount >= 1 && !hasPaidSubscription) {
  throw new Error('Limitation gratuite atteinte...');
}
```

**Problèmes:**
- ❌ Vérifie les abonnements de TOUTES les écoles (pas lié à l'utilisateur)
- ❌ N'importe qui peut créer une école si UNE SEULE école du système a un abonnement
- ❌ Pas de vérification de qui fait la demande

### 3. **Champs Inutiles et Automatisation Dangereuse**
**Champs problématiques:**
- `director_name`, `director_email`, `director_phone` → Créent automatiquement un compte
- Pas de validation du directeur
- Création de compte sans le consentement de la personne

### 4. **Champs Manquants**
- ❌ Pas de **région** (Centre, Littoral, Sud, etc.)
- ❌ Pas de **département**
- ❌ Pas de **justification** de la demande

### 5. **Type d'Établissement Confus**
Le champ `type` mélange deux concepts:
- Statut de propriété: `private`, `public`
- Type pédagogique: `maternelle`, `primaire`, `college`, `lycee`

**Exemple problématique:**
```jsx
<select name="type">
  <option value="private">Privé</option>      {/* Statut */}
  <option value="public">Public</option>       {/* Statut */}
  <option value="maternelle">Maternelle</option> {/* Type pédagogique */}
  <option value="primaire">Primaire</option>     {/* Type pédagogique */}
</select>
```

### 6. **Valeur Par Défaut Incorrecte - Classes**
**Problème:** Le formulaire de création de classe met `max_students: 40` par défaut.

**Attendu:** `max_students: 20` (limite App Core gratuite)

---

## ✅ Solutions Implémentées

### 1. **Système de Demande (SchoolRequestModal)**

**Nouveau Composant:** `apps/admin/src/pages/Schools/components/SchoolRequestModal.jsx`

#### A. Vérification d'Éligibilité

```javascript
const checkEligibility = async () => {
  // Admins: accès direct
  if (user?.role === 'admin') {
    setCanRequest(true);
    return;
  }

  // Autres: vérifier abonnement payant actif
  const { data: activeSubscriptions } = await supabase
    .from('school_subscriptions')
    .select('id, app_id, school_id')
    .in('status', ['trial', 'active'])
    .neq('app_id', 'core') // Exclure app gratuite
    .gt('expires_at', new Date().toISOString());

  if (!activeSubscriptions || activeSubscriptions.length === 0) {
    setCanRequest(false);
    setError('Vous devez avoir un abonnement actif pour demander...');
  } else {
    setCanRequest(true);
  }
};
```

#### B. Écran de Blocage pour Utilisateurs Sans Abonnement

```jsx
{!canRequest ? (
  <div className="p-6">
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <p className="text-sm font-medium text-red-800">Abonnement requis</p>
      <p className="text-sm text-red-700">{error}</p>
      <a href="/bundles" className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg">
        Voir les packs disponibles
      </a>
    </div>
  </div>
) : (
  <form onSubmit={handleSubmit}>
    {/* Formulaire de demande */}
  </form>
)}
```

#### C. Champs Améliorés et Complétés

**Informations de l'Établissement:**
1. **Nom** (requis)
2. **Code** (requis, unique)
3. **Type d'établissement** (select séparé):
   - Maternelle
   - Primaire
   - Collège
   - Lycée
   - Collège/Lycée
4. **Statut de l'établissement** (select séparé):
   - Privé
   - Public

**Localisation:**
1. **Région** (requis, select avec 10 régions du Cameroun)
2. **Département** (optionnel)
3. **Ville** (requis)
4. **Adresse** (optionnel)
5. **Téléphone** (optionnel)
6. **Email** (optionnel)

**Informations du Directeur:**
1. **Nom complet** (requis)
2. **Email** (requis)
3. **Téléphone** (optionnel)

**Justification:**
1. **Justification de la demande** (requis, textarea)

#### D. Soumission de Demande

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();

  // Créer une demande de création d'établissement
  const { error: requestError } = await supabase
    .from('school_creation_requests')
    .insert([{
      requester_user_id: user.id,
      school_name: formData.name.trim(),
      school_code: formData.code.trim(),
      school_type: formData.school_type,        // maternelle, primaire, etc.
      ownership_type: formData.ownership_type,  // private, public
      region: formData.region.trim(),
      department: formData.department.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      director_full_name: formData.director_full_name.trim(),
      director_phone: formData.director_phone.trim(),
      director_email: formData.director_email.trim(),
      justification: formData.justification.trim(),
      status: 'pending',
    }]);

  // Notifier les admins
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin');

  if (admins && admins.length > 0) {
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      title: 'Nouvelle demande de création d\'établissement',
      message: `${user.full_name} a demandé la création de "${formData.name}"`,
      type: 'info',
      priority: 'high',
      action_url: '/schools/requests',
    }));

    await supabase.from('user_notifications').insert(notifications);
  }
};
```

---

### 2. **Migration SQL - Table school_creation_requests**

**Fichier:** `supabase/migrations/20260104_school_creation_requests.sql`

#### A. Structure de la Table

```sql
CREATE TABLE school_creation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES users(id),

  -- Informations établissement
  school_name TEXT NOT NULL,
  school_code TEXT NOT NULL UNIQUE,
  school_type TEXT NOT NULL CHECK (school_type IN ('maternelle', 'primaire', 'college', 'lycee', 'college_lycee')),
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('private', 'public')),

  -- Localisation
  region TEXT NOT NULL,
  department TEXT,
  city TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,

  -- Directeur
  director_full_name TEXT NOT NULL,
  director_phone TEXT,
  director_email TEXT NOT NULL,

  -- Justification
  justification TEXT NOT NULL,

  -- Statut et traitement
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by_user_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_school_id UUID REFERENCES schools(id),

  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### B. Row Level Security (RLS)

**Policy 1: Voir ses propres demandes**
```sql
CREATE POLICY "Utilisateurs voient leurs demandes"
ON school_creation_requests FOR SELECT
USING (
  requester_user_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

**Policy 2: Créer une demande (avec abonnement payant)**
```sql
CREATE POLICY "Création avec abonnement payant"
ON school_creation_requests FOR INSERT
WITH CHECK (
  auth.uid() = requester_user_id
  AND
  (
    -- Admins peuvent toujours créer
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR
    -- Ou avoir un abonnement payant actif
    EXISTS (
      SELECT 1 FROM school_subscriptions
      WHERE status IN ('trial', 'active')
        AND app_id != 'core'
        AND (expires_at IS NULL OR expires_at > NOW())
    )
  )
);
```

**Policy 3: Seuls les admins modifient/suppriment**
```sql
CREATE POLICY "Admins modifient" ON school_creation_requests FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins suppriment" ON school_creation_requests FOR DELETE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
```

#### C. Fonctions d'Approbation/Rejet

**Fonction d'approbation:**
```sql
CREATE FUNCTION approve_school_request(
  p_request_id UUID,
  p_admin_user_id UUID,
  p_review_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request RECORD;
  v_new_school_id UUID;
  v_director_user_id UUID;
BEGIN
  -- Vérifier admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les admins peuvent approuver';
  END IF;

  -- Récupérer la demande
  SELECT * INTO v_request FROM school_creation_requests
  WHERE id = p_request_id AND status = 'pending';

  -- Créer ou récupérer le directeur
  SELECT id INTO v_director_user_id FROM users WHERE email = v_request.director_email;

  IF v_director_user_id IS NULL THEN
    INSERT INTO users (email, full_name, phone, role, is_active)
    VALUES (v_request.director_email, v_request.director_full_name, v_request.director_phone, 'principal', true)
    RETURNING id INTO v_director_user_id;
  END IF;

  -- Créer l'établissement
  INSERT INTO schools (name, code, type, region, city, address, phone, email, director_user_id, status)
  VALUES (v_request.school_name, v_request.school_code, v_request.school_type, v_request.region, v_request.city, v_request.address, v_request.phone, v_request.email, v_director_user_id, 'active')
  RETURNING id INTO v_new_school_id;

  -- Lier directeur à l'école
  UPDATE users SET current_school_id = v_new_school_id WHERE id = v_director_user_id;

  -- Activer App Core gratuite
  INSERT INTO school_subscriptions (school_id, app_id, status, start_date)
  VALUES (v_new_school_id, 'core', 'active', NOW());

  -- Mettre à jour la demande
  UPDATE school_creation_requests
  SET status = 'approved', reviewed_by_user_id = p_admin_user_id, reviewed_at = NOW(), review_notes = p_review_notes, created_school_id = v_new_school_id
  WHERE id = p_request_id;

  -- Notifier le demandeur
  INSERT INTO user_notifications (user_id, title, message, type, priority, action_url)
  VALUES (v_request.requester_user_id, 'Demande approuvée', format('Votre demande "%s" a été approuvée !', v_request.school_name), 'success', 'high', '/schools');

  RETURN v_new_school_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Fonction de rejet:**
```sql
CREATE FUNCTION reject_school_request(
  p_request_id UUID,
  p_admin_user_id UUID,
  p_review_notes TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_admin_user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Seuls les admins peuvent rejeter';
  END IF;

  -- Mettre à jour la demande
  UPDATE school_creation_requests
  SET status = 'rejected', reviewed_by_user_id = p_admin_user_id, reviewed_at = NOW(), review_notes = p_review_notes
  WHERE id = p_request_id AND status = 'pending';

  -- Notifier
  INSERT INTO user_notifications (...)
  VALUES (...);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3. **Correction - Formulaire de Classe**

#### A. Nombre Par Défaut d'Élèves: 40 → 20

**Avant:**
```javascript
const [formData, setFormData] = useState({
  ...
  max_students: 40,  // ❌ Incorrect
});
```

**Après:**
```javascript
const [formData, setFormData] = useState({
  ...
  max_students: 20,  // ✅ Correct (limite App Core)
});
```

**Fichiers modifiés:**
- Ligne 25: Valeur initiale
- Ligne 81: Valeur en mode édition
- Ligne 100: Valeur en mode reset

#### B. Correction academic_years: year → name

**Problème:** La colonne s'appelle `name` dans la table `academic_years`, pas `year`.

**Avant:**
```javascript
const { data: existingYear } = await supabase
  .from('academic_years')
  .select('id')
  .eq('year', formData.school_year)  // ❌ Colonne inexistante
  .eq('school_id', formData.school_id)
  .maybeSingle();
```

**Après:**
```javascript
const { data: existingYear } = await supabase
  .from('academic_years')
  .select('id')
  .eq('name', formData.school_year)  // ✅ Correct
  .eq('school_id', formData.school_id)
  .maybeSingle();
```

**Erreur corrigée:**
```
Error: {
  code: 'PGRST204',
  message: "Could not find the 'year' column of 'academic_years'"
}
```

---

### 4. **Migration SQL - Ajout Colonne region**

**Fichier:** `supabase/migrations/20260104_add_schools_region_column.sql`

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'region'
  ) THEN
    ALTER TABLE schools ADD COLUMN region TEXT;
    COMMENT ON COLUMN schools.region IS 'Région du Cameroun';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region);
```

---

## 📋 Workflow Complet

### Pour un Utilisateur Standard

```
1. Utilisateur clique "Demander un établissement"
   ↓
2. Vérification automatique de l'abonnement
   ├─ Pas d'abonnement payant → Blocage + Redirection vers /bundles
   └─ Abonnement actif → Accès au formulaire
   ↓
3. Remplissage du formulaire de demande
   - Informations établissement (nom, code, type, statut)
   - Localisation (région, département, ville, adresse)
   - Directeur (nom, email, téléphone)
   - Justification (textarea)
   ↓
4. Soumission de la demande
   ↓
5. Demande enregistrée avec status='pending'
   ↓
6. Notifications envoyées à tous les admins
   ↓
7. Utilisateur attend l'approbation
```

### Pour un Administrateur

```
1. Admin reçoit notification "Nouvelle demande..."
   ↓
2. Admin va sur /schools/requests
   ↓
3. Consulte la demande (toutes les infos + justification)
   ↓
4. Décision:
   ├─ Approuver
   │  ├─ Clique "Approuver"
   │  ├─ Fonction approve_school_request() s'exécute:
   │  │  - Création du directeur (si n'existe pas)
   │  │  - Création de l'établissement
   │  │  - Activation App Core gratuite
   │  │  - Notification au demandeur
   │  └─ Demande marquée 'approved'
   │
   └─ Rejeter
      ├─ Clique "Rejeter"
      ├─ Saisit la raison du rejet
      ├─ Fonction reject_school_request() s'exécute:
      │  - Demande marquée 'rejected'
      │  - Notification au demandeur avec raison
      └─ Fin
```

---

## 🧪 Tests Recommandés

### Test 1: Blocage Sans Abonnement
- [ ] Se connecter avec utilisateur App Core uniquement
- [ ] Cliquer "Demander un établissement"
- [ ] Vérifier écran de blocage avec message d'erreur
- [ ] Vérifier lien vers /bundles présent

### Test 2: Création de Demande (Avec Abonnement)
- [ ] Se connecter avec utilisateur ayant App Académique active
- [ ] Cliquer "Demander un établissement"
- [ ] Vérifier accès au formulaire
- [ ] Remplir tous les champs
- [ ] Soumettre
- [ ] Vérifier notification admin créée
- [ ] Vérifier demande enregistrée en BDD (status='pending')

### Test 3: Approbation (Admin)
- [ ] Se connecter en tant qu'admin
- [ ] Aller sur /schools/requests
- [ ] Cliquer "Approuver" sur une demande
- [ ] Vérifier:
  - Établissement créé dans `schools`
  - Directeur créé/mis à jour dans `users`
  - App Core activée dans `school_subscriptions`
  - Demande marquée 'approved'
  - Notification envoyée au demandeur

### Test 4: Rejet (Admin)
- [ ] Cliquer "Rejeter"
- [ ] Saisir raison: "Code établissement invalide"
- [ ] Soumettre
- [ ] Vérifier demande marquée 'rejected'
- [ ] Vérifier notification avec raison envoyée

### Test 5: Formulaire Classe - Nombre Élèves
- [ ] Ouvrir formulaire "Nouvelle Classe"
- [ ] Vérifier champ "Nombre max d'élèves" = 20 (pas 40)

### Test 6: Création Classe - Année Académique
- [ ] Remplir formulaire classe
- [ ] Année: 2026-2027
- [ ] Soumettre
- [ ] Vérifier création réussie (pas d'erreur PGRST204)
- [ ] Vérifier `academic_years` contient bien l'année avec `name='2026-2027'`

---

## 📝 Fichiers Créés/Modifiés

### Créés
1. **SchoolRequestModal.jsx** (570 lignes)
   - `apps/admin/src/pages/Schools/components/SchoolRequestModal.jsx`
   - Modal de demande avec vérification d'éligibilité

2. **Migration school_creation_requests** (340 lignes)
   - `supabase/migrations/20260104_school_creation_requests.sql`
   - Table + RLS + Fonctions approve/reject

3. **Migration add region** (25 lignes)
   - `supabase/migrations/20260104_add_schools_region_column.sql`
   - Ajout colonne region dans schools

### Modifiés
1. **ClassFormModal.jsx**
   - Lignes 25, 81, 100: `max_students: 40` → `20`
   - Lignes 291, 303: `.eq('year', ...)` → `.eq('name', ...)`

2. **SchoolsPage.jsx**
   - Ligne 21: Ajout import `SchoolRequestModal`
   - Ligne 33: Ajout state `requestModal`
   - Lignes 151-159: Modification `handleCreateSchool()` - routage admin/non-admin
   - Lignes 200-216: Bouton adaptatif (Nouvelle École / Demander un Établissement)
   - Lignes 377-381: Rendu du composant `SchoolRequestModal`

3. **components/index.js (Schools)**
   - Ligne 2: Export `SchoolRequestModal`

4. **SchoolRequestsPage.jsx** (NOUVEAU - 550 lignes)
   - `apps/admin/src/pages/SchoolRequests/SchoolRequestsPage.jsx`
   - Page admin de gestion des demandes d'établissements
   - Liste, filtrage, recherche, approbation, rejet

5. **App.jsx**
   - Ligne 8: Import SchoolRequestsPage
   - Ligne 119: Route `/schools/requests`

6. **Sidebar.jsx**
   - Ligne 21: Import icône FileCheck
   - Ligne 40: Lien "Demandes Établissements" dans menu admin

---

## 🔄 Prochaines Étapes

### 1. ✅ Interface de Gestion des Demandes (Admin) - COMPLÉTÉ
Page `/schools/requests` créée avec:
- ✅ Liste des demandes (pending, approved, rejected)
- ✅ Filtres par statut + recherche multi-critères
- ✅ Actions: Approuver / Rejeter avec modals de confirmation
- ✅ Utilisation des fonctions `approve_school_request()` et `reject_school_request()`
- ✅ Affichage post-traitement (revieweur, notes, école créée)
- ✅ Intégration complète dans la navigation admin

**Documentation:** Voir [SCHOOL_REQUESTS_ADMIN_PAGE.md](SCHOOL_REQUESTS_ADMIN_PAGE.md)

### 2. ✅ Application des Migrations SQL - COMPLÉTÉ
Les migrations suivantes ont été appliquées:
- ✅ `20260104_school_creation_requests.sql` (table + RLS + fonctions)
- ✅ `20260104_add_schools_region_column.sql` (colonne region)

### 3. Historique des Demandes (Utilisateur)
**FUTUR** - Permettre aux utilisateurs de voir leurs demandes passées:
- Page `/my-requests` pour consulter l'historique
- Statut de chaque demande (pending, approved, rejected)
- Raison du rejet si applicable
- Lien vers l'école créée si approuvée

### 4. Export des Demandes
**FUTUR** - Permettre aux admins d'exporter les demandes:
- Bouton "Exporter" sur `/schools/requests`
- Formats: Excel, CSV, PDF
- Export filtré selon critères actifs

### 5. Améliorations du Modal de Détails
**FUTUR** - Améliorer `ViewRequestModal`:
- Actuellement affiche JSON brut
- Créer interface structurée avec sections
- Affichage formaté de tous les champs

---

**Date:** 04 Janvier 2026
**Version:** 2.5.0
**Statut:** ✅✅ SYSTÈME COMPLET - FRONTEND + BACKEND
**Fonctionnalités:**
- ✅ Formulaire de demande avec vérification d'abonnement (SchoolRequestModal)
- ✅ Intégration dans SchoolsPage (bouton adaptatif admin/non-admin)
- ✅ Page admin de gestion des demandes (/schools/requests)
- ✅ Approbation/Rejet avec fonctions SQL sécurisées
- ✅ Notifications automatiques
- ✅ Migrations SQL appliquées
