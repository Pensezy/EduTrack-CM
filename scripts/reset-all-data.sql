-- ==========================================
-- SCRIPT UNIVERSEL DE RESET COMPLET
-- Efface TOUTES les données de TOUTES les tables
-- ⚠️ GARDE les structures (tables, colonnes, contraintes, RLS)
-- ==========================================

DO $$
DECLARE
  table_record RECORD;
  total_tables INTEGER := 0;
  total_rows_deleted BIGINT := 0;
BEGIN
  RAISE NOTICE '🔄 Début du nettoyage de la base de données...';
  RAISE NOTICE '';

  -- Désactiver temporairement les triggers pour accélérer
  SET session_replication_role = 'replica';

  -- Parcourir TOUTES les tables du schéma public
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    BEGIN
      -- Compter les lignes avant suppression
      DECLARE
        row_count BIGINT;
      BEGIN
        EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.tablename) INTO row_count;

        IF row_count > 0 THEN
          -- Vider la table (supprime les données, garde la structure)
          EXECUTE format('TRUNCATE TABLE public.%I CASCADE', table_record.tablename);

          total_tables := total_tables + 1;
          total_rows_deleted := total_rows_deleted + row_count;

          RAISE NOTICE '✅ Table "%" vidée (% lignes supprimées)', table_record.tablename, row_count;
        ELSE
          RAISE NOTICE '⚪ Table "%" déjà vide', table_record.tablename;
        END IF;
      END;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur sur table "%" : %', table_record.tablename, SQLERRM;
    END;
  END LOOP;

  -- Réactiver les triggers
  SET session_replication_role = 'origin';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ NETTOYAGE TERMINÉ !';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables vidées : %', total_tables;
  RAISE NOTICE 'Lignes supprimées : %', total_rows_deleted;
  RAISE NOTICE '';
  RAISE NOTICE '📝 PROCHAINES ÉTAPES :';
  RAISE NOTICE '   1. Allez dans Supabase Dashboard';
  RAISE NOTICE '   2. Authentication > Users';
  RAISE NOTICE '   3. Supprimez TOUS les utilisateurs manuellement';
  RAISE NOTICE '   4. Testez le nouveau parcours d''inscription';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT : Les tables et leur structure sont INTACTES';
  RAISE NOTICE '   - Colonnes conservées ✅';
  RAISE NOTICE '   - Contraintes conservées ✅';
  RAISE NOTICE '   - Politiques RLS conservées ✅';
  RAISE NOTICE '   - Seules les DONNÉES ont été supprimées';
END $$;
