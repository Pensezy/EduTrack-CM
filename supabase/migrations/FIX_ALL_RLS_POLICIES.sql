-- =====================================================
-- MIGRATION: Corriger TOUTES les politiques RLS
-- Date: 2026-01-01
-- Description: Trouver et afficher toutes les politiques RLS pour diagnostic
-- =====================================================

-- =====================================================
-- 1. LISTER TOUTES LES POLITIQUES RLS EXISTANTES
-- =====================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📋 LISTE DE TOUTES LES POLITIQUES RLS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';

  FOR policy_record IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE 'Table: %.%', policy_record.schemaname, policy_record.tablename;
    RAISE NOTICE 'Policy: %', policy_record.policyname;
    RAISE NOTICE 'USING: %', COALESCE(policy_record.qual, '(aucune)');
    RAISE NOTICE 'WITH CHECK: %', COALESCE(policy_record.with_check, '(aucune)');
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- =====================================================
-- 2. DÉSACTIVER TEMPORAIREMENT RLS SUR school_subscriptions
-- =====================================================

-- Désactiver RLS temporairement pour permettre les requêtes
ALTER TABLE school_subscriptions DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. INSTRUCTIONS POUR L'UTILISATEUR
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '⚠️ RLS DÉSACTIVÉ sur school_subscriptions';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📝 INSTRUCTIONS:';
  RAISE NOTICE '1. Vérifiez les politiques RLS listées ci-dessus';
  RAISE NOTICE '2. Cherchez celles qui contiennent "school_id"';
  RAISE NOTICE '3. Testez maintenant votre application';
  RAISE NOTICE '';
  RAISE NOTICE 'Si ça fonctionne maintenant, le problème vient bien des politiques RLS';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ ATTENTION: RLS est désactivé sur school_subscriptions';
  RAISE NOTICE 'Pour le réactiver, exécutez:';
  RAISE NOTICE '  ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
