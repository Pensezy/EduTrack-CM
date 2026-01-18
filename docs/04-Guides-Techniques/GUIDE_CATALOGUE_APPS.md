# Guide : Page Catalogue Apps Admin

**Date :** 2 janvier 2026
**Version :** 2.3.5
**Fonctionnalité :** Gestion globale du catalogue d'applications

---

## 🎯 Vue d'Ensemble

La page **Catalogue Apps** permet à l'admin de gérer le catalogue global des applications sans passer par une école spécifique.

### Différences Admin vs Directeur

| Fonctionnalité | Admin | Directeur |
|---------------|-------|-----------|
| **Catalogue Apps** | ✅ Modifier prix, statuts dev | ❌ Pas d'accès |
| **App Store** | ❌ Pas dans le menu | ✅ Voir catalogue, activer apps |
| **Mes Apps** | ❌ Pas dans le menu | ✅ Gérer ses abonnements |
| **SchoolAdminModal** | ✅ Assigner apps par école | ❌ Pas d'accès |

---

## 📋 Fonctionnalités

### 1. Visualisation

**Accès :** Menu **Catalogue Apps** (badge NEW)

**Liste complète** :
- Toutes les apps du catalogue
- Icône, nom, description
- Catégorie (pedagogy, administration, etc.)
- ID de l'app
- Statut de développement (ready, beta, in_development)
- Statut (active, inactive, deprecated)
- Prix annuel et mensuel

### 2. Recherche et Filtres

**Recherche textuelle** :
- Par nom d'application
- Par description

**Filtre par catégorie** :
- Toutes catégories
- Pédagogie
- Administration
- Communication
- Analytics

**Filtre par statut dev** :
- Tous les statuts
- ✅ Prêt (ready)
- 🧪 Beta (beta)
- 🚧 En Développement (in_development)

### 3. Modification des Apps

**Bouton "Modifier"** :
- Ouvre le mode édition inline
- 4 champs modifiables :
  1. **Statut Développement** : ready | beta | in_development
  2. **Statut** : active | inactive | deprecated
  3. **Prix Annuel** : en FCFA
  4. **Prix Mensuel** : en FCFA

**Actions** :
- **Sauvegarder** : Enregistre les modifications en BDD
- **Annuler** : Annule les modifications

---

## 🚀 Mise en Route

### Prérequis : Ajouter la Colonne `development_status`

⚠️ **IMPORTANT** : Cette colonne n'existe pas encore dans votre base de données.

#### Étape 1 : Copier la Migration

Ouvrir le fichier : `supabase/migrations/ADD_APP_DEVELOPMENT_STATUS.sql`

#### Étape 2 : Exécuter dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Menu **SQL Editor** → **New Query**
4. Coller le contenu du fichier
5. Cliquer **Run**

#### Étape 3 : Vérifier le Résultat

Vous devriez voir :

```
═══════════════════════════════════════════════════════
📊 STATUT DE DÉVELOPPEMENT DES APPLICATIONS
═══════════════════════════════════════════════════════

 id          | name                 | status_display    | price
-------------|----------------------|-------------------|----------------
 core        | Gestion de Base      | ✅ Prête         | 🆓 GRATUIT
 academic    | Gestion Académique   | ✅ Prête         | 50000 FCFA/an
 financial   | Gestion Financière   | ✅ Prête         | 75000 FCFA/an
 ...

📈 RÉSUMÉ:
  ✅ Prêtes: 3
  🚧 En développement: 5
  🧪 Beta: 0

✅ Migration terminée avec succès
```

#### Étape 4 : Rafraîchir l'Application

Dans l'interface EduTrack Admin, appuyer sur **F5**.

---

## 📖 Utilisation

### Accéder à la Page

1. Se connecter en tant qu'**admin**
2. Cliquer sur **"Catalogue Apps"** dans le menu (badge NEW)

### Modifier une App

1. **Trouver l'app** :
   - Utiliser la recherche ou les filtres
   - Cliquer sur "Modifier"

2. **Modifier les champs** :
   - Statut Dev : Choisir ready/beta/in_development
   - Statut : Choisir active/inactive/deprecated
   - Prix Annuel : Entrer le prix en FCFA
   - Prix Mensuel : Entrer le prix en FCFA (optionnel)

3. **Enregistrer** :
   - Cliquer "Sauvegarder" ✅
   - Ou "Annuler" pour abandonner ❌

### Exemple : Passer une App en Beta

**Scénario** : L'app "Discipline" est en développement mais prête pour les tests.

1. Rechercher "Discipline"
2. Cliquer "Modifier"
3. Statut Dev → **Beta**
4. Cliquer "Sauvegarder"

→ L'app affichera maintenant un badge 🧪 **Beta**

---

## 🎨 Badges et Statuts

### Statuts de Développement

| Valeur | Badge | Signification |
|--------|-------|---------------|
| `ready` | ✅ Prêt | Production, recommandé |
| `beta` | 🧪 Beta | Phase test, bugs possibles |
| `in_development` | 🚧 En Dev | Non recommandé, test interne |

### Statuts Généraux

| Valeur | Badge | Signification |
|--------|-------|---------------|
| `active` | Actif (vert) | App disponible |
| `inactive` | Inactif (gris) | App désactivée |
| `deprecated` | Déprécié (rouge) | App obsolète, ne plus utiliser |

---

## 🔐 Permissions

### Admin
- ✅ Modifier statuts dev
- ✅ Modifier statuts généraux
- ✅ Modifier prix
- ✅ Voir toutes les apps

### Directeur
- ❌ Pas d'accès à "Catalogue Apps"
- ✅ Accès à "App Store" (consultation)
- ✅ Accès à "Mes Apps" (gestion abonnements école)

---

## 🧪 Tests de Validation

### Test 1 : Accès Admin ✅

```
1. Connexion : admin@edutrack.cm
2. Vérifier présence "Catalogue Apps" dans menu
3. Vérifier ABSENCE "App Store" et "Mes Apps"
4. Cliquer "Catalogue Apps" → Page s'affiche
```

### Test 2 : Modification App ✅

```
1. Sur Catalogue Apps
2. Rechercher une app (ex: "Academic")
3. Cliquer "Modifier"
4. Changer "Statut Dev" → Beta
5. Changer "Prix Annuel" → 60000
6. Cliquer "Sauvegarder"
7. Vérifier badge 🧪 Beta affiché
8. Vérifier prix 60 000 FCFA/an
```

### Test 3 : Accès Directeur ❌

```
1. Connexion en tant que directeur
2. Vérifier ABSENCE "Catalogue Apps"
3. Vérifier présence "App Store" et "Mes Apps"
4. Essayer d'accéder /apps-catalog → Bloqué ou menu invisible
```

---

## ❌ Dépannage

### Erreur : Column "development_status" does not exist

**Cause :** La migration `ADD_APP_DEVELOPMENT_STATUS.sql` n'a pas été appliquée.

**Solution :**
1. Exécuter la migration dans Supabase SQL Editor
2. Rafraîchir l'application (F5)

### Menu "Catalogue Apps" Absent

**Causes possibles :**
1. **Pas connecté en tant qu'admin**
   - Vérifier : Menu affiche "EduTrack Admin" ?
   - Sinon : Se reconnecter avec admin@edutrack.cm

2. **Cache navigateur**
   - Vider le cache (Ctrl+Shift+Delete)
   - Rafraîchir (F5)

### Modifications Non Enregistrées

**Causes possibles :**
1. **Permissions RLS**
   - Vérifier que la politique `apps_all_admin` existe
   - Exécuter : `SELECT * FROM pg_policies WHERE tablename = 'apps'`

2. **Erreur dans la console**
   - Ouvrir DevTools (F12) → Console
   - Vérifier les erreurs PATCH
   - Me donner l'erreur complète

---

## 📊 Architecture Technique

### Routes

| Route | Accès | Description |
|-------|-------|-------------|
| `/apps-catalog` | Admin | Gestion globale catalogue |
| `/app-store` | Directeur | Consultation catalogue |
| `/my-apps` | Directeur | Gestion abonnements école |

### Composants

**AppsCatalogPage.jsx** (365 lignes)
- État : apps, loading, searchQuery, filters, editingApp, editForm
- Fonctions :
  - `loadApps()` : Charge toutes les apps
  - `handleEdit(app)` : Ouvre mode édition
  - `handleSaveEdit(appId)` : Sauvegarde modifications
  - `handleCancelEdit()` : Annule édition
- Composants :
  - Filtres (recherche, catégorie, statut dev)
  - Liste apps (cards avec mode édition inline)
  - Badges (statut dev, statut général)

### Base de Données

**Table `apps`** :
```sql
CREATE TABLE apps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  price_yearly INTEGER DEFAULT 0,
  price_monthly INTEGER,
  is_core BOOLEAN DEFAULT false,
  features JSONB,
  dependencies TEXT[],
  status TEXT DEFAULT 'active',
  development_status TEXT DEFAULT 'ready',  -- 🆕 AJOUTÉ
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Politiques RLS** :
- `apps_select_authenticated` : Lecture pour tous
- `apps_all_admin` : Modification admin uniquement

---

## 🔄 Workflow Complet

### Admin Modifie une App

```
1. Admin → /apps-catalog
2. Recherche "Discipline"
3. Clique "Modifier"
4. Change statut dev → "beta"
5. Change prix → 45000 FCFA/an
6. Clique "Sauvegarder"
   ↓
7. PATCH /apps?id=eq.discipline
   ↓
8. RLS vérifie : user.role = 'admin' ? ✅
   ↓
9. UPDATE apps SET
     development_status = 'beta',
     price_yearly = 45000
   WHERE id = 'discipline'
   ↓
10. Reload apps → Affiche badge 🧪 Beta
```

### Directeur Voit l'App Mise à Jour

```
1. Directeur → /app-store
2. App "Discipline" affiche :
   - Badge 🧪 Beta
   - Prix 45 000 FCFA/an
3. Clique "Démarrer Essai"
   ↓
4. Modal confirmation
5. Crée school_subscription
   ↓
6. App activée pour son école
```

---

## 📝 Changelog

| Date | Version | Modification |
|------|---------|--------------|
| 2026-01-02 | 2.3.5 | Ajout page Catalogue Apps pour admin |
| 2026-01-02 | 2.3.5 | Réorganisation menus admin vs directeur |
| 2026-01-02 | 2.3.5 | Migration ADD_APP_DEVELOPMENT_STATUS.sql |

---

**Auteur :** Claude Sonnet 4.5
**Date :** 2 janvier 2026
**Statut :** ✅ Implémenté
**Prochaine Étape :** Appliquer la migration `ADD_APP_DEVELOPMENT_STATUS.sql`
