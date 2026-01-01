-- =====================================================
-- MIGRATION: Améliorer Descriptions Applications
-- Date: 2026-01-01
-- Description: Rendre les descriptions compréhensibles pour le grand public
-- =====================================================

-- =====================================================
-- METTRE À JOUR LES DESCRIPTIONS
-- =====================================================

-- App Core (Gratuite)
UPDATE apps SET
  description = 'Gestion complète de votre établissement scolaire : inscriptions, classes, emplois du temps et suivi des élèves.',
  features = ARRAY[
    'Gestion des inscriptions et réinscriptions',
    'Organisation des classes et niveaux',
    'Création des emplois du temps',
    'Suivi des présences quotidiennes',
    'Fiches d''informations des élèves'
  ]
WHERE id = 'core';

-- App Academic (Pédagogie)
UPDATE apps SET
  description = 'Gérez facilement les notes, bulletins et résultats scolaires de vos élèves tout au long de l''année.',
  features = ARRAY[
    'Saisie rapide des notes par matière',
    'Génération automatique des bulletins',
    'Calcul des moyennes et classements',
    'Historique complet des résultats',
    'Statistiques de performance par classe'
  ]
WHERE id = 'academic';

-- App Financial (Comptabilité)
UPDATE apps SET
  description = 'Suivez les paiements des frais scolaires, gérez la comptabilité et générez des reçus automatiquement.',
  features = ARRAY[
    'Suivi des paiements et arriérés',
    'Génération automatique de reçus',
    'Gestion des frais et tarifs',
    'Rapports financiers détaillés',
    'Relances automatiques des impayés'
  ]
WHERE id = 'financial';

-- App Schedule (Emplois du Temps)
UPDATE apps SET
  description = 'Créez et gérez les emplois du temps de toutes vos classes en quelques clics, avec gestion des absences professeurs.',
  features = ARRAY[
    'Création facile d''emplois du temps',
    'Gestion des salles de classe',
    'Remplacement automatique en cas d''absence',
    'Planning des examens et contrôles',
    'Export et impression des emplois du temps'
  ]
WHERE id = 'schedule';

-- App Discipline (Vie Scolaire)
UPDATE apps SET
  description = 'Gérez la discipline, suivez le comportement des élèves et communiquez avec les parents en temps réel.',
  features = ARRAY[
    'Enregistrement des sanctions et félicitations',
    'Carnet de liaison numérique',
    'Notifications automatiques aux parents',
    'Suivi du comportement par élève',
    'Statistiques de discipline par classe'
  ]
WHERE id = 'discipline';

-- App HR (Personnel)
UPDATE apps SET
  description = 'Gérez votre personnel enseignant et administratif : contrats, salaires, congés et évaluations.',
  features = ARRAY[
    'Dossiers complets du personnel',
    'Gestion des contrats et renouvellements',
    'Calcul automatique des salaires',
    'Suivi des congés et absences',
    'Évaluations et formations'
  ]
WHERE id = 'hr';

-- App Communication (Parents & Élèves)
UPDATE apps SET
  description = 'Communiquez facilement avec parents et élèves : SMS, emails, notifications et messagerie intégrée.',
  features = ARRAY[
    'Envoi de SMS groupés aux parents',
    'Notifications push sur mobile',
    'Messagerie école-parents',
    'Diffusion d''informations et circulaires',
    'Historique des communications'
  ]
WHERE id = 'communication';

-- App Reporting (Statistiques & Rapports)
UPDATE apps SET
  description = 'Générez des rapports détaillés et tableaux de bord pour piloter votre établissement avec efficacité.',
  features = ARRAY[
    'Tableaux de bord en temps réel',
    'Rapports personnalisables',
    'Statistiques par classe et niveau',
    'Export Excel et PDF',
    'Graphiques et visualisations'
  ]
WHERE id = 'reporting';

-- =====================================================
-- VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DESCRIPTIONS MISES À JOUR';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

SELECT
  name as "Application",
  LEFT(description, 80) || '...' as "Description"
FROM apps
ORDER BY sort_order;
