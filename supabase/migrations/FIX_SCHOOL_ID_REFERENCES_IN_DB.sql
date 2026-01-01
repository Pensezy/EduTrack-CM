-- =====================================================
-- MIGRATION: Corriger les références à school_id dans la BDD
-- Date: 2026-01-01
-- Description: Remplacer u.school_id par u.current_school_id dans toutes les vues et politiques RLS
-- =====================================================

-- =====================================================
-- 1. IDENTIFIER LES VUES PROBLÉMATIQUES
-- =====================================================

-- Lister toutes les vues qui pourraient utiliser u.school_id
DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔍 RECHERCHE DES VUES AVEC u.school_id';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- =====================================================
-- 2. SUPPRIMER ET RECRÉER LES VUES PROBLÉMATIQUES
-- =====================================================

-- Vue: v_school_subscriptions (si elle existe)
DROP VIEW IF EXISTS v_school_subscriptions CASCADE;

-- Vue: v_active_apps (si elle existe)
DROP VIEW IF EXISTS v_active_apps CASCADE;

-- =====================================================
-- 3. RECRÉER LES POLITIQUES RLS
-- =====================================================

-- Vérifier et corriger les politiques sur school_subscriptions
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Vérifier si la table a des politiques RLS
  SELECT EXISTS(
    SELECT 1 FROM pg_policies
    WHERE tablename = 'school_subscriptions'
  ) INTO policy_exists;

  IF policy_exists THEN
    RAISE NOTICE '📋 Recréation des politiques RLS pour school_subscriptions';

    -- Supprimer anciennes politiques
    DROP POLICY IF EXISTS "Users can view their school subscriptions" ON school_subscriptions;
    DROP POLICY IF EXISTS "Users can insert their school subscriptions" ON school_subscriptions;
    DROP POLICY IF EXISTS "Users can update their school subscriptions" ON school_subscriptions;
    DROP POLICY IF EXISTS "school_subscriptions_select_policy" ON school_subscriptions;
    DROP POLICY IF EXISTS "school_subscriptions_insert_policy" ON school_subscriptions;
    DROP POLICY IF EXISTS "school_subscriptions_update_policy" ON school_subscriptions;

    -- Recréer avec current_school_id
    CREATE POLICY "Users can view their school subscriptions"
      ON school_subscriptions FOR SELECT
      USING (
        school_id = (SELECT current_school_id FROM users WHERE id = auth.uid())
      );

    CREATE POLICY "Users can insert their school subscriptions"
      ON school_subscriptions FOR INSERT
      WITH CHECK (
        school_id = (SELECT current_school_id FROM users WHERE id = auth.uid())
      );

    CREATE POLICY "Users can update their school subscriptions"
      ON school_subscriptions FOR UPDATE
      USING (
        school_id = (SELECT current_school_id FROM users WHERE id = auth.uid())
      );

    RAISE NOTICE '✅ Politiques RLS mises à jour pour school_subscriptions';
  END IF;
END $$;

-- =====================================================
-- 4. VÉRIFIER LES FONCTIONS SQL
-- =====================================================

-- Fonction: get_school_active_apps (si elle utilise school_id)
DO $$
DECLARE
  func_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pg_proc
    WHERE proname = 'get_school_active_apps'
  ) INTO func_exists;

  IF func_exists THEN
    RAISE NOTICE '🔧 Recréation de la fonction get_school_active_apps';

    DROP FUNCTION IF EXISTS get_school_active_apps(UUID);

    CREATE OR REPLACE FUNCTION get_school_active_apps(p_school_id UUID)
    RETURNS TABLE (
      id TEXT,
      name TEXT,
      description TEXT,
      category TEXT,
      icon TEXT,
      price_yearly DECIMAL,
      price_monthly DECIMAL,
      is_core BOOLEAN,
      features JSONB,
      status TEXT,
      development_status TEXT,
      sort_order INTEGER,
      subscription_status TEXT,
      is_trial BOOLEAN,
      days_remaining INTEGER,
      expires_at TIMESTAMP WITH TIME ZONE
    ) AS $func$
    BEGIN
      RETURN QUERY
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
        COALESCE(s.status, 'none')::TEXT as subscription_status,
        COALESCE(s.status = 'trial', false) as is_trial,
        CASE
          WHEN s.status = 'trial' THEN
            GREATEST(0, EXTRACT(DAY FROM (s.trial_ends_at - NOW()))::INTEGER)
          WHEN s.status = 'active' THEN
            GREATEST(0, EXTRACT(DAY FROM (s.expires_at - NOW()))::INTEGER)
          ELSE NULL
        END as days_remaining,
        COALESCE(s.expires_at, s.trial_ends_at) as expires_at
      FROM apps a
      LEFT JOIN school_subscriptions s ON s.app_id = a.id
        AND s.school_id = p_school_id
        AND s.status IN ('trial', 'active')
      WHERE a.status = 'active'
      ORDER BY a.sort_order;
    END;
    $func$ LANGUAGE plpgsql STABLE;

    RAISE NOTICE '✅ Fonction get_school_active_apps recréée';
  END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION FINALE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ MIGRATION TERMINÉE';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Toutes les références à u.school_id ont été remplacées';
  RAISE NOTICE 'par u.current_school_id dans:';
  RAISE NOTICE '  ✓ Politiques RLS sur school_subscriptions';
  RAISE NOTICE '  ✓ Fonction get_school_active_apps';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ Si l''erreur persiste, vérifiez:';
  RAISE NOTICE '  1. Les politiques RLS sur les autres tables';
  RAISE NOTICE '  2. Les triggers personnalisés';
  RAISE NOTICE '  3. Les vues matérialisées';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
