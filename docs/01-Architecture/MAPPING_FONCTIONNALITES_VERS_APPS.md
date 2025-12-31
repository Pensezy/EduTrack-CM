# 🗺️ MAPPING FONCTIONNALITÉS ACTUELLES → APPS MODULAIRES
## Analyse Complète EduTrack CM v1.2.7

**Date:** 31 décembre 2025
**Version analysée:** 1.2.7
**Objectif:** Diviser le monolithe actuel en 7 applications modulaires indépendantes

---

## 📋 TABLE DES MATIÈRES

1. [Inventaire Complet des Fonctionnalités](#inventaire-complet)
2. [Mapping vers Apps Modulaires](#mapping-vers-apps)
3. [Module CORE (Gratuit)](#module-core)
4. [App 1: Gestion Académique](#app-1-gestion-académique)
5. [App 2: Gestion Financière](#app-2-gestion-financière)
6. [App 3: Discipline & Absences](#app-3-discipline--absences)
7. [App 4: Emplois du Temps](#app-4-emplois-du-temps)
8. [App 5: Communication](#app-5-communication)
9. [App 6: Reporting Avancé](#app-6-reporting-avancé)
10. [App 7: Ressources Humaines](#app-7-ressources-humaines)
11. [Fonctionnalités Manquantes](#fonctionnalités-manquantes)
12. [Plan de Migration Technique](#plan-de-migration)

---

## 📊 INVENTAIRE COMPLET DES FONCTIONNALITÉS

### Vue d'ensemble par nombre

| Catégorie | Count |
|-----------|-------|
| **Rôles/Dashboards** | 6 (Élève, Parent, Enseignant, Secrétaire, Directeur, Admin) |
| **Pages fonctionnelles** | 22 routes principales |
| **Services** | 30 fichiers services |
| **Tables Supabase** | ~35 tables |
| **Composants UI** | ~80 composants |
| **Hooks personnalisés** | 8 hooks |

### Fonctionnalités par domaine

```
📚 ACADÉMIQUE (40% du code)
├─ Gestion notes (saisie, bulletins, moyennes)
├─ Devoirs et évaluations
├─ Comportement et conduite
├─ Emplois du temps (basique)
└─ Documents pédagogiques

💼 ADMINISTRATIF (35% du code)
├─ Gestion élèves (inscription, profils)
├─ Gestion enseignants (comptes, assignations)
├─ Paiements et frais
├─ Absences et justifications
├─ Cartes scolaires
├─ Certificats et documents
└─ Transferts inter-écoles

📧 COMMUNICATION (15% du code)
├─ Notifications (centre de notifications)
├─ SMS (rappels paiements, absences)
├─ Emails (communications)
├─ Messages internes (enseignants ↔ élèves/parents)
└─ Annonces

📊 ANALYTICS (10% du code)
├─ Statistiques dashboard
├─ Graphiques (moyennes, présences, paiements)
├─ Rapports de base
└─ Exports PDF/Excel
```

---

## 🎯 MAPPING VERS APPS MODULAIRES

### Principe de Division

Chaque **app modulaire** regroupe:
1. ✅ **Routes spécifiques** (ex: `/notes`, `/payments`)
2. ✅ **Services dédiés** (ex: `gradeService.js`, `paymentService.js`)
3. ✅ **Tables Supabase** (ex: `grades`, `payments`)
4. ✅ **Composants UI** (ex: `GradeEntryPanel`, `PaymentTab`)
5. ✅ **Hooks** (ex: `useGrades`, `usePayments`)

### Matrice de Répartition

| Fonctionnalité Actuelle | App Cible | Priorité | Effort Migration |
|-------------------------|-----------|----------|------------------|
| Profil élève | CORE | P0 | Faible |
| Dashboard de base | CORE | P0 | Faible |
| Saisie notes | APP 1 (Académique) | P1 | Moyen |
| Bulletins PDF | APP 1 (Académique) | P1 | Moyen |
| Moyennes & classements | APP 1 (Académique) | P1 | Faible |
| Devoirs (assignments) | APP 1 (Académique) | P1 | Moyen |
| Comportement (conduct) | APP 1 (Académique) | P2 | Faible |
| Documents pédagogiques | APP 1 (Académique) | P2 | Moyen |
| Paiements | APP 2 (Financière) | P1 | Élevé |
| Reçus PDF | APP 2 (Financière) | P1 | Moyen |
| Relances paiements | APP 2 (Financière) | P2 | Moyen |
| Statistiques financières | APP 2 (Financière) | P2 | Faible |
| Absences | APP 3 (Discipline) | P1 | Moyen |
| Justifications | APP 3 (Discipline) | P1 | Moyen |
| Retards | APP 3 (Discipline) | P2 | Faible |
| Sanctions | APP 3 (Discipline) | P2 | Faible |
| Emplois du temps | APP 4 (Planning) | P2 | Élevé |
| Gestion salles | APP 4 (Planning) | P3 | Nouveau |
| Emplois du temps profs | APP 4 (Planning) | P2 | Moyen |
| SMS | APP 5 (Communication) | P1 | Moyen |
| Emails | APP 5 (Communication) | P2 | Moyen |
| Notifications push | APP 5 (Communication) | P1 | Faible |
| Messagerie interne | APP 5 (Communication) | P2 | Nouveau |
| Annonces | APP 5 (Communication) | P2 | Faible |
| Graphiques stats | APP 6 (Reporting) | P2 | Moyen |
| Exports ministère | APP 6 (Reporting) | P3 | Nouveau |
| Analytics avancées | APP 6 (Reporting) | P3 | Nouveau |
| Prédictions IA | APP 6 (Reporting) | P3 | Nouveau |
| Gestion enseignants (RH) | APP 7 (RH) | P2 | Moyen |
| Contrats | APP 7 (RH) | P3 | Nouveau |
| Salaires | APP 7 (RH) | P3 | Nouveau |
| Évaluations profs | APP 7 (RH) | P3 | Nouveau |

**Légende Priorité:**
- P0: Critique (Core obligatoire)
- P1: Élevée (Premiers modules payants)
- P2: Moyenne (Modules secondaires)
- P3: Basse (Features avancées)

**Légende Effort:**
- Faible: < 1 semaine
- Moyen: 1-2 semaines
- Élevé: 2-4 semaines
- Nouveau: Pas encore implémenté

---

## 🆓 MODULE CORE (Gratuit - Toujours Actif)

### Description
Base gratuite avec fonctionnalités essentielles, limitée à 50 élèves et 1 classe.

### Fonctionnalités Incluses

#### 1. Authentication & Autorisation
**Existant:**
- ✅ Connexion PIN (élèves/parents)
- ✅ Connexion email/password (personnel)
- ✅ Gestion de session (AuthContext)
- ✅ Multi-rôles (6 rôles)
- ✅ Staff Login séparé

**Routes:**
- `/login-authentication`
- `/staff-login`
- `/auth/callback`
- `/password-recovery`

**Services:**
- `authService.js`
- `passwordService.js`
- `passwordHashService.js`

**Tables:**
- `users`
- `audit_logs` (connexions)

---

#### 2. Dashboard de Base
**Existant:**
- ✅ Vue d'ensemble par rôle
- ✅ Statistiques simples (4 cartes métriques)
- ✅ Navigation par onglets

**Composants:**
- `Dashboard.jsx` (par rôle)
- `MetricCard.jsx`
- `QuickActions.jsx`

**Inclus dans Core:**
- Dashboard élève (profil, stats de base)
- Dashboard parent (vue enfants)
- Dashboard enseignant (classes assignées)
- Dashboard secrétaire (tâches du jour)
- Dashboard directeur (métriques école)

---

#### 3. Gestion Profils
**Existant:**
- ✅ Profil élève (lecture seule)
- ✅ Profil parent
- ✅ Profil enseignant
- ✅ Profil école (directeur)

**Composants:**
- `ProfileCard.jsx` (élève)
- `ParentInfoCard.jsx`
- `TeacherSchedule.jsx` (basique)

**Routes:**
- `/profile-settings`

**Tables:**
- `students` (limité 50)
- `parents`
- `teachers`
- `schools`

---

#### 4. Gestion Utilisateurs (Basique)
**Existant:**
- ✅ Création comptes (directeur/secrétaire)
- ✅ Assignation rôles
- ✅ Activation/désactivation

**Routes:**
- `/principal-dashboard` (onglet Accounts)
- `/secretary-dashboard` (onglet Students/Teachers)

**Services:**
- `userService` (edutrackService.js)

**Tables:**
- `users`
- `teachers`
- `secretaries`

---

#### 5. Gestion École
**Existant:**
- ✅ Informations établissement
- ✅ Gestion classes (CRUD)
- ✅ Suggestions classes selon type école

**Composants:**
- `SchoolInfoPanel.jsx`
- `ClassManagement.jsx`

**Tables:**
- `schools`
  - Colonnes: id, name, type, address, city, country, phone, code, status, available_classes, director_user_id
- `classes`
  - Colonnes: id, school_id, academic_year_id, name, level, section
- `academic_years`
  - Colonnes: id, school_id, name, start_date, end_date, is_current

---

#### 6. Gestion Élèves (Limité)
**Existant:**
- ✅ Inscription élèves
- ✅ Profil élève (lecture/écriture)
- ✅ Recherche élève

**Limitations Core:**
- ❌ Maximum 50 élèves
- ❌ Maximum 1 classe
- ❌ Pas d'import Excel massif
- ❌ Pas de transferts inter-écoles

**Composants:**
- `StudentManagementTab.jsx` (secrétaire)
- `StudentCard.jsx`

**Services:**
- `studentService.js` (limité)

**Tables:**
- `students` (WHERE count <= 50)

---

#### 7. Notes Simples (Sans Bulletins Auto)
**Existant:**
- ✅ Saisie notes manuelle
- ✅ Visualisation notes élève
- ✅ Moyennes basiques

**Limitations Core:**
- ✅ Saisie notes OK
- ❌ PAS de bulletins PDF automatiques
- ❌ PAS de classements
- ❌ PAS de statistiques avancées
- ❌ PAS d'exports

**Composants:**
- `GradesPanel.jsx` (lecture seule élève)
- Version simplifiée de `GradeEntryPanel.jsx` (enseignant)

**Services:**
- `gradeService` (basique seulement)

**Tables:**
- `grades`
- `grades_normalized` (vue)

---

#### 8. Interface Utilisateur
**Existant:**
- ✅ Header responsive
- ✅ Sidebar collapsible
- ✅ Navigation par onglets
- ✅ Design moderne (Tailwind CSS)
- ✅ Mode mobile

**Composants:**
- `Header.jsx`
- `Sidebar.jsx`
- `MobileSidebar.jsx`
- Tous les composants UI de base (`Button`, `Input`, `Select`, etc.)

---

#### 9. Notifications (Basique)
**Existant:**
- ✅ Centre de notifications
- ✅ Notifications système
- ✅ Badge non lus

**Limitations Core:**
- ✅ Notifications internes OK
- ❌ PAS d'envoi SMS
- ❌ PAS d'envoi emails
- ❌ PAS de notifications push

**Composants:**
- `NotificationCenter.jsx`
- `NotificationsPanel.jsx`

**Tables:**
- `notifications` (lecture seule)

---

### Résumé Core

| Aspect | Détails |
|--------|---------|
| **Prix** | 0 FCFA à vie |
| **Élèves max** | 50 |
| **Classes max** | 1 |
| **Enseignants max** | 5 |
| **Utilisateurs max** | 3 (directeur + 2 enseignants) |
| **Routes** | 10 routes essentielles |
| **Services** | 5 services basiques |
| **Tables** | 8 tables principales |
| **Features** | Auth, Dashboard, Profils, Notes simples, Gestion de base |
| **Limitations** | Pas de bulletins auto, pas de SMS, pas d'analytics |

### Fichiers Core

```
src/
├── pages/
│   ├── LoginAuthentication.jsx ✅
│   ├── StaffLogin.jsx ✅
│   ├── PasswordRecovery.jsx ✅
│   ├── ProfileSettings.jsx ✅
│   └── dashboards/
│       ├── StudentDashboard/ ✅ (version limitée)
│       ├── ParentDashboard/ ✅ (version limitée)
│       ├── TeacherDashboard/ ✅ (version limitée)
│       ├── SecretaryDashboard/ ✅ (version limitée)
│       └── PrincipalDashboard/ ✅ (version limitée)
├── services/
│   ├── authService.js ✅
│   ├── userService.js ✅
│   ├── schoolService.js ✅
│   ├── studentService.js ✅ (basique)
│   └── gradeService.js ✅ (basique)
├── components/
│   ├── ui/ ✅ (tous)
│   ├── Header.jsx ✅
│   ├── Sidebar.jsx ✅
│   └── NotificationCenter.jsx ✅
├── hooks/
│   ├── useAuth.js ✅
│   ├── useDataMode.js ✅
│   └── useRoleSession.js ✅
└── contexts/
    └── AuthContext.jsx ✅
```

---

## 📚 APP 1: GESTION ACADÉMIQUE

**Prix:** 15 000 FCFA/an
**Catégorie:** Pédagogie

### Fonctionnalités à Migrer

#### 1. Saisie Notes Complète ✅ (EXISTANT)
**Actuellement dans:**
- `TeacherDashboard/tabs/grades/GradeEntryPanel.jsx`

**Fonctionnalités:**
- ✅ Saisie notes par élève
- ✅ Saisie notes par évaluation
- ✅ Types: devoir, contrôle, examen, oral
- ✅ Note sur 20 avec coefficient
- ✅ Commentaire par note
- ✅ Enregistrement Supabase

**Service:**
- `gradeService.js` (fonction `createGrade()`)

**Tables:**
- `grades` (id, student_id, subject_id, grade, description, evaluation_type, coefficient, created_at)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── GradeEntryPanel.jsx ✅
│   ├── GradeForm.jsx
│   └── GradeTypeSelector.jsx
└── services/
    └── gradeService.js ✅
```

---

#### 2. Bulletins Automatiques ✅ (EXISTANT)
**Actuellement dans:**
- `TeacherDashboard/components/ReportCard.jsx`

**Fonctionnalités:**
- ✅ Génération automatique PDF
- ✅ Template personnalisable
- ✅ Logo école
- ✅ Moyennes par matière
- ✅ Moyenne générale
- ✅ Classement
- ✅ Appréciations
- ✅ Signature directeur

**Service:**
- `pdfGenerator.js` (fonction `generateReportCard()`)

**Dépendances:**
- jsPDF
- DOMPurify (sécurité XSS)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── ReportCard.jsx ✅
│   ├── BulletinGenerator.jsx
│   └── BulletinTemplate.jsx
└── services/
    └── pdfGenerator.js ✅
```

**Tables:**
- `grades`
- `students`
- `classes`
- `subjects`

---

#### 3. Moyennes & Classements ✅ (EXISTANT)
**Actuellement dans:**
- `TeacherDashboard/tabs/grades/GradesSummaryPanel.jsx`

**Fonctionnalités:**
- ✅ Calcul moyennes automatique
- ✅ Classement par classe
- ✅ Top 10 élèves
- ✅ Mention (TB, B, AB, Passable)
- ✅ Évolution trimestre/trimestre

**Service:**
- `gradeService.js` (fonctions `calculateAverages()`, `getRankings()`)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── GradesSummaryPanel.jsx ✅
│   ├── RankingTable.jsx
│   └── AverageEvolutionChart.jsx
└── hooks/
    └── useGradeStats.js
```

---

#### 4. Devoirs (Assignments) ✅ (EXISTANT)
**Actuellement dans:**
- `StudentDashboard/tabs/Assignments.jsx`
- `TeacherDashboard/` (création devoirs implicite)

**Fonctionnalités:**
- ✅ Création devoir (enseignant)
- ✅ Assignation à classe/élèves
- ✅ Date limite
- ✅ Ressources attachées
- ✅ Soumission élève (upload fichier)
- ✅ Statut (en attente/terminé)

**Service:**
- `assignmentService.js` (à créer, actuellement dans edutrackService)

**Tables:**
- `assignments` (id, class_id, subject_id, title, description, due_date, assignment_type)
- `assignment_submissions` (id, assignment_id, student_id, file_url, submitted_at, status)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── AssignmentList.jsx ✅
│   ├── AssignmentCreator.jsx (nouveau)
│   ├── AssignmentSubmission.jsx ✅
│   └── UpcomingAssignments.jsx ✅
└── services/
    └── assignmentService.js (nouveau)
```

---

#### 5. Documents Pédagogiques ✅ (EXISTANT)
**Actuellement dans:**
- `StudentDashboard/tabs/Documents.jsx`
- `TeacherDashboard/tabs/DocumentManager.jsx`

**Fonctionnalités:**
- ✅ Upload documents (PDF, DOCX)
- ✅ Organisation par matière
- ✅ Visibilité (élèves/parents)
- ✅ Téléchargement
- ✅ Historique

**Service:**
- `documentService.js` ✅

**Tables:**
- `documents` (id, title, document_type, file_name, file_path, uploaded_by, class_name, visibility, created_at)

**Stockage:**
- Supabase Storage (bucket: `documents`)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── DocumentManager.jsx ✅
│   ├── DocumentUploader.jsx
│   ├── DocumentList.jsx
│   └── DocumentViewer.jsx
└── services/
    └── documentService.js ✅
```

---

#### 6. Comportement & Conduite ✅ (EXISTANT - PARTIEL)
**Actuellement dans:**
- `StudentDashboard/tabs/Profile.jsx` (BehaviorAssessment)
- `TeacherDashboard/tabs/grades/ConductPanel.jsx`

**Fonctionnalités:**
- ✅ Évaluation comportementale (4 catégories)
- ✅ Score global
- ✅ Commentaires
- ✅ Félicitations/Avertissements
- ⚠️ Notes de conduite (partiel)

**Service:**
- `conductService.js` (à créer/compléter)

**Tables:**
- `behavior_assessments` (id, student_id, participation, discipline, respect, homework, comment, created_at)
- `conduct_notes` (id, student_id, teacher_id, note_type, comment, date)

**Composants à migrer:**
```
modules/academic/
├── components/
│   ├── BehaviorAssessment.jsx ✅
│   ├── ConductPanel.jsx ✅
│   └── ConductHistory.jsx (nouveau)
└── services/
    └── conductService.js (nouveau)
```

---

#### 7. Statistiques Académiques ⚠️ (PARTIEL)
**Actuellement dans:**
- `PrincipalDashboard/components/ClassAverageChart.jsx`

**Fonctionnalités existantes:**
- ✅ Moyennes par classe (graph)
- ⚠️ Taux de réussite (basique)
- ❌ Matières en difficulté (manquant)
- ❌ Top élèves global (manquant)
- ❌ Évolution temporelle (manquant)

**Composants à créer/migrer:**
```
modules/academic/
├── components/
│   ├── ClassAverageChart.jsx ✅
│   ├── SubjectPerformanceAnalysis.jsx (nouveau)
│   ├── TopStudentsWidget.jsx (nouveau)
│   └── AcademicTrendsChart.jsx (nouveau)
└── hooks/
    └── useAcademicStats.js (nouveau)
```

---

#### 8. Exports Académiques ✅ (EXISTANT - PARTIEL)
**Actuellement dans:**
- Plusieurs dashboards (boutons export)

**Fonctionnalités:**
- ✅ Export PDF bulletins
- ⚠️ Export Excel notes (basique)
- ❌ Export relevés de notes (manquant)
- ❌ Format ministère MINESEC (manquant)

**Service:**
- `pdfGenerator.js` ✅
- `excelExporter.js` (à créer)

**Composants à créer:**
```
modules/academic/
└── services/
    ├── pdfGenerator.js ✅
    └── excelExporter.js (nouveau)
```

---

### Résumé App Académique

| Aspect | Existant | À Créer | À Migrer |
|--------|----------|---------|----------|
| **Saisie notes** | ✅ 100% | - | GradeEntryPanel |
| **Bulletins** | ✅ 100% | - | ReportCard |
| **Moyennes** | ✅ 100% | - | GradesSummaryPanel |
| **Devoirs** | ✅ 80% | Création enseignant | Assignments |
| **Documents** | ✅ 100% | - | DocumentManager |
| **Comportement** | ⚠️ 60% | Conduite complète | BehaviorAssessment |
| **Stats** | ⚠️ 40% | Matières difficulté | ClassAverageChart |
| **Exports** | ⚠️ 50% | Excel, Ministère | pdfGenerator |

### Fichiers à Migrer vers `/modules/academic/`

```
modules/academic/
├── routes.jsx (nouveau)
├── components/
│   ├── GradeEntryPanel.jsx ✅
│   ├── GradesSummaryPanel.jsx ✅
│   ├── ReportCard.jsx ✅
│   ├── ConductPanel.jsx ✅
│   ├── DocumentManager.jsx ✅
│   ├── AssignmentList.jsx ✅
│   ├── BehaviorAssessment.jsx ✅
│   ├── ClassAverageChart.jsx ✅
│   ├── AssignmentCreator.jsx (nouveau)
│   ├── ConductHistory.jsx (nouveau)
│   ├── SubjectPerformanceAnalysis.jsx (nouveau)
│   └── excelExporter.js (nouveau)
├── services/
│   ├── gradeService.js ✅
│   ├── documentService.js ✅
│   ├── pdfGenerator.js ✅
│   ├── assignmentService.js (nouveau)
│   ├── conductService.js (nouveau)
│   └── academicStatsService.js (nouveau)
├── hooks/
│   ├── useGrades.js (nouveau)
│   ├── useAssignments.js (nouveau)
│   └── useAcademicStats.js (nouveau)
└── pages/
    ├── NotesPage.jsx (nouveau)
    ├── BulletinsPage.jsx (nouveau)
    ├── AssignmentsPage.jsx (nouveau)
    └── StatisticsPage.jsx (nouveau)
```

### Tables App Académique

```sql
-- Tables existantes
✅ grades
✅ assignments
✅ assignment_submissions
✅ documents
✅ behavior_assessments
✅ conduct_notes
✅ student_achievements

-- Vues
✅ grades_normalized
```

### Routes App Académique

```javascript
/notes                    // Saisie notes
/notes/entry              // Formulaire saisie
/notes/summary            // Synthèse
/bulletins                // Génération bulletins
/bulletins/:studentId     // Bulletin individuel
/assignments              // Devoirs
/assignments/create       // Créer devoir
/documents                // Documents pédagogiques
/conduct                  // Comportement
/statistics/academic      // Stats académiques
```

---

## 💰 APP 2: GESTION FINANCIÈRE

**Prix:** 20 000 FCFA/an
**Catégorie:** Administration

### Fonctionnalités à Migrer

#### 1. Gestion Paiements ✅ (EXISTANT - COMPLET)
**Actuellement dans:**
- `SecretaryDashboard/tabs/PaymentTab.jsx`
- `ParentDashboard/tabs/Payments.jsx` (lecture seule)

**Fonctionnalités:**
- ✅ Recherche élève (nom/matricule)
- ✅ Types de frais (12 types):
  - Scolarité mensuelle
  - Inscription annuelle
  - Uniforme
  - Manuels scolaires
  - Transport
  - Cantine
  - Sorties scolaires
  - Examens
  - Activités extrascolaires
  - Assurance
  - Frais divers
  - Autre
- ✅ Enregistrement paiement
- ✅ Paiements partiels (montant payé < montant total)
- ✅ Méthodes paiement (espèces, mobile money, virement, chèque)
- ✅ Statut auto (completed/pending/overdue/partial)
- ✅ Historique paiements par élève

**Service:**
- `paymentService.js` ✅ (complet)
  - getAllPayments()
  - searchStudents()
  - getFeeTypes()
  - recordPayment()
  - markAsPaid()
  - getPaymentStats()

**Tables:**
- `payments` (id, student_id, fee_type, amount, amount_paid, status, payment_method, payment_date, created_at, updated_at)

**Composants à migrer:**
```
modules/financial/
├── components/
│   ├── PaymentTab.jsx ✅
│   ├── PaymentRegistrationModal.jsx ✅
│   ├── PaymentHistoryTable.jsx
│   └── PaymentStatusBadge.jsx
└── services/
    └── paymentService.js ✅
```

---

#### 2. Reçus Automatiques ✅ (EXISTANT - COMPLET)
**Actuellement dans:**
- `SecretaryDashboard/modals/ReceiptModal.jsx`

**Fonctionnalités:**
- ✅ Génération automatique PDF
- ✅ Numérotation unique (RCPT-YYYY-XXXXX)
- ✅ Données école (nom, adresse, téléphone)
- ✅ Données élève (nom, classe, matricule)
- ✅ Détails paiement (montant, méthode, date)
- ✅ Signature secrétaire
- ✅ Sécurité XSS (DOMPurify)

**Service:**
- `paymentService.js` (fonction `generateReceipt()`)

**Dépendances:**
- jsPDF
- DOMPurify

**Composants à migrer:**
```
modules/financial/
├── components/
│   ├── ReceiptModal.jsx ✅
│   ├── ReceiptGenerator.jsx
│   └── ReceiptTemplate.jsx
└── services/
    └── receiptService.js (extraire de paymentService)
```

---

#### 3. Relances Paiements ✅ (EXISTANT - COMPLET)
**Actuellement dans:**
- `SecretaryDashboard/tabs/PaymentTab.jsx`

**Fonctionnalités:**
- ✅ Envoi SMS rappel (individuel)
- ✅ Envoi email rappel (individuel)
- ✅ Envoi en lot (multiple élèves)
- ✅ Historique notifications
- ✅ Templates prédéfinis
- ✅ Personnalisation message

**Service:**
- `paymentService.js` ✅
  - sendPaymentReminder(studentId, type) // type: sms/email
  - bulkSendReminders(studentIds, type)

**Intégrations:**
- SMS API (à configurer)
- Email API (EmailJS ou SMTP)

**Composants à migrer:**
```
modules/financial/
├── components/
│   ├── PaymentReminderModal.jsx
│   ├── BulkReminderSelector.jsx
│   └── ReminderHistory.jsx
└── services/
    └── reminderService.js (extraire de paymentService)
```

---

#### 4. Statistiques Financières ✅ (EXISTANT - PARTIEL)
**Actuellement dans:**
- `PrincipalDashboard/components/PaymentStatusChart.jsx`
- `SecretaryDashboard/tabs/PaymentTab.jsx` (stats basiques)

**Fonctionnalités existantes:**
- ✅ Total attendu
- ✅ Total collecté
- ✅ Retards de paiement
- ✅ Graph statuts paiements (pie chart)
- ⚠️ Taux de recouvrement (basique)
- ❌ Revenus par mois (manquant)
- ❌ Prévisions trésorerie (manquant)
- ❌ Comparaison année N vs N-1 (manquant)

**Service:**
- `paymentService.js` (fonction `getPaymentStats()`)

**Composants à créer/migrer:**
```
modules/financial/
├── components/
│   ├── PaymentStatusChart.jsx ✅
│   ├── RevenueByMonthChart.jsx (nouveau)
│   ├── CollectionRateWidget.jsx (nouveau)
│   ├── TreasuryForecast.jsx (nouveau)
│   └── YearOverYearComparison.jsx (nouveau)
└── hooks/
    └── useFinancialStats.js (nouveau)
```

---

#### 5. Exports Comptables ⚠️ (PARTIEL)
**Actuellement dans:**
- Quelques boutons export basiques

**Fonctionnalités:**
- ⚠️ Export Excel paiements (basique)
- ❌ Journal des encaissements (manquant)
- ❌ État des créances (manquant)
- ❌ Rapports DAF (manquant)

**Service:**
- `excelExporter.js` (à créer)

**Composants à créer:**
```
modules/financial/
├── components/
│   ├── ExportModal.jsx (nouveau)
│   └── AccountingReports.jsx (nouveau)
└── services/
    └── financialExporter.js (nouveau)
```

---

#### 6. Factures ⚠️ (BASIQUE)
**Actuellement dans:**
- `paymentService.js` (fonction `createInvoice()`)

**Fonctionnalités:**
- ⚠️ Création facture basique
- ❌ Numérotation séquentielle (manquant)
- ❌ Templates personnalisables (manquant)
- ❌ Échéanciers (manquant)
- ❌ Relances auto factures impayées (manquant)

**Composants à créer:**
```
modules/financial/
├── components/
│   ├── InvoiceGenerator.jsx (nouveau)
│   ├── InvoiceTemplate.jsx (nouveau)
│   └── PaymentScheduleManager.jsx (nouveau)
└── services/
    └── invoiceService.js (nouveau)
```

---

### Résumé App Financière

| Aspect | Existant | À Créer | À Migrer |
|--------|----------|---------|----------|
| **Paiements** | ✅ 100% | - | PaymentTab |
| **Reçus** | ✅ 100% | - | ReceiptModal |
| **Relances** | ✅ 100% | - | BulkReminders |
| **Stats** | ⚠️ 50% | Revenus/Prévisions | PaymentStatusChart |
| **Exports** | ⚠️ 30% | Compta complète | - |
| **Factures** | ⚠️ 30% | Templates, échéanciers | - |

### Fichiers à Migrer vers `/modules/financial/`

```
modules/financial/
├── routes.jsx (nouveau)
├── components/
│   ├── PaymentTab.jsx ✅
│   ├── PaymentRegistrationModal.jsx ✅
│   ├── ReceiptModal.jsx ✅
│   ├── PaymentStatusChart.jsx ✅
│   ├── PaymentReminderModal.jsx (nouveau)
│   ├── BulkReminderSelector.jsx (nouveau)
│   ├── RevenueByMonthChart.jsx (nouveau)
│   ├── CollectionRateWidget.jsx (nouveau)
│   ├── InvoiceGenerator.jsx (nouveau)
│   ├── ExportModal.jsx (nouveau)
│   └── AccountingReports.jsx (nouveau)
├── services/
│   ├── paymentService.js ✅
│   ├── receiptService.js (extraire)
│   ├── reminderService.js (extraire)
│   ├── invoiceService.js (nouveau)
│   └── financialExporter.js (nouveau)
├── hooks/
│   ├── usePayments.js (nouveau)
│   └── useFinancialStats.js (nouveau)
└── pages/
    ├── PaymentsPage.jsx (nouveau)
    ├── ReceiptsPage.jsx (nouveau)
    ├── FinancialStatsPage.jsx (nouveau)
    └── AccountingExportsPage.jsx (nouveau)
```

### Tables App Financière

```sql
-- Tables existantes
✅ payments

-- Tables à créer
❌ invoices (nouveau)
❌ payment_schedules (nouveau)
❌ fee_types (config - peut être JSON dans schools)
```

### Routes App Financière

```javascript
/payments                 // Gestion paiements
/payments/register        // Enregistrer paiement
/payments/:studentId      // Historique élève
/receipts                 // Reçus
/receipts/:receiptId      // Reçu individuel
/payment-reminders        // Relances
/invoices                 // Factures
/invoices/create          // Créer facture
/financial-stats          // Statistiques
/accounting-exports       // Exports comptables
```

---

## ⏰ APP 3: DISCIPLINE & ABSENCES

**Prix:** 10 000 FCFA/an
**Catégorie:** Administration

### Fonctionnalités à Migrer

#### 1. Gestion Absences ✅ (EXISTANT - COMPLET)
**Actuellement dans:**
- `SecretaryDashboard/tabs/JustificationTab.jsx`
- `TeacherDashboard/tabs/AttendanceManager.jsx`
- `StudentDashboard/tabs/Attendance.jsx` (lecture seule)

**Fonctionnalités:**
- ✅ Enregistrement absence (secrétaire/enseignant)
- ✅ Date et période (matin/après-midi/journée)
- ✅ Type (absence/retard)
- ✅ Motif
- ✅ Statut (en attente/justifié/injustifié)
- ✅ Document joint (scan justificatif)

**Service:**
- `absenceService.js` ✅
  - createAbsence(studentId, date, type, reason)
  - getAllAbsences(schoolId)
  - searchStudents()
  - justifyAbsence(absenceId, justification)

**Tables:**
- `absences` OU `attendances` (id, student_id, date, status, period, reason, justification_status, justification_document, created_at)

**Composants à migrer:**
```
modules/discipline/
├── components/
│   ├── JustificationTab.jsx ✅
│   ├── AttendanceManager.jsx ✅
│   ├── AttendanceCalendar.jsx ✅ (élève)
│   ├── AbsenceForm.jsx
│   └── JustificationUploader.jsx
└── services/
    └── absenceService.js ✅
```

---

#### 2. Pointage Présences ✅ (EXISTANT)
**Actuellement dans:**
- `TeacherDashboard/tabs/AttendanceManager.jsx`

**Fonctionnalités:**
- ✅ Appel journalier (présent/absent/retard)
- ✅ Par classe
- ✅ Interface rapide (checkboxes)
- ✅ Sauvegarde en lot
- ✅ Historique présence

**Service:**
- Intégré dans `absenceService.js` (fonctions de pointage)

**Tables:**
- `attendances` (id, student_id, date, status: present/absent/late, period, teacher_id, created_at)

**Composants à migrer:**
```
modules/discipline/
├── components/
│   ├── AttendanceManager.jsx ✅
│   ├── DailyAttendanceSheet.jsx
│   └── AttendanceHistory.jsx
└── hooks/
    └── useAttendance.js (nouveau)
```

---

#### 3. Notifications Parents ✅ (EXISTANT - COMPLET)
**Actuellement dans:**
- `SecretaryDashboard/tabs/JustificationTab.jsx`

**Fonctionnalités:**
- ✅ Appel parent (enregistrement action)
- ✅ Envoi SMS rappel
- ✅ Envoi email rappel
- ✅ Envoi en lot (plusieurs parents)
- ✅ Historique notifications
- ✅ Statut délivrance

**Service:**
- `absenceService.js` ✅
  - callParent(absenceId, note)
  - sendSMSReminder(absenceId)
  - sendEmailReminder(absenceId)
  - bulkSendReminders(absenceIds, type)
  - getAllNotificationHistory(schoolId)

**Tables:**
- `communication_logs` (id, student_id, absence_id, type: call/sms/email, message, sent_at, delivered_at, status)

**Composants à migrer:**
```
modules/discipline/
├── components/
│   ├── ParentContactModal.jsx
│   ├── BulkSMSModal.jsx
│   └── NotificationHistory.jsx
└── services/
    └── parentNotificationService.js (extraire de absenceService)
```

---

#### 4. Retards ⚠️ (PARTIEL)
**Actuellement dans:**
- `attendances` table (status: late)

**Fonctionnalités existantes:**
- ✅ Enregistrement retard
- ⚠️ Heure d'arrivée (basique)
- ❌ Fréquence retards (manquant)
- ❌ Alertes parents récurrents (manquant)
- ❌ Statistiques retards (manquant)

**Composants à créer:**
```
modules/discipline/
├── components/
│   ├── TardinessTracker.jsx (nouveau)
│   ├── TardinessStats.jsx (nouveau)
│   └── RecurrentTardinessAlert.jsx (nouveau)
└── hooks/
    └── useTardiness.js (nouveau)
```

---

#### 5. Sanctions Disciplinaires ⚠️ (BASIQUE)
**Actuellement dans:**
- `conduct_notes` table (implicite)

**Fonctionnalités existantes:**
- ⚠️ Notes de conduite (basique)
- ❌ Types sanctions formels (manquant)
- ❌ Conseil de discipline (manquant)
- ❌ Historique sanctions (manquant)
- ❌ Workflow avertissement → exclusion (manquant)

**Tables à créer:**
```sql
❌ sanctions (nouveau)
   - id, student_id, sanction_type, reason, date, duration, issued_by, status
   - Types: avertissement, blâme, exclusion temporaire, exclusion définitive, conseil discipline
```

**Composants à créer:**
```
modules/discipline/
├── components/
│   ├── SanctionForm.jsx (nouveau)
│   ├── SanctionHistory.jsx (nouveau)
│   ├── DisciplineCouncilWorkflow.jsx (nouveau)
│   └── SanctionStatistics.jsx (nouveau)
└── services/
    └── sanctionService.js (nouveau)
```

---

#### 6. Rapports d'Assiduité ⚠️ (PARTIEL)
**Actuellement dans:**
- Quelques stats basiques dans dashboards

**Fonctionnalités existantes:**
- ✅ Taux de présence par élève (basique)
- ⚠️ Taux de présence par classe (basique)
- ❌ Absentéisme chronique (manquant)
- ❌ Export ministère (manquant)
- ❌ Graphiques évolution (manquant)

**Composants à créer:**
```
modules/discipline/
├── components/
│   ├── AttendanceReportGenerator.jsx (nouveau)
│   ├── AbsenteeismAnalysis.jsx (nouveau)
│   ├── AttendanceTrendsChart.jsx (nouveau)
│   └── MinistryAttendanceExport.jsx (nouveau)
└── services/
    └── attendanceReportService.js (nouveau)
```

---

### Résumé App Discipline

| Aspect | Existant | À Créer | À Migrer |
|--------|----------|---------|----------|
| **Absences** | ✅ 100% | - | JustificationTab |
| **Pointage** | ✅ 100% | - | AttendanceManager |
| **Notifications** | ✅ 100% | - | ParentContact |
| **Retards** | ⚠️ 40% | Stats, alertes | - |
| **Sanctions** | ⚠️ 20% | Système complet | - |
| **Rapports** | ⚠️ 30% | Assiduité complète | - |

### Fichiers à Migrer vers `/modules/discipline/`

```
modules/discipline/
├── routes.jsx (nouveau)
├── components/
│   ├── JustificationTab.jsx ✅
│   ├── AttendanceManager.jsx ✅
│   ├── AttendanceCalendar.jsx ✅
│   ├── ParentContactModal.jsx (nouveau)
│   ├── BulkSMSModal.jsx (nouveau)
│   ├── TardinessTracker.jsx (nouveau)
│   ├── SanctionForm.jsx (nouveau)
│   ├── SanctionHistory.jsx (nouveau)
│   ├── DisciplineCouncilWorkflow.jsx (nouveau)
│   ├── AttendanceReportGenerator.jsx (nouveau)
│   └── AbsenteeismAnalysis.jsx (nouveau)
├── services/
│   ├── absenceService.js ✅
│   ├── parentNotificationService.js (extraire)
│   ├── sanctionService.js (nouveau)
│   └── attendanceReportService.js (nouveau)
├── hooks/
│   ├── useAttendance.js (nouveau)
│   └── useTardiness.js (nouveau)
└── pages/
    ├── AttendancePage.jsx (nouveau)
    ├── TardinessPage.jsx (nouveau)
    ├── SanctionsPage.jsx (nouveau)
    └── AttendanceReportsPage.jsx (nouveau)
```

### Tables App Discipline

```sql
-- Tables existantes
✅ attendances (ou absences)
✅ communication_logs

-- Tables à créer
❌ sanctions (nouveau)
❌ tardiness_records (ou intégrer dans attendances)
```

### Routes App Discipline

```javascript
/attendance               // Pointage présences
/attendance/:classId      // Appel classe
/absences                 // Gestion absences
/absences/justify         // Justifier absence
/tardiness                // Gestion retards
/sanctions                // Sanctions disciplinaires
/sanctions/create         // Créer sanction
/attendance-reports       // Rapports assiduité
```

---

## 📅 APP 4: EMPLOIS DU TEMPS

**Prix:** 12 000 FCFA/an
**Catégorie:** Pédagogie

### Fonctionnalités Existantes (Basiques)

#### 1. Emploi du Temps Élève ✅ (EXISTANT - BASIQUE)
**Actuellement dans:**
- `StudentDashboard/tabs/Schedule.jsx`

**Fonctionnalités:**
- ✅ Affichage planning hebdomadaire (lun-sam)
- ✅ Par jour et par créneau horaire
- ✅ Matière, enseignant, salle
- ✅ Code couleur par matière
- ✅ Affichage responsive

**Tables:**
- `schedules` OU `timetables` (id, class_id, day, time_slot, subject_id, teacher_id, room, created_at)

**Composants à migrer:**
```
modules/schedule/
├── components/
│   ├── StudentSchedule.jsx ✅ (affichage seulement)
│   └── WeeklyScheduleView.jsx
└── hooks/
    └── useSchedule.js (nouveau)
```

---

#### 2. Emploi du Temps Enseignant ⚠️ (PARTIEL)
**Actuellement dans:**
- `TeacherDashboard/components/TeacherSchedule.jsx`

**Fonctionnalités:**
- ✅ Affichage planning enseignant
- ⚠️ Cours du jour (basique)
- ❌ Heures supplémentaires (manquant)
- ❌ Remplacements (manquant)

**Composants à migrer:**
```
modules/schedule/
├── components/
│   ├── TeacherSchedule.jsx ✅
│   ├── DailyTeacherSchedule.jsx (nouveau)
│   └── OvertimeTracker.jsx (nouveau)
└── hooks/
    └── useTeacherSchedule.js (nouveau)
```

---

### Fonctionnalités à Créer (Nouvelles)

#### 3. Générateur Automatique ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Algorithme optimisation contraintes
- ❌ Respect disponibilités profs
- ❌ Équilibrage charge horaire
- ❌ Génération en 10-15 minutes

**Algorithme:**
- Contraintes dures:
  - Pas de chevauchement prof
  - Pas de chevauchement salle
  - Pas de classe sans prof
  - Respect plages horaires école
- Contraintes souples:
  - Équilibrage jours (pas tout le lundi)
  - Préférences profs (matins vs après-midis)
  - Matières lourdes en début de semaine
  - Pauses raisonnables

**Composants à créer:**
```
modules/schedule/
├── components/
│   ├── ScheduleGenerator.jsx (nouveau)
│   ├── ConstraintsForm.jsx (nouveau)
│   ├── GenerationProgress.jsx (nouveau)
│   └── GeneratedSchedulePreview.jsx (nouveau)
├── services/
│   └── scheduleAlgorithm.js (nouveau - complexe!)
└── pages/
    └── GeneratorPage.jsx (nouveau)
```

---

#### 4. Gestion Salles ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Liste des salles (nom, capacité, type)
- ❌ Équipements (labo, vidéoproj, informatique)
- ❌ Disponibilité en temps réel
- ❌ Réservations ponctuelles
- ❌ Conflits salles

**Tables à créer:**
```sql
❌ rooms (nouveau)
   - id, school_id, name, capacity, room_type, equipment, floor, building
❌ room_reservations (nouveau)
   - id, room_id, date, time_slot, reserved_by, purpose, status
```

**Composants à créer:**
```
modules/schedule/
├── components/
│   ├── RoomManager.jsx (nouveau)
│   ├── RoomList.jsx (nouveau)
│   ├── RoomReservation.jsx (nouveau)
│   └── RoomConflictDetector.jsx (nouveau)
├── services/
│   └── roomService.js (nouveau)
└── pages/
    └── RoomsPage.jsx (nouveau)
```

---

#### 5. Détection Conflits ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Détection prof en double
- ❌ Détection salle occupée
- ❌ Détection classe surchargée (>8h/jour)
- ❌ Alertes temps réel lors de modifications
- ❌ Suggestions résolution

**Composants à créer:**
```
modules/schedule/
├── components/
│   ├── ConflictDetector.jsx (nouveau)
│   ├── ConflictList.jsx (nouveau)
│   └── ConflictResolver.jsx (nouveau)
└── services/
    └── conflictDetectionService.js (nouveau)
```

---

#### 6. Personnalisation ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Plages horaires configurables (ex: 7h30-13h vs 8h-15h)
- ❌ Pauses et récréations (durée, horaires)
- ❌ Jours spéciaux (mercredis courts, samedis)
- ❌ Templates par niveau (primaire vs secondaire)

**Tables à créer:**
```sql
❌ school_schedule_config (nouveau)
   - id, school_id, start_time, end_time, slot_duration, break_times, days_config
❌ schedule_templates (nouveau)
   - id, school_id, name, level, config
```

**Composants à créer:**
```
modules/schedule/
├── components/
│   ├── ScheduleConfigForm.jsx (nouveau)
│   ├── TimeSlotEditor.jsx (nouveau)
│   └── TemplateManager.jsx (nouveau)
└── pages/
    └── ConfigurationPage.jsx (nouveau)
```

---

#### 7. Exports ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Export PDF par classe
- ❌ Export PDF par prof
- ❌ Export PDF par salle
- ❌ Affichage mural A3 (impression)

**Composants à créer:**
```
modules/schedule/
└── services/
    └── schedulePdfGenerator.js (nouveau)
```

---

### Résumé App Emplois du Temps

| Aspect | Existant | À Créer | Effort |
|--------|----------|---------|--------|
| **Affichage élève** | ✅ 100% | - | - |
| **Affichage prof** | ⚠️ 60% | Heures sup | Faible |
| **Générateur** | ❌ 0% | TOUT | Élevé (algorithme complexe) |
| **Salles** | ❌ 0% | TOUT | Moyen |
| **Conflits** | ❌ 0% | TOUT | Moyen |
| **Personnalisation** | ❌ 0% | TOUT | Moyen |
| **Exports** | ❌ 0% | TOUT | Faible |

⚠️ **ATTENTION:** App Planning est la plus complexe à créer (70% nouveau code)

### Fichiers à Créer pour `/modules/schedule/`

```
modules/schedule/
├── routes.jsx (nouveau)
├── components/
│   ├── StudentSchedule.jsx ✅
│   ├── TeacherSchedule.jsx ✅
│   ├── WeeklyScheduleView.jsx (nouveau)
│   ├── ScheduleGenerator.jsx (nouveau)
│   ├── ConstraintsForm.jsx (nouveau)
│   ├── GenerationProgress.jsx (nouveau)
│   ├── RoomManager.jsx (nouveau)
│   ├── RoomList.jsx (nouveau)
│   ├── RoomReservation.jsx (nouveau)
│   ├── ConflictDetector.jsx (nouveau)
│   ├── ConflictList.jsx (nouveau)
│   ├── ConflictResolver.jsx (nouveau)
│   ├── ScheduleConfigForm.jsx (nouveau)
│   ├── TimeSlotEditor.jsx (nouveau)
│   └── TemplateManager.jsx (nouveau)
├── services/
│   ├── scheduleAlgorithm.js (nouveau - COMPLEXE)
│   ├── roomService.js (nouveau)
│   ├── conflictDetectionService.js (nouveau)
│   └── schedulePdfGenerator.js (nouveau)
├── hooks/
│   ├── useSchedule.js (nouveau)
│   ├── useTeacherSchedule.js (nouveau)
│   └── useRooms.js (nouveau)
├── algorithms/
│   ├── constraint-solver.js (nouveau)
│   ├── schedule-optimizer.js (nouveau)
│   └── conflict-detector.js (nouveau)
└── pages/
    ├── SchedulesPage.jsx (nouveau)
    ├── GeneratorPage.jsx (nouveau)
    ├── RoomsPage.jsx (nouveau)
    ├── ConflictsPage.jsx (nouveau)
    ├── ConfigurationPage.jsx (nouveau)
    └── ExportsPage.jsx (nouveau)
```

### Tables App Emplois du Temps

```sql
-- Tables existantes
✅ schedules (ou timetables)

-- Tables à créer
❌ rooms (nouveau)
❌ room_reservations (nouveau)
❌ school_schedule_config (nouveau)
❌ schedule_templates (nouveau)
❌ teacher_availability (nouveau)
❌ schedule_constraints (nouveau)
```

### Routes App Emplois du Temps

```javascript
/schedules                // Vue générale
/schedules/generator      // Générateur auto
/schedules/generator/configure  // Configuration contraintes
/schedules/generator/preview    // Prévisualisation
/schedules/rooms          // Gestion salles
/schedules/rooms/:roomId  // Détails salle
/schedules/conflicts      // Conflits détectés
/schedules/export         // Exports PDF
/schedules/configuration  // Config système
```

---

## 📧 APP 5: COMMUNICATION

**Prix:** 8 000 FCFA/an
**Catégorie:** Communication

### Fonctionnalités Existantes

#### 1. SMS Groupés ✅ (EXISTANT - PARTIEL)
**Actuellement dans:**
- `SecretaryDashboard/tabs/JustificationTab.jsx` (relances absences)
- `SecretaryDashboard/tabs/PaymentTab.jsx` (relances paiements)

**Fonctionnalités existantes:**
- ✅ Envoi SMS individuel
- ✅ Envoi SMS en lot (plusieurs parents)
- ⚠️ Templates prédéfinis (basique)
- ❌ Crédits SMS inclus (manquant)
- ❌ Historique SMS centralisé (manquant)

**Services:**
- `absenceService.js` (sendSMSReminder)
- `paymentService.js` (sendPaymentReminder)

**Intégrations:**
- API SMS locale (à configurer selon pays)

**Composants à migrer/créer:**
```
modules/communication/
├── components/
│   ├── SMSComposer.jsx (nouveau)
│   ├── SMSTemplateSelector.jsx (nouveau)
│   ├── RecipientSelector.jsx
│   ├── BulkSMSModal.jsx ✅ (migrer)
│   └── SMSHistory.jsx (nouveau)
└── services/
    └── smsService.js (consolider absenceService + paymentService)
```

---

#### 2. Envoi Emails ⚠️ (PARTIEL)
**Actuellement dans:**
- `SecretaryDashboard/tabs/JustificationTab.jsx` (emails absences)
- `SecretaryDashboard/tabs/PaymentTab.jsx` (emails paiements)

**Fonctionnalités existantes:**
- ✅ Envoi email individuel
- ✅ Envoi email en lot
- ⚠️ Templates HTML basiques
- ❌ Pièces jointes (manquant)
- ❌ Éditeur WYSIWYG (manquant)

**Service:**
- `emailService.js` ✅ (existe mais basique)

**Intégration:**
- EmailJS (actuellement configuré)

**Composants à migrer/créer:**
```
modules/communication/
├── components/
│   ├── EmailComposer.jsx (nouveau)
│   ├── EmailTemplateEditor.jsx (nouveau)
│   ├── AttachmentUploader.jsx (nouveau)
│   └── EmailHistory.jsx (nouveau)
└── services/
    └── emailService.js ✅
```

---

#### 3. Notifications Push ✅ (EXISTANT)
**Actuellement dans:**
- Tous les dashboards (`NotificationCenter.jsx`)

**Fonctionnalités:**
- ✅ Centre de notifications
- ✅ Badge non lus
- ✅ Notifications système
- ✅ Marquage comme lu
- ⚠️ Filtres par type (basique)
- ❌ Notifications push réelles (manquant - actuellement in-app seulement)

**Service:**
- `notificationService` (edutrackService.js)

**Tables:**
- `notifications` (id, user_id, student_id, title, message, type, priority, is_read, created_at)

**Composants à migrer:**
```
modules/communication/
├── components/
│   ├── NotificationCenter.jsx ✅
│   ├── NotificationsList.jsx
│   ├── NotificationFilters.jsx (nouveau)
│   └── PushNotificationSettings.jsx (nouveau)
└── services/
    └── pushNotificationService.js (nouveau - web push)
```

---

#### 4. Messagerie Interne ⚠️ (BASIQUE)
**Actuellement dans:**
- `StudentDashboard/tabs/Messages.jsx`
- `TeacherDashboard/tabs/StudentCommunication.jsx`

**Fonctionnalités existantes:**
- ✅ Messages enseignant → élèves (basique)
- ⚠️ Réponses élèves (implicite via notifications)
- ❌ Chat temps réel (manquant)
- ❌ Pièces jointes messages (manquant)
- ❌ Messages parents ↔ profs (manquant)

**Composants à créer/migrer:**
```
modules/communication/
├── components/
│   ├── MessagingCenter.jsx (nouveau)
│   ├── MessageThread.jsx (nouveau)
│   ├── MessageComposer.jsx (nouveau)
│   ├── ParentTeacherChat.jsx (nouveau)
│   └── MessageAttachments.jsx (nouveau)
└── services/
    └── messagingService.js (nouveau)
```

**Tables à créer:**
```sql
❌ messages (nouveau)
   - id, from_user_id, to_user_id, subject, body, attachments, is_read, parent_message_id, created_at
❌ message_participants (nouveau - pour groupes)
   - id, message_id, user_id, role (sender/recipient), is_read
```

---

#### 5. Annonces ⚠️ (BASIQUE)
**Actuellement dans:**
- Quelques notifications système

**Fonctionnalités existantes:**
- ⚠️ Notifications génériques (utilisées comme annonces)
- ❌ Tableau d'affichage digital (manquant)
- ❌ Événements/Calendrier partagé (manquant)
- ❌ Communiqués officiels (manquant)
- ❌ Épinglage annonces importantes (manquant)

**Composants à créer:**
```
modules/communication/
├── components/
│   ├── AnnouncementBoard.jsx (nouveau)
│   ├── AnnouncementCreator.jsx (nouveau)
│   ├── EventCalendar.jsx (nouveau)
│   └── OfficialNoticeViewer.jsx (nouveau)
└── services/
    └── announcementService.js (nouveau)
```

**Tables à créer:**
```sql
❌ announcements (nouveau)
   - id, school_id, title, content, announcement_type, target_audience, is_pinned, expires_at, created_by, created_at
❌ events (peut-être déjà existe - à vérifier)
   - id, school_id, title, description, event_type, start_date, end_date, location, created_at
```

---

#### 6. Statistiques Communications ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Taux de lecture messages
- ❌ Parents non joignables (contacts invalides)
- ❌ Canaux préférés par parent (SMS vs email)
- ❌ Engagement (réponses, confirmations)

**Composants à créer:**
```
modules/communication/
├── components/
│   ├── CommunicationStats.jsx (nouveau)
│   ├── ReadRatesChart.jsx (nouveau)
│   ├── UnreachableParentsList.jsx (nouveau)
│   └── EngagementMetrics.jsx (nouveau)
└── services/
    └── communicationAnalytics.js (nouveau)
```

---

#### 7. Crédits SMS ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ 500-2000 SMS/mois selon bundle
- ❌ Compteur SMS restants
- ❌ Historique consommation
- ❌ Achat SMS supplémentaires (15 FCFA/SMS)
- ❌ Alertes quota

**Tables à créer:**
```sql
❌ sms_credits (nouveau)
   - id, school_id, bundle_id, monthly_quota, used_this_month, extra_purchased, reset_date, created_at
❌ sms_usage_log (nouveau)
   - id, school_id, sent_to, message, cost, sent_at, delivery_status
```

**Composants à créer:**
```
modules/communication/
├── components/
│   ├── SMSCreditsWidget.jsx (nouveau)
│   ├── SMSUsageChart.jsx (nouveau)
│   └── PurchaseExtraSMSModal.jsx (nouveau)
└── services/
    └── smsCreditsService.js (nouveau)
```

---

### Résumé App Communication

| Aspect | Existant | À Créer | À Migrer |
|--------|----------|---------|----------|
| **SMS** | ⚠️ 50% | Centralisé, templates | BulkSMS |
| **Emails** | ⚠️ 40% | WYSIWYG, pièces jointes | - |
| **Notifs Push** | ⚠️ 60% | Web push réel | NotificationCenter |
| **Messagerie** | ⚠️ 30% | Chat, pièces jointes | Messages |
| **Annonces** | ⚠️ 20% | Tableau, événements | - |
| **Statistiques** | ❌ 0% | TOUT | - |
| **Crédits SMS** | ❌ 0% | TOUT | - |

### Fichiers à Créer pour `/modules/communication/`

```
modules/communication/
├── routes.jsx (nouveau)
├── components/
│   ├── NotificationCenter.jsx ✅
│   ├── BulkSMSModal.jsx ✅
│   ├── SMSComposer.jsx (nouveau)
│   ├── SMSTemplateSelector.jsx (nouveau)
│   ├── SMSHistory.jsx (nouveau)
│   ├── EmailComposer.jsx (nouveau)
│   ├── EmailTemplateEditor.jsx (nouveau)
│   ├── EmailHistory.jsx (nouveau)
│   ├── MessagingCenter.jsx (nouveau)
│   ├── MessageThread.jsx (nouveau)
│   ├── MessageComposer.jsx (nouveau)
│   ├── AnnouncementBoard.jsx (nouveau)
│   ├── AnnouncementCreator.jsx (nouveau)
│   ├── EventCalendar.jsx (nouveau)
│   ├── CommunicationStats.jsx (nouveau)
│   ├── SMSCreditsWidget.jsx (nouveau)
│   └── SMSUsageChart.jsx (nouveau)
├── services/
│   ├── smsService.js (consolider)
│   ├── emailService.js ✅
│   ├── pushNotificationService.js (nouveau)
│   ├── messagingService.js (nouveau)
│   ├── announcementService.js (nouveau)
│   ├── smsCreditsService.js (nouveau)
│   └── communicationAnalytics.js (nouveau)
├── hooks/
│   ├── useSMS.js (nouveau)
│   ├── useMessages.js (nouveau)
│   └── useAnnouncements.js (nouveau)
└── pages/
    ├── SMSPage.jsx (nouveau)
    ├── EmailsPage.jsx (nouveau)
    ├── MessagesPage.jsx (nouveau)
    ├── AnnouncementsPage.jsx (nouveau)
    └── StatsPage.jsx (nouveau)
```

### Tables App Communication

```sql
-- Tables existantes
✅ notifications
✅ communication_logs

-- Tables à créer
❌ messages (nouveau)
❌ message_participants (nouveau)
❌ announcements (nouveau)
❌ events (nouveau ou à vérifier)
❌ sms_credits (nouveau)
❌ sms_usage_log (nouveau)
❌ email_templates (nouveau)
❌ sms_templates (nouveau)
```

### Routes App Communication

```javascript
/messages                 // Messagerie interne
/messages/compose         // Nouveau message
/messages/:threadId       // Fil de discussion
/sms                      // Centre SMS
/sms/send                 // Envoyer SMS
/sms/history              // Historique SMS
/emails                   // Centre emails
/emails/compose           // Composer email
/announcements            // Tableau annonces
/announcements/create     // Créer annonce
/events                   // Calendrier événements
/communication-stats      // Statistiques
/sms-credits              // Gestion crédits SMS
```

---

## 📊 APP 6: REPORTING AVANCÉ

**Prix:** 15 000 FCFA/an
**Catégorie:** Analytics

### Fonctionnalités Existantes (Basiques)

#### 1. Graphiques Dashboard ✅ (EXISTANT)
**Actuellement dans:**
- `PrincipalDashboard/components/`
  - ClassAverageChart.jsx
  - AttendanceChart.jsx
  - PaymentStatusChart.jsx

**Fonctionnalités:**
- ✅ Graph moyennes par classe (bar chart)
- ✅ Graph présences par classe (line chart)
- ✅ Graph statuts paiements (pie chart)
- ⚠️ Interactivité basique
- ❌ Filtres temporels (manquant)
- ❌ Drill-down (manquant)

**Bibliothèque:**
- Probablement Chart.js ou Recharts (à vérifier)

**Composants à migrer:**
```
modules/reporting/
├── components/
│   ├── ClassAverageChart.jsx ✅
│   ├── AttendanceChart.jsx ✅
│   ├── PaymentStatusChart.jsx ✅
│   └── InteractiveChartWrapper.jsx (nouveau)
└── hooks/
    └── useChartData.js (nouveau)
```

---

#### 2. Statistiques Basiques ✅ (EXISTANT)
**Actuellement dans:**
- Dashboards (cartes métriques)
- `analyticsService` (edutrackService.js)

**Fonctionnalités:**
- ✅ Métriques KPI basiques (4 cartes)
- ✅ Calculs simples (totaux, moyennes)
- ❌ Segmentations avancées (manquant)
- ❌ Comparaisons temporelles (manquant)

**Service:**
- `analyticsService` (basique)

**Composants à migrer:**
```
modules/reporting/
├── components/
│   ├── MetricCard.jsx ✅
│   └── KPIDashboard.jsx
└── services/
    └── analyticsService.js (enrichir)
```

---

### Fonctionnalités à Créer (Nouvelles)

#### 3. Analytics Avancées ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Tableaux de bord interactifs
- ❌ KPIs éducatifs (taux réussite, abandon, redoublement)
- ❌ Segmentation (genre, âge, niveau social, quartier)
- ❌ Analyse de tendances
- ❌ Comparaisons (classe vs classe, année vs année)
- ❌ Heatmaps (performance par matière/élève)

**Composants à créer:**
```
modules/reporting/
├── components/
│   ├── AdvancedDashboard.jsx (nouveau)
│   ├── KPIGrid.jsx (nouveau)
│   ├── SegmentationAnalysis.jsx (nouveau)
│   ├── TrendAnalysis.jsx (nouveau)
│   ├── PerformanceHeatmap.jsx (nouveau)
│   └── ComparativeCharts.jsx (nouveau)
├── services/
│   └── advancedAnalyticsService.js (nouveau)
└── pages/
    └── AnalyticsPage.jsx (nouveau)
```

---

#### 4. Exports Ministère ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Format MINESEC standardisé
- ❌ Statistiques annuelles officielles
- ❌ Rapports trimestriels
- ❌ Déclarations obligatoires
- ❌ CSV/Excel exports conformes

**Formats requis (Cameroun - MINESEC):**
- Effectifs par classe et par genre
- Taux de réussite aux examens officiels
- Personnel enseignant (qualifications)
- Infrastructures (salles, équipements)
- Résultats aux examens nationaux

**Composants à créer:**
```
modules/reporting/
├── components/
│   ├── MinistryExportForm.jsx (nouveau)
│   ├── MinistryReportPreview.jsx (nouveau)
│   └── OfficialStatisticsTable.jsx (nouveau)
├── services/
│   └── ministryExportService.js (nouveau)
└── templates/
    ├── minesec-format-1.json (nouveau)
    ├── minesec-format-2.json (nouveau)
    └── README-formats.md (nouveau)
```

---

#### 5. Rapports Personnalisés ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Builder visuel de rapports
- ❌ Filtres avancés (AND/OR, multiples critères)
- ❌ Sélection colonnes affichées
- ❌ Tri et regroupements
- ❌ Sauvegarde rapports favoris
- ❌ Planification envois automatiques (email hebdo)
- ❌ Exports multi-formats (PDF, Excel, CSV)

**Composants à créer:**
```
modules/reporting/
├── components/
│   ├── ReportBuilder.jsx (nouveau)
│   ├── FilterBuilder.jsx (nouveau)
│   ├── ColumnSelector.jsx (nouveau)
│   ├── GroupBySelector.jsx (nouveau)
│   ├── ReportPreview.jsx (nouveau)
│   ├── SavedReportsList.jsx (nouveau)
│   └── ScheduleReportModal.jsx (nouveau)
├── services/
│   └── reportBuilderService.js (nouveau)
└── pages/
    └── CustomReportsPage.jsx (nouveau)
```

**Tables à créer:**
```sql
❌ saved_reports (nouveau)
   - id, school_id, name, description, filters, columns, grouping, created_by, is_favorite, created_at
❌ scheduled_reports (nouveau)
   - id, report_id, frequency (daily/weekly/monthly), recipients, next_run, last_run, is_active
```

---

#### 6. Prédictions IA ❌ (NOUVEAU - FUTUR)
**Fonctionnalités (Phase avancée):**
- ❌ Risque d'échec élève (ML model)
- ❌ Prévision effectifs année prochaine
- ❌ Optimisation ressources (salles, profs)
- ❌ Recommandations pédagogiques

**Technologies:**
- TensorFlow.js (in-browser ML)
- OU Python backend (Flask API)
- Modèles pré-entraînés ou custom

**Composants à créer:**
```
modules/reporting/
├── components/
│   ├── StudentRiskPredictor.jsx (nouveau)
│   ├── EnrollmentForecast.jsx (nouveau)
│   ├── ResourceOptimization.jsx (nouveau)
│   └── AIRecommendations.jsx (nouveau)
├── services/
│   └── aiPredictionService.js (nouveau)
├── models/
│   ├── student-risk-model.json (nouveau)
│   └── enrollment-forecast-model.json (nouveau)
└── pages/
    └── PredictionsPage.jsx (nouveau)
```

⚠️ **Note:** Prédictions IA = feature avancée, priorité P3 (peut attendre phase 2-3)

---

#### 7. Visualisations Avancées ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Graphiques interactifs (zoom, drill-down)
- ❌ Cartes de chaleur (heatmaps)
- ❌ Graphiques en temps réel (live data)
- ❌ Dashboards multi-pages
- ❌ Exportation graphiques (PNG, SVG)

**Bibliothèques:**
- D3.js (visualisations custom)
- Recharts (React charts)
- Plotly.js (graphiques scientifiques)

**Composants à créer:**
```
modules/reporting/
├── components/
│   ├── InteractiveLineChart.jsx (nouveau)
│   ├── HeatmapVisualization.jsx (nouveau)
│   ├── LiveDataWidget.jsx (nouveau)
│   ├── MultiPageDashboard.jsx (nouveau)
│   └── ChartExporter.jsx (nouveau)
└── hooks/
    └── useRealtimeData.js (nouveau)
```

---

#### 8. Comparaisons Multi-Écoles ❌ (NOUVEAU - FUTUR)
**Fonctionnalités (Si plusieurs écoles utilisent EduTrack):**
- ❌ Benchmarking anonymisé
- ❌ Classements régionaux
- ❌ Meilleures pratiques identifiées
- ❌ Comparaison performance similaire (même taille, même type)

⚠️ **Note:** Nécessite agrégation multi-tenants, priorité P3

---

### Résumé App Reporting

| Aspect | Existant | À Créer | Effort |
|--------|----------|---------|--------|
| **Graphiques** | ✅ 60% | Interactivité | Faible |
| **Stats basiques** | ✅ 70% | Enrichir | Faible |
| **Analytics** | ❌ 0% | TOUT | Moyen |
| **Exports ministère** | ❌ 0% | TOUT | Moyen |
| **Builder rapports** | ❌ 0% | TOUT | Élevé |
| **Prédictions IA** | ❌ 0% | TOUT | Très élevé |
| **Viz avancées** | ❌ 0% | TOUT | Moyen |
| **Multi-écoles** | ❌ 0% | TOUT | Élevé |

### Fichiers à Créer pour `/modules/reporting/`

```
modules/reporting/
├── routes.jsx (nouveau)
├── components/
│   ├── ClassAverageChart.jsx ✅
│   ├── AttendanceChart.jsx ✅
│   ├── PaymentStatusChart.jsx ✅
│   ├── MetricCard.jsx ✅
│   ├── AdvancedDashboard.jsx (nouveau)
│   ├── KPIGrid.jsx (nouveau)
│   ├── SegmentationAnalysis.jsx (nouveau)
│   ├── TrendAnalysis.jsx (nouveau)
│   ├── PerformanceHeatmap.jsx (nouveau)
│   ├── ReportBuilder.jsx (nouveau)
│   ├── FilterBuilder.jsx (nouveau)
│   ├── MinistryExportForm.jsx (nouveau)
│   ├── StudentRiskPredictor.jsx (nouveau)
│   ├── InteractiveLineChart.jsx (nouveau)
│   └── HeatmapVisualization.jsx (nouveau)
├── services/
│   ├── analyticsService.js ✅ (enrichir)
│   ├── advancedAnalyticsService.js (nouveau)
│   ├── reportBuilderService.js (nouveau)
│   ├── ministryExportService.js (nouveau)
│   └── aiPredictionService.js (nouveau)
├── hooks/
│   ├── useChartData.js (nouveau)
│   ├── useAnalytics.js (nouveau)
│   └── useRealtimeData.js (nouveau)
├── models/ (IA)
│   ├── student-risk-model.json (nouveau)
│   └── enrollment-forecast-model.json (nouveau)
├── templates/
│   ├── minesec-format-1.json (nouveau)
│   └── minesec-format-2.json (nouveau)
└── pages/
    ├── AnalyticsPage.jsx (nouveau)
    ├── CustomReportsPage.jsx (nouveau)
    ├── MinistryExportsPage.jsx (nouveau)
    └── PredictionsPage.jsx (nouveau)
```

### Tables App Reporting

```sql
-- Tables existantes
✅ Toutes les tables (lecture seule pour analytics)

-- Tables à créer
❌ saved_reports (nouveau)
❌ scheduled_reports (nouveau)
❌ analytics_cache (nouveau - pour perfs)
❌ ministry_export_history (nouveau)
```

### Routes App Reporting

```javascript
/analytics                // Dashboard analytics
/analytics/advanced       // Analytics avancées
/analytics/trends         // Analyse tendances
/reports/builder          // Créateur rapports
/reports/saved            // Rapports sauvegardés
/reports/:reportId        // Rapport individuel
/exports/ministry         // Exports MINESEC
/exports/ministry/preview // Prévisualisation
/predictions              // Prédictions IA
/predictions/risk         // Risque échec
/visualizations           // Viz avancées
```

---

## 👥 APP 7: RESSOURCES HUMAINES

**Prix:** 18 000 FCFA/an
**Catégorie:** Administration

### Fonctionnalités Existantes (Basiques)

#### 1. Gestion Enseignants ✅ (EXISTANT - BASIQUE)
**Actuellement dans:**
- `PrincipalDashboard/tabs/Accounts.jsx` (création comptes)
- `SecretaryDashboard/tabs/TeacherManagementTab.jsx`
- `TeacherDashboard/tabs/Account.jsx` (profil)

**Fonctionnalités:**
- ✅ Création compte enseignant (email, password, rôle)
- ✅ Informations de base (nom, email, téléphone)
- ✅ Spécialité/matière
- ✅ Activation/désactivation
- ⚠️ Profil enseignant (basique)
- ❌ Dossier RH complet (manquant)
- ❌ Historique (manquant)

**Tables:**
- `teachers` (id, user_id, school_id, full_name, email, phone, specialty, is_active, created_at)
- `users` (id, email, role, created_at)

**Composants à migrer:**
```
modules/hr/
├── components/
│   ├── TeacherManagementTab.jsx ✅
│   ├── TeacherForm.jsx
│   ├── TeacherProfileCard.jsx
│   └── TeacherList.jsx
└── services/
    └── teacherService.js ✅
```

---

#### 2. Assignation Classes ✅ (EXISTANT)
**Actuellement dans:**
- `SecretaryDashboard/components/TeacherAssignmentManager.jsx`

**Fonctionnalités:**
- ✅ Assignation enseignant → classes
- ✅ Assignation enseignant → matières
- ✅ Multi-assignations (un prof → plusieurs classes)
- ✅ Suppression assignations
- ⚠️ Charge horaire (basique)
- ❌ Heures supplémentaires (manquant)

**Tables:**
- `teacher_assignments` (id, teacher_id, class_id, subject_id, class_name, subject_name, school_id, schedule, is_active, created_at)

**Composants à migrer:**
```
modules/hr/
├── components/
│   ├── TeacherAssignmentManager.jsx ✅
│   ├── ClassAssignmentForm.jsx
│   └── WorkloadCalculator.jsx (nouveau)
└── services/
    └── assignmentService.js (extraire de teacherService)
```

---

### Fonctionnalités à Créer (Nouvelles)

#### 3. Dossiers Personnel Complets ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Informations personnelles étendues:
  - Date naissance, lieu
  - CNI/Passeport
  - Adresse complète
  - Situation familiale
  - Personnes à contacter (urgence)
- ❌ Qualifications:
  - Diplômes (scan PDF)
  - Formations continues
  - Certifications
  - Expérience professionnelle
- ❌ Documents administratifs:
  - Casier judiciaire
  - Certificat médical
  - Attestations
  - Photos

**Tables à créer:**
```sql
❌ teacher_profiles (nouveau - étendre teachers)
   - id, teacher_id, birth_date, birth_place, id_card, address, marital_status, emergency_contact
❌ teacher_qualifications (nouveau)
   - id, teacher_id, degree_type, institution, year, document_url
❌ teacher_documents (nouveau)
   - id, teacher_id, document_type, file_url, expiry_date, uploaded_at
```

**Composants à créer:**
```
modules/hr/
├── components/
│   ├── TeacherProfileComplete.jsx (nouveau)
│   ├── QualificationsManager.jsx (nouveau)
│   ├── DocumentsManager.jsx (nouveau)
│   └── EmergencyContactForm.jsx (nouveau)
└── pages/
    └── TeacherDetailsPage.jsx (nouveau)
```

---

#### 4. Contrats ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Types de contrats:
  - CDI (Contrat Durée Indéterminée)
  - CDD (Contrat Durée Déterminée)
  - Vacation (horaire)
  - Stage
- ❌ Gestion contrats:
  - Création contrat
  - Upload PDF signé
  - Date début/fin
  - Renouvellements
  - Avenants
  - Résiliations
- ❌ Archivage sécurisé
- ❌ Historique contractuel

**Tables à créer:**
```sql
❌ teacher_contracts (nouveau)
   - id, teacher_id, contract_type, start_date, end_date, salary_base, contract_url, is_active, created_at
❌ contract_amendments (nouveau - avenants)
   - id, contract_id, amendment_type, description, document_url, effective_date
```

**Composants à créer:**
```
modules/hr/
├── components/
│   ├── ContractManager.jsx (nouveau)
│   ├── ContractForm.jsx (nouveau)
│   ├── ContractViewer.jsx (nouveau)
│   ├── AmendmentForm.jsx (nouveau)
│   └── ContractHistory.jsx (nouveau)
├── services/
│   └── contractService.js (nouveau)
└── pages/
    └── ContractsPage.jsx (nouveau)
```

---

#### 5. Gestion Salaires ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Grilles salariales:
  - Salaire de base
  - Primes (ancienneté, responsabilité)
  - Indemnités (transport, logement)
  - Heures supplémentaires
- ❌ Calcul paie mensuelle:
  - Brut
  - Retenues (CNPS, impôts)
  - Net à payer
- ❌ Bulletins de paie:
  - Génération automatique PDF
  - Modèle officiel Cameroun
  - Envoi email sécurisé
- ❌ Historique paiements
- ❌ Exports comptables

**Tables à créer:**
```sql
❌ salary_grids (nouveau)
   - id, school_id, grade, base_salary, seniority_bonus, responsibility_bonus, created_at
❌ teacher_salaries (nouveau)
   - id, teacher_id, month, year, base, bonuses, deductions, gross, net, payment_date, payment_method, status
❌ payslips (nouveau)
   - id, salary_id, document_url, sent_at, is_downloaded
```

**Composants à créer:**
```
modules/hr/
├── components/
│   ├── SalaryManager.jsx (nouveau)
│   ├── SalaryCalculator.jsx (nouveau)
│   ├── PayslipGenerator.jsx (nouveau)
│   ├── SalaryHistory.jsx (nouveau)
│   ├── DeductionsForm.jsx (nouveau)
│   └── BonusesForm.jsx (nouveau)
├── services/
│   ├── salaryService.js (nouveau)
│   └── payslipService.js (nouveau)
└── pages/
    └── SalariesPage.jsx (nouveau)
```

---

#### 6. Évaluations Enseignants ❌ (NOUVEAU)
**Fonctionnalités:**
- ❌ Types d'évaluations:
  - Inspection pédagogique (directeur/inspecteur)
  - Évaluation élèves (feedback)
  - Auto-évaluation
  - Évaluation pairs
- ❌ Critères:
  - Maîtrise de la matière
  - Pédagogie
  - Gestion de classe
  - Ponctualité
  - Assiduité
  - Relation élèves
- ❌ Plans de formation:
  - Besoins identifiés
  - Formations recommandées
  - Suivi progressions
- ❌ Évolution carrière:
  - Promotions
  - Changements de grade
  - Augmentations

**Tables à créer:**
```sql
❌ teacher_evaluations (nouveau)
   - id, teacher_id, evaluation_type, evaluator_id, criteria_scores (JSONB), strengths, weaknesses, recommendations, date, next_review_date
❌ training_plans (nouveau)
   - id, teacher_id, training_type, provider, start_date, end_date, cost, status, certificate_url
❌ career_events (nouveau)
   - id, teacher_id, event_type, description, effective_date, document_url
```

**Composants à créer:**
```
modules/hr/
├── components/
│   ├── EvaluationForm.jsx (nouveau)
│   ├── EvaluationHistory.jsx (nouveau)
│   ├── TrainingPlanManager.jsx (nouveau)
│   ├── CareerTimelineViewer.jsx (nouveau)
│   └── PerformanceDashboard.jsx (nouveau)
├── services/
│   ├── evaluationService.js (nouveau)
│   └── trainingService.js (nouveau)
└── pages/
    └── EvaluationsPage.jsx (nouveau)
```

---

#### 7. Emplois du Temps Profs ⚠️ (PARTIEL)
**Actuellement dans:**
- App Emplois du Temps (App 4)

**Intégration avec App 4:**
- ✅ Affichage emploi du temps prof
- ❌ Vue hebdomadaire enseignant (manquant)
- ❌ Heures supplémentaires (manquant)
- ❌ Remplacements (manquant)
- ❌ Disponibilités (manquant)

**Note:** Cette fonctionnalité chevauche App 4 et App 7. À clarifier:
- **Option A**: Intégrer dans App 4 uniquement
- **Option B**: Vue dans App 7, gestion dans App 4
- **Option C**: Dupliquer (pas idéal)

**Recommandation:** Garder dans App 4, mais App 7 peut afficher un widget résumé (charge horaire, heures sup)

---

### Résumé App RH

| Aspect | Existant | À Créer | Effort |
|--------|----------|---------|--------|
| **Gestion profs** | ✅ 60% | Dossiers complets | Moyen |
| **Assignations** | ✅ 80% | Charge horaire | Faible |
| **Contrats** | ❌ 0% | TOUT | Moyen |
| **Salaires** | ❌ 0% | TOUT | Élevé |
| **Évaluations** | ❌ 0% | TOUT | Moyen |
| **Planning profs** | ⚠️ 40% | Voir App 4 | - |

⚠️ **Note:** App RH est largement à créer (60% nouveau code)

### Fichiers à Créer pour `/modules/hr/`

```
modules/hr/
├── routes.jsx (nouveau)
├── components/
│   ├── TeacherManagementTab.jsx ✅
│   ├── TeacherAssignmentManager.jsx ✅
│   ├── TeacherProfileComplete.jsx (nouveau)
│   ├── QualificationsManager.jsx (nouveau)
│   ├── DocumentsManager.jsx (nouveau)
│   ├── ContractManager.jsx (nouveau)
│   ├── ContractForm.jsx (nouveau)
│   ├── ContractViewer.jsx (nouveau)
│   ├── SalaryManager.jsx (nouveau)
│   ├── SalaryCalculator.jsx (nouveau)
│   ├── PayslipGenerator.jsx (nouveau)
│   ├── EvaluationForm.jsx (nouveau)
│   ├── EvaluationHistory.jsx (nouveau)
│   ├── TrainingPlanManager.jsx (nouveau)
│   ├── CareerTimelineViewer.jsx (nouveau)
│   └── WorkloadCalculator.jsx (nouveau)
├── services/
│   ├── teacherService.js ✅
│   ├── assignmentService.js (extraire)
│   ├── contractService.js (nouveau)
│   ├── salaryService.js (nouveau)
│   ├── payslipService.js (nouveau)
│   ├── evaluationService.js (nouveau)
│   └── trainingService.js (nouveau)
├── hooks/
│   ├── useTeachers.js (nouveau)
│   ├── useSalaries.js (nouveau)
│   └── useEvaluations.js (nouveau)
└── pages/
    ├── TeachersPage.jsx (nouveau)
    ├── TeacherDetailsPage.jsx (nouveau)
    ├── ContractsPage.jsx (nouveau)
    ├── SalariesPage.jsx (nouveau)
    └── EvaluationsPage.jsx (nouveau)
```

### Tables App RH

```sql
-- Tables existantes
✅ teachers
✅ users
✅ teacher_assignments

-- Tables à créer
❌ teacher_profiles (nouveau - étendre teachers)
❌ teacher_qualifications (nouveau)
❌ teacher_documents (nouveau)
❌ teacher_contracts (nouveau)
❌ contract_amendments (nouveau)
❌ salary_grids (nouveau)
❌ teacher_salaries (nouveau)
❌ payslips (nouveau)
❌ teacher_evaluations (nouveau)
❌ training_plans (nouveau)
❌ career_events (nouveau)
```

### Routes App RH

```javascript
/teachers                 // Liste enseignants
/teachers/:teacherId      // Profil complet
/teachers/:teacherId/edit // Modifier
/teachers/create          // Créer
/contracts                // Gestion contrats
/contracts/:contractId    // Détails contrat
/salaries                 // Gestion salaires
/salaries/calculate       // Calculer paie
/salaries/:salaryId       // Détails paie
/payslips                 // Bulletins paie
/evaluations              // Évaluations
/evaluations/:evalId      // Détails évaluation
/training-plans           // Plans formation
/career                   // Évolution carrière
```

---

## 🚨 FONCTIONNALITÉS MANQUANTES

### Globales (Toutes Apps)

1. **Multi-Langue** ❌
   - Interface uniquement français actuellement
   - Besoin: Anglais (pour Cameroun bilingue)
   - Peut-être: Autres langues locales

2. **Mode Hors-Ligne** ❌
   - Actuellement: Nécessite Internet
   - Besoin: Cache local + sync
   - Use case: Zones rurales, coupures Internet

3. **Application Mobile Native** ❌
   - Actuellement: PWA responsive
   - Besoin: Apps iOS/Android natives (React Native?)
   - Features: Notifications push réelles, caméra, GPS

4. **API Publique** ❌
   - Besoin: Intégrations tierces
   - Webhooks, REST API documentée
   - Use case: Partenaires, développeurs

5. **Marketplace Extensions** ❌
   - Besoin: Apps tiers installables
   - Modèle: Comme Shopify, Salesforce
   - Use case: Comptabilité, Paie avancée, etc.

6. **Audit Complet** ❌
   - Actuellement: `audit_logs` basique
   - Besoin: Traçabilité totale RGPD
   - Qui a fait quoi, quand, pourquoi

7. **Backup Automatique** ⚠️
   - Actuellement: Supabase auto-backup (7 jours)
   - Besoin: Exports manuels programmés
   - Restauration point-in-time

---

### Par App

#### App 1: Académique
- ❌ Notes vocales (prof dicte notes)
- ❌ Import Excel massif notes
- ❌ OCR correction copies (scan → notes auto)
- ❌ Plagiat détection (devoirs)
- ❌ Bibliothèque numérique

#### App 2: Financière
- ❌ Intégration Mobile Money API réelle (MTN, Orange)
- ❌ Paiements en ligne (parents payent directement)
- ❌ Comptabilité double entrée
- ❌ Déclarations fiscales
- ❌ Prévisions budgétaires

#### App 3: Discipline
- ❌ Pointage biométrique (empreinte, facial)
- ❌ Badges QR code élèves (scan entrée/sortie)
- ❌ Géolocalisation transport scolaire
- ❌ Vidéosurveillance intégration

#### App 4: Emplois du Temps
- ❌ **TOUT LE GÉNÉRATEUR AUTO** (70% de l'app)
- ❌ Salles et réservations
- ❌ Conflits et résolutions
- ❌ Algorithme optimisation

#### App 5: Communication
- ❌ Messagerie temps réel (WebSocket/Firebase)
- ❌ Visioconférences (cours en ligne)
- ❌ Forum école
- ❌ Réseaux sociaux intégrés (partage succès)

#### App 6: Reporting
- ❌ **TOUT LE MODULE IA/ML** (prédictions, recommandations)
- ❌ Exports ministère standardisés
- ❌ Builder rapports visuels
- ❌ Dashboards temps réel

#### App 7: RH
- ❌ **TOUT LE MODULE PAIE** (salaires, bulletins)
- ❌ Contrats et archivage
- ❌ Évaluations formelles
- ❌ Plans formation et carrière

---

## 🛠️ PLAN DE MIGRATION TECHNIQUE

### Phase 0: Préparation (Semaine 1-2)

#### Étape 0.1: Infrastructure Modulaire
- [ ] Créer structure `/modules/` dans `src/`
- [ ] Créer dossier par app:
  ```
  src/modules/
  ├── core/
  ├── academic/
  ├── financial/
  ├── discipline/
  ├── schedule/
  ├── communication/
  ├── reporting/
  └── hr/
  ```
- [ ] Créer `modules/README.md` expliquant structure

#### Étape 0.2: Tables Supabase
- [ ] Créer table `apps`:
  ```sql
  CREATE TABLE apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price_yearly INTEGER,
    features JSONB,
    dependencies TEXT[],
    is_core BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] Seed data (7 apps)
- [ ] Créer table `school_subscriptions`:
  ```sql
  CREATE TABLE school_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    app_id TEXT REFERENCES apps(id),
    status TEXT DEFAULT 'trial', -- trial/active/expired
    trial_ends_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(school_id, app_id)
  );
  ```
- [ ] Créer fonction `has_active_app(school_id, app_id)`:
  ```sql
  CREATE OR REPLACE FUNCTION has_active_app(p_school_id UUID, p_app_id TEXT)
  RETURNS BOOLEAN AS $$
  BEGIN
    -- App core toujours accessible
    IF EXISTS (SELECT 1 FROM apps WHERE id = p_app_id AND is_core = true) THEN
      RETURN true;
    END IF;
    -- Vérifier abonnement actif
    RETURN EXISTS (
      SELECT 1 FROM school_subscriptions
      WHERE school_id = p_school_id
        AND app_id = p_app_id
        AND status IN ('trial', 'active')
        AND (expires_at > now() OR trial_ends_at > now())
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

#### Étape 0.3: Hooks et Contextes
- [ ] Créer `src/hooks/useAppAccess.js`:
  ```javascript
  export const useAppAccess = (appId) => {
    const { school } = useSchool();
    const hasAccess = useMemo(() => {
      // Logique vérification accès
    }, [school, appId]);
    return { hasAccess, app, isLocked, canUpgrade };
  };
  ```
- [ ] Créer `src/contexts/AppsContext.jsx`:
  ```javascript
  export const AppsContext = createContext();
  export const AppsProvider = ({ children }) => {
    const [activeApps, setActiveApps] = useState([]);
    // ...
  };
  ```
- [ ] Créer `src/components/ProtectedRoute.jsx`:
  ```javascript
  const ProtectedRoute = ({ appId, children }) => {
    const { hasAccess } = useAppAccess(appId);
    if (!hasAccess) return <UpgradeModal app={appId} />;
    return children;
  };
  ```

---

### Phase 1: Module CORE (Semaine 3-4)

#### Étape 1.1: Identifier Code Core
- [ ] Lister fichiers appartenant au Core:
  - Authentication (`authService.js`, `LoginAuthentication.jsx`, `StaffLogin.jsx`)
  - Dashboards basiques (versions allégées)
  - Profils (lecture seule)
  - Header, Sidebar, UI components
  - `schoolService.js`
  - `userService.js` (basique)
- [ ] Créer `modules/core/` et copier (pas déplacer encore)

#### Étape 1.2: Créer Limitations Core
- [ ] Middleware `checkCoreLimitations`:
  ```javascript
  export const checkCoreLimitations = async (schoolId) => {
    const { data: school } = await supabase
      .from('schools')
      .select('subscription_type')
      .eq('id', schoolId)
      .single();

    if (school.subscription_type === 'core') {
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      if (studentsCount >= 50) {
        throw new Error('CORE_LIMIT_STUDENTS_EXCEEDED');
      }
    }
  };
  ```
- [ ] Appliquer dans formulaires inscription élève

#### Étape 1.3: Tests Core
- [ ] Tester inscription 50 élèves max
- [ ] Tester création 1 classe max
- [ ] Tester notes simples (sans bulletins)
- [ ] Tester que apps payantes sont bloquées

---

### Phase 2: App Académique (Semaine 5-7)

#### Étape 2.1: Créer Structure
```
src/modules/academic/
├── routes.jsx
├── components/
│   ├── (migrer fichiers existants)
│   └── (créer nouveaux si besoin)
├── services/
│   ├── gradeService.js ✅
│   ├── documentService.js ✅
│   ├── pdfGenerator.js ✅
│   └── assignmentService.js (nouveau)
├── hooks/
│   └── useGrades.js (nouveau)
└── pages/
    ├── NotesPage.jsx (nouveau)
    ├── BulletinsPage.jsx (nouveau)
    └── AssignmentsPage.jsx (nouveau)
```

#### Étape 2.2: Migrer Composants
- [ ] Copier `GradeEntryPanel.jsx` → `modules/academic/components/`
- [ ] Copier `GradesSummaryPanel.jsx`
- [ ] Copier `ReportCard.jsx`
- [ ] Copier `ConductPanel.jsx`
- [ ] Copier `DocumentManager.jsx`
- [ ] Copier `AssignmentList.jsx`
- [ ] Adapter imports relatifs

#### Étape 2.3: Créer Routes Protégées
```javascript
// src/modules/academic/routes.jsx
import { ProtectedRoute } from '../../components/ProtectedRoute';

export const AcademicRoutes = () => (
  <ProtectedRoute appId="academic">
    <Routes>
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/notes/entry" element={<GradeEntryPage />} />
      <Route path="/bulletins" element={<BulletinsPage />} />
      <Route path="/assignments" element={<AssignmentsPage />} />
    </Routes>
  </ProtectedRoute>
);
```

#### Étape 2.4: Intégrer dans Routes Principales
```javascript
// src/Routes.jsx
import { AcademicRoutes } from './modules/academic/routes';

function Routes() {
  return (
    <Routes>
      {/* ... routes core ... */}
      <Route path="/academic/*" element={<AcademicRoutes />} />
    </Routes>
  );
}
```

#### Étape 2.5: Tests
- [ ] Tester accès bloqué si app non active
- [ ] Tester modal upgrade apparaît
- [ ] Activer app en DB → tester accès OK
- [ ] Tester toutes fonctionnalités (notes, bulletins, devoirs)

---

### Phase 3: App Financière (Semaine 8-10)

**Identique à Phase 2 mais pour App Financière**

#### Étape 3.1: Structure
```
src/modules/financial/
├── routes.jsx
├── components/
│   ├── PaymentTab.jsx ✅
│   ├── ReceiptModal.jsx ✅
│   └── ...
├── services/
│   ├── paymentService.js ✅
│   └── receiptService.js (extraire)
└── pages/
    ├── PaymentsPage.jsx (nouveau)
    └── FinancialStatsPage.jsx (nouveau)
```

#### Étape 3.2-3.5: Idem Phase 2

---

### Phase 4: App Discipline (Semaine 11-13)

**Idem Phase 2-3**

---

### Phase 5: App Planning (Semaine 14-18)

⚠️ **ATTENTION:** Cette phase est la plus longue car 70% nouveau code (générateur automatique)

#### Étape 5.1: Développer Générateur
- [ ] Algorithme contraintes (2 semaines)
- [ ] Interface générateur (1 semaine)
- [ ] Tests optimisation (1 semaine)

---

### Phase 6: App Communication (Semaine 19-21)

**Idem précédentes + consolidation SMS/Email**

---

### Phase 7: App Reporting (Semaine 22-25)

**Idem + création builder rapports (complexe)**

---

### Phase 8: App RH (Semaine 26-29)

**Idem + création module paie (complexe)**

---

### Phase 9: App Store UI (Semaine 30-32)

#### Étape 9.1: Page App Store
- [ ] Liste apps disponibles
- [ ] Cartes apps (prix, features, démo)
- [ ] Filtres (catégorie, prix)
- [ ] Recherche

#### Étape 9.2: Page Mes Apps
- [ ] Apps installées
- [ ] Statut (actif/trial/expiré)
- [ ] Gérer abonnement
- [ ] Statistiques usage

#### Étape 9.3: Checkout
- [ ] Sélection app ou bundle
- [ ] Méthodes paiement (Mobile Money, virement)
- [ ] Confirmation
- [ ] Activation automatique

---

### Phase 10: Admin Panel (Semaine 33-35)

#### Étape 10.1: Super-Admin Interface
- [ ] Gestion écoles
- [ ] Activation/désactivation apps par école
- [ ] Historique abonnements
- [ ] Analytics global

#### Étape 10.2: Billing
- [ ] Factures automatiques
- [ ] Rappels renouvellement
- [ ] Historique paiements

---

### Phase 11: Testing & Deployment (Semaine 36-38)

#### Étape 11.1: Tests Globaux
- [ ] 10 écoles pilotes
- [ ] Scénarios d'usage complets
- [ ] Performance (charge)
- [ ] Sécurité (pentests)

#### Étape 11.2: Documentation
- [ ] Guide utilisateur par app
- [ ] Vidéos formation
- [ ] FAQ
- [ ] Support

#### Étape 11.3: Launch
- [ ] Migration données existantes
- [ ] Campagne marketing
- [ ] Monitoring production

---

## 📊 RÉSUMÉ GLOBAL

### Répartition Code Existant vs Nouveau

| App | Existant | Nouveau | Effort Migration | Effort Création | Total Effort |
|-----|----------|---------|------------------|-----------------|--------------|
| **CORE** | 80% | 20% | 2 semaines | 1 semaine | 3 semaines |
| **Académique** | 75% | 25% | 2 semaines | 1 semaine | 3 semaines |
| **Financière** | 70% | 30% | 2 semaines | 1 semaine | 3 semaines |
| **Discipline** | 60% | 40% | 2 semaines | 2 semaines | 4 semaines |
| **Planning** | 30% | 70% | 1 semaine | 4 semaines | 5 semaines |
| **Communication** | 40% | 60% | 1 semaine | 2 semaines | 3 semaines |
| **Reporting** | 30% | 70% | 1 semaine | 3 semaines | 4 semaines |
| **RH** | 30% | 70% | 1 semaine | 3 semaines | 4 semaines |
| **App Store** | 0% | 100% | 0 | 3 semaines | 3 semaines |
| **Admin Panel** | 20% | 80% | 0 | 3 semaines | 3 semaines |
| **TOTAL** | - | - | 12 semaines | 23 semaines | **35 semaines** |

### Statistiques Finales

**Code Existant:**
- ✅ **Utilisable directement**: ~45%
- ⚠️ **Utilisable avec modifications**: ~25%
- ❌ **À créer**: ~30%

**Fonctionnalités:**
- ✅ **Implémentées et prêtes**: 156 fonctionnalités
- ⚠️ **Partiellement implémentées**: 48 fonctionnalités
- ❌ **À créer**: 89 fonctionnalités

**Tables Supabase:**
- ✅ **Existantes**: ~35 tables
- ❌ **À créer**: ~20 tables

**Effort Total Estimé:**
- **Migration**: 12 semaines
- **Création nouveau**: 23 semaines
- **Total**: **35 semaines** (~8-9 mois avec 1 développeur)

---

## ✅ RECOMMANDATIONS FINALES

### 1. Priorités
**Ordre de développement recommandé:**
1. ✅ CORE (P0 - Critique)
2. ✅ App Académique (P1 - Revenue driver)
3. ✅ App Financière (P1 - Revenue driver)
4. ✅ App Discipline (P1 - Différenciateur)
5. ⚠️ App Communication (P2 - Peut attendre)
6. ⚠️ App Planning (P2 - Complexe, peut attendre)
7. ⚠️ App Reporting (P2 - Nice to have)
8. ⚠️ App RH (P3 - Marché restreint)

### 2. Approche Agile
- Développer par sprints de 2 semaines
- Livrer 1 app tous les 2-3 mois
- Tester avec écoles pilotes après chaque app

### 3. Données Existantes
- Migration zéro perte de données
- Scripts de migration fournis
- Backup complet avant migration

### 4. Formation Utilisateurs
- Vidéos par app (5-10 min)
- Documentation PDF imprimable
- Support WhatsApp pendant transition

---

**Document créé le 31 décembre 2025**
**EduTrack CM - Mapping Fonctionnalités v1.0**
**Auteur: Équipe Technique EduTrack**
