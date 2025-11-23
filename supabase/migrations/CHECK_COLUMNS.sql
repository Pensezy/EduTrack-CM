-- ====================================
-- VÉRIFICATION RAPIDE DES COLONNES MANQUANTES
-- ====================================

-- 1. Colonnes de la table students
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'students' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Colonnes de la table classes
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'classes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Colonnes de la table grades
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'grades' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Colonnes de la table attendances
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'attendances' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Colonnes de la table notifications
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public'
ORDER BY ordinal_position;
