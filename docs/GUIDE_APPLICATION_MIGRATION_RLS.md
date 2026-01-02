# Guide : Application de la Migration RLS pour App Store

**Date :** 2 janvier 2026
**Problème :** App Store et Mes Apps sont vides
**Cause :** Politiques RLS trop restrictives
**Solution :** Migration `20260102_fix_apps_rls_permissions.sql`

---

## 🎯 Étapes pour Appliquer la Migration

### 1️⃣ Ouvrir Supabase Dashboard

1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet EduTrack CM
3. Cliquer sur **SQL Editor** dans le menu de gauche

### 2️⃣ Copier le Script SQL

Ouvrir le fichier : `supabase/migrations/20260102_fix_apps_rls_permissions.sql`

**Copier tout le contenu** (140 lignes)

### 3️⃣ Exécuter la Migration

1. Dans SQL Editor, cliquer sur **+ New Query**
2. Coller le contenu copié
3. Cliquer sur **Run** (ou Ctrl+Enter)

### 4️⃣ Vérifier le Résultat

Vous devriez voir ce message de succès :

```
═══════════════════════════════════════════════════════════
✅ POLITIQUES RLS CORRIGÉES!
═══════════════════════════════════════════════════════════

📋 Tables mises à jour :
   - apps (lecture : tous, modification : admins)
   - bundles (lecture : tous, modification : admins)
   - school_subscriptions (lecture selon rôle, modification : admins)

✅ Permissions :
   - Lecture : Tous les utilisateurs authentifiés
   - Modification : Admins uniquement

🔄 Prochaine étape : Rafraîchir l'application
```

### 5️⃣ Rafraîchir l'Application

1. Dans l'interface EduTrack Admin, **rafraîchir la page** (F5)
2. Se reconnecter si nécessaire
3. Ouvrir **App Store** → Les applications doivent s'afficher
4. Ouvrir **Mes Apps** → Les données doivent s'afficher

---

## 🔍 Ce que Fait cette Migration

### Table `apps`

**Avant :**
```sql
-- Politique restrictive (probablement limitée aux admins)
```

**Après :**
```sql
-- LECTURE : Tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read all apps"
  ON apps FOR SELECT
  TO authenticated
  USING (true);

-- MODIFICATION : Admins uniquement
CREATE POLICY "Only admins can modify apps"
  ON apps FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

### Table `bundles`

**Même structure** : Lecture pour tous, modification pour admins

### Table `school_subscriptions`

**LECTURE :**
- **Admin** : Voit TOUS les abonnements
- **Directeur** : Voit les abonnements de SON école
- **Autres** : Voient les abonnements de leur école

**MODIFICATION :**
- **Admin uniquement**

---

## ✅ Permissions Finales

| Table | Lecture | Modification |
|-------|---------|--------------|
| `apps` | ✅ Admin<br>✅ Directeur<br>✅ Autres | ✅ Admin uniquement |
| `bundles` | ✅ Admin<br>✅ Directeur<br>✅ Autres | ✅ Admin uniquement |
| `school_subscriptions` | ✅ Admin (tout)<br>✅ Directeur (son école)<br>✅ Autres (leur école) | ✅ Admin uniquement |

---

## 🧪 Tests de Validation

### Test 1 : Admin voit tout ✅
```
1. Connexion : admin@edutrack.cm
2. Ouvrir /app-store → Toutes les apps visibles
3. Ouvrir /my-apps → Toutes les subscriptions visibles
4. Vérifier possibilité de modifier apps/bundles
```

### Test 2 : Directeur voit tout mais ne peut pas modifier ✅
```
1. Connexion en tant que directeur
2. Ouvrir /app-store → Toutes les apps visibles ✅
3. Ouvrir /my-apps → Subscriptions de son école ✅
4. Essayer de modifier une app → ❌ Bloqué par RLS
```

### Test 3 : Isolation des Données ✅
```
1. Connexion directeur École A
2. /my-apps → Voir uniquement abonnements École A
3. Connexion directeur École B
4. /my-apps → Voir uniquement abonnements École B
```

---

## ❌ Si ça ne Marche Pas

### Erreur : "permission denied"

**Cause :** L'utilisateur connecté n'est pas authentifié

**Solution :**
```sql
-- Vérifier que l'utilisateur est bien dans auth.users
SELECT email, role FROM auth.users WHERE email = 'votre@email.com';

-- Vérifier que le profil existe dans public.users
SELECT email, role FROM public.users WHERE email = 'votre@email.com';
```

### App Store toujours vide

**Causes possibles :**
1. **Aucune donnée dans la table `apps`**
   ```sql
   SELECT COUNT(*) FROM apps;
   ```
   → Si 0, il faut ajouter des applications

2. **RLS non appliqué**
   ```sql
   -- Vérifier les politiques
   SELECT * FROM pg_policies WHERE tablename = 'apps';
   ```

3. **Cache frontend**
   - Vider le cache du navigateur (Ctrl+Shift+Delete)
   - Fermer/rouvrir l'onglet
   - Essayer en navigation privée

---

## 📊 Architecture des Tables

```
apps (Catalogue)
  ├─ id (TEXT)
  ├─ name
  ├─ description
  ├─ category
  ├─ price_yearly
  ├─ status ('active', 'beta', 'deprecated')
  └─ features (JSONB)

bundles (Packs)
  ├─ id (TEXT)
  ├─ name
  ├─ app_ids (TEXT[])  ← Array d'IDs apps
  ├─ price_yearly
  ├─ is_active
  └─ savings

school_subscriptions (Abonnements)
  ├─ id (UUID)
  ├─ school_id → schools.id
  ├─ app_id → apps.id
  ├─ bundle_id → bundles.id (nullable)
  ├─ status ('trial', 'active', 'expired')
  ├─ trial_ends_at
  ├─ expires_at
  └─ amount_paid
```

**Note :** Pas de table `bundle_apps` car la relation est gérée par `bundles.app_ids` (array)

---

## 🔐 Sécurité

### Ce qui est Protégé

✅ **Modification des apps** : Admin uniquement
✅ **Modification des bundles** : Admin uniquement
✅ **Création d'abonnements** : Admin uniquement
✅ **Isolation des données** : Directeur voit uniquement son école

### Ce qui est Accessible

✅ **Lecture du catalogue** : Tous les utilisateurs authentifiés
✅ **Consultation des bundles** : Tous les utilisateurs authentifiés
✅ **Visualisation des abonnements** : Selon le rôle

---

## 📝 Changelog

**Version 1.0** (2 janvier 2026)
- Correction RLS pour `apps` (lecture publique)
- Correction RLS pour `bundles` (lecture publique)
- Correction RLS pour `school_subscriptions` (lecture selon rôle)
- Retrait références `bundle_apps` (table inexistante)
- Retrait filtre `is_active` sur `apps` (colonne inexistante)

---

**Auteur :** Claude Sonnet 4.5
**Support :** docs/ADMIN_VS_PRINCIPAL_PERMISSIONS.md
**Migration :** supabase/migrations/20260102_fix_apps_rls_permissions.sql
