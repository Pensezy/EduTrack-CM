# 🔍 Checklist de Vérification - Système de Packs

## ✅ Étapes de Vérification

### 1️⃣ Vérifier que le serveur fonctionne

- [ ] Ouvrir `http://localhost:5175/` dans le navigateur
- [ ] Rafraîchir la page (Ctrl+Shift+R ou Cmd+Shift+R pour vider le cache)
- [ ] Vérifier qu'il n'y a pas d'erreurs dans la console du navigateur (F12)

### 2️⃣ Vérifier la migration SQL

Exécutez cette requête dans Supabase SQL Editor:

```sql
-- Vérifier que les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('bundle_access_requests', 'school_bundle_subscriptions');

-- Devrait retourner 2 lignes
```

```sql
-- Vérifier que la colonne is_active existe dans bundles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bundles'
  AND column_name = 'is_active';

-- Devrait retourner 1 ligne: is_active | boolean
```

```sql
-- Vérifier que les fonctions existent
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('activate_bundle', 'approve_bundle_request', 'reject_bundle_request');

-- Devrait retourner 3 lignes
```

### 3️⃣ Tester en tant qu'ADMIN

**a) Connectez-vous avec un compte admin**

**b) Vérifiez le Dashboard Admin:**
- [ ] Vous voyez des stats GLOBALES (pas juste votre école)
- [ ] Section "Revenus" est visible avec montant total
- [ ] Carte "Apps & Packs" avec statistiques
- [ ] Alertes sur demandes en attente

**c) Vérifiez la Sidebar:**
- [ ] Menu "Catalogue Apps" visible
- [ ] Menu "Demandes Apps" visible
- [ ] Menu **"Catalogue Packs"** visible ✨
- [ ] Menu **"Demandes Packs"** visible avec badge "NEW" ✨

**d) Testez "Catalogue Packs":**
- [ ] Page s'ouvre sans erreur
- [ ] Vous voyez la liste des packs
- [ ] Boutons "Activer/Désactiver" visibles
- [ ] Bouton "Assigner" visible

**e) Testez "Demandes Packs":**
- [ ] Page s'ouvre sans erreur
- [ ] Stats affichées (Total, En attente, Approuvées, Rejetées)
- [ ] Filtres fonctionnent

### 4️⃣ Tester en tant que DIRECTEUR (Principal)

**a) Connectez-vous avec un compte directeur**

**b) Vérifiez le Dashboard Principal:**
- [ ] Vous voyez UNIQUEMENT les stats de VOTRE école
- [ ] Nom de votre école affiché en haut
- [ ] PAS de section "Revenus" visible
- [ ] Stats: élèves, enseignants, classes de votre école uniquement

**c) Vérifiez la Sidebar:**
- [ ] Menu "App Store" visible
- [ ] Menu "Mes Apps" visible
- [ ] Menu "Mon École" visible
- [ ] **PAS de menu "Catalogue Packs"** (réservé admin)
- [ ] **PAS de menu "Demandes Packs"** (réservé admin)

**d) Testez l'App Store:**
- [ ] Cliquez sur "App Store"
- [ ] Onglet "Packs" visible en haut
- [ ] Cliquez sur onglet "Packs"
- [ ] Liste des packs s'affiche
- [ ] Cliquez "Souscrire" sur un pack
- [ ] **Modal "Demander l'accès au [Pack]" s'ouvre** ✨
- [ ] Modal affiche:
  - [ ] Description du pack
  - [ ] Prix annuel + Économies
  - [ ] Liste des applications incluses
  - [ ] Champ message optionnel
  - [ ] Bouton "Envoyer la demande"

**e) Créer une demande de pack:**
- [ ] Remplissez le message (optionnel)
- [ ] Cliquez "Envoyer la demande"
- [ ] Alert de succès s'affiche
- [ ] Modal se ferme

### 5️⃣ Tester le Workflow Complet Admin

**a) Retournez sur le compte admin**

**b) Allez dans "Demandes Packs":**
- [ ] Vous voyez la demande créée par le directeur
- [ ] Statut: "En attente" (badge jaune)
- [ ] Infos visibles: École, Pack, Demandeur, Date
- [ ] Message de demande affiché

**c) Approuver la demande:**
- [ ] Cliquez "Approuver"
- [ ] Modal s'ouvre
- [ ] Champ "Durée d'activation" avec valeur par défaut 1
- [ ] Changez à 2 ans
- [ ] Ajoutez un message: "Demande approuvée pour 2 ans"
- [ ] Cliquez "Confirmer"
- [ ] Alert de succès avec message: "Pack activé avec X applications"
- [ ] Demande passe à "Approuvée" (badge vert)

**d) Vérifier dans Supabase:**

```sql
-- Vérifier que la demande est approved
SELECT status, review_message, reviewed_at
FROM bundle_access_requests
WHERE status = 'approved'
ORDER BY reviewed_at DESC
LIMIT 1;
```

```sql
-- Vérifier que l'abonnement pack a été créé
SELECT bundle_id, status, expires_at
FROM school_bundle_subscriptions
ORDER BY created_at DESC
LIMIT 1;

-- expires_at devrait être dans 2 ans
```

```sql
-- Vérifier que les apps du pack ont été activées
SELECT app_id, status, expires_at
FROM school_subscriptions
WHERE school_id = (SELECT school_id FROM bundle_access_requests WHERE status = 'approved' ORDER BY reviewed_at DESC LIMIT 1)
  AND status = 'active'
ORDER BY created_at DESC;

-- Devrait retourner toutes les apps du pack avec même expires_at
```

### 6️⃣ Vérifier le Compte à Rebours

**a) En tant que directeur:**
- [ ] Allez dans "Mes Apps"
- [ ] Vous devriez voir toutes les apps du pack activées
- [ ] Chaque app affiche "Expire dans X jours/mois/ans"
- [ ] Date d'expiration devrait être la même pour toutes les apps du pack

---

## 🐛 Problèmes Courants

### Le dashboard ne change pas

**Cause**: Cache du navigateur
**Solution**:
- Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
- Ou F12 → Network → Cocher "Disable cache"

### Erreur "Cannot resolve @edutrack/..."

**Cause**: Imports incorrects
**Solution**: Vérifier que tous les imports utilisent `@edutrack/api` et non `@edutrack/contexts`

### Les menus Packs ne s'affichent pas

**Cause**: Rôle utilisateur incorrect
**Solution**:
- Vérifier dans Supabase que l'utilisateur a bien `role = 'admin'`
- Les menus "Catalogue Packs" et "Demandes Packs" sont UNIQUEMENT pour admin

### La modal de demande ne s'ouvre pas

**Cause**: Erreur JavaScript
**Solution**:
- Ouvrir console navigateur (F12)
- Vérifier les erreurs
- Vérifier que `BundleRequestModal.jsx` est bien importé dans `AppStorePage.jsx`

### Erreur lors de l'approbation

**Cause**: Fonction PostgreSQL non créée ou erreur RLS
**Solution**:
- Vérifier que la migration SQL a bien été exécutée
- Vérifier que l'utilisateur admin a les droits nécessaires

---

## 📊 Résumé des Différences Admin vs Directeur

| Fonctionnalité | Admin | Directeur |
|----------------|-------|-----------|
| Dashboard | Stats GLOBALES + Revenus | Stats de SON école uniquement |
| Catalogue Packs | ✅ Voir/gérer tous packs | ❌ Non accessible |
| Demandes Packs | ✅ Approuver/Rejeter | ❌ Non accessible |
| App Store Packs | ✅ Visible | ✅ Demander accès |
| Activation Packs | ✅ Direct + Approbation | ❌ Demande uniquement |

---

## 🎯 Test Rapide

**1. Admin Dashboard devrait afficher:**
```
┌─────────────────────────────────────────┐
│ 🏫 Dashboard Admin                      │
├─────────────────────────────────────────┤
│ [Écoles: X] [Utilisateurs: Y]          │
│ [Élèves: Z] [Enseignants: W]           │
│                                         │
│ 💰 Revenus                              │
│ Total: XXX,XXX FCFA                     │
│                                         │
│ 📦 Apps & Packs                         │
│ Apps actives: X/Y                       │
│ Packs actifs: X                         │
│                                         │
│ ⚠️ Demandes en attente                  │
│ Apps: X | Packs: Y | Inscriptions: Z   │
└─────────────────────────────────────────┘
```

**2. Directeur Dashboard devrait afficher:**
```
┌─────────────────────────────────────────┐
│ 🏫 École ABC                            │
├─────────────────────────────────────────┤
│ [Élèves: X] [Enseignants: Y]           │
│ [Personnel: Z] [Classes: W]            │
│                                         │
│ 📱 Mes Applications                     │
│ Apps actives: X                         │
│ Packs actifs: Y                         │
│                                         │
│ ⏳ Demandes en attente                  │
│ Apps: X | Packs: Y                      │
└─────────────────────────────────────────┘
```

**PAS de section "Revenus" pour directeur !**
