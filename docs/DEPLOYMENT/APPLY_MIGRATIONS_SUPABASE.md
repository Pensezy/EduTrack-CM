# 🚀 Guide : Appliquer les Migrations Supabase

**Date** : 2026-01-01
**Objectif** : Activer le système modulaire d'applications et bundles

---

## ⚠️ Migrations à Appliquer

Deux migrations sont nécessaires pour activer le système complet :

### 1️⃣ **Migration Architecture Modulaire**
**Fichier** : `supabase/migrations/20251231_modular_architecture_setup.sql`

**Contenu** :
- ✅ Tables : `apps`, `bundles`, `school_subscriptions`
- ✅ Fonctions SQL : `has_active_app()`, `get_school_active_apps()`, `start_trial()`, `activate_subscription()`
- ✅ Vues : `v_apps_catalog`, `v_bundles_catalog`
- ✅ **Données Seed** : 8 applications + 3 bundles avec tous les prix

**Apps incluses** :
| ID | Nom | Prix/an | Catégorie |
|----|-----|---------|-----------|
| `core` | EduTrack Base | 0 FCFA | Gratuit |
| `academic` | Gestion Académique | 15,000 FCFA | Pédagogie |
| `schedule` | Emplois du Temps | 12,000 FCFA | Pédagogie |
| `financial` | Gestion Financière | 20,000 FCFA | Administration |
| `discipline` | Discipline & Absences | 10,000 FCFA | Administration |
| `hr` | Ressources Humaines | 18,000 FCFA | Administration |
| `communication` | Communication | 8,000 FCFA | Communication |
| `reporting` | Reporting Avancé | 15,000 FCFA | Analytics |

**Bundles inclus** :
| ID | Nom | Apps | Prix/an | Économie |
|----|-----|------|---------|----------|
| `starter` | Bundle Starter | academic + discipline | 25,000 FCFA | 10,000 FCFA |
| `standard` | Bundle Standard | academic + discipline + financial + communication | 50,000 FCFA | 15,000 FCFA |
| `premium` | Bundle Premium | Toutes les apps (7) | 80,000 FCFA | 18,000 FCFA |

### 2️⃣ **Migration Auto-Activation App Core**
**Fichier** : `supabase/migrations/20260101_auto_activate_core_app.sql`

**Contenu** :
- ✅ Trigger `on_school_created` : Active automatiquement l'app "core" pour chaque nouvelle école
- ✅ Activation rétroactive pour toutes les écoles existantes

---

## 📋 Procédure d'Application

### Étape 1 : Connexion à Supabase

1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet EduTrack
3. Aller dans **SQL Editor** (icône `</>` dans le menu latéral)

### Étape 2 : Appliquer Migration 1 (Architecture Modulaire)

1. Cliquer sur **"New Query"**
2. Copier TOUT le contenu de `supabase/migrations/20251231_modular_architecture_setup.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"** (en bas à droite)
5. Vérifier qu'il n'y a pas d'erreurs (devrait dire "Success")

**Vérification** :
```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM apps;  -- Devrait retourner 8
SELECT COUNT(*) FROM bundles;  -- Devrait retourner 3

-- Vérifier les prix
SELECT id, name, price_yearly FROM apps ORDER BY sort_order;

-- Vérifier les bundles
SELECT id, name, price_yearly, savings FROM bundles ORDER BY sort_order;
```

### Étape 3 : Appliquer Migration 2 (Auto-Activation Core)

1. Cliquer sur **"New Query"**
2. Copier TOUT le contenu de `supabase/migrations/20260101_auto_activate_core_app.sql`
3. Coller dans l'éditeur SQL
4. Cliquer sur **"Run"**
5. Observer les logs NOTICE qui montrent :
   ```
   ✅ Migration terminée:
     - Total écoles actives: X
     - Écoles avec app "core": X
   ✅ Toutes les écoles ont l'app "core" activée
   ```

**Vérification** :
```sql
-- Vérifier que les écoles ont l'app core
SELECT
  s.name AS school_name,
  ss.app_id,
  ss.status,
  ss.activated_at
FROM schools s
JOIN school_subscriptions ss ON ss.school_id = s.id
WHERE ss.app_id = 'core'
ORDER BY s.name;
```

---

## 🧪 Tests Après Migration

### Test 1 : Landing Page
1. Aller sur https://edutrack-cm-hub.vercel.app
2. Vérifier que les **8 applications** s'affichent avec les bons prix
3. Vérifier que les **3 packs** s'affichent avec économies
4. Ouvrir console (F12) → Pas d'erreur de chargement

### Test 2 : App Store (Dashboard Principal)
1. Se connecter en tant que Principal
2. Aller dans **App Store**
3. **Onglet Applications** : Vérifier que les 8 apps s'affichent
4. **Onglet Packs** : Vérifier que les 3 bundles s'affichent
5. Console (F12) → Devrait voir : `✅ Bundles chargés: [...]`

### Test 3 : Mes Apps (Dashboard Principal)
1. Aller dans **Mes Apps**
2. Vérifier que **1 app active** (core) s'affiche
3. Stats :
   - Apps Actives : 1
   - Essais Gratuits : 0
   - Expire Bientôt : 0
   - Dépenses Totales : 0 FCFA

### Test 4 : Nouvelle Inscription
1. Créer un nouveau compte école
2. Après inscription confirmée, vérifier dans Supabase :
   ```sql
   SELECT * FROM school_subscriptions
   WHERE school_id = 'UUID_NOUVELLE_ECOLE'
   AND app_id = 'core';
   ```
3. Devrait retourner 1 ligne avec `status = 'active'`

---

## 🐛 Problèmes Possibles

### Erreur : "relation apps does not exist"
**Cause** : Les tables n'ont pas été créées

**Solution** :
1. Vérifier que vous avez bien appliqué la migration `20251231_modular_architecture_setup.sql`
2. Vérifier les permissions RLS

### Erreur : "could not find the v_apps_catalog view"
**Cause** : Les vues n'ont pas été créées

**Solution** :
1. Réappliquer la section VUES de la migration (lignes 452-502)
2. Vérifier avec :
   ```sql
   SELECT * FROM v_apps_catalog LIMIT 1;
   ```

### Apps/Bundles vides dans l'interface
**Cause** : Données seed non insérées

**Solution** :
1. Réexécuter la section SEED DATA (lignes 366-430)
2. Vérifier avec :
   ```sql
   SELECT COUNT(*) FROM apps;
   SELECT COUNT(*) FROM bundles;
   ```

### App "core" non activée pour écoles existantes
**Cause** : Migration 2 non appliquée ou trigger désactivé

**Solution** :
1. Réappliquer `20260101_auto_activate_core_app.sql`
2. Ou exécuter manuellement :
   ```sql
   INSERT INTO school_subscriptions (school_id, app_id, status, activated_at, auto_renew)
   SELECT s.id, 'core', 'active', NOW(), true
   FROM schools s
   LEFT JOIN school_subscriptions ss ON ss.school_id = s.id AND ss.app_id = 'core'
   WHERE ss.id IS NULL AND s.status = 'active';
   ```

---

## ✅ Checklist Complète

- [ ] Migration 1 appliquée (`20251231_modular_architecture_setup.sql`)
- [ ] 8 apps présentes dans la table `apps`
- [ ] 3 bundles présents dans la table `bundles`
- [ ] Vues `v_apps_catalog` et `v_bundles_catalog` créées
- [ ] Migration 2 appliquée (`20260101_auto_activate_core_app.sql`)
- [ ] Trigger `on_school_created` actif
- [ ] Toutes les écoles existantes ont l'app "core" activée
- [ ] Landing Page affiche les apps et bundles
- [ ] App Store affiche les apps et bundles
- [ ] Mes Apps affiche l'app "core" pour les écoles
- [ ] Nouvelle inscription active automatiquement "core"

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs dans Supabase SQL Editor
2. Consulter la table `audit_logs` si elle existe
3. Vérifier les politiques RLS avec :
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('apps', 'bundles', 'school_subscriptions');
   ```

---

**Dernière mise à jour** : 2026-01-01
**Status après application** : ✅ Système modulaire opérationnel
