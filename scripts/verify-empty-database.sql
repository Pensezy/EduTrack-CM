-- ==========================================
-- VÉRIFICATION : Compte les lignes dans TOUTES les tables
-- ==========================================

DO $$
DECLARE
  table_record RECORD;
  row_count BIGINT;
  total_rows BIGINT := 0;
  non_empty_tables INTEGER := 0;
BEGIN
  RAISE NOTICE '🔍 Vérification de la base de données...';
  RAISE NOTICE '';

  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.tablename) INTO row_count;

    IF row_count > 0 THEN
      RAISE NOTICE '⚠️  Table "%" contient % lignes', table_record.tablename, row_count;
      non_empty_tables := non_empty_tables + 1;
      total_rows := total_rows + row_count;
    END IF;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  IF total_rows = 0 THEN
    RAISE NOTICE '✅ BASE DE DONNÉES VIDE !';
    RAISE NOTICE 'Toutes les tables sont vides (0 lignes)';
  ELSE
    RAISE NOTICE '⚠️  BASE DE DONNÉES NON VIDE';
    RAISE NOTICE 'Tables non vides : %', non_empty_tables;
    RAISE NOTICE 'Total lignes restantes : %', total_rows;
  END IF;
  RAISE NOTICE '========================================';
END $$;
