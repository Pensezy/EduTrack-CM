-- ==========================================
-- DIAGNOSTIC DES TABLES
-- ==========================================
-- Executez ce script pour voir les colonnes exactes

-- Colonnes de la table users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Colonnes de la table schools
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'schools'
ORDER BY ordinal_position;

-- Verifier si les triggers existent
SELECT 
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY trigger_name;

-- Voir les logs d'erreurs PostgreSQL (si disponibles)
SELECT * FROM pg_stat_activity WHERE state = 'active';
