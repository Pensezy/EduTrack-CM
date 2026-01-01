-- =====================================================
-- FIX RAPIDE: Permissions RLS pour Vues Apps/Bundles
-- Date: 2026-01-01
-- Description: Corriger erreur 403 lors accès aux vues v_apps_catalog et v_bundles_catalog
-- =====================================================

-- =====================================================
-- PROBLÈME: Erreur 403 lors du SELECT sur les vues
-- =====================================================

-- Les vues v_apps_catalog et v_bundles_catalog peuvent retourner 403
-- car les tables sous-jacentes (apps, bundles) ont des politiques RLS

-- =====================================================
-- SOLUTION 1: Désactiver RLS sur tables apps et bundles (PUBLIC READ)
-- =====================================================

-- Apps: Lecture publique (catalogue accessible à tous)
DROP POLICY IF EXISTS "Public read access to apps" ON apps;
CREATE POLICY "Public read access to apps"
  ON apps FOR SELECT
  TO PUBLIC
  USING (true);

-- Bundles: Lecture publique (catalogue accessible à tous)
DROP POLICY IF EXISTS "Public read access to bundles" ON bundles;
CREATE POLICY "Public read access to bundles"
  ON bundles FOR SELECT
  TO PUBLIC
  USING (true);

-- =====================================================
-- SOLUTION 2: Permissions explicites sur les vues
-- =====================================================

-- Donner accès SELECT à tous les rôles authentifiés et anonymes
GRANT SELECT ON v_apps_catalog TO anon, authenticated;
GRANT SELECT ON v_bundles_catalog TO anon, authenticated;

-- =====================================================
-- VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Permissions RLS mises à jour:';
  RAISE NOTICE '  - apps: Lecture publique activée';
  RAISE NOTICE '  - bundles: Lecture publique activée';
  RAISE NOTICE '  - v_apps_catalog: SELECT accordé à anon + authenticated';
  RAISE NOTICE '  - v_bundles_catalog: SELECT accordé à anon + authenticated';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test recommandé:';
  RAISE NOTICE '  SELECT * FROM v_apps_catalog LIMIT 1;';
  RAISE NOTICE '  SELECT * FROM v_bundles_catalog LIMIT 1;';
END $$;

-- Test immédiat
SELECT 'Apps catalog:' as test, COUNT(*) as count FROM v_apps_catalog;
SELECT 'Bundles catalog:' as test, COUNT(*) as count FROM v_bundles_catalog;
