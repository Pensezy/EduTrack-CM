-- ============================================================================
-- Migration: Mise à jour du catalogue selon nouveau document commercial 2026
-- ============================================================================

-- 1. Mise à jour des applications existantes avec nouvelles infos
-- ============================================================================

-- App Core (Gratuite)
UPDATE apps
SET
  name = 'App Core',
  description = 'Le socle indispensable de votre digitalisation. Centralise vos données et structure votre établissement.',
  short_description = 'Gestion complète de base avec générateur de cartes scolaires',
  features = jsonb_build_array(
    'Gestion des profils (élèves, enseignants, personnel)',
    'Architecture pédagogique (classes/filières)',
    'Générateur de cartes avec QR Code personnalisable',
    'Import de données via Excel',
    'Dashboard direction en temps réel'
  ),
  category = 'core',
  price_monthly = 0,
  price_yearly = 0,
  is_free = true,
  development_status = 'ready',
  sort_order = 1
WHERE slug = 'core';

-- App Académique (ex: Notes & Évaluations)
UPDATE apps
SET
  name = 'App Académique',
  description = 'Moteur de calcul adaptatif pour système Trimestriel (Scolaire) et LMD (Universitaire).',
  short_description = 'Notes, résultats et bulletins - Double compatibilité Scolaire/LMD',
  features = jsonb_build_array(
    'Mode Scolaire: Séquences, Trimestres, Coefficients',
    'Mode LMD: Semestres, UV, Crédits, GPA',
    'Saisie décentralisée par enseignants',
    'Calculateur automatique (moyennes, rangs, mentions)',
    'Bulletins, relevés, PV de délibération',
    'Archivage pluriannuel'
  ),
  category = 'pedagogy',
  price_monthly = 7500,
  price_yearly = 75000,
  is_free = false,
  development_status = 'beta',
  sort_order = 2
WHERE slug = 'notes-evaluations';

-- App Trésorerie & Comptabilité (ex: Comptabilité)
UPDATE apps
SET
  name = 'App Trésorerie & Comptabilité',
  description = 'Gestion financière stricte adaptée aux réalités locales (paiements échelonnés, espèces, Mobile Money).',
  short_description = 'Sécurisez vos revenus avec une gestion financière complète',
  features = jsonb_build_array(
    'Suivi des scolarités (tranches, délais, échéanciers)',
    'Caisse & dépenses avec traçabilité',
    'Reçus automatiques PDF/Ticket thermique',
    'Liste des insolvables',
    'Gestion de la paie (permanents et vacataires)'
  ),
  category = 'administration',
  price_monthly = 12000,
  price_yearly = 120000,
  is_free = false,
  development_status = 'beta',
  sort_order = 3
WHERE slug = 'comptabilite';

-- App Communication & Alertes (ex: Communication)
UPDATE apps
SET
  name = 'App Communication & Alertes',
  description = 'Lien direct avec les familles et étudiants. Notifications, SMS, emails.',
  short_description = 'Communication fluide avec familles et étudiants (SMS + Notifications)',
  features = jsonb_build_array(
    'Campagnes SMS (rappels, convocations, absences)',
    'Notifications app gratuites',
    'Emailing (bulletins, circulaires)',
    'Ciblage précis (classe, niveau, débiteurs)',
    'Note: SMS facturés via Packs Crédits'
  ),
  category = 'communication',
  price_monthly = 4500,
  price_yearly = 45000,
  is_free = false,
  development_status = 'beta',
  sort_order = 4
WHERE slug = 'communication';

-- App Planning & Temps (ex: Emplois du Temps)
UPDATE apps
SET
  name = 'App Planning & Temps',
  description = 'Gestion intelligente des ressources temporelles et matérielles.',
  short_description = 'Emplois du temps, salles et pointage enseignants',
  features = jsonb_build_array(
    'Emplois du temps par classe/amphi et enseignant',
    'Gestion des salles (éviter conflits)',
    'Pointage enseignants',
    'Calcul automatique des vacations'
  ),
  category = 'pedagogy',
  price_monthly = 6000,
  price_yearly = 60000,
  is_free = false,
  development_status = 'beta',
  sort_order = 5
WHERE slug = 'emplois-du-temps';

-- App Discipline & Assiduité (ex: Absences & Discipline)
UPDATE apps
SET
  name = 'App Discipline & Assiduité',
  description = 'Digitalisation de la vie scolaire et de la discipline.',
  short_description = 'Pointage, discipline et suivi comportemental',
  features = jsonb_build_array(
    'Appel numérique (par cours ou journée)',
    'Suivi disciplinaire (blâmes, avertissements, exclusions)',
    'Conseil de discipline (rapports automatiques)',
    'Billet entrée/sortie numérisé'
  ),
  category = 'administration',
  price_monthly = 5000,
  price_yearly = 50000,
  is_free = false,
  development_status = 'beta',
  sort_order = 6
WHERE slug = 'absences-discipline';

-- App Bibliothèque 2.0 (ex: Bibliothèque)
UPDATE apps
SET
  name = 'App Bibliothèque 2.0',
  description = 'Gestion simplifiée du fonds documentaire physique.',
  short_description = 'Catalogage, prêts et statistiques de bibliothèque',
  features = jsonb_build_array(
    'Catalogue digital complet',
    'Prêts & retours (recherche ou scan code-barres)',
    'Statistiques (livres populaires, rotation)',
    'Pénalités et amendes de retard'
  ),
  category = 'pedagogy',
  price_monthly = 4000,
  price_yearly = 40000,
  is_free = false,
  development_status = 'beta',
  sort_order = 7
WHERE slug = 'bibliotheque';

-- App Décisionnel (ex: Statistiques & Rapports)
UPDATE apps
SET
  name = 'App Décisionnel',
  description = 'Tableaux de bord avancés pour analyser la performance pédagogique, effectifs et santé financière.',
  short_description = 'Statistiques et analytics pour le pilotage',
  features = jsonb_build_array(
    'Dashboards direction en temps réel',
    'Analyses pédagogiques',
    'Évolution des effectifs',
    'Santé financière',
    'Rapports personnalisables'
  ),
  category = 'analytics',
  price_monthly = 5500,
  price_yearly = 55000,
  is_free = false,
  development_status = 'beta',
  sort_order = 8
WHERE slug = 'statistiques-rapports';

-- 2. Ajout de la nouvelle app E-Learning
-- ============================================================================

INSERT INTO apps (
  id,
  name,
  slug,
  description,
  short_description,
  icon,
  category,
  price_monthly,
  price_yearly,
  is_free,
  trial_days,
  features,
  development_status,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'App E-Learning & Ressources',
  'e-learning',
  'Étendez l''apprentissage au-delà de la salle de classe. Plateforme moderne pour le partage de savoir.',
  'Banque d''épreuves, dépôt de cours et cahier de texte numérique',
  '📚',
  'pedagogy',
  8500,
  85000,
  false,
  30,
  jsonb_build_array(
    'Banque d''épreuves (archivage sujets)',
    'Dépôt de cours (PDF, Word, Audio)',
    'Cahier de texte numérique',
    'Travaux dirigés en ligne',
    'Suivi avancement du programme'
  ),
  'beta',
  true,
  9
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  development_status = EXCLUDED.development_status;

-- 3. Mise à jour des bundles/packs
-- ============================================================================

-- Supprimer les anciens packs
DELETE FROM bundles WHERE slug IN ('essentiel', 'standard', 'premium');

-- Pack Start (Primaire / Petite École)
INSERT INTO bundles (
  id,
  name,
  slug,
  description,
  target_audience,
  price_yearly,
  discount_amount,
  discount_percentage,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'Pack Start',
  'start',
  'Pour écoles souhaitant débuter la digitalisation à moindre coût',
  'Primaire, Petites Écoles',
  100000,
  25000,
  20,
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_yearly = EXCLUDED.price_yearly,
  discount_amount = EXCLUDED.discount_amount;

-- Pack Gestion (Collège / Lycée)
INSERT INTO bundles (
  id,
  name,
  slug,
  description,
  target_audience,
  price_yearly,
  discount_amount,
  discount_percentage,
  is_active,
  sort_order,
  is_recommended
) VALUES (
  gen_random_uuid(),
  'Pack Gestion',
  'gestion',
  'Établissements voulant sécuriser les finances et gérer les notes',
  'Collèges, Lycées',
  200000,
  40000,
  17,
  true,
  2,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_yearly = EXCLUDED.price_yearly,
  discount_amount = EXCLUDED.discount_amount,
  is_recommended = EXCLUDED.is_recommended;

-- Pack Excellence (Lycée Bilingue / Complexe)
INSERT INTO bundles (
  id,
  name,
  slug,
  description,
  target_audience,
  price_yearly,
  discount_amount,
  discount_percentage,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'Pack Excellence',
  'excellence',
  'Établissements visant une gestion à 360° sans compromis',
  'Lycées Bilingues, Complexes Scolaires',
  350000,
  85000,
  20,
  true,
  3
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_yearly = EXCLUDED.price_yearly,
  discount_amount = EXCLUDED.discount_amount;

-- Pack Campus (Université / Grande École)
INSERT INTO bundles (
  id,
  name,
  slug,
  description,
  target_audience,
  price_yearly,
  discount_amount,
  discount_percentage,
  is_active,
  sort_order,
  is_custom_pricing
) VALUES (
  gen_random_uuid(),
  'Pack Campus',
  'campus',
  'Gestion LMD complète pour l''enseignement supérieur',
  'Universités, Grandes Écoles',
  0, -- Sur devis
  0,
  0,
  true,
  4,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_custom_pricing = EXCLUDED.is_custom_pricing;

-- 4. Lier les apps aux bundles
-- ============================================================================

-- D'abord, supprimer les anciennes associations
DELETE FROM bundle_apps;

-- Pack Start: Core + Académique + Discipline
INSERT INTO bundle_apps (bundle_id, app_id)
SELECT
  b.id,
  a.id
FROM bundles b
CROSS JOIN apps a
WHERE b.slug = 'start'
  AND a.slug IN ('core', 'notes-evaluations', 'absences-discipline');

-- Pack Gestion: Core + Académique + Trésorerie + Communication
INSERT INTO bundle_apps (bundle_id, app_id)
SELECT
  b.id,
  a.id
FROM bundles b
CROSS JOIN apps a
WHERE b.slug = 'gestion'
  AND a.slug IN ('core', 'notes-evaluations', 'comptabilite', 'communication');

-- Pack Excellence: Core + Académique + Trésorerie + Communication + Planning + Discipline + E-Learning
INSERT INTO bundle_apps (bundle_id, app_id)
SELECT
  b.id,
  a.id
FROM bundles b
CROSS JOIN apps a
WHERE b.slug = 'excellence'
  AND a.slug IN ('core', 'notes-evaluations', 'comptabilite', 'communication', 'emplois-du-temps', 'absences-discipline', 'e-learning');

-- Pack Campus: Toutes les apps (gestion complète)
INSERT INTO bundle_apps (bundle_id, app_id)
SELECT
  b.id,
  a.id
FROM bundles b
CROSS JOIN apps a
WHERE b.slug = 'campus'
  AND a.is_active = true;

-- 5. Vérification et rapport
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration catalogue 2026 terminée';
  RAISE NOTICE '📱 Apps actives: %', (SELECT COUNT(*) FROM apps WHERE is_active = true);
  RAISE NOTICE '📦 Packs disponibles: %', (SELECT COUNT(*) FROM bundles WHERE is_active = true);
  RAISE NOTICE '🔗 Associations bundle-apps: %', (SELECT COUNT(*) FROM bundle_apps);
END $$;
