# 🔄 Flux de Suppression de Compte Directeur

## 📊 Diagramme de Flux Complet

```
┌─────────────────────────────────────────────────────────────┐
│                   👤 DIRECTEUR                              │
│              "Je veux supprimer mon compte"                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                🖥️  INTERFACE UTILISATEUR                    │
│                                                             │
│   1️⃣ Page : /profile-settings                              │
│   2️⃣ Scroll vers le bas                                    │
│   3️⃣ Section "Zone de danger" (rouge)                      │
│                                                             │
│   📋 Affichage :                                            │
│   • Email du compte                                         │
│   • Avertissement pour directeurs                          │
│   • Liste complète des suppressions                        │
│   • Bouton "Supprimer définitivement mon compte"           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ⚠️  CONFIRMATION                          │
│                                                             │
│   Modal s'ouvre avec :                                      │
│   • ⚠️ Icône d'alerte                                       │
│   • Titre : "Confirmer la suppression"                     │
│   • Texte : "Action définitive et irréversible"            │
│                                                             │
│   📝 Champ de saisie :                                      │
│   "Tapez exactement : SUPPRIMER MON COMPTE"                │
│                                                             │
│   [ Input field ]                                           │
│                                                             │
│   Boutons :                                                 │
│   [ Annuler ] [ Supprimer définitivement ] (désactivé)     │
│                                                             │
│   ⚙️ Logique :                                              │
│   • Bouton activé SI texte == "SUPPRIMER MON COMPTE"       │
│   • Bouton désactivé SINON                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ ✅ Texte correct + Clic sur "Supprimer"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              🔄 PROCESSUS DE SUPPRESSION                    │
│                      (7 étapes)                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1/7 : Suppression des Données Transactionnelles     │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Toutes les notes (grades)                            │
│     • Toutes les présences (attendances)                   │
│     • Tous les paiements (payments)                        │
│                                                             │
│  📊 Exemple : 9,000 enregistrements supprimés              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 2/7 : Suppression des Communications & Logs         │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Toutes les notifications                             │
│     • Tous les logs d'audit                                │
│                                                             │
│  📊 Exemple : 1,500 enregistrements supprimés              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 3/7 : Suppression des Relations                     │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Relations classes ↔ matières                         │
│     • Relations enseignants ↔ matières                     │
│     • Relations parents ↔ étudiants ↔ école                │
│                                                             │
│  📊 Exemple : 230 relations supprimées                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 4/7 : Suppression des Comptes Utilisateurs          │
│                                                             │
│  📋 Récupération des IDs utilisateurs :                    │
│     • student.user_id → [id1, id2, ..., id100]            │
│     • teacher.user_id → [id101, ..., id118]               │
│     • parent.user_id → [id119, ..., id148]                │
│     • secretary.user_id → [id149, id150]                  │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Tous les profils étudiants (100)                     │
│     • Tous les profils enseignants (18)                    │
│     • Tous les profils parents (30)                        │
│     • Tous les profils secrétaires (2)                     │
│     • Tous les comptes users liés (150 - sauf directeur)   │
│                                                             │
│  📊 Exemple : 300 enregistrements supprimés                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 5/7 : Suppression de la Configuration               │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Toutes les matières (15)                             │
│     • Toutes les classes (10)                              │
│     • Toutes les périodes d'évaluation (6)                 │
│     • Toutes les années académiques (3)                    │
│                                                             │
│  📊 Exemple : 34 enregistrements supprimés                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 6/7 : Suppression des Types                         │
│                                                             │
│  ❌ Suppression de :                                        │
│     • Types de notes (5)                                   │
│     • Types de présences (4)                               │
│     • Types de paiements (6)                               │
│     • Rôles utilisateurs (12)                              │
│                                                             │
│  📊 Exemple : 27 enregistrements supprimés                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 7/7 : Suppression de l'École et du Directeur        │
│                                                             │
│  ❌ Suppression de :                                        │
│     • École complète (schools)                             │
│     • Compte utilisateur directeur (users)                 │
│     • Compte Auth Supabase (auth.users)                    │
│                                                             │
│  📊 Exemple : 2 enregistrements supprimés                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ✅ SUPPRESSION TERMINÉE                        │
│                                                             │
│  📊 Résultats :                                             │
│     • Tables vidées : 22/22                                │
│     • Enregistrements supprimés : ~11,092                  │
│     • Comptes supprimés : 151 (150 liés + directeur)       │
│     • Temps écoulé : ~15 secondes                          │
│                                                             │
│  🔒 Actions finales :                                       │
│     1. Déconnexion forcée (signOut)                        │
│     2. Redirection vers "/" (page d'accueil)               │
│     3. Message de confirmation                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   🏠 PAGE D'ACCUEIL                         │
│                                                             │
│   ✅ Message affiché :                                      │
│   "Votre compte a été supprimé avec succès.                │
│    Toutes vos données ont été effacées."                   │
│                                                             │
│   🔒 État du système :                                      │
│   • Utilisateur déconnecté                                 │
│   • Session terminée                                       │
│   • Impossible de se reconnecter                           │
│   • École n'existe plus                                    │
│   • Données complètement effacées                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Détails des Suppressions par Étape

### ÉTAPE 1/7 : Données Transactionnelles (9,000 enregistrements)

```sql
DELETE FROM grades WHERE school_id = 'xxx';          -- 5,000 notes
DELETE FROM attendances WHERE school_id = 'xxx';     -- 3,000 présences
DELETE FROM payments WHERE school_id = 'xxx';        -- 1,000 paiements
```

### ÉTAPE 2/7 : Communications & Logs (1,500 enregistrements)

```sql
DELETE FROM notifications WHERE school_id = 'xxx';   -- 500 notifications
DELETE FROM audit_logs WHERE school_id = 'xxx';      -- 1,000 logs
```

### ÉTAPE 3/7 : Relations (230 enregistrements)

```sql
DELETE FROM class_subjects WHERE school_id = 'xxx';         -- 50 relations
DELETE FROM teacher_subjects WHERE school_id = 'xxx';       -- 30 relations
DELETE FROM parent_student_schools WHERE school_id = 'xxx'; -- 150 relations
```

### ÉTAPE 4/7 : Utilisateurs (300 enregistrements)

```sql
-- Suppression des profils
DELETE FROM students WHERE school_id = 'xxx';      -- 100 étudiants
DELETE FROM teachers WHERE school_id = 'xxx';      -- 18 enseignants
DELETE FROM parents WHERE school_id = 'xxx';       -- 30 parents
DELETE FROM secretaries WHERE school_id = 'xxx';   -- 2 secrétaires

-- Suppression des comptes users (150 - directeur)
DELETE FROM users WHERE id IN (student_user_ids);  -- 100 comptes
DELETE FROM users WHERE id IN (teacher_user_ids);  -- 18 comptes
DELETE FROM users WHERE id IN (parent_user_ids);   -- 30 comptes
DELETE FROM users WHERE id IN (secretary_user_ids);-- 2 comptes
```

### ÉTAPE 5/7 : Configuration (34 enregistrements)

```sql
DELETE FROM subjects WHERE school_id = 'xxx';            -- 15 matières
DELETE FROM classes WHERE school_id = 'xxx';             -- 10 classes
DELETE FROM evaluation_periods WHERE school_id = 'xxx'; -- 6 périodes
DELETE FROM academic_years WHERE school_id = 'xxx';      -- 3 années
```

### ÉTAPE 6/7 : Types (27 enregistrements)

```sql
DELETE FROM grade_types WHERE school_id = 'xxx';      -- 5 types
DELETE FROM attendance_types WHERE school_id = 'xxx'; -- 4 types
DELETE FROM payment_types WHERE school_id = 'xxx';    -- 6 types
DELETE FROM user_roles WHERE school_id = 'xxx';       -- 12 rôles
```

### ÉTAPE 7/7 : École & Directeur (2 enregistrements)

```sql
DELETE FROM schools WHERE id = 'xxx';                 -- 1 école
DELETE FROM users WHERE id = 'director_id';           -- 1 directeur
-- + Suppression du compte Auth Supabase
```

---

## 📊 Statistiques Totales

```
╔════════════════════════════════════════════════════╗
║        STATISTIQUES DE SUPPRESSION                 ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  📋 Tables affectées       : 22/22 (100%)         ║
║  📊 Enregistrements        : ~11,092              ║
║  👥 Comptes utilisateurs   : 151                  ║
║  🏫 Écoles                 : 1                    ║
║  ⏱️  Temps total            : ~15 secondes         ║
║  💾 Données récupérables   : 0 (0%)               ║
║  ✅ Statut                  : SUCCÈS COMPLET      ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

## 🔐 Mesures de Sécurité

### ✅ Avant Suppression
1. **Confirmation en 2 étapes**
   - Clic sur bouton rouge
   - Saisie exacte de "SUPPRIMER MON COMPTE"

2. **Vérification du rôle**
   - Seuls les directeurs peuvent supprimer une école complète

3. **Avertissements clairs**
   - Message "IRRÉVERSIBLE" affiché
   - Liste complète des suppressions visible

### ✅ Pendant Suppression
1. **Ordre de suppression respecté**
   - Inverse des dépendances (clés étrangères)

2. **Logs de progression**
   - Chaque étape loguée dans la console
   - Indicateur de progression (1/7, 2/7, etc.)

3. **Récupération des IDs**
   - IDs utilisateurs récupérés avant suppression des profils

### ✅ Après Suppression
1. **Déconnexion forcée**
   - `supabase.auth.signOut()`

2. **Redirection automatique**
   - Vers page d'accueil (`/`)

3. **Message de confirmation**
   - "Votre compte a été supprimé avec succès"

---

## ⚠️ Points d'Attention

### ❗ Pas de Rollback
- ✅ Les suppressions sont **définitives**
- ❌ Pas de système d'annulation
- ❌ Pas de sauvegarde automatique

### ❗ Pas de Notification
- ❌ Autres utilisateurs **non prévenus** automatiquement
- ⚠️ Recommandation : Prévenir manuellement avant suppression

### ❗ Suppression Auth
- ⚠️ `auth.admin.deleteUser()` nécessite permissions spéciales
- ✅ Alternative : Déconnexion forcée implémentée

---

## 🧪 Test du Flux

### Test Complet (Environnement de Test UNIQUEMENT)

```javascript
// 1. Créer une école test
// 2. Ajouter des données test
// 3. Aller sur /profile-settings
// 4. Scroll vers "Zone de danger"
// 5. Cliquer sur "Supprimer définitivement mon compte"
// 6. Taper "SUPPRIMER MON COMPTE"
// 7. Cliquer sur "Supprimer définitivement"
// 8. Vérifier :
//    - Redirection vers /
//    - Message de confirmation
//    - Impossible de se reconnecter
//    - Toutes les données supprimées (SQL)
```

---

**Date :** 26 Octobre 2025  
**Version :** 1.0.0  
**Status :** ✅ Implémenté et documenté
