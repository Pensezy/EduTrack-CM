# Guide Rapide : Application de la Migration Système de Demandes

**Date :** 2 janvier 2026
**Fichier :** `supabase/migrations/20260102_app_access_request_system.sql`
**Durée :** ~2 minutes

---

## ✅ Checklist Pré-Migration

Avant d'appliquer la migration, vérifier :

- [ ] Connexion à [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Projet EduTrack sélectionné
- [ ] Accès SQL Editor disponible
- [ ] Backup récent de la base de données (recommandé)

---

## 📋 Étapes d'Application

### 1. Ouvrir le Fichier de Migration

**Emplacement :** `supabase/migrations/20260102_app_access_request_system.sql`

**Contenu :**
- Table `app_access_requests`
- Politiques RLS (6 policies)
- Fonctions `approve_app_request()` et `reject_app_request()`
- Vue `v_app_access_requests`

### 2. Copier le Contenu

1. Ouvrir le fichier dans VSCode
2. Sélectionner tout (Ctrl+A)
3. Copier (Ctrl+C)

### 3. Exécuter dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet **EduTrack**
3. Menu de gauche → **SQL Editor**
4. Cliquer **New Query**
5. Coller le contenu (Ctrl+V)
6. Cliquer **Run** (bouton vert en bas à droite)

### 4. Vérifier le Résultat

**✅ Résultat attendu :**

```
═══════════════════════════════════════════════════════
✅ SYSTÈME DE DEMANDES D'ACCÈS AUX APPLICATIONS
═══════════════════════════════════════════════════════

📋 Table créée:
   - app_access_requests (avec RLS)

🔧 Fonctions créées:
   - approve_app_request(request_id, admin_id, message)
   - reject_app_request(request_id, admin_id, message)

👁️  Vue créée:
   - v_app_access_requests (détails complets)

🔐 Politiques RLS:
   - Directeurs: Voir/Créer demandes de leur école
   - Admins: Tout voir, approuver, rejeter

⚠️  WORKFLOW:
   1. Directeur demande accès (apps ready/beta seulement)
   2. Admin voit la demande et peut:
      - Approuver → Crée subscription automatiquement
      - Rejeter → Demande marquée rejected
   3. Directeur reçoit notification du résultat

✅ Migration terminée avec succès!
═══════════════════════════════════════════════════════
```

**❌ En cas d'erreur :**

Si vous voyez une erreur, vérifier :

1. **Table existe déjà** :
   ```
   ERROR: relation "app_access_requests" already exists
   ```
   → Migration déjà appliquée, pas de problème.

2. **Fonction existe déjà** :
   ```
   NOTICE: function "approve_app_request" already exists, replacing
   ```
   → Normal, `CREATE OR REPLACE` remplace la fonction.

3. **Permissions insuffisantes** :
   ```
   ERROR: permission denied
   ```
   → Vérifier que vous êtes connecté en tant que propriétaire du projet.

---

## 🧪 Tests Post-Migration

### Test 1 : Vérifier la Table

```sql
-- Vérifier que la table existe
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'app_access_requests';

-- Doit retourner 1 ligne
```

### Test 2 : Vérifier les Politiques RLS

```sql
-- Lister les politiques
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'app_access_requests'
ORDER BY policyname;

-- Doit retourner 6 lignes:
-- app_requests_delete_admin      | DELETE
-- app_requests_insert_principal  | INSERT
-- app_requests_select_admin      | SELECT
-- app_requests_select_principal  | SELECT
-- app_requests_update_admin      | UPDATE
-- app_requests_update_principal  | UPDATE
```

### Test 3 : Vérifier les Fonctions

```sql
-- Lister les fonctions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%app_request%';

-- Doit retourner 2 lignes:
-- approve_app_request | FUNCTION
-- reject_app_request  | FUNCTION
```

### Test 4 : Vérifier la Vue

```sql
-- Vérifier que la vue existe
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'v_app_access_requests';

-- Doit retourner 1 ligne avec table_type = 'VIEW'
```

### Test 5 : Créer une Demande de Test

```sql
-- Insérer une demande de test (remplacer les UUIDs)
INSERT INTO app_access_requests (
  school_id,
  app_id,
  requested_by,
  request_message
) VALUES (
  'uuid-de-votre-ecole',
  'academic',  -- ID d'une app existante
  'uuid-du-directeur',
  'Demande de test pour vérifier le système'
);

-- Vérifier
SELECT * FROM v_app_access_requests;
```

---

## 🔄 Prochaines Étapes

Après avoir appliqué la migration avec succès :

1. **Frontend - Modifier AppStorePage** :
   - Changer bouton "Activer" → "Demander l'accès"
   - Appeler fonction `createAppRequest()` au lieu de `activateApp()`
   - Filtrer apps : seulement `development_status IN ('ready', 'beta')`

2. **Frontend - Créer AppAccessRequestsPage** :
   - Page pour admin gérer les demandes
   - Liste avec filtres (pending, approved, rejected)
   - Boutons Approuver/Rejeter avec modals

3. **Frontend - Mettre à Jour Dashboard Admin** :
   - Ajouter compteur "X demandes en attente"
   - Lien rapide vers page de gestion

4. **Frontend - Mettre à Jour Sidebar** :
   - Ajouter menu "Demandes d'Accès" pour admin
   - Badge notification si demandes pending

5. **Frontend - MyAppsPage** :
   - Ajouter onglet "Mes Demandes"
   - Afficher statut (pending, approved, rejected)
   - Afficher messages de l'admin

---

## 📞 Support

En cas de problème :

1. Vérifier les logs dans SQL Editor (onglet "Logs")
2. Consulter le guide complet : `docs/GUIDE_DEMANDES_ACCES_APPS.md`
3. Vérifier les erreurs dans la console navigateur (F12)

---

**Auteur :** Claude Sonnet 4.5
**Date :** 2 janvier 2026
**Statut :** ✅ Prêt à appliquer
