# 🚨 URGENT: Migrations SQL à Appliquer

**Problème actuel**: App Store et Mes Apps sont vides car les données ne sont **PAS dans Supabase**.

## ✅ CE QUI A ÉTÉ FAIT (Code Frontend)

Le code frontend est **déjà prêt** et déployé sur Vercel:
- ✅ Chargement apps depuis BDD (au lieu de hardcodé)
- ✅ Chargement bundles depuis BDD
- ✅ Affichage app core dans Mes Apps
- ✅ Badges statut développement

## ❌ CE QUI MANQUE (Base de Données)

Les **tables sont vides** dans Supabase. Il faut appliquer les migrations pour y insérer les données.

---

## 📋 MIGRATIONS À APPLIQUER MAINTENANT

### **Migration 1** : Architecture Modulaire (8 apps + 3 bundles)

**Fichier** : `supabase/migrations/20251231_modular_architecture_setup.sql`

**Qu'est-ce qu'elle fait ?**
- Crée les tables `apps`, `bundles`, `school_subscriptions`
- **Insère 8 applications** :
  - core (Gratuit - App de base)
  - academic (15,000 FCFA/an)
  - schedule (12,000 FCFA/an)
  - financial (20,000 FCFA/an)
  - discipline (10,000 FCFA/an)
  - hr (18,000 FCFA/an)
  - communication (8,000 FCFA/an)
  - reporting (15,000 FCFA/an)
- **Insère 3 bundles** (Starter, Standard, Premium)
- Crée vues `v_apps_catalog`, `v_bundles_catalog`
- Crée fonctions SQL (has_active_app, get_school_active_apps, start_trial, etc.)

**Comment l'appliquer ?**
1. Ouvrir https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (menu gauche)
4. Cliquer **New Query**
5. Copier **TOUT** le contenu du fichier `20251231_modular_architecture_setup.sql`
6. Coller dans l'éditeur
7. Cliquer **Run** (bouton vert)
8. Attendre... Vous devriez voir "Success" ✅

---

### **Migration 2** : Prix Réalistes

**Fichier** : `supabase/migrations/UPDATE_REALISTIC_PRICING.sql`

**Qu'est-ce qu'elle fait ?**
- Met à jour les prix pour être réalistes (27k-40k FCFA/an au lieu de 8k-20k)
- Met à jour les économies des bundles

**Comment l'appliquer ?**
1. SQL Editor → New Query
2. Copier contenu de `UPDATE_REALISTIC_PRICING.sql`
3. Coller et Run

---

### **Migration 3** : Permissions RLS

**Fichier** : `supabase/migrations/FIX_RLS_VIEWS_PUBLIC.sql`

**Qu'est-ce qu'elle fait ?**
- Autorise la lecture publique des apps et bundles (pour la landing page)
- Donne accès SELECT aux vues pour les utilisateurs anonymes et authentifiés

**Comment l'appliquer ?**
1. SQL Editor → New Query
2. Copier contenu de `FIX_RLS_VIEWS_PUBLIC.sql`
3. Coller et Run

---

### **Migration 4** : Auto-Activation App Core

**Fichier** : `supabase/migrations/20260101_auto_activate_core_app.sql`

**Qu'est-ce qu'elle fait ?**
- Active automatiquement l'app core (gratuite) pour toutes les écoles
- Crée un trigger pour activer l'app core pour chaque nouvelle école

**Comment l'appliquer ?**
1. SQL Editor → New Query
2. Copier contenu de `20260101_auto_activate_core_app.sql`
3. Coller et Run

---

### **Migration 5** : Statut Développement Apps

**Fichier** : `supabase/migrations/ADD_APP_DEVELOPMENT_STATUS.sql`

**Qu'est-ce qu'elle fait ?**
- Ajoute champ `development_status` sur table apps
- Marque 3 apps comme "ready" et 5 comme "in_development"

**Comment l'appliquer ?**
1. SQL Editor → New Query
2. Copier contenu de `ADD_APP_DEVELOPMENT_STATUS.sql`
3. Coller et Run

---

## ✅ VÉRIFICATION APRÈS MIGRATION

Exécutez ce script pour vérifier que tout est OK:

**Fichier** : `supabase/migrations/VERIFY_MODULAR_SYSTEM.sql`

Il va afficher:
- ✅ Tables créées
- ✅ 8 apps insérées
- ✅ 3 bundles insérés
- ✅ Vues fonctionnelles
- ✅ Fonctions créées
- ✅ Trigger actif
- ✅ App core activée pour toutes les écoles

Si tout est OK, vous verrez: `🎉 SYSTÈME MODULAIRE: 100% OPÉRATIONNEL`

---

## 🧪 TESTER APRÈS MIGRATION

1. **App Store** (Dashboard Principal)
   - Aller dans App Store
   - Vous devriez voir **8 applications** avec leurs prix
   - Onglet Packs : **3 bundles**
   - Apps avec badge "En Développement" (orange) pour 5 apps

2. **Mes Apps** (Dashboard Principal)
   - Vous devriez voir **1 app active** (l'app "core" gratuite)
   - Stats Apps Actives : 1
   - Carte de l'app core affichée

3. **Landing Page** (https://edutrack-cm-hub.vercel.app)
   - Section Applications : 8 apps
   - Section Packs : 3 bundles
   - Tous les prix affichés

---

## ⏱️ TEMPS ESTIMÉ : 10 minutes

1. Migration 1 (principale) : 3 min
2. Migration 2 (prix) : 1 min
3. Migration 3 (RLS) : 1 min
4. Migration 4 (core app) : 1 min
5. Migration 5 (dev status) : 1 min
6. Vérification : 2 min
7. Tests interface : 1 min

---

## 🆘 EN CAS DE PROBLÈME

### Erreur: "relation apps does not exist"
→ Migration 1 pas appliquée ou a échoué
→ Réexécuter `20251231_modular_architecture_setup.sql`

### Apps toujours vides après migration
→ Vérifier dans SQL Editor :
```sql
SELECT COUNT(*) FROM apps;
SELECT COUNT(*) FROM bundles;
```
→ Si 0, réexécuter la section SEED DATA de la migration 1

### App core non visible dans Mes Apps
→ Vérifier :
```sql
SELECT * FROM school_subscriptions WHERE app_id = 'core';
```
→ Si vide, réexécuter migration 4

---

**❓ BESOIN D'AIDE ?**

Si les migrations échouent ou si vous avez des erreurs, **copiez le message d'erreur complet** et envoyez-le moi.
