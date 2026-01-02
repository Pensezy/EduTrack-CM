-- =====================================================
-- MIGRATION: Ajout Statut de Développement des Apps
-- Date: 2026-01-02 (FIXED)
-- Description: Ajouter un champ pour indiquer si une app est prête ou en développement
-- =====================================================

-- =====================================================
-- 1. AJOUTER COLONNE development_status
-- =====================================================

ALTER TABLE apps
ADD COLUMN IF NOT EXISTS development_status TEXT DEFAULT 'ready'
CHECK (development_status IN ('ready', 'in_development', 'beta'));

COMMENT ON COLUMN apps.development_status IS 'Statut de développement: ready (prête), in_development (en cours), beta (version test)';

-- =====================================================
-- 2. SUPPRIMER ET RECRÉER LA VUE v_apps_catalog
-- =====================================================

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS v_apps_catalog CASCADE;

-- Recréer la vue avec la nouvelle colonne
CREATE OR REPLACE VIEW v_apps_catalog AS
SELECT
  a.id,
  a.name,
  a.description,
  a.category,
  a.icon,
  a.price_yearly,
  a.price_monthly,
  a.is_core,
  a.features,
  a.status,
  a.development_status,
  a.sort_order,
  CASE
    WHEN a.is_core THEN 'Gratuit'
    WHEN a.price_yearly > 0 THEN a.price_yearly || ' FCFA/an'
    ELSE 'Prix sur demande'
  END as price_display
FROM apps a
WHERE a.status = 'active'
ORDER BY a.sort_order;

COMMENT ON VIEW v_apps_catalog IS 'Catalogue complet des applications disponibles avec pricing et statut de développement';

-- =====================================================
-- 3. METTRE À JOUR LES APPS EXISTANTES
-- =====================================================

-- Apps PRÊTES (fonctionnelles)
UPDATE apps SET development_status = 'ready'
WHERE id IN ('core', 'academic', 'financial');

-- Apps EN DÉVELOPPEMENT (pas encore finies)
UPDATE apps SET development_status = 'in_development'
WHERE id IN ('schedule', 'discipline', 'hr', 'communication', 'reporting');

-- =====================================================
-- 4. VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📊 STATUT DE DÉVELOPPEMENT DES APPLICATIONS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Afficher les apps avec leur statut
SELECT
  id,
  name,
  CASE development_status
    WHEN 'ready' THEN '✅ Prête'
    WHEN 'in_development' THEN '🚧 En Développement'
    WHEN 'beta' THEN '🧪 Version Beta'
    ELSE development_status
  END as status_display,
  CASE
    WHEN is_core THEN '🆓 GRATUIT'
    ELSE price_yearly || ' FCFA/an'
  END as price
FROM apps
ORDER BY sort_order;

-- Résumé
DO $$
DECLARE
  ready_count INTEGER;
  dev_count INTEGER;
  beta_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ready_count FROM apps WHERE development_status = 'ready';
  SELECT COUNT(*) INTO dev_count FROM apps WHERE development_status = 'in_development';
  SELECT COUNT(*) INTO beta_count FROM apps WHERE development_status = 'beta';

  RAISE NOTICE '';
  RAISE NOTICE '📈 RÉSUMÉ:';
  RAISE NOTICE '  ✅ Prêtes: %', ready_count;
  RAISE NOTICE '  🚧 En développement: %', dev_count;
  RAISE NOTICE '  🧪 Beta: %', beta_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;
