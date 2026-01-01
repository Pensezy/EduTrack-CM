-- =====================================================
-- MIGRATION: Associer Utilisateur Principal à une École
-- Date: 2026-01-01
-- Description: Créer une école pour l'utilisateur principal et l'y associer
-- =====================================================

-- =====================================================
-- 1. VÉRIFIER L'UTILISATEUR
-- =====================================================

DO $$
DECLARE
  principal_user RECORD;
  school_exists BOOLEAN;
  school_id_value UUID;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '🔍 VÉRIFICATION UTILISATEUR PRINCIPAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════';

  -- Chercher l'utilisateur principal (pensezy.si@gmail.com)
  SELECT * INTO principal_user
  FROM users
  WHERE email = 'pensezy.si@gmail.com' AND role = 'principal'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE WARNING '❌ Utilisateur principal non trouvé dans la table users';
    RAISE NOTICE 'Astuce: Vérifiez que l''utilisateur s''est connecté au moins une fois';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Utilisateur trouvé:';
  RAISE NOTICE '  - ID: %', principal_user.id;
  RAISE NOTICE '  - Email: %', principal_user.email;
  RAISE NOTICE '  - Nom: %', principal_user.full_name;
  RAISE NOTICE '  - school_id: %', COALESCE(principal_user.school_id::TEXT, 'NULL');

  -- Vérifier si une école existe déjà pour cet utilisateur
  SELECT EXISTS(
    SELECT 1 FROM schools WHERE director_user_id = principal_user.id
  ) INTO school_exists;

  IF school_exists THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Une école existe déjà pour cet utilisateur';

    SELECT id INTO school_id_value FROM schools WHERE director_user_id = principal_user.id LIMIT 1;

    -- Mettre à jour school_id si nécessaire
    IF principal_user.school_id IS NULL OR principal_user.school_id != school_id_value THEN
      UPDATE users
      SET school_id = school_id_value
      WHERE id = principal_user.id;

      RAISE NOTICE '✅ school_id mis à jour: %', school_id_value;
    ELSE
      RAISE NOTICE 'ℹ️ current_school_id déjà correct';
    END IF;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '📝 Création d''une école pour cet utilisateur...';

    -- Créer une école de test
    INSERT INTO schools (
      name,
      code,
      type,
      director_name,
      director_user_id,
      director_email,
      director_phone,
      address,
      phone,
      email,
      status
    ) VALUES (
      'École Pilote EduTrack',
      'EPT-001',
      'private',
      principal_user.full_name,
      principal_user.id,
      principal_user.email,
      COALESCE(principal_user.phone, '+237 6XX XX XX XX'),
      'Yaoundé, Cameroun',
      '+237 600 000 000',
      'ecole.pilote@edutrack.cm',
      'active'
    ) RETURNING id INTO school_id_value;

    RAISE NOTICE '✅ École créée avec ID: %', school_id_value;

    -- Associer l'utilisateur à cette école
    UPDATE users
    SET current_school_id = school_id_value
    WHERE id = principal_user.id;

    RAISE NOTICE '✅ Utilisateur associé à l''école';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📊 RÉSULTAT FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Utilisateur: %', principal_user.email;
  RAISE NOTICE 'École: %', (SELECT name FROM schools WHERE id = school_id_value);
  RAISE NOTICE 'ID École: %', school_id_value;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- =====================================================
-- 2. VÉRIFICATION
-- =====================================================

SELECT
  u.email,
  u.full_name,
  u.role,
  u.current_school_id,
  s.name as school_name,
  s.code as school_code
FROM users u
LEFT JOIN schools s ON s.id = u.current_school_id
WHERE u.email = 'pensezy.si@gmail.com';
