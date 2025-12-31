# 🏗️ ARCHITECTURE MODULAIRE EDUTRACK CM
## Le Système de Gestion Scolaire Évolutif et Adaptable

---

## 📋 TABLE DES MATIÈRES

1. [Vision et Philosophie](#vision-et-philosophie)
2. [Différenciation Marché](#différenciation-marché)
3. [Architecture Technique](#architecture-technique)
4. [Catalogue des Applications](#catalogue-des-applications)
5. [Stratégie de Pricing](#stratégie-de-pricing)
6. [Expérience Utilisateur](#expérience-utilisateur)
7. [Implémentation Technique](#implémentation-technique)
8. [Migration Progressive](#migration-progressive)
9. [Roadmap de Développement](#roadmap-de-développement)
10. [Analyse Concurrentielle](#analyse-concurrentielle)

---

## 🎯 VISION ET PHILOSOPHIE

### Le Problème Actuel

**Observation du marché camerounais:**
- Les systèmes de gestion scolaire existants sont **monolithiques** et **rigides**
- Prix élevé (150 000 - 500 000 FCFA/an) pour des fonctionnalités souvent inutilisées
- Formation complexe (2-4 semaines) qui freine l'adoption
- Migration "tout ou rien" qui force les écoles à abandonner leurs systèmes existants
- Résultat: **80% des écoles restent au papier/Excel** malgré les solutions disponibles

### Notre Réponse: Le Modèle Odoo Éducatif

> **"Commencez petit, grandissez à votre rythme"**

EduTrack CM adopte une architecture modulaire inspirée d'Odoo, permettant aux établissements scolaires de:

✅ **Adopter progressivement** - Installer uniquement les modules nécessaires
✅ **Payer selon l'usage** - Coût adapté aux besoins réels
✅ **Coexister avec l'existant** - Migration douce sans rupture brutale
✅ **Évoluer à son rythme** - Ajouter des modules quand l'école est prête
✅ **Tester sans risque** - Version gratuite + 30 jours d'essai sur toutes les apps

### Principes Fondamentaux

1. **Modularité**: Chaque application = module indépendant et fonctionnel
2. **Interopérabilité**: Les modules communiquent entre eux mais fonctionnent seuls
3. **Progressivité**: Adoption par étapes, pas de "big bang"
4. **Accessibilité**: Version gratuite fonctionnelle pour toujours
5. **Flexibilité**: À la carte OU bundles prédéfinis selon préférence

---

## 🌊 DIFFÉRENCIATION MARCHÉ

### Tableau Comparatif

| Critère | Concurrents Actuels | EduTrack CM Modulaire |
|---------|---------------------|----------------------|
| **Modèle** | Monolithique "tout ou rien" | Modulaire "à la carte" |
| **Prix d'entrée** | 150 000 - 500 000 FCFA | 0 FCFA (gratuit jusqu'à 50 élèves) |
| **Migration** | Brutale, remplacement total | Progressive, coexistence possible |
| **Formation** | 2-4 semaines complètes | Module par module (2-3 jours max) |
| **Évolution** | Abonnement fixe annuel | Pay-as-you-grow |
| **Flexibilité** | Aucune, package figé | Totale, composition libre |
| **Risque** | Élevé (gros investissement) | Faible (test gratuit) |
| **Adoption** | Lente, résistance forte | Rapide, adoption naturelle |

### Avantages Compétitifs

#### 1. **Barrière d'entrée quasi-nulle**
```
Concurrent:
"Payez 200 000 FCFA pour l'année, formation 2 semaines"
→ Directeur: "Trop cher, trop compliqué, on reste au papier"

EduTrack CM:
"Testez GRATUITEMENT avec 50 élèves, ajoutez ce que vous voulez plus tard"
→ Directeur: "Ok, essayons les notes d'abord"
```

#### 2. **Migration sans risque**
- École garde son ancien système de paiements Excel
- Active uniquement module Notes EduTrack
- Teste 3 mois
- Si satisfait, migre progressivement les paiements
- **Zéro rupture de service**

#### 3. **Pricing psychologique**
```
Concurrent: "Package complet 300 000 FCFA"
→ Perception: "Trop cher pour ce qu'on utilise"

EduTrack CM: "App Notes 15 000 FCFA/an"
→ Perception: "Raisonnable, je paye ce que j'utilise"
```

#### 4. **Effet de réseau freemium**
- 1000 écoles gratuites = marketing viral
- Bouche-à-oreille positif
- Upsell naturel ("on veut les paiements aussi!")
- Marketplace d'apps tiers (futur)

### Positionnement Stratégique

```
         Complexité
             ↑
             |
   Systèmes  |                    Systèmes
   Papier/   |                    Entreprise
   Excel     |  [EDUTRACK CM]    (SAP Edu)
             |        ★
             |
     ←───────┼────────────────→
      Prix   |              Prix
      Bas    |              Élevé
             |
```

**EduTrack CM = Sweet Spot:**
- Simplicité du papier/Excel
- Puissance des systèmes professionnels
- Prix accessible
- Adoption progressive

---

## 🏛️ ARCHITECTURE TECHNIQUE

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    EDUTRACK CM PLATFORM                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           🆓 CORE (Gratuit - Toujours Actif)         │   │
│  │  • Dashboard de base                                  │   │
│  │  • Gestion utilisateurs (5 profs max)                │   │
│  │  • 1 classe, 50 élèves                               │   │
│  │  • Profil école                                       │   │
│  │  • Notes simples                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │📚 APP 1   │  │💰 APP 2   │  │⏰ APP 3   │  │📅 APP 4  │ │
│  │Académique │  │Financière │  │Discipline │  │Planning  │ │
│  │15k/an     │  │20k/an     │  │10k/an     │  │12k/an    │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐                │
│  │📧 APP 5   │  │📊 APP 6   │  │👥 APP 7   │                │
│  │Communic.  │  │Reporting  │  │RH         │                │
│  │8k/an      │  │15k/an     │  │18k/an     │                │
│  └───────────┘  └───────────┘  └───────────┘                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE                             │
│  • Supabase (PostgreSQL + Auth + Storage)                   │
│  • React 18 + Vite                                           │
│  • Feature Flags System                                      │
│  • Module Registry                                           │
│  • Dynamic Route Loading                                     │
└─────────────────────────────────────────────────────────────┘
```

### Principes Architecturaux

#### 1. **Isolation des Modules**
Chaque application est un module autonome avec:
- Ses propres routes (`/notes/*`, `/payments/*`)
- Ses propres composants React
- Ses propres tables Supabase (avec RLS)
- Ses propres services/API
- Pas de dépendances fortes (max 1 dépendance)

#### 2. **Activation Dynamique**
```javascript
// Vérification d'accès à la volée
const { hasAccess } = useAppAccess('academic');

if (hasAccess) {
  // Afficher fonctionnalité
} else {
  // Afficher upgrade prompt
}
```

#### 3. **Lazy Loading**
```javascript
// Chargement des apps uniquement si activées
const AcademicModule = lazy(() =>
  school.hasApp('academic')
    ? import('./modules/academic')
    : Promise.resolve({ default: UpgradePrompt })
);
```

#### 4. **Système de Permissions Granulaire**
```sql
-- RLS Supabase conditionnel par app
CREATE POLICY "Users access notes if academic app active"
  ON grades FOR SELECT
  USING (
    get_user_school_id() = school_id
    AND has_active_app(get_user_school_id(), 'academic')
  );
```

---

## 📦 CATALOGUE DES APPLICATIONS

### 🆓 MODULE CORE (Gratuit à Vie)

**Toujours inclus, toujours actif**

#### Fonctionnalités
- ✅ Dashboard de base avec statistiques simples
- ✅ Gestion de 1 classe maximum
- ✅ Jusqu'à 50 élèves
- ✅ Jusqu'à 5 enseignants
- ✅ Notes simples (sans bulletins auto)
- ✅ Profil école et paramètres de base
- ✅ 3 utilisateurs (directeur + 2 enseignants)

#### Limitations
- ❌ Pas de bulletins automatiques
- ❌ Pas de statistiques avancées
- ❌ Pas d'exports PDF
- ❌ Pas de notifications
- ❌ Support communautaire uniquement

#### Objectif Stratégique
- **Acquisition**: Permettre test sans engagement
- **Activation**: Démontrer valeur rapidement
- **Conversion**: Inciter upgrade naturel quand limites atteintes

---

### 📚 APP 1: GESTION ACADÉMIQUE

**Prix: 15 000 FCFA/an** | **Catégorie: Pédagogie**

#### Description
Module complet pour la gestion des notes, moyennes, classements et bulletins automatisés.

#### Fonctionnalités Clés
✅ **Notes illimitées**
- Saisie par matière, trimestre, semestre
- Notes sur 20, coefficients personnalisables
- Appréciation par matière
- Historique complet

✅ **Bulletins automatiques**
- Génération instantanée PDF
- Template personnalisable (logo école)
- Signature numérique directeur
- Envoi automatique par email/WhatsApp

✅ **Moyennes & Classements**
- Calcul automatique moyennes générales
- Classement par classe/niveau
- Mention (TB, B, AB, Passable)
- Évolution trimestre/trimestre

✅ **Statistiques académiques**
- Taux de réussite par classe
- Matières en difficulté
- Top 10 élèves
- Graphiques d'évolution

✅ **Exports**
- Export Excel notes
- Export PDF bulletins groupés
- Export PDF relevés de notes
- Format ministère (MINESEC)

#### Cas d'Usage
> **École Primaire Saint-Jean (120 élèves, 6 classes)**
> - Utilise uniquement cette app
> - Saisie notes sur tablette
> - Génère bulletins en 2 clics
> - Économise 3 jours/trimestre
> - Coût: 15 000 FCFA/an au lieu de 200 000 FCFA système complet

#### Dépendances
Aucune (autonome)

#### Routes
- `/notes` - Saisie notes
- `/bulletins` - Génération bulletins
- `/statistics/academic` - Statistiques
- `/rankings` - Classements

---

### 💰 APP 2: GESTION FINANCIÈRE

**Prix: 20 000 FCFA/an** | **Catégorie: Administration**

#### Description
Module complet pour gérer paiements, frais de scolarité, reçus et relances automatiques.

#### Fonctionnalités Clés
✅ **Gestion des paiements**
- Enregistrement paiements (espèces, virement, Mobile Money)
- Échéanciers personnalisés par élève
- Paiements partiels
- Historique complet

✅ **Reçus automatiques**
- Génération instantanée PDF
- Numérotation automatique
- Signature numérique
- Envoi SMS/Email/WhatsApp

✅ **Relances paiements**
- Relances automatiques parents
- SMS/Email/WhatsApp selon préférence
- Planning relances configurable
- Suivi relances effectuées

✅ **Statistiques financières**
- Revenus par mois/trimestre
- Taux de recouvrement
- Élèves en retard de paiement
- Prévisions de trésorerie
- Graphiques évolution

✅ **Exports comptables**
- Journal des encaissements
- État des créances
- Export comptabilité (Excel)
- Rapports pour DAF

#### Cas d'Usage
> **Collège Bilingue Elite (350 élèves)**
> - Active App Financière + Académique
> - Fini les reçus papier perdus
> - Relances auto par WhatsApp
> - Taux recouvrement +35%
> - Coût: 35 000 FCFA/an (au lieu de 300 000 FCFA)

#### Dépendances
Aucune (autonome)

#### Routes
- `/payments` - Enregistrer paiements
- `/receipts` - Reçus
- `/payment-reminders` - Relances
- `/financial-stats` - Statistiques
- `/accounting-exports` - Exports

---

### ⏰ APP 3: DISCIPLINE & ABSENCES

**Prix: 10 000 FCFA/an** | **Catégorie: Administration**

#### Description
Module de gestion des absences, retards, sanctions et notifications parents.

#### Fonctionnalités Clés
✅ **Pointage absences**
- Pointage quotidien rapide
- Motifs d'absence (maladie, autorisation, injustifiée)
- Justificatifs numérisés
- Historique élève

✅ **Gestion retards**
- Heure d'arrivée
- Fréquence retards
- Alertes parents récurrents

✅ **Sanctions disciplinaires**
- Types sanctions (avertissement, exclusion, etc.)
- Conseil de discipline
- Historique complet
- Statistiques comportement

✅ **Notifications parents**
- SMS/Email/WhatsApp automatique
- "Votre enfant absent aujourd'hui"
- "Retard 3ème fois cette semaine"
- Confirmation lecture parent

✅ **Rapports d'assiduité**
- Taux de présence par élève/classe
- Absentéisme chronique
- Export ministère
- Graphiques évolution

#### Cas d'Usage
> **Lycée Technique Moderne (600 élèves)**
> - Pointage tablette en 5 min/classe
> - Parents notifiés en temps réel
> - Détection absentéisme précoce
> - Économie: 2h/jour secrétariat
> - Coût: 10 000 FCFA/an

#### Dépendances
Aucune (autonome)

#### Routes
- `/attendance` - Pointage
- `/tardiness` - Retards
- `/sanctions` - Discipline
- `/attendance-reports` - Rapports

---

### 📅 APP 4: EMPLOIS DU TEMPS

**Prix: 12 000 FCFA/an** | **Catégorie: Pédagogie**

#### Description
Génération intelligente d'emplois du temps, gestion salles, détection conflits.

#### Fonctionnalités Clés
✅ **Générateur automatique**
- Algorithme optimisation
- Respect contraintes profs
- Équilibrage charge horaire
- Planning en 10 minutes

✅ **Gestion des salles**
- Disponibilité salles
- Capacité (nb élèves)
- Équipements (labo, vidéoproj)
- Réservations

✅ **Détection conflits**
- Prof en double
- Salle occupée
- Classe surchargée
- Alerte temps réel

✅ **Personnalisation**
- Plages horaires configurables
- Pauses, récréations
- Jours spéciaux
- Template par niveau

✅ **Exports**
- PDF par classe
- PDF par prof
- PDF par salle
- Affichage mural

#### Cas d'Usage
> **Collège d'Enseignement Général (12 classes)**
> - Planning fait en 15 min (vs 3 jours avant)
> - Zéro conflit
> - Modification rapide en cours d'année
> - Coût: 12 000 FCFA/an

#### Dépendances
Aucune (autonome)

#### Routes
- `/schedules/generator` - Génération
- `/schedules/rooms` - Salles
- `/schedules/conflicts` - Conflits
- `/schedules/export` - Exports

---

### 📧 APP 5: COMMUNICATION

**Prix: 8 000 FCFA/an** | **Catégorie: Communication**

#### Description
Messagerie interne, SMS groupés, notifications push, annonces.

#### Fonctionnalités Clés
✅ **SMS groupés**
- Envoi masse (classe, niveau, tous)
- 500 SMS/mois inclus
- Templates prédéfinis
- Historique envois

✅ **Notifications push**
- App mobile parents
- Alertes temps réel
- Accords lecture
- Rappels automatiques

✅ **Messagerie interne**
- Chat prof ↔ parents
- Chat direction ↔ profs
- Pièces jointes
- Archivage conversations

✅ **Annonces**
- Tableau d'affichage digital
- Événements (réunions, examens)
- Communiqués officiels
- Calendrier partagé

✅ **Statistiques**
- Taux de lecture messages
- Parents non joignables
- Canaux préférés
- Engagement

#### Cas d'Usage
> **École Maternelle & Primaire (200 élèves)**
> - Fini les papiers perdus dans sacs
> - Parents informés en temps réel
> - Réunions: taux présence +40%
> - Coût: 8 000 FCFA/an + SMS

#### Dépendances
Aucune (autonome)

#### Crédits Inclus
- 500 SMS/mois gratuits
- SMS supplémentaires: 15 FCFA/SMS

#### Routes
- `/messages` - Messagerie
- `/sms` - Envoi SMS
- `/announcements` - Annonces
- `/notifications` - Notifications

---

### 📊 APP 6: REPORTING AVANCÉ

**Prix: 15 000 FCFA/an** | **Catégorie: Analytics**

#### Description
Statistiques avancées, tableaux de bord analytics, exports ministère, prédictions IA.

#### Fonctionnalités Clés
✅ **Analytics avancées**
- Tableaux de bord interactifs
- KPIs éducatifs (taux réussite, abandon)
- Segmentation (genre, âge, niveau social)
- Analyse tendances

✅ **Exports ministère**
- Format MINESEC standardisé
- Statistiques annuelles
- Rapports trimestriels
- Déclarations officielles

✅ **Rapports personnalisés**
- Builder visuel de rapports
- Filtres avancés
- Planification envois automatiques
- Partage sécurisé

✅ **Prédictions IA** (Futur)
- Risque d'échec élève
- Prévision effectifs année prochaine
- Optimisation ressources
- Recommandations pédagogiques

✅ **Visualisations**
- Graphiques interactifs
- Cartes de chaleur
- Évolutions temporelles
- Comparaisons multi-écoles (anonymisées)

#### Cas d'Usage
> **Réseau d'Écoles (3 établissements, 800 élèves)**
> - Pilotage par la data
> - Décisions basées sur statistiques
> - Rapports ministère en 1 clic
> - Coût: 15 000 FCFA/an

#### Dépendances
Requiert: **App Académique** (pour données de base)

#### Routes
- `/analytics` - Tableaux de bord
- `/reports/builder` - Créateur rapports
- `/reports/ministry` - Exports officiels
- `/predictions` - IA & prédictions

---

### 👥 APP 7: RESSOURCES HUMAINES

**Prix: 18 000 FCFA/an** | **Catégorie: Administration**

#### Description
Gestion complète du personnel enseignant et administratif.

#### Fonctionnalités Clés
✅ **Gestion enseignants**
- Dossiers complets profs
- Matières enseignées
- Niveaux assignés
- Charge horaire
- Disponibilités

✅ **Contrats & Documents**
- Contrats de travail numérisés
- Renouvellements
- Avenants
- Archivage sécurisé

✅ **Gestion salaires**
- Grilles salariales
- Calcul paie mensuelle
- Retenues (CNPS, impôts)
- Bulletins de paie PDF
- Historique paiements

✅ **Évaluations**
- Fiches d'évaluation
- Inspection classes
- Performance pédagogique
- Plans de formation
- Évolution carrière

✅ **Emploi du temps profs**
- Intégration App Planning
- Vue prof individuelle
- Heures supplémentaires
- Remplacements

#### Cas d'Usage
> **Lycée Privé (45 enseignants)**
> - Paie automatisée
> - Bulletins paie envoyés par email
> - Suivi évaluations
> - Base documentaire sécurisée
> - Coût: 18 000 FCFA/an

#### Dépendances
Recommandé: **App Emplois du Temps** (pour intégration planning)

#### Routes
- `/teachers` - Gestion profs
- `/hr/contracts` - Contrats
- `/hr/salaries` - Salaires
- `/hr/evaluations` - Évaluations

---

## 💎 STRATÉGIE DE PRICING

### Modèle de Tarification

#### 1. **Apps Individuelles (À la Carte)**

| Application | Prix Annuel | Prix Mensuel | Économie |
|-------------|-------------|--------------|----------|
| 📚 Académique | 15 000 FCFA | 1 500 FCFA | 3 000 FCFA |
| 💰 Financière | 20 000 FCFA | 2 000 FCFA | 4 000 FCFA |
| ⏰ Discipline | 10 000 FCFA | 1 200 FCFA | 4 400 FCFA |
| 📅 Planning | 12 000 FCFA | 1 200 FCFA | 2 400 FCFA |
| 📧 Communication | 8 000 FCFA | 1 000 FCFA | 4 000 FCFA |
| 📊 Reporting | 15 000 FCFA | 1 500 FCFA | 3 000 FCFA |
| 👥 RH | 18 000 FCFA | 1 800 FCFA | 3 600 FCFA |

**Total à la carte: 98 000 FCFA/an**

#### 2. **Bundles Prédéfinis (Recommandé)**

##### 📦 BUNDLE STARTER
**Prix: 25 000 FCFA/an** (au lieu de 35 000 FCFA)
**Économie: 10 000 FCFA (29%)**

**Inclus:**
- ✅ App Académique (15 000)
- ✅ App Discipline (10 000)
- ✅ Support email prioritaire

**Recommandé pour:**
- Écoles primaires
- Petites structures (< 200 élèves)
- Premier usage système numérique

**Cas d'usage:**
> "Je veux digitaliser notes et absences uniquement"

---

##### 💼 BUNDLE STANDARD
**Prix: 50 000 FCFA/an** (au lieu de 65 000 FCFA)
**Économie: 15 000 FCFA (23%)**

**Inclus:**
- ✅ App Académique (15 000)
- ✅ App Discipline (10 000)
- ✅ App Financière (20 000)
- ✅ App Communication (8 000)
- ✅ Support prioritaire + formation vidéo
- ✅ 1000 SMS/mois inclus

**Recommandé pour:**
- Collèges & lycées
- Structures moyennes (200-500 élèves)
- Gestion complète élèves

**Cas d'usage:**
> "Je veux gérer notes, absences, paiements et communiquer avec parents"

---

##### 🚀 BUNDLE PREMIUM
**Prix: 80 000 FCFA/an** (au lieu de 98 000 FCFA)
**Économie: 18 000 FCFA (18%)**

**Inclus:**
- ✅ **TOUTES les applications** (7 apps)
- ✅ Support prioritaire téléphone
- ✅ Formation sur site (1 journée)
- ✅ 2000 SMS/mois inclus
- ✅ Personnalisation logo/couleurs
- ✅ Backup quotidien garanti

**Recommandé pour:**
- Grands établissements (> 500 élèves)
- Réseaux d'écoles
- Gestion professionnelle complète

**Cas d'usage:**
> "Je veux la solution complète clé en main"

---

#### 3. **Version Gratuite (Freemium)**

**Prix: 0 FCFA à VIE**

**Limitations:**
- 🔒 Maximum 50 élèves
- 🔒 1 classe uniquement
- 🔒 5 enseignants max
- 🔒 3 utilisateurs système
- 🔒 Notes simples (pas bulletins auto)
- 🔒 Pas d'exports PDF
- 🔒 Support communautaire uniquement
- 🔒 Logo EduTrack sur bulletins

**Inclus:**
- ✅ Dashboard de base
- ✅ Gestion élèves
- ✅ Saisie notes manuelles
- ✅ Profil école
- ✅ Mises à jour sécurité

**Objectif:**
- Acquisition massive (objectif 1000 écoles)
- Test sans risque
- Conversion naturelle (upgrade quand >50 élèves)

---

### Pricing Psychologique

#### Stratégies Appliquées

**1. Ancrage Prix**
```
❌ Mauvais: "Bundle Standard: 50 000 FCFA"

✅ Bon:
"Bundle Standard: 50 000 FCFA/an
Prix normal à la carte: 65 000 FCFA
👉 ÉCONOMISEZ 15 000 FCFA"
```

**2. Déclinaison Mensuelle**
```
"App Académique:
• 15 000 FCFA/an (économisez 3 000 FCFA)
• OU 1 500 FCFA/mois (sans engagement)"
```

**3. Comparaison Compétitive**
```
"Systèmes traditionnels: 200 000 - 500 000 FCFA/an
EduTrack Bundle Premium: 80 000 FCFA/an
👉 ÉCONOMIE: jusqu'à 420 000 FCFA"
```

**4. Essai Gratuit**
```
"TOUTES LES APPS: 30 JOURS GRATUITS
Testez sans carte bancaire
Annulez quand vous voulez"
```

---

### Tableau Comparatif Besoins

| Type École | Effectif | Bundle Recommandé | Prix/an | Prix/élève/an |
|------------|----------|-------------------|---------|---------------|
| Maternelle | 30-80 | Gratuit ou Starter | 0-25k | 0-312 FCFA |
| Primaire | 100-250 | Starter ou Standard | 25-50k | 200-250 FCFA |
| Collège | 200-500 | Standard | 50k | 100-250 FCFA |
| Lycée | 400-800 | Standard ou Premium | 50-80k | 100-200 FCFA |
| Réseau (multi-sites) | 800+ | Premium | 80k | <100 FCFA |

**Observation:** Plus l'école est grande, plus le coût par élève diminue (économie d'échelle)

---

### Stratégie de Conversion Freemium

#### Parcours Utilisateur Typique

```
Jour 0: Inscription gratuite
├─> Onboarding interactif
├─> Import 1 classe (50 élèves max)
└─> Tutoriel notes simples

Semaine 1-2: Utilisation gratuite
├─> Saisie notes
├─> Familiarisation interface
└─> Notification: "Bulletins auto disponibles en Starter"

Mois 1: Atteinte limites?
├─> Si <50 élèves: continuer gratuit ✅
└─> Si >50 élèves:
    ├─> Popup: "Passez à Starter pour élèves illimités"
    ├─> 30 jours d'essai GRATUIT
    └─> Conversion: ~40%

Mois 2-3: Valeur démontrée
├─> École satisfaite
├─> Upsell: "Ajoutez App Financière?" (essai gratuit)
└─> Cross-sell: "Bundle Standard = meilleur prix"

Mois 6: Client établi
├─> Usage régulier 2-3 apps
├─> Proposition upgrade Premium (économie 18k)
└─> Conversion Premium: ~15%
```

#### Triggers de Conversion

**Automatiques:**
1. **Limite élèves** → "Upgrade pour élèves illimités"
2. **Limite classes** → "Passez à Starter"
3. **Tentative export PDF** → "Exports disponibles en Starter"
4. **3ème utilisateur** → "Utilisateurs illimités en Starter"

**Opportunistes:**
- Rentrée scolaire (septembre)
- Fin trimestre (génération bulletins)
- Période paiements (frais inscription)

---

## 🎨 EXPÉRIENCE UTILISATEUR

### App Store Interface

#### Page Principale

```
╔═══════════════════════════════════════════════════════════╗
║                    🏪 APP STORE EDUTRACK                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  [Rechercher une app...]                    [Mes Apps: 2] ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  📦 BUNDLES RECOMMANDÉS                            │   ║
║  ├────────────────────────────────────────────────────┤   ║
║  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │   ║
║  │  │ STARTER  │  │ STANDARD │  │ PREMIUM  │         │   ║
║  │  │ 25k/an   │  │ 50k/an ★ │  │ 80k/an   │         │   ║
║  │  │ Éco 10k  │  │ Éco 15k  │  │ Éco 18k  │         │   ║
║  │  └──────────┘  └──────────┘  └──────────┘         │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │  ✅ MES APPLICATIONS (2)                           │   ║
║  ├────────────────────────────────────────────────────┤   ║
║  │  📚 Académique     💰 Financière                   │   ║
║  │  [Gérer] [Stats]  [Gérer] [Stats]                 │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  📚 PÉDAGOGIE                                              ║
║  ┌───────────┐  ┌───────────┐                            ║
║  │📚 Académi │  │📅 Planning│  [+ App verrouillée]       ║
║  │✓ Installé │  │12k/an     │                            ║
║  └───────────┘  └───────────┘                            ║
║                                                            ║
║  💼 ADMINISTRATION                                         ║
║  ┌───────────┐  ┌───────────┐  ┌───────────┐            ║
║  │💰 Financ. │  │⏰ Discipli│  │👥 RH      │            ║
║  │✓ Installé │  │10k/an     │  │18k/an 🔒  │            ║
║  └───────────┘  └───────────┘  └───────────┘            ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

#### Carte Application (Non Installée)

```
┌─────────────────────────────────────┐
│  📅                        [🔒 Pro] │
│  EMPLOIS DU TEMPS                   │
│                                      │
│  Génération automatique, gestion    │
│  salles, détection conflits         │
│                                      │
│  ✓ Algorithme optimisation          │
│  ✓ Respect contraintes profs        │
│  ✓ Exports PDF classe/prof          │
│                                      │
│  ┌──────────────────────────────┐  │
│  │ 12 000 FCFA/an               │  │
│  │ ou 1 200 FCFA/mois           │  │
│  └──────────────────────────────┘  │
│                                      │
│  [Essai Gratuit 30j] [Plus d'info] │
└─────────────────────────────────────┘
```

#### Carte Application (Installée)

```
┌─────────────────────────────────────┐
│  📚                     [✓ Active]  │
│  GESTION ACADÉMIQUE                 │
│                                      │
│  Notes, bulletins, moyennes auto    │
│                                      │
│  📊 Utilisée 47 fois ce mois        │
│  📅 Expire le 15/09/2026            │
│  💳 Renouvellement auto: OUI        │
│                                      │
│  [Gérer] [Voir Statistiques]       │
└─────────────────────────────────────┘
```

### Dashboard Adaptatif

#### Utilisateur Gratuit (0 Apps)

```
╔═══════════════════════════════════════════════════════════╗
║  📊 DASHBOARD                              [🆓 Gratuit]   ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  👋 Bienvenue Directeur KAMGA                             ║
║  École Primaire Bilingue Excellence                       ║
║                                                            ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐               ║
║  │ 1/1      │  │ 35/50    │  │ 3/5      │               ║
║  │ Classes  │  │ Élèves   │  │ Profs    │               ║
║  └──────────┘  └──────────┘  └──────────┘               ║
║                                                            ║
║  ⚠️ LIMITATIONS VERSION GRATUITE:                         ║
║  • Maximum 50 élèves (35/50 utilisés)                    ║
║  • 1 classe uniquement                                    ║
║  • Pas de bulletins automatiques                          ║
║                                                            ║
║  💡 [PASSEZ À STARTER] pour débloquer:                    ║
║     ✓ Élèves illimités                                    ║
║     ✓ Classes illimitées                                  ║
║     ✓ Bulletins auto PDF                                  ║
║     → 25 000 FCFA/an • Essai 30j gratuit                 ║
║                                                            ║
║  📚 Découvrez nos apps dans l'App Store →                 ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

#### Utilisateur Starter (2 Apps)

```
╔═══════════════════════════════════════════════════════════╗
║  📊 DASHBOARD                           [📦 Bundle STARTER] ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ ║
║  │ 6        │  │ 145      │  │ 12       │  │ 98%      │ ║
║  │ Classes  │  │ Élèves   │  │ Profs    │  │ Présence │ ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘ ║
║                                                            ║
║  📚 ACADÉMIQUE                                            ║
║  • 23 bulletins générés ce mois                           ║
║  • Moyenne générale: 12.5/20                              ║
║  • Top élève: NKOLO Marie (16.8/20)                      ║
║  [Voir détails →]                                         ║
║                                                            ║
║  ⏰ DISCIPLINE                                             ║
║  • Taux présence: 98% (↗ +2% vs mois dernier)           ║
║  • 3 élèves absents aujourd'hui                           ║
║  • 7 retards cette semaine                                ║
║  [Pointage →]                                             ║
║                                                            ║
║  💡 UPGRADE SUGGÉRÉ:                                      ║
║  📦 Bundle STANDARD (50k/an) ajoute:                      ║
║     💰 Gestion Paiements (fini Excel!)                    ║
║     📧 Communication Parents (SMS auto)                   ║
║     → Essai gratuit 30j • Économie 15k                   ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

#### Utilisateur Premium (Toutes Apps)

```
╔═══════════════════════════════════════════════════════════╗
║  📊 DASHBOARD VIP                    [🚀 Bundle PREMIUM]  ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │  📈 ANALYTICS AVANCÉES                              │ ║
║  │  [Graphiques interactifs taux réussite, revenus...] │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ║
║  │ 📚   │ │ 💰   │ │ ⏰   │ │ 📅   │ │ 📧   │ │ 📊   │ ║
║  │ Notes│ │ Paiem│ │ Absen│ │ EDT  │ │ SMS  │ │ Stats│ ║
║  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ ║
║                                                            ║
║  🎯 INSIGHTS IA:                                          ║
║  • 12 élèves à risque d'échec détectés                   ║
║  • Taux recouvrement: 87% (↗ +5% vs trimestre)          ║
║  • Prévision effectifs 2025: +15 élèves                  ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

### Expérience Upgrade

#### Modal "App Verrouillée"

```
╔════════════════════════════════════════════════════╗
║              🔒 FONCTIONNALITÉ PRO                 ║
╠════════════════════════════════════════════════════╣
║                                                     ║
║  Vous tentez d'accéder à:                          ║
║  💰 GESTION FINANCIÈRE                             ║
║                                                     ║
║  Cette app inclut:                                  ║
║  ✓ Paiements illimités                             ║
║  ✓ Reçus automatiques PDF                          ║
║  ✓ Relances paiements auto                         ║
║  ✓ Statistiques financières                        ║
║                                                     ║
║  ┌───────────────────────────────────────────┐    ║
║  │  20 000 FCFA/an                           │    ║
║  │  ou 2 000 FCFA/mois                       │    ║
║  │                                             │    ║
║  │  [🎁 ESSAI GRATUIT 30 JOURS]              │    ║
║  │  Aucune carte requise                      │    ║
║  └───────────────────────────────────────────┘    ║
║                                                     ║
║  💡 Meilleur prix en Bundle Standard:              ║
║     50 000 FCFA/an (au lieu de 65k)               ║
║     = 4 apps pour le prix de 2.5                   ║
║                                                     ║
║  [Activer l'essai gratuit] [Voir bundles]         ║
║                        [Retour]                     ║
║                                                     ║
╚════════════════════════════════════════════════════╝
```

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Base de Données (Supabase)

#### Nouvelles Tables

```sql
-- =====================================================
-- TABLE: apps (Catalogue des applications)
-- =====================================================
CREATE TABLE apps (
  id TEXT PRIMARY KEY,                -- 'academic', 'financial', etc.
  name TEXT NOT NULL,                 -- 'Gestion Académique'
  description TEXT,
  category TEXT NOT NULL,             -- 'pedagogy', 'administration', etc.
  icon TEXT,                          -- Emoji '📚'
  price_yearly INTEGER NOT NULL,      -- Prix en FCFA
  price_monthly INTEGER,              -- Prix mensuel
  is_core BOOLEAN DEFAULT false,      -- App core gratuite?
  features JSONB,                     -- ['notes', 'bulletins', ...]
  dependencies TEXT[],                -- Apps requises ['academic']
  routes JSONB,                       -- ['/notes', '/bulletins']
  components JSONB,                   -- ['NotesManager', ...]
  limitations JSONB,                  -- Limitations version gratuite
  credits JSONB,                      -- Crédits inclus (SMS, etc.)
  status TEXT DEFAULT 'active',       -- active, beta, deprecated
  sort_order INTEGER,                 -- Ordre affichage
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Données initiales
INSERT INTO apps (id, name, category, price_yearly, is_core, features) VALUES
('core', 'EduTrack Base', 'core', 0, true, '["dashboard", "users", "profile"]'),
('academic', 'Gestion Académique', 'pedagogy', 15000, false, '["notes", "bulletins", "rankings"]'),
('financial', 'Gestion Financière', 'administration', 20000, false, '["payments", "receipts"]'),
('discipline', 'Discipline & Absences', 'administration', 10000, false, '["attendance", "sanctions"]'),
('schedule', 'Emplois du Temps', 'pedagogy', 12000, false, '["schedule_generator", "rooms"]'),
('communication', 'Communication', 'communication', 8000, false, '["sms", "messaging"]'),
('reporting', 'Reporting Avancé', 'analytics', 15000, false, '["analytics", "exports"]'),
('hr', 'Ressources Humaines', 'administration', 18000, false, '["teachers", "salaries"]');

-- =====================================================
-- TABLE: bundles (Packs prédéfinis)
-- =====================================================
CREATE TABLE bundles (
  id TEXT PRIMARY KEY,                -- 'starter', 'standard', 'premium'
  name TEXT NOT NULL,
  description TEXT,
  app_ids TEXT[] NOT NULL,            -- ['academic', 'discipline']
  price_yearly INTEGER NOT NULL,
  savings INTEGER,                    -- Économie vs à la carte
  recommended_for TEXT,               -- 'primary', 'secondary', etc.
  features_extra JSONB,               -- Avantages bundle (support, etc.)
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO bundles VALUES
('starter', 'Bundle Starter', 'Idéal écoles primaires',
  ARRAY['academic', 'discipline'], 25000, 10000, 'primary',
  '{"support": "email", "training": "video"}', 1),
('standard', 'Bundle Standard', 'Solution complète collèges',
  ARRAY['academic', 'discipline', 'financial', 'communication'], 50000, 15000, 'secondary',
  '{"support": "priority", "training": "video", "sms_monthly": 1000}', 2),
('premium', 'Bundle Premium', 'Tout inclus grands établissements',
  ARRAY['academic', 'discipline', 'financial', 'communication', 'schedule', 'reporting', 'hr'],
  80000, 18000, 'large',
  '{"support": "phone", "training": "onsite", "sms_monthly": 2000, "backup": "daily"}', 3);

-- =====================================================
-- TABLE: school_subscriptions (Abonnements)
-- =====================================================
CREATE TABLE school_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES apps(id),
  bundle_id TEXT REFERENCES bundles(id),  -- NULL si à la carte

  status TEXT NOT NULL DEFAULT 'trial',   -- trial, active, expired, cancelled

  -- Dates
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Paiement
  payment_method TEXT,                    -- mobile_money, bank_transfer, cash
  payment_reference TEXT,
  amount_paid INTEGER,

  -- Renouvellement
  auto_renew BOOLEAN DEFAULT true,

  -- Usage
  usage_stats JSONB,                      -- Stats utilisation

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(school_id, app_id)
);

-- Index pour performance
CREATE INDEX idx_school_subs_school ON school_subscriptions(school_id);
CREATE INDEX idx_school_subs_status ON school_subscriptions(status);
CREATE INDEX idx_school_subs_expires ON school_subscriptions(expires_at);

-- =====================================================
-- FONCTION: Vérifier si école a accès à une app
-- =====================================================
CREATE OR REPLACE FUNCTION has_active_app(
  p_school_id UUID,
  p_app_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- App core toujours accessible
  IF EXISTS (SELECT 1 FROM apps WHERE id = p_app_id AND is_core = true) THEN
    RETURN true;
  END IF;

  -- Vérifier abonnement actif ou en trial
  RETURN EXISTS (
    SELECT 1 FROM school_subscriptions
    WHERE school_id = p_school_id
      AND app_id = p_app_id
      AND status IN ('trial', 'active')
      AND (
        status = 'trial' AND trial_ends_at > now()
        OR
        status = 'active' AND expires_at > now()
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FONCTION: Obtenir apps actives d'une école
-- =====================================================
CREATE OR REPLACE FUNCTION get_school_active_apps(p_school_id UUID)
RETURNS TABLE(app_id TEXT, app_name TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    COALESCE(ss.status, 'available') as status
  FROM apps a
  LEFT JOIN school_subscriptions ss
    ON a.id = ss.app_id
    AND ss.school_id = p_school_id
    AND ss.status IN ('trial', 'active')
  WHERE a.is_core = true
    OR ss.id IS NOT NULL
  ORDER BY a.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS: Sécurité Row Level Security
-- =====================================================

-- Apps: lecture publique
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps are viewable by everyone"
  ON apps FOR SELECT
  USING (true);

-- Bundles: lecture publique
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bundles are viewable by everyone"
  ON bundles FOR SELECT
  USING (true);

-- Subscriptions: école voit uniquement ses abonnements
ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their school subscriptions"
  ON school_subscriptions FOR SELECT
  USING (school_id = get_user_school_id());

CREATE POLICY "School admins manage subscriptions"
  ON school_subscriptions FOR ALL
  USING (
    school_id = get_user_school_id()
    AND get_user_role() IN ('principal', 'admin')
  );

-- =====================================================
-- RLS CONDITIONNEL: Accès aux données selon apps
-- =====================================================

-- Exemple: Notes accessibles si app academic active
CREATE POLICY "Users access grades if academic app active"
  ON grades FOR SELECT
  USING (
    get_user_school_id() = school_id
    AND (
      has_active_app(get_user_school_id(), 'academic')
      OR has_active_app(get_user_school_id(), 'core')
    )
  );

-- Exemple: Paiements accessibles si app financial active
CREATE POLICY "Users access payments if financial app active"
  ON payments FOR SELECT
  USING (
    get_user_school_id() = school_id
    AND has_active_app(get_user_school_id(), 'financial')
  );

-- Etc. pour chaque table liée à une app...
```

### Configuration React

#### Structure Fichiers

```
src/
├── config/
│   ├── apps.js                 # Catalogue apps & bundles
│   └── features.js             # Feature flags
├── hooks/
│   ├── useAppAccess.js         # Hook vérification accès
│   ├── useFeatureAccess.js     # Hook features spécifiques
│   └── useSchoolSubscriptions.js
├── contexts/
│   └── AppsContext.jsx         # Context apps actives
├── components/
│   ├── ProtectedRoute.jsx      # Route protégée par app
│   ├── FeatureGate.jsx         # Composant conditionnel
│   ├── AppCard.jsx             # Carte app
│   ├── BundleCard.jsx          # Carte bundle
│   └── UpgradeModal.jsx        # Modal upgrade
├── pages/
│   ├── AppStore/
│   │   ├── AppStore.jsx
│   │   ├── AppDetails.jsx
│   │   └── Checkout.jsx
│   └── Subscriptions/
│       ├── MyApps.jsx
│       └── Billing.jsx
└── services/
    └── subscriptionService.js  # API Supabase
```

#### Hook useAppAccess

```javascript
// src/hooks/useAppAccess.js
import { useMemo } from 'react';
import { useSchool } from './useSchool';
import { APPS_CATALOG } from '../config/apps';

/**
 * Hook pour vérifier accès à une application
 * @param {string} appId - ID de l'app ('academic', 'financial', etc.)
 * @returns {object} { hasAccess, app, isLocked, canUpgrade, status }
 */
export const useAppAccess = (appId) => {
  const { school, subscriptions, loading } = useSchool();

  const result = useMemo(() => {
    const app = APPS_CATALOG[appId];

    // App inexistante
    if (!app) {
      return {
        hasAccess: false,
        app: null,
        isLocked: true,
        canUpgrade: false,
        status: 'not_found',
        loading
      };
    }

    // App core toujours accessible
    if (app.isCore) {
      return {
        hasAccess: true,
        app,
        isLocked: false,
        canUpgrade: false,
        status: 'core',
        loading
      };
    }

    // Vérifier abonnement
    const subscription = subscriptions?.find(
      sub => sub.app_id === appId && ['trial', 'active'].includes(sub.status)
    );

    const hasAccess = !!subscription;

    // Vérifier expiration
    let status = 'locked';
    if (subscription) {
      if (subscription.status === 'trial') {
        const daysLeft = Math.ceil(
          (new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
        );
        status = daysLeft > 0 ? 'trial' : 'trial_expired';
      } else if (subscription.status === 'active') {
        const daysLeft = Math.ceil(
          (new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
        );
        status = daysLeft > 0 ? 'active' : 'expired';
      }
    }

    return {
      hasAccess: hasAccess && ['trial', 'active'].includes(status),
      app,
      isLocked: !hasAccess || !['trial', 'active'].includes(status),
      canUpgrade: !hasAccess || status.includes('expired'),
      status,
      subscription,
      loading
    };
  }, [appId, school, subscriptions, loading]);

  return result;
};

/**
 * Hook pour vérifier accès à une feature spécifique
 * @param {string} featureName - Nom de la feature
 * @returns {boolean}
 */
export const useFeatureAccess = (featureName) => {
  const { subscriptions, loading } = useSchool();

  const hasAccess = useMemo(() => {
    if (loading) return false;

    // Chercher dans toutes les apps actives
    return Object.values(APPS_CATALOG).some(app => {
      // Vérifier si app est active
      const isActive = app.isCore || subscriptions?.some(
        sub => sub.app_id === app.id && ['trial', 'active'].includes(sub.status)
      );

      // Vérifier si feature incluse dans app
      return isActive && app.features?.includes(featureName);
    });
  }, [featureName, subscriptions, loading]);

  return hasAccess;
};

/**
 * Hook pour obtenir toutes les apps actives
 * @returns {array}
 */
export const useActiveApps = () => {
  const { subscriptions, loading } = useSchool();

  const activeApps = useMemo(() => {
    if (loading) return [];

    const apps = Object.values(APPS_CATALOG).filter(app => {
      return app.isCore || subscriptions?.some(
        sub => sub.app_id === app.id && ['trial', 'active'].includes(sub.status)
      );
    });

    return apps;
  }, [subscriptions, loading]);

  return { apps: activeApps, loading };
};
```

#### Composant ProtectedRoute

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAppAccess } from '../hooks/useAppAccess';
import UpgradeModal from './UpgradeModal';
import LoadingSpinner from './LoadingSpinner';

/**
 * Route protégée nécessitant une app active
 */
const ProtectedRoute = ({
  appId,
  children,
  redirectTo = '/app-store',
  showModal = true
}) => {
  const { hasAccess, app, loading, status } = useAppAccess(appId);

  // Chargement
  if (loading) {
    return <LoadingSpinner />;
  }

  // Pas d'accès
  if (!hasAccess) {
    // Afficher modal upgrade ou rediriger
    if (showModal) {
      return (
        <UpgradeModal
          app={app}
          currentStatus={status}
          onClose={() => window.history.back()}
        />
      );
    }

    return <Navigate to={redirectTo} replace />;
  }

  // Accès OK
  return children;
};

export default ProtectedRoute;
```

#### Composant FeatureGate

```javascript
// src/components/FeatureGate.jsx
import { useFeatureAccess } from '../hooks/useAppAccess';
import UpgradePrompt from './UpgradePrompt';

/**
 * Affiche children si feature accessible, sinon upgrade prompt
 */
const FeatureGate = ({
  feature,
  children,
  fallback = null,
  showUpgrade = true
}) => {
  const hasAccess = useFeatureAccess(feature);

  if (hasAccess) {
    return children;
  }

  if (showUpgrade) {
    return <UpgradePrompt feature={feature} />;
  }

  return fallback;
};

export default FeatureGate;

// Utilisation:
<FeatureGate feature="bulletins_auto">
  <button onClick={generateBulletins}>
    Générer Bulletins PDF
  </button>
</FeatureGate>
```

#### Routes Dynamiques

```javascript
// src/Routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useActiveApps } from './hooks/useAppAccess';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages Core (toujours disponibles)
import Dashboard from './pages/Dashboard';
import AppStore from './pages/AppStore';
import Profile from './pages/Profile';

// Modules Lazy Load
const NotesModule = lazy(() => import('./modules/academic/NotesRoutes'));
const PaymentsModule = lazy(() => import('./modules/financial/PaymentsRoutes'));
const AttendanceModule = lazy(() => import('./modules/discipline/AttendanceRoutes'));
const ScheduleModule = lazy(() => import('./modules/schedule/ScheduleRoutes'));
const MessagingModule = lazy(() => import('./modules/communication/MessagingRoutes'));
const AnalyticsModule = lazy(() => import('./modules/reporting/AnalyticsRoutes'));
const HRModule = lazy(() => import('./modules/hr/HRRoutes'));

function AppRoutes() {
  const { apps, loading } = useActiveApps();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Routes Core */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app-store" element={<AppStore />} />
        <Route path="/profile" element={<Profile />} />

        {/* Routes Modules (conditionnelles) */}

        {/* App Académique */}
        <Route
          path="/notes/*"
          element={
            <ProtectedRoute appId="academic">
              <NotesModule />
            </ProtectedRoute>
          }
        />

        {/* App Financière */}
        <Route
          path="/payments/*"
          element={
            <ProtectedRoute appId="financial">
              <PaymentsModule />
            </ProtectedRoute>
          }
        />

        {/* App Discipline */}
        <Route
          path="/attendance/*"
          element={
            <ProtectedRoute appId="discipline">
              <AttendanceModule />
            </ProtectedRoute>
          }
        />

        {/* App Planning */}
        <Route
          path="/schedules/*"
          element={
            <ProtectedRoute appId="schedule">
              <ScheduleModule />
            </ProtectedRoute>
          }
        />

        {/* App Communication */}
        <Route
          path="/messages/*"
          element={
            <ProtectedRoute appId="communication">
              <MessagingModule />
            </ProtectedRoute>
          }
        />

        {/* App Reporting */}
        <Route
          path="/analytics/*"
          element={
            <ProtectedRoute appId="reporting">
              <AnalyticsModule />
            </ProtectedRoute>
          }
        />

        {/* App RH */}
        <Route
          path="/hr/*"
          element={
            <ProtectedRoute appId="hr">
              <HRModule />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
```

#### Sidebar Dynamique

```javascript
// src/components/Sidebar.jsx
import { useActiveApps } from '../hooks/useAppAccess';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const { apps, loading } = useActiveApps();

  // Menu structure avec app requirements
  const menuItems = [
    // Core (toujours visible)
    {
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      app: 'core'
    },
    {
      label: 'App Store',
      icon: '🏪',
      path: '/app-store',
      app: 'core'
    },

    // Apps conditionnelles
    {
      label: 'Notes & Bulletins',
      icon: '📚',
      path: '/notes',
      app: 'academic'
    },
    {
      label: 'Paiements',
      icon: '💰',
      path: '/payments',
      app: 'financial'
    },
    {
      label: 'Absences',
      icon: '⏰',
      path: '/attendance',
      app: 'discipline'
    },
    {
      label: 'Emplois du Temps',
      icon: '📅',
      path: '/schedules',
      app: 'schedule'
    },
    {
      label: 'Messages',
      icon: '📧',
      path: '/messages',
      app: 'communication'
    },
    {
      label: 'Statistiques',
      icon: '📊',
      path: '/analytics',
      app: 'reporting'
    },
    {
      label: 'Ressources Humaines',
      icon: '👥',
      path: '/hr',
      app: 'hr'
    },
  ];

  // Filtrer items selon apps actives
  const visibleItems = menuItems.filter(item => {
    // Core toujours visible
    if (item.app === 'core') return true;

    // Vérifier si app active
    return apps.some(app => app.id === item.app);
  });

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h2>EduTrack CM</h2>
      </div>

      <ul className="sidebar-menu">
        {visibleItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'menu-item active' : 'menu-item'
              }
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* Separator */}
        <li className="menu-separator" />

        {/* Upsell locked apps */}
        {!apps.find(a => a.id === 'financial') && (
          <li>
            <NavLink to="/app-store?app=financial" className="menu-item locked">
              <span className="menu-icon">💰</span>
              <span className="menu-label">Paiements</span>
              <span className="lock-badge">🔒 Pro</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;
```

---

## 🔄 MIGRATION PROGRESSIVE

### Scénarios d'Adoption

#### Scénario 1: École 100% Papier

**École Primaire Providence (80 élèves, 4 classes)**

```
État Initial:
├─ Notes: Cahiers papier enseignants
├─ Bulletins: Calculés à la main, tapés Word
├─ Paiements: Cahier reçus manuscrits
├─ Absences: Registre papier
└─ Communication: Notes dans cahiers élèves

Étape 1 - Mois 0: Test Gratuit
├─> Inscription version gratuite
├─> Import 1 classe test (20 élèves)
├─> Saisie notes trimestre en cours
└─> Formation 2h vidéo

Étape 2 - Mois 1: Adoption Partielle
├─> Satisfait du test
├─> Active App Académique (essai 30j)
├─> Migre toutes les classes (80 élèves)
├─> Génère 1ers bulletins automatiques
└─> Économie: 2 jours de travail

Étape 3 - Mois 2: Extension
├─> Fin essai → Conversion (15k/an)
├─> Garde système papier pour paiements
├─> Garde registre absences papier
└─> Coexistence harmonieuse

Étape 4 - Mois 6: Expansion
├─> Demande parents: "Bulletins par WhatsApp?"
├─> Active App Communication (essai 30j)
├─> Envoi bulletins automatique
└─> Parents ravis

Étape 5 - Année 2: Full Digital
├─> Active App Financière (20k)
├─> Migre paiements progressivement
├─> Reçus numériques + papier
└─> Total: 35k/an (vs 200k concurrent)

Résultat:
✅ Migration douce sur 18 mois
✅ Zéro rupture de service
✅ Personnel formé progressivement
✅ Économie 165k/an vs concurrent
```

#### Scénario 2: École Avec Excel

**Collège Moderne (350 élèves, 12 classes)**

```
État Initial:
├─ Notes: Fichier Excel maître complexe
├─ Bulletins: Macros Excel + impression
├─ Paiements: Excel + reçus manuscrits
├─ Absences: Feuilles Excel imprimées
└─ Communication: WhatsApp non structuré

Étape 1 - Mois 0: Coexistence
├─> Active App Académique (essai)
├─> Import notes depuis Excel (script fourni)
├─> Test parallèle Excel vs EduTrack
└─> Garde Excel en backup

Étape 2 - Mois 1: Bascule Partielle
├─> EduTrack plus rapide qu'Excel
├─> Abandon progressif Excel notes
├─> Garde Excel pour paiements
└─> Conversion App Académique (15k)

Étape 3 - Mois 3: Extension Financière
├─> Fatigue Excel paiements
├─> Active App Financière (essai)
├─> Import historique paiements Excel
└─> Coexistence 1 mois

Étape 4 - Mois 4: Full Apps
├─> Abandon complet Excel
├─> Bundle Standard (50k/an)
├─> + App Communication (SMS parents)
└─> Économie vs licences Office: 30k/an

Résultat:
✅ Migration 4 mois
✅ Données Excel préservées
✅ Pas de perte historique
✅ Personnel maîtrise Excel → transition facile
```

#### Scénario 3: École Avec Logiciel Concurrent

**Lycée Technique (600 élèves)**

```
État Initial:
├─ Logiciel X: 300 000 FCFA/an
├─ Fonctionnalités utilisées: 40%
├─> Notes ✓
├─> Bulletins ✓
├─> Paiements ✗ (trop complexe, garde Excel)
├─> Absences ✗ (pas utilisé)
└─> Personnel: difficulté utilisation

Étape 1 - Mois -3: Test Parallèle
├─> Inscription EduTrack gratuit
├─> Test App Académique (essai)
├─> Comparaison côte à côte
└─> Garde Logiciel X actif

Étape 2 - Mois 0: Décision Bascule
├─> EduTrack plus simple
├─> Export données Logiciel X
├─> Import massif dans EduTrack
└─> Active Bundle Standard (50k)

Étape 3 - Mois 1: Transition
├─> Formation personnel (3 jours)
├─> Logiciel X en lecture seule
├─> EduTrack système principal
└─> Support migration inclus

Étape 4 - Mois 3: Résiliation Ancien
├─> Résiliation Logiciel X
├─> Économie: 250 000 FCFA/an
├─> Ajout App Planning (12k)
└─> Total: 62k vs 300k

Résultat:
✅ Économie 238k/an (79%)
✅ Personnel plus satisfait
✅ Fonctionnalités + utilisées
✅ ROI immédiat
```

### Scripts de Migration

#### Script Import Excel → EduTrack

```javascript
// scripts/import-from-excel.js
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

async function importStudentsFromExcel(filePath, schoolId) {
  // Lire fichier Excel
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  // Initialiser Supabase
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Mapper données
  const students = data.map(row => ({
    school_id: schoolId,
    first_name: row['Prénom'],
    last_name: row['Nom'],
    date_of_birth: new Date(row['Date Naissance']),
    gender: row['Genre'],
    class_name: row['Classe'],
    parent_phone: row['Téléphone Parent'],
    // ...
  }));

  // Import batch
  const { data: inserted, error } = await supabase
    .from('students')
    .insert(students);

  if (error) {
    console.error('Erreur import:', error);
    return { success: false, error };
  }

  console.log(`✅ ${inserted.length} élèves importés`);
  return { success: true, count: inserted.length };
}

// Utilisation:
// node import-from-excel.js eleves.xlsx uuid-ecole
```

---

## 📅 ROADMAP DE DÉVELOPPEMENT

### Phase 1: Infrastructure (Mois 1-2)

**Objectif:** Bases techniques modulaires

#### Semaine 1-2: Base de Données
- [x] Création tables `apps`, `bundles`, `school_subscriptions`
- [x] Fonctions `has_active_app()`, `get_school_active_apps()`
- [x] Seed data (7 apps + 3 bundles)
- [x] RLS conditionnel par app
- [x] Tests unitaires SQL

#### Semaine 3-4: React Infrastructure
- [ ] Hook `useAppAccess()`
- [ ] Hook `useFeatureAccess()`
- [ ] Hook `useActiveApps()`
- [ ] Composant `ProtectedRoute`
- [ ] Composant `FeatureGate`
- [ ] Context `AppsContext`

#### Semaine 5-6: Services
- [ ] `subscriptionService.js` (CRUD abonnements)
- [ ] `trialService.js` (gestion essais gratuits)
- [ ] `billingService.js` (facturation)
- [ ] Tests intégration Supabase

**Livrable:** Infrastructure modulaire fonctionnelle

---

### Phase 2: UI App Store (Mois 2-3)

#### Semaine 7-8: Pages Principales
- [ ] Page `AppStore` (catalogue apps)
- [ ] Page `AppDetails` (détail app)
- [ ] Page `MyApps` (apps installées)
- [ ] Page `Checkout` (paiement)

#### Semaine 9-10: Composants
- [ ] `AppCard` (carte app)
- [ ] `BundleCard` (carte bundle)
- [ ] `UpgradeModal` (modal upgrade)
- [ ] `TrialBadge` (badge essai)
- [ ] `ExpirationAlert` (alerte expiration)

#### Semaine 11-12: UX/UI
- [ ] Design system (couleurs, typo)
- [ ] Animations transitions
- [ ] Responsive mobile/tablette
- [ ] Tests utilisateurs (5 écoles pilotes)

**Livrable:** App Store complet et fonctionnel

---

### Phase 3: Refactor Apps Existantes (Mois 3-4)

**Objectif:** Transformer code actuel en modules

#### Semaine 13-14: App Académique
- [ ] Créer `/modules/academic/`
- [ ] Isoler routes notes/bulletins
- [ ] Migrer composants existants
- [ ] Ajouter feature flags
- [ ] Tests non-régression

#### Semaine 15-16: App Financière
- [ ] Créer `/modules/financial/`
- [ ] Isoler routes paiements/reçus
- [ ] Migrer composants
- [ ] Feature flags
- [ ] Tests

#### Semaine 17-18: App Discipline
- [ ] Créer `/modules/discipline/`
- [ ] Isoler routes absences/sanctions
- [ ] Migrer composants
- [ ] Feature flags
- [ ] Tests

**Livrable:** 3 apps principales isolées et fonctionnelles

---

### Phase 4: Nouvelles Apps (Mois 4-5)

#### Semaine 19-20: App Emplois du Temps
- [ ] Algorithme génération automatique
- [ ] Interface générateur
- [ ] Gestion salles
- [ ] Détection conflits
- [ ] Exports PDF

#### Semaine 21-22: App Communication
- [ ] Intégration SMS (API locale)
- [ ] Messagerie interne
- [ ] Système annonces
- [ ] Notifications push
- [ ] Statistiques envois

**Livrable:** 5 apps totales disponibles

---

### Phase 5: Apps Avancées (Mois 5-6)

#### Semaine 23-24: App Reporting
- [ ] Tableaux de bord avancés
- [ ] Builder rapports visuels
- [ ] Exports format ministère
- [ ] Graphiques interactifs (Chart.js)
- [ ] Prédictions IA (phase 1)

#### Semaine 25-26: App RH
- [ ] Gestion dossiers profs
- [ ] Module contrats
- [ ] Calcul salaires
- [ ] Bulletins paie PDF
- [ ] Évaluations

**Livrable:** 7 apps complètes

---

### Phase 6: Admin & Billing (Mois 6)

#### Semaine 27-28: Admin Panel
- [ ] Interface super-admin
- [ ] Gestion abonnements écoles
- [ ] Activation/désactivation apps
- [ ] Analytics usage
- [ ] Support tickets

#### Semaine 29-30: Paiement
- [ ] Intégration Mobile Money (MTN/Orange)
- [ ] Virement bancaire
- [ ] Factures automatiques
- [ ] Rappels renouvellement
- [ ] Historique paiements

**Livrable:** Système complet opérationnel

---

### Phase 7: Testing & Launch (Mois 7)

#### Semaine 31-32: Tests
- [ ] Tests 10 écoles pilotes
- [ ] Corrections bugs
- [ ] Optimisations performance
- [ ] Documentation complète
- [ ] Vidéos formation

#### Semaine 33-34: Marketing
- [ ] Landing page
- [ ] Vidéos démo
- [ ] Docs API (pour partenaires)
- [ ] Programme ambassadeurs
- [ ] Campagne lancement

**Livrable:** Lancement public

---

## 📊 ANALYSE CONCURRENTIELLE

### Concurrents Identifiés (Cameroun)

#### 1. **SchoolSoft CM**
- **Prix:** 250 000 FCFA/an
- **Modèle:** Monolithique
- **Forces:** Installé dans grandes écoles
- **Faiblesses:** Cher, complexe, pas modulaire
- **Notre Avantage:** Prix 5x inférieur, modulaire

#### 2. **GestiEcole Pro**
- **Prix:** 180 000 FCFA/an
- **Modèle:** Desktop Windows
- **Forces:** Pas besoin Internet
- **Faiblesses:** Pas cloud, pas mobile, rigide
- **Notre Avantage:** Cloud, mobile, flexible

#### 3. **EduManager**
- **Prix:** 150 000 FCFA/an
- **Modèle:** SaaS monolithique
- **Forces:** Cloud, interface moderne
- **Faiblesses:** Tout ou rien, pas adapté petites écoles
- **Notre Avantage:** Freemium, adoption progressive

#### 4. **Excel / Papier** (80% du marché)
- **Prix:** Gratuit (Excel) ou 0 FCFA (papier)
- **Forces:** Connu, pas d'abonnement
- **Faiblesses:** Pas de collaboration, erreurs, lent
- **Notre Avantage:** Gratuit aussi (50 élèves), puis upgrade progressif

### Matrice Positionnement

```
                    Flexibilité
                         ↑
                         |
   Excel/Papier          |           EduTrack CM
   (Gratuit mais limité) |           (Modulaire)
                         |              ★
   ─────────────────────┼────────────────────→
                         |              Prix
   SchoolSoft            |           Accessible
   GestiEcole            |
   (Cher, rigide)        |
                         |
```

### Tableau Comparatif Détaillé

| Critère | Concurrents | EduTrack CM | Avantage |
|---------|-------------|-------------|----------|
| **Prix entrée** | 150-250k | 0 FCFA | ✅ 100% économie |
| **Modularité** | Non | Oui | ✅ Unique |
| **Essai gratuit** | 7-15j | 30j + Freemium | ✅ Généreux |
| **Mobile** | Limité | Full responsive | ✅ Meilleur |
| **Cloud** | Oui | Oui | ⚖️ Égal |
| **SMS inclus** | Non (payant) | 500-2000/mois | ✅ Inclus |
| **Support** | Email | Email+Tel+Onsite | ✅ Meilleur |
| **Migration** | Complexe | Scripts fournis | ✅ Facile |
| **Évolution** | Annuelle | Mensuelle | ✅ Flexible |
| **Coexistence** | Non | Oui | ✅ Unique |

---

## 🎯 CONCLUSION

### Synthèse de l'Approche

L'architecture modulaire d'EduTrack CM représente un **changement de paradigme** dans l'édition de logiciels de gestion scolaire au Cameroun:

#### ✅ Avantages Stratégiques

1. **Accessibilité Maximale**
   - Version gratuite fonctionnelle (50 élèves)
   - Barrière d'entrée quasi-nulle
   - Essais gratuits 30 jours
   - Prix 5x inférieur à la concurrence

2. **Adoption Naturelle**
   - Migration progressive sans rupture
   - Coexistence avec systèmes existants
   - Formation module par module
   - ROI immédiat dès la première app

3. **Différenciation Forte**
   - Unique sur le marché camerounais
   - Positionnement "Odoo de l'éducation"
   - Flexibilité inégalée
   - Innovation continue par modules

4. **Scalabilité Business**
   - Freemium → Acquisition massive
   - Upsell naturel (nouvelles apps)
   - Cross-sell (bundles avantageux)
   - Revenu récurrent prévisible

#### 🎯 Objectifs Chiffrés (18 mois)

```
Cible Utilisateurs:
├─ 1000 écoles gratuites (mois 12)
├─ 200 écoles Starter (mois 12)
├─ 50 écoles Standard (mois 18)
└─ 10 écoles Premium (mois 18)

Revenu Estimé (Mois 18):
├─ Starter: 200 × 25k = 5 000 000 FCFA
├─ Standard: 50 × 50k = 2 500 000 FCFA
├─ Premium: 10 × 80k = 800 000 FCFA
└─ Total MRR: 690 000 FCFA (~8.3M/an)

Taux de Conversion:
├─ Gratuit → Payant: 20% (industrie: 2-5%)
├─ Starter → Standard: 25%
├─ Standard → Premium: 20%
└─ Churn annuel: <10% (vs 30% industrie)
```

### Prochaines Étapes Immédiates

#### Option A: Validation Concept (Recommandé)
1. Utiliser les 6 questionnaires pour étude marché
2. Interviewer 20 directeurs sur concept modulaire
3. Présenter mockups App Store
4. Valider pricing et bundles
5. Décision GO/NO-GO

#### Option B: Développement Direct
1. Commencer Phase 1 (Infrastructure)
2. Tables Supabase + Hooks React
3. Refactor 1ère app (Académique)
4. Test alpha avec 3 écoles pilotes
5. Itération rapide

### Recommandation Finale

**JE RECOMMANDE FORTEMENT CETTE APPROCHE.**

Pourquoi?
- ✅ Différenciation claire et défendable
- ✅ Modèle économique prouvé (Odoo, Shopify, Salesforce)
- ✅ Adapté au contexte camerounais
- ✅ Adoption progressive = moins de résistance
- ✅ Scalabilité technique et business

**La question n'est pas "si" mais "quand commencer".**

Mon vote: **Commencer dès maintenant** par la validation concept (Option A), puis développement (Option B) si validation positive.

---

**Document préparé le 31 décembre 2025**
**EduTrack CM - Architecture Modulaire v1.0**
**Auteur: Équipe Technique EduTrack**

---

*Ce document est évolutif et sera mis à jour au fur et à mesure de l'implémentation.*
