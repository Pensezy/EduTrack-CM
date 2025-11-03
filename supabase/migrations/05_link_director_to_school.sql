-- Migration pour synchroniser les liens bidirectionnels users <-> schools
-- Date: 2025-10-29
-- Objectif: S'assurer que TOUS les directeurs sont correctement liés à leurs écoles

-- =====================================================
-- ÉTAPE 1: Synchroniser schools.director_user_id 
-- Pour tous les directeurs qui ont un current_school_id
-- =====================================================
UPDATE schools s
SET 
  director_user_id = u.id,
  director_name = u.full_name,
  phone = COALESCE(s.phone, u.phone),
  email = COALESCE(s.email, u.email),
  updated_at = NOW()
FROM users u
WHERE u.role = 'principal'
  AND u.current_school_id = s.id
  AND s.director_user_id IS NULL;

-- =====================================================
-- ÉTAPE 2: Synchroniser users.current_school_id
-- Pour tous les directeurs liés dans schools.director_user_id
-- =====================================================
UPDATE users u
SET 
  current_school_id = s.id,
  updated_at = NOW()
FROM schools s
WHERE s.director_user_id = u.id
  AND u.role = 'principal'
  AND u.current_school_id IS NULL;

-- =====================================================
-- ÉTAPE 3: Rapport de synchronisation
-- =====================================================
DO $$
DECLARE
  v_synced_schools INT;
  v_synced_users INT;
BEGIN
  -- Compter les écoles avec directeur lié
  SELECT COUNT(*) INTO v_synced_schools
  FROM schools
  WHERE director_user_id IS NOT NULL;

  -- Compter les directeurs avec école liée
  SELECT COUNT(*) INTO v_synced_users
  FROM users
  WHERE role = 'principal'
    AND current_school_id IS NOT NULL;

  RAISE NOTICE '=== RAPPORT DE SYNCHRONISATION ===';
  RAISE NOTICE 'Écoles avec directeur lié: %', v_synced_schools;
  RAISE NOTICE 'Directeurs avec école liée: %', v_synced_users;
  RAISE NOTICE 'Synchronisation terminée avec succès!';
END $$;

-- =====================================================
-- ÉTAPE 4: Vérification finale des liens
-- =====================================================
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.role,
  u.current_school_id,
  s.id as school_id,
  s.name as school_name,
  s.director_user_id,
  CASE 
    WHEN u.current_school_id = s.id AND s.director_user_id = u.id THEN '✅ Lien bidirectionnel OK'
    WHEN u.current_school_id = s.id AND s.director_user_id IS NULL THEN '⚠️ Manque director_user_id dans school'
    WHEN u.current_school_id IS NULL AND s.director_user_id = u.id THEN '⚠️ Manque current_school_id dans user'
    ELSE '❌ Liens incohérents'
  END as status
FROM users u
LEFT JOIN schools s ON s.id = u.current_school_id OR s.director_user_id = u.id
WHERE u.role = 'principal'
ORDER BY u.created_at DESC;
