-- =====================================================
-- MIGRATION: Auto-activation App Core pour Nouvelles Écoles
-- Date: 2026-01-01
-- Description: Active automatiquement l'app "core" (gratuite) lors de la création d'une école
-- =====================================================

-- =====================================================
-- FONCTION: auto_activate_core_app
-- =====================================================
CREATE OR REPLACE FUNCTION public.auto_activate_core_app()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insérer l'app "core" dans school_subscriptions pour la nouvelle école
  INSERT INTO public.school_subscriptions (
    school_id,
    app_id,
    status,
    activated_at,
    auto_renew,
    created_by
  )
  VALUES (
    NEW.id,                    -- ID de l'école nouvellement créée
    'core',                    -- App core (gratuite)
    'active',                  -- Status actif
    NOW(),                     -- Date d'activation
    true,                      -- Auto-renew (app gratuite reste toujours active)
    NEW.director_user_id       -- Créé par le directeur
  )
  ON CONFLICT (school_id, app_id) DO NOTHING; -- Éviter doublons si déjà activée

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_activate_core_app IS 'Active automatiquement l''app "core" (gratuite) pour chaque nouvelle école créée';

-- =====================================================
-- TRIGGER: on_school_created
-- =====================================================
DROP TRIGGER IF EXISTS on_school_created ON schools;

CREATE TRIGGER on_school_created
  AFTER INSERT ON schools
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_activate_core_app();

COMMENT ON TRIGGER on_school_created ON schools IS 'Déclenche l''activation automatique de l''app "core" après création d''une école';

-- =====================================================
-- VÉRIFICATION: Activer "core" pour écoles existantes
-- =====================================================

-- Activer "core" pour toutes les écoles existantes qui ne l'ont pas encore
INSERT INTO public.school_subscriptions (
  school_id,
  app_id,
  status,
  activated_at,
  auto_renew,
  created_by
)
SELECT
  s.id AS school_id,
  'core' AS app_id,
  'active' AS status,
  NOW() AS activated_at,
  true AS auto_renew,
  s.director_user_id AS created_by
FROM schools s
LEFT JOIN school_subscriptions ss
  ON ss.school_id = s.id
  AND ss.app_id = 'core'
WHERE ss.id IS NULL  -- Seulement les écoles sans app "core"
  AND s.status = 'active';  -- Seulement les écoles actives

-- =====================================================
-- LOGS DE VÉRIFICATION
-- =====================================================

DO $$
DECLARE
  total_schools INTEGER;
  schools_with_core INTEGER;
BEGIN
  -- Compter total écoles actives
  SELECT COUNT(*) INTO total_schools
  FROM schools
  WHERE status = 'active';

  -- Compter écoles avec app core
  SELECT COUNT(DISTINCT school_id) INTO schools_with_core
  FROM school_subscriptions
  WHERE app_id = 'core' AND status = 'active';

  RAISE NOTICE '✅ Migration terminée:';
  RAISE NOTICE '  - Total écoles actives: %', total_schools;
  RAISE NOTICE '  - Écoles avec app "core": %', schools_with_core;

  IF total_schools = schools_with_core THEN
    RAISE NOTICE '  ✅ Toutes les écoles ont l''app "core" activée';
  ELSE
    RAISE WARNING '  ⚠️ % écoles sans app "core"', (total_schools - schools_with_core);
  END IF;
END;
$$;
