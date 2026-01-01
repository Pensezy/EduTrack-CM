# 📋 Plan d'Amélioration Dashboard Principal

**Date** : 2026-01-01
**Objectif** : Corriger et améliorer tous les onglets du dashboard principal

---

## 🎯 Problèmes Identifiés et Solutions

### 1️⃣ ONGLET "ÉCOLE" (`apps/admin/src/pages/Schools/SchoolsPage.jsx`)

#### Problèmes
- ❌ Bouton "Nouvelle École" ne fonctionne pas
- ❌ Boutons Modifier/Voir/Supprimer ne fonctionnent pas
- ❌ Pas de restrictions sur la suppression d'école
- ❌ Pas de limitation en mode gratuit (1 école max)

#### Solutions
1. **Créer modal de création d'école** : `SchoolCreateModal.jsx`
   - Formulaire similaire à SignupPage mais simplifié
   - Validation des champs requis
   - Génération automatique du code école

2. **Créer modal de modification** : `SchoolEditModal.jsx`
   - Charger les données existantes
   - Empêcher modification du code (UNIQUE)
   - Validation des changements

3. **Créer modal de visualisation** : `SchoolViewModal.jsx`
   - Affichage en lecture seule
   - Stats de l'école (nb classes, élèves, etc.)

4. **Améliorer la suppression** :
   - Vérifier qu'il reste au moins 1 école pour le principal
   - Vérifier qu'il n'y a pas d'élèves actifs
   - Vérifier qu'il n'y a pas de classes actives
   - Demander confirmation avec saisie du nom
   - Soft delete (status = 'inactive') au lieu de hard delete

5. **Limitation mode gratuit** :
   - Vérifier le nombre d'écoles actives du principal
   - Si >= 1 école ET pas d'abonnement premium → désactiver bouton "Nouvelle École"
   - Afficher badge "Upgrade vers Premium" pour débloquer

#### Fichiers à modifier
- `apps/admin/src/pages/Schools/SchoolsPage.jsx` (ligne 183-186)
- `apps/admin/src/components/modals/SchoolCreateModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/SchoolEditModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/SchoolViewModal.jsx` (NOUVEAU)

---

### 2️⃣ ONGLET "UTILISATEURS" (`apps/admin/src/pages/Users/UsersPage.jsx`)

#### Problèmes
- ❌ Le directeur voit son propre compte (pas pertinent)
- ❌ Recherche non adaptée (directeur voit tous les types, même admin)
- ❌ Boutons Modifier/Voir/Bloquer ne fonctionnent pas
- ❌ Bouton "Nouvel Utilisateur" ne fonctionne pas

#### Solutions
1. **Filtrage par rôle selon type utilisateur** :
   ```javascript
   // Si admin → voit tous les rôles
   const visibleRoles = userRole === 'admin'
     ? ['admin', 'principal', 'teacher', 'secretary', 'student', 'parent']
     : ['teacher', 'secretary', 'student', 'parent']; // Principal ne voit pas admin/principal
   ```

2. **Exclure le compte du directeur actuel** :
   ```javascript
   .neq('id', currentUser.id) // Ne pas afficher son propre compte
   ```

3. **Créer modal de création** : `UserCreateModal.jsx`
   - Formulaire avec : nom, email, téléphone, rôle
   - Génération PIN aléatoire (6 chiffres)
   - Envoi email de bienvenue avec PIN
   - Roles disponibles selon type utilisateur

4. **Créer modal de modification** : `UserEditModal.jsx`
   - Modification : nom, téléphone, rôle
   - NE PAS permettre modification email (UNIQUE)
   - Réinitialisation PIN optionnelle

5. **Créer modal de visualisation** : `UserViewModal.jsx`
   - Informations complètes
   - Historique activité
   - Classes assignées (si enseignant)

6. **Action Bloquer/Débloquer** :
   - Toggle `is_active` (true/false)
   - Confirmation avant blocage
   - Message de confirmation après action

#### Fichiers à modifier
- `apps/admin/src/pages/Users/UsersPage.jsx` (ligne 47-48, 217-220)
- `apps/admin/src/components/modals/UserCreateModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/UserEditModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/UserViewModal.jsx` (NOUVEAU)

---

### 3️⃣ ONGLET "CLASSES" (`apps/admin/src/pages/Classes/ClassesPage.jsx`)

#### Problèmes
- ❌ Boutons Modifier/Voir/Supprimer ne fonctionnent pas
- ❌ Bouton "Nouvelle Classe" ne fonctionne pas

#### Solutions
1. **Créer modal de création** : `ClassCreateModal.jsx`
   - Formulaire : nom, niveau, capacité, année académique
   - Sélection année académique active par défaut
   - Validation capacité > 0

2. **Créer modal de modification** : `ClassEditModal.jsx`
   - Modification : nom, niveau, capacité
   - NE PAS permettre changement année académique
   - Afficher nb élèves actuels

3. **Créer modal de visualisation** : `ClassViewModal.jsx`
   - Liste des élèves
   - Stats : nb élèves / capacité
   - Enseignants assignés

4. **Améliorer suppression** :
   - Vérifier qu'il n'y a pas d'élèves inscrits
   - Confirmation avec saisie du nom
   - Afficher message d'erreur si élèves présents

#### Fichiers à modifier
- `apps/admin/src/pages/Classes/ClassesPage.jsx` (ligne 171-174)
- `apps/admin/src/components/modals/ClassCreateModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/ClassEditModal.jsx` (NOUVEAU)
- `apps/admin/src/components/modals/ClassViewModal.jsx` (NOUVEAU)

---

### 4️⃣ ONGLET "DEMANDES" (`apps/admin/src/pages/Enrollment/EnrollmentPage.jsx`)

#### État Actuel
✅ Table `enrollment_requests` existe dans le schema
✅ Colonnes : id, school_id, student_name, student_dob, parent_name, parent_phone, parent_email, requested_class, status, enrollment_date

#### Vérifications à faire
1. **Tester récupération données** :
   - Vérifier que la query Supabase fonctionne
   - Tester filtrage par statut (pending, approved, rejected)
   - Vérifier affichage des informations

2. **Tester boutons Approuver/Rejeter** :
   - Vérifier update du statut
   - Vérifier création élève si approuvé
   - Vérifier envoi notification parent

3. **Si problèmes** :
   - Ajouter logs console
   - Créer modal de confirmation pour actions
   - Ajouter gestion erreurs

#### Fichiers à vérifier
- `apps/admin/src/pages/Enrollment/EnrollmentPage.jsx` (ligne 195-200)

---

### 5️⃣ ONGLET "PERSONNEL" (`apps/admin/src/pages/Personnel/PersonnelPage.jsx`)

#### Problèmes
- ❌ Même problèmes que "Utilisateurs" (filtrage, boutons)
- ❌ Bouton "Nouveau Personnel" ne fonctionne pas

#### Solutions
**IDENTIQUES À L'ONGLET UTILISATEURS** mais spécifiques au personnel :
- Filtrage : rôles = teacher, secretary uniquement
- Création limitée aux rôles teacher/secretary
- Même modals que Utilisateurs (réutilisables)

#### Fichiers à modifier
- `apps/admin/src/pages/Personnel/PersonnelPage.jsx` (ligne 224-227)

---

### 6️⃣ ONGLET "APP STORE" (`apps/admin/src/pages/AppStore/AppStorePage.jsx`)

#### Problèmes
- ❌ Ne fonctionne pas
- ❌ Rien ne s'affiche

#### État de la Base de Données
✅ Table `apps` existe (migration `20251231_modular_architecture_setup.sql`)
✅ 8 apps seed data :
  - core (FREE)
  - academic (15,000 FCFA/an)
  - schedule (12,000 FCFA/an)
  - financial (20,000 FCFA/an)
  - discipline (10,000 FCFA/an)
  - hr (18,000 FCFA/an)
  - communication (8,000 FCFA/an)
  - reporting (15,000 FCFA/an)

✅ Table `bundles` existe :
  - starter (25,000 FCFA)
  - standard (50,000 FCFA)
  - premium (80,000 FCFA)

✅ Vue `v_apps_catalog` existe (formatage prix)
✅ Vue `v_bundles_catalog` existe (formatage bundles)

#### Solutions
1. **Vérifier que la migration est appliquée** :
   ```sql
   SELECT * FROM apps;
   SELECT * FROM bundles;
   SELECT * FROM v_apps_catalog;
   ```

2. **Corriger AppStorePage** :
   - Utiliser hook `useActiveApps()` (existe déjà dans `/packages/api-client/src/hooks/useActiveApps.js`)
   - Récupérer `apps` et `bundles` depuis Supabase
   - Afficher prix depuis la BDD (pas hardcodé)

3. **Afficher correctement** :
   - Onglet "Applications" : toutes les apps avec prix
   - Onglet "Packs" : tous les bundles avec économies
   - Boutons "Essayer gratuitement" (30 jours)
   - Boutons "Souscrire"

#### Fichiers à modifier
- `apps/admin/src/pages/AppStore/AppStorePage.jsx` (ligne 89-93)
- Utiliser `/packages/api-client/src/hooks/useActiveApps.js`

---

### 7️⃣ ONGLET "MES APPS" (`apps/admin/src/pages/MyApps/MyAppsPage.jsx`)

#### Problèmes
- ❌ Affichage vide
- ❌ Pas de données réalistes

#### Solutions
1. **Application de base activée automatiquement** :
   - Lors création école → activer app "core" (FREE)
   - Créer trigger ou fonction SQL :
   ```sql
   CREATE OR REPLACE FUNCTION auto_activate_core_app()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO school_subscriptions (school_id, app_id, status, activated_at)
     VALUES (NEW.id, 'core', 'active', NOW())
     ON CONFLICT DO NOTHING;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER on_school_created
   AFTER INSERT ON schools
   FOR EACH ROW
   EXECUTE FUNCTION auto_activate_core_app();
   ```

2. **Utiliser hook `useSchoolSubscriptions()`** :
   - Récupérer subscriptions actives
   - Afficher apps actives avec date expiration
   - Afficher trials en cours

3. **Afficher stats réalistes** :
   - Compter apps actives
   - Compter trials
   - Calculer dépenses totales
   - Afficher apps qui expirent bientôt (<7 jours)

#### Fichiers à modifier
- `apps/admin/src/pages/MyApps/MyAppsPage.jsx` (ligne 97-101)
- `supabase/migrations/20251231_modular_architecture_setup.sql` (ajouter trigger)

---

### 8️⃣ LANDING PAGE - PRIX DYNAMIQUES (`apps/hub/src/pages/Landing/LandingPage.jsx`)

#### Problème
❌ Prix hardcodés dans le code (ligne 38-146)

#### Solution
1. **Récupérer prix depuis BDD** :
   ```javascript
   const { data: apps } = await supabase.from('v_apps_catalog').select('*');
   const { data: bundles } = await supabase.from('v_bundles_catalog').select('*');
   ```

2. **Remplacer données hardcodées** :
   - Applications : utiliser `apps` au lieu de `applications`
   - Packs : utiliser `bundles` au lieu de `pricingPlans`

3. **Formater prix** :
   - Vue `v_apps_catalog` retourne déjà `price_yearly_formatted`
   - Vue `v_bundles_catalog` retourne `price_formatted` et `savings_formatted`

#### Fichiers à modifier
- `apps/hub/src/pages/Landing/LandingPage.jsx` (ligne 38-146, 324-400)

---

## 📊 Résumé des Fichiers à Créer

### Nouveaux Composants Modals
```
apps/admin/src/components/modals/
├── SchoolCreateModal.jsx
├── SchoolEditModal.jsx
├── SchoolViewModal.jsx
├── UserCreateModal.jsx
├── UserEditModal.jsx
├── UserViewModal.jsx
├── ClassCreateModal.jsx
├── ClassEditModal.jsx
└── ClassViewModal.jsx
```

### Nouveaux Hooks (si besoin)
```
packages/api-client/src/hooks/
├── useSchools.js (CRUD operations)
├── useUsers.js (CRUD operations)
└── useClasses.js (CRUD operations)
```

### Migrations à ajouter
```
supabase/migrations/
└── 20260101_auto_activate_core_app.sql (trigger)
```

---

## 🔄 Ordre d'Exécution

### Phase 1 : Base de Données (30 min)
1. ✅ Vérifier que migration modular_architecture est appliquée
2. ✅ Créer trigger auto_activate_core_app
3. ✅ Tester vues v_apps_catalog et v_bundles_catalog

### Phase 2 : Landing Page (1h)
4. Remplacer prix hardcodés par données BDD
5. Tester affichage applications et packs

### Phase 3 : App Store & Mes Apps (2h)
6. Corriger AppStorePage avec useActiveApps
7. Corriger MyAppsPage avec useSchoolSubscriptions
8. Tester achat/trial apps

### Phase 4 : Modals Réutilisables (3h)
9. Créer modals School (Create/Edit/View)
10. Créer modals User (Create/Edit/View)
11. Créer modals Class (Create/Edit/View)

### Phase 5 : Intégration Pages (4h)
12. Intégrer modals dans SchoolsPage + logique suppression
13. Intégrer modals dans UsersPage + filtrage
14. Intégrer modals dans ClassesPage
15. Intégrer modals dans PersonnelPage
16. Vérifier EnrollmentPage

### Phase 6 : Limitations Mode Gratuit (1h)
17. Ajouter vérification 1 école max
18. Désactiver bouton si limite atteinte
19. Afficher message upgrade

### Phase 7 : Tests Complets (2h)
20. Tester chaque onglet
21. Tester CRUD sur chaque entité
22. Tester restrictions et validations

---

## ⏱️ Estimation Totale : ~13 heures

---

**Prochaine étape** : Commencer par Phase 1 (vérification BDD) puis Phase 2 (Landing Page dynamique)
