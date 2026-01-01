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
  is_core = true,
  status = 'active',
  development_status = 'ready',
  sort_order = 1
WHERE id = 'core';

-- App Academic → App Académique
UPDATE apps
SET
  name = 'App Académique',
  description = 'Moteur de calcul adaptatif pour système Trimestriel (Scolaire) et LMD (Universitaire).',
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
  is_core = false,
  status = 'active',
  development_status = 'ready',
  sort_order = 2
WHERE id = 'academic';

-- App Financial → App Trésorerie & Comptabilité
UPDATE apps
SET
  name = 'App Trésorerie & Comptabilité',
  description = 'Gestion financière stricte adaptée aux réalités locales (paiements échelonnés, espèces, Mobile Money).',
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
  is_core = false,
  status = 'active',
  development_status = 'ready',
  sort_order = 3
WHERE id = 'financial';

-- App Communication → App Communication & Alertes
UPDATE apps
SET
  name = 'App Communication & Alertes',
  description = 'Lien direct avec les familles et étudiants. Notifications, SMS, emails.',
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
  is_core = false,
  status = 'active',
  development_status = 'beta',
  sort_order = 4
WHERE id = 'communication';

-- App Schedule → App Planning & Temps
UPDATE apps
SET
  name = 'App Planning & Temps',
  description = 'Gestion intelligente des ressources temporelles et matérielles.',
  features = jsonb_build_array(
    'Emplois du temps par classe/amphi et enseignant',
    'Gestion des salles (éviter conflits)',
    'Pointage enseignants',
    'Calcul automatique des vacations'
  ),
  category = 'pedagogy',
  price_monthly = 6000,
  price_yearly = 60000,
  is_core = false,
  status = 'active',
  development_status = 'beta',
  sort_order = 5
WHERE id = 'schedule';

-- App Discipline → App Discipline & Assiduité
UPDATE apps
SET
  name = 'App Discipline & Assiduité',
  description = 'Digitalisation de la vie scolaire et de la discipline.',
  features = jsonb_build_array(
    'Appel numérique (par cours ou journée)',
    'Suivi disciplinaire (blâmes, avertissements, exclusions)',
    'Conseil de discipline (rapports automatiques)',
    'Billet entrée/sortie numérisé'
  ),
  category = 'administration',
  price_monthly = 5000,
  price_yearly = 50000,
  is_core = false,
  status = 'active',
  development_status = 'beta',
  sort_order = 6
WHERE id = 'discipline';

-- App Reporting → App Décisionnel
UPDATE apps
SET
  name = 'App Décisionnel',
  description = 'Tableaux de bord avancés pour analyser la performance pédagogique, effectifs et santé financière.',
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
  is_core = false,
  status = 'active',
  development_status = 'beta',
  sort_order = 7
WHERE id = 'reporting';

-- App HR → App Bibliothèque 2.0 (REMPLACEMENT)
-- Note: On remplace l'app HR par Bibliothèque selon le nouveau catalogue
UPDATE apps
SET
  name = 'App Bibliothèque 2.0',
  description = 'Gestion simplifiée du fonds documentaire physique.',
  features = jsonb_build_array(
    'Catalogue digital complet',
    'Prêts & retours (recherche ou scan code-barres)',
    'Statistiques (livres populaires, rotation)',
    'Pénalités et amendes de retard'
  ),
  category = 'pedagogy',
  icon = '📚',
  price_monthly = 4000,
  price_yearly = 40000,
  is_core = false,
  status = 'active',
  development_status = 'beta',
  sort_order = 8
WHERE id = 'hr';

-- 2. Ajout de la nouvelle app E-Learning
-- ============================================================================

INSERT INTO apps (
  id,
  name,
  description,
  category,
  icon,
  price_yearly,
  price_monthly,
  is_core,
  features,
  status,
  sort_order,
  development_status
) VALUES (
  'elearning',
  'App E-Learning & Ressources',
  'Étendez l''apprentissage au-delà de la salle de classe. Plateforme moderne pour le partage de savoir.',
  'pedagogy',
  '🎓',
  85000,
  8500,
  false,
  jsonb_build_array(
    'Banque d''épreuves (archivage sujets)',
    'Dépôt de cours (PDF, Word, Audio)',
    'Cahier de texte numérique',
    'Travaux dirigés en ligne',
    'Suivi avancement du programme'
  ),
  'active',
  9,
  'beta'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  development_status = EXCLUDED.development_status;

-- 3. Mise à jour des bundles/packs
-- ============================================================================

-- Supprimer les anciens packs
DELETE FROM bundles WHERE id IN ('starter', 'standard', 'premium');

-- Pack Start (Primaire / Petite École)
INSERT INTO bundles (
  id,
  name,
  description,
  recommended_for,
  app_ids,
  price_yearly,
  savings,
  is_active,
  sort_order,
  features_extra
) VALUES (
  'start',
  'Pack Start',
  'Pour écoles souhaitant débuter la digitalisation à moindre coût',
  'Primaire, Petites Écoles',
  ARRAY['core', 'academic', 'discipline'],
  100000,
  25000,
  true,
  1,
  '{"support": "email", "training": "video", "features": ["Notes et bulletins", "Gestion discipline"]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  app_ids = EXCLUDED.app_ids,
  price_yearly = EXCLUDED.price_yearly,
  savings = EXCLUDED.savings,
  features_extra = EXCLUDED.features_extra;

-- Pack Gestion (Collège / Lycée) - RECOMMANDÉ
INSERT INTO bundles (
  id,
  name,
  description,
  recommended_for,
  app_ids,
  price_yearly,
  savings,
  is_active,
  sort_order,
  features_extra
) VALUES (
  'gestion',
  'Pack Gestion',
  'Établissements voulant sécuriser les finances et gérer les notes',
  'Collèges, Lycées',
  ARRAY['core', 'academic', 'financial', 'communication'],
  200000,
  40000,
  true,
  2,
  '{"support": "priority_email", "training": "video", "recommended": true, "features": ["Notes", "Trésorerie", "Communication"]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  app_ids = EXCLUDED.app_ids,
  price_yearly = EXCLUDED.price_yearly,
  savings = EXCLUDED.savings,
  features_extra = EXCLUDED.features_extra;

-- Pack Excellence (Lycée Bilingue / Complexe)
INSERT INTO bundles (
  id,
  name,
  description,
  recommended_for,
  app_ids,
  price_yearly,
  savings,
  is_active,
  sort_order,
  features_extra
) VALUES (
  'excellence',
  'Pack Excellence',
  'Établissements visant une gestion à 360° sans compromis',
  'Lycées Bilingues, Complexes Scolaires',
  ARRAY['core', 'academic', 'financial', 'communication', 'schedule', 'discipline', 'elearning'],
  350000,
  85000,
  true,
  3,
  '{"support": "phone", "training": "onsite", "features": ["Gestion complète", "E-Learning", "Support prioritaire"]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  app_ids = EXCLUDED.app_ids,
  price_yearly = EXCLUDED.price_yearly,
  savings = EXCLUDED.savings,
  features_extra = EXCLUDED.features_extra;

-- Pack Campus (Université / Grande École)
INSERT INTO bundles (
  id,
  name,
  description,
  recommended_for,
  app_ids,
  price_yearly,
  savings,
  is_active,
  sort_order,
  features_extra
) VALUES (
  'campus',
  'Pack Campus',
  'Gestion LMD complète pour l''enseignement supérieur',
  'Universités, Grandes Écoles',
  ARRAY['core', 'academic', 'financial', 'communication', 'schedule', 'discipline', 'hr', 'reporting', 'elearning'],
  0, -- Sur devis
  0,
  true,
  4,
  '{"support": "dedicated", "training": "custom", "custom_pricing": true, "features": ["Toutes les apps", "Mode LMD complet", "Support dédié"]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  app_ids = EXCLUDED.app_ids,
  features_extra = EXCLUDED.features_extra;

-- 4. Vérification et rapport
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration catalogue 2026 terminée';
  RAISE NOTICE '📱 Apps actives: %', (SELECT COUNT(*) FROM apps WHERE status = 'active');
  RAISE NOTICE '📦 Packs disponibles: %', (SELECT COUNT(*) FROM bundles WHERE is_active = true);
END $$;
