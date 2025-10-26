# 🗑️ Suppression de Compte Directeur - Liste Complète des Données

## ⚠️ ATTENTION : SUPPRESSION DÉFINITIVE ET IRRÉVERSIBLE

Lorsqu'un **directeur** supprime son compte, **TOUTES** les données suivantes sont **définitivement effacées** de la base de données.

---

## 📋 Ordre de Suppression (Cascade)

### 1️⃣ DONNÉES TRANSACTIONNELLES

#### **Notes (grades)**
- ✅ Toutes les notes des étudiants
- ✅ Toutes les évaluations
- ✅ Tous les commentaires des enseignants
- ✅ Historique complet des performances

**Tables affectées :** `grades`

---

#### **Présences (attendances)**
- ✅ Tous les enregistrements de présence
- ✅ Toutes les absences justifiées/non justifiées
- ✅ Tous les retards
- ✅ Historique complet de présence

**Tables affectées :** `attendances`

---

#### **Paiements (payments)**
- ✅ Tous les paiements de scolarité
- ✅ Tous les reçus
- ✅ Toutes les factures
- ✅ Historique financier complet

**Tables affectées :** `payments`

---

### 2️⃣ COMMUNICATIONS & LOGS

#### **Notifications**
- ✅ Toutes les notifications envoyées
- ✅ Toutes les alertes système
- ✅ Tous les messages aux parents
- ✅ Historique de communication

**Tables affectées :** `notifications`

---

#### **Logs d'Audit**
- ✅ Tous les logs d'activité
- ✅ Historique des actions administratives
- ✅ Traces de modifications
- ✅ Logs de sécurité

**Tables affectées :** `audit_logs`

---

### 3️⃣ RELATIONS & ASSOCIATIONS

#### **Relations Classes-Matières**
- ✅ Toutes les associations classes ↔ matières
- ✅ Configuration des emplois du temps
- ✅ Liens pédagogiques

**Tables affectées :** `class_subjects`

---

#### **Relations Enseignants-Matières**
- ✅ Toutes les assignations enseignants ↔ matières
- ✅ Planning des enseignants
- ✅ Responsabilités pédagogiques

**Tables affectées :** `teacher_subjects`

---

#### **Relations Parents-Étudiants**
- ✅ Tous les liens parents ↔ étudiants ↔ école
- ✅ Autorités parentales
- ✅ Contacts d'urgence

**Tables affectées :** `parent_student_schools`

---

### 4️⃣ COMPTES UTILISATEURS

#### **Étudiants (students)**
- ✅ **Tous les profils étudiants**
- ✅ Informations personnelles (nom, prénom, date de naissance, genre)
- ✅ Informations de contact
- ✅ Matricules
- ✅ Photos de profil
- ✅ **Comptes utilisateurs associés** dans la table `users`

**Tables affectées :** `students`, `users`

---

#### **Enseignants (teachers)**
- ✅ **Tous les profils enseignants**
- ✅ Informations personnelles
- ✅ Qualifications et diplômes
- ✅ Spécialisations
- ✅ Informations de contact
- ✅ **Comptes utilisateurs associés** dans la table `users`

**Tables affectées :** `teachers`, `users`

---

#### **Parents**
- ✅ **Tous les profils parents**
- ✅ Informations personnelles
- ✅ Informations de contact
- ✅ Relations avec étudiants
- ✅ **Comptes utilisateurs associés** dans la table `users`

**Tables affectées :** `parents`, `users`

---

#### **Secrétaires (secretaries)**
- ✅ **Tous les profils secrétaires**
- ✅ Informations personnelles
- ✅ Permissions administratives
- ✅ **Comptes utilisateurs associés** dans la table `users`

**Tables affectées :** `secretaries`, `users`

---

### 5️⃣ CONFIGURATION PÉDAGOGIQUE

#### **Matières (subjects)**
- ✅ Toutes les matières enseignées
- ✅ Codes matières
- ✅ Descriptions
- ✅ Coefficients

**Tables affectées :** `subjects`

---

#### **Classes**
- ✅ Toutes les classes de l'école
- ✅ Niveaux (CP, CE1, CE2, etc.)
- ✅ Sections (A, B, C)
- ✅ Effectifs

**Tables affectées :** `classes`

---

#### **Périodes d'Évaluation**
- ✅ Trimestres
- ✅ Semestres
- ✅ Périodes personnalisées
- ✅ Dates de début/fin

**Tables affectées :** `evaluation_periods`

---

#### **Années Académiques**
- ✅ Toutes les années scolaires
- ✅ Années en cours
- ✅ Archives des années passées
- ✅ Configuration des calendriers

**Tables affectées :** `academic_years`

---

### 6️⃣ TYPES & CONFIGURATION

#### **Types de Notes (grade_types)**
- ✅ Contrôle continu
- ✅ Examens
- ✅ Devoirs
- ✅ Types personnalisés

**Tables affectées :** `grade_types`

---

#### **Types de Présences (attendance_types)**
- ✅ Présent
- ✅ Absent justifié
- ✅ Absent non justifié
- ✅ Retard
- ✅ Types personnalisés

**Tables affectées :** `attendance_types`

---

#### **Types de Paiements (payment_types)**
- ✅ Scolarité
- ✅ Cantine
- ✅ Transport
- ✅ Activités
- ✅ Types personnalisés

**Tables affectées :** `payment_types`

---

#### **Rôles Utilisateurs (user_roles)**
- ✅ Tous les rôles et permissions
- ✅ Configuration des accès
- ✅ Hiérarchie des droits

**Tables affectées :** `user_roles`

---

### 7️⃣ ÉTABLISSEMENT

#### **École (schools)**
- ✅ **Profil complet de l'école**
- ✅ Nom de l'établissement
- ✅ Adresse
- ✅ Informations de contact
- ✅ Logo et images
- ✅ Configuration générale
- ✅ Paramètres de l'établissement

**Tables affectées :** `schools`

---

### 8️⃣ COMPTE DIRECTEUR

#### **Utilisateur Directeur (users)**
- ✅ **Votre compte utilisateur**
- ✅ Informations personnelles
- ✅ Email de connexion
- ✅ Historique de connexion

**Tables affectées :** `users`

---

#### **Compte Auth Supabase**
- ✅ Accès à l'application
- ✅ Authentification
- ✅ Sessions

**Services affectés :** Supabase Auth

---

## 📊 Résumé des Tables Supprimées

| # | Table | Description | Cascade |
|---|-------|-------------|---------|
| 1 | `grades` | Notes des étudiants | ✅ |
| 2 | `attendances` | Présences | ✅ |
| 3 | `payments` | Paiements | ✅ |
| 4 | `notifications` | Notifications | ✅ |
| 5 | `audit_logs` | Logs d'audit | ✅ |
| 6 | `class_subjects` | Relations classes-matières | ✅ |
| 7 | `teacher_subjects` | Relations enseignants-matières | ✅ |
| 8 | `parent_student_schools` | Relations parents-étudiants | ✅ |
| 9 | `students` | Profils étudiants | ✅ |
| 10 | `teachers` | Profils enseignants | ✅ |
| 11 | `parents` | Profils parents | ✅ |
| 12 | `secretaries` | Profils secrétaires | ✅ |
| 13 | `users` | Comptes utilisateurs liés | ✅ |
| 14 | `subjects` | Matières | ✅ |
| 15 | `classes` | Classes | ✅ |
| 16 | `evaluation_periods` | Périodes d'évaluation | ✅ |
| 17 | `academic_years` | Années académiques | ✅ |
| 18 | `grade_types` | Types de notes | ✅ |
| 19 | `attendance_types` | Types de présences | ✅ |
| 20 | `payment_types` | Types de paiements | ✅ |
| 21 | `user_roles` | Rôles utilisateurs | ✅ |
| 22 | `schools` | École | ✅ |

**TOTAL : 22 tables** affectées par la suppression d'un compte directeur

---

## 🚨 IMPLICATIONS

### Pour les Utilisateurs
- ❌ **TOUS les comptes** (étudiants, enseignants, parents, secrétaires) sont **supprimés**
- ❌ **Impossible de se reconnecter** après la suppression
- ❌ **Aucune récupération possible** des comptes

### Pour les Données
- ❌ **Perte TOTALE** de l'historique pédagogique
- ❌ **Perte TOTALE** des bulletins et notes
- ❌ **Perte TOTALE** de l'historique financier
- ❌ **Perte TOTALE** des statistiques et rapports

### Pour l'École
- ❌ **L'établissement disparaît complètement** du système
- ❌ **Impossible de recréer l'école** avec le même historique
- ❌ **Tous les documents et configurations** sont perdus

---

## ⚙️ Processus Technique

### Ordre d'Exécution

```javascript
1. Récupération de l'ID de l'école du directeur
2. Suppression des notes (grades)
3. Suppression des présences (attendances)
4. Suppression des paiements (payments)
5. Suppression des notifications
6. Suppression des logs d'audit (audit_logs)
7. Suppression des relations (class_subjects, teacher_subjects, parent_student_schools)
8. Récupération des IDs des utilisateurs liés (students, teachers, parents, secretaries)
9. Suppression des profils (students, teachers, parents, secretaries)
10. Suppression des comptes users liés (sauf le directeur)
11. Suppression de la configuration (subjects, classes, evaluation_periods, academic_years)
12. Suppression des types (grade_types, attendance_types, payment_types, user_roles)
13. Suppression de l'école (schools)
14. Suppression du compte directeur (users)
15. Déconnexion et suppression du compte Auth Supabase
16. Redirection vers la page d'accueil
```

### Logs de Progression

```
🗑️ Début de la suppression complète de l'école et de toutes ses données...
📋 École ID: {schoolId}
1/7 Suppression des notes...
2/7 Suppression des présences...
3/7 Suppression des paiements...
4/7 Suppression des notifications...
   Suppression des logs d'audit...
   Suppression des relations classes-matières...
   Suppression des relations enseignants-matières...
   Suppression des relations parents-étudiants...
5/7 Suppression des étudiants...
   Suppression des enseignants...
   Suppression des parents...
   Suppression des secrétaires...
   Suppression de {N} comptes utilisateurs liés...
6/7 Suppression des matières...
   Suppression des classes...
   Suppression des périodes d'évaluation...
   Suppression des années académiques...
   Suppression des types de notes...
   Suppression des types de présences...
   Suppression des types de paiements...
   Suppression des rôles utilisateurs...
7/7 Suppression de l'école...
✅ Toutes les données de l'école ont été supprimées avec succès !
✅ Votre compte a été supprimé avec succès. Toutes vos données ont été effacées.
```

---

## 🔒 Sécurité

### Mesures de Protection

1. **Confirmation obligatoire**
   - Saisie exacte de "SUPPRIMER MON COMPTE"
   - Sensible à la casse

2. **Vérification du rôle**
   - Seuls les directeurs peuvent supprimer une école complète
   - Les autres rôles ne suppriment que leurs données personnelles

3. **Transaction atomique**
   - Suppressions dans le bon ordre pour éviter les erreurs de clés étrangères
   - Logs détaillés pour chaque étape

4. **Déconnexion forcée**
   - Impossible d'utiliser l'application après suppression
   - Redirection immédiate vers la page d'accueil

---

## 📝 Recommandations

### Avant de Supprimer

1. **⚠️ EXPORTER TOUTES LES DONNÉES**
   - Bulletins de notes
   - Listes d'étudiants
   - Historique financier
   - Documents importants

2. **📧 INFORMER TOUS LES UTILISATEURS**
   - Enseignants
   - Parents
   - Secrétaires
   - Étudiants (si applicable)

3. **💾 SAUVEGARDER LES CONFIGURATIONS**
   - Grilles de notes
   - Emplois du temps
   - Paramètres de l'école

4. **🔍 VÉRIFIER LES ALTERNATIVES**
   - Désactivation temporaire ?
   - Changement de directeur ?
   - Archive de l'école ?

---

## ❓ Questions Fréquentes

### Q: Puis-je récupérer mes données après suppression ?
**R:** ❌ **NON**. La suppression est **définitive et irréversible**.

### Q: Les autres utilisateurs peuvent-ils récupérer leurs données ?
**R:** ❌ **NON**. Tous les comptes liés à l'école sont supprimés.

### Q: Combien de temps prend la suppression ?
**R:** ⏱️ Entre **5 et 30 secondes** selon la quantité de données.

### Q: Puis-je annuler pendant la suppression ?
**R:** ❌ **NON**. Une fois lancée, la suppression est irréversible.

### Q: Que se passe-t-il si une erreur survient ?
**R:** ⚠️ Les suppressions déjà effectuées **ne sont PAS annulées**. Contactez le support immédiatement.

### Q: Les logs de suppression sont-ils conservés ?
**R:** ❌ **NON**. Les logs d'audit de l'école sont également supprimés.

---

## 📞 Support

En cas de suppression accidentelle ou d'erreur :
- ⚠️ **Il est trop tard** si la suppression est terminée
- 📧 Contactez le support technique immédiatement
- 🔍 Vérifiez vos sauvegardes personnelles

---

**Dernière mise à jour :** 26 Octobre 2025  
**Version :** 2.0.0 (Complète)  
**Nombre de tables affectées :** 22

**⚠️ CETTE ACTION EST DÉFINITIVE, IRRÉVERSIBLE ET SUPPRIME TOUT ⚠️**
