-- ============================================================================
-- Migration: Mise à jour des limites App Core Gratuite
-- Date: 2026-01-02
-- Description: Limite App Core à 20 élèves, 1 classe, 3 enseignants, 0 secrétaire
-- ============================================================================

-- 1. Mettre à jour la description et limitations de l'App Core
UPDATE apps
SET
  description = 'Le socle indispensable de votre digitalisation. Limité à 20 élèves et 1 classe. Bulletins PDF basiques inclus (sans personnalisation).',
  limitations = jsonb_build_object(
    'max_students', 20,
    'max_classes', 1,
    'max_teachers', 3,
    'features', jsonb_build_object(
      'grades_entry', true,
      'basic_bulletins_pdf', true,
      'professional_bulletins_pdf', false,
      'school_logo_on_bulletins', false,
      'bulletin_customization', false,
      'advanced_statistics', false,
      'excel_exports', false,
      'sms_notifications', false,
      'email_notifications', false,
      'payment_management', false,
      'attendance_tracking', false
    )
  )
WHERE id = 'core';

-- 2. Fonction pour vérifier la limite d'élèves
CREATE OR REPLACE FUNCTION check_student_limit_core()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  school_has_paid_academic BOOLEAN;
BEGIN
  -- Compter les élèves actuels de cette école
  SELECT COUNT(*) INTO current_count
  FROM students
  WHERE school_id = NEW.school_id;

  -- Vérifier si l'école a souscrit à l'App Académique
  SELECT EXISTS (
    SELECT 1
    FROM school_subscriptions
    WHERE school_id = NEW.school_id
      AND app_id = 'academic'
      AND status IN ('trial', 'active')
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO school_has_paid_academic;

  -- Si pas d'app académique ET limite dépassée
  IF NOT school_has_paid_academic AND current_count >= 20 THEN
    RAISE EXCEPTION 'Limite de 20 élèves atteinte avec App Core gratuite. Souscrivez à App Académique pour débloquer jusqu''à 500 élèves.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer le trigger sur insertion d'élève
DROP TRIGGER IF EXISTS enforce_student_limit_core ON students;
CREATE TRIGGER enforce_student_limit_core
  BEFORE INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION check_student_limit_core();

-- 4. Fonction pour vérifier la limite de classes
CREATE OR REPLACE FUNCTION check_class_limit_core()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  school_has_paid_academic BOOLEAN;
BEGIN
  -- Compter les classes actuelles de cette école
  SELECT COUNT(*) INTO current_count
  FROM classes
  WHERE school_id = NEW.school_id;

  -- Vérifier si l'école a souscrit à l'App Académique
  SELECT EXISTS (
    SELECT 1
    FROM school_subscriptions
    WHERE school_id = NEW.school_id
      AND app_id = 'academic'
      AND status IN ('trial', 'active')
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO school_has_paid_academic;

  -- Si pas d'app académique ET limite dépassée
  IF NOT school_has_paid_academic AND current_count >= 1 THEN
    RAISE EXCEPTION 'Limite de 1 classe atteinte avec App Core gratuite. Souscrivez à App Académique pour créer des classes illimitées.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger sur insertion de classe
DROP TRIGGER IF EXISTS enforce_class_limit_core ON classes;
CREATE TRIGGER enforce_class_limit_core
  BEFORE INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION check_class_limit_core();

-- 6. Fonction pour vérifier la limite d'enseignants ET bloquer les secrétaires
CREATE OR REPLACE FUNCTION check_teacher_secretary_limit_core()
RETURNS TRIGGER AS $$
DECLARE
  current_teacher_count INTEGER;
  user_school_id UUID;
  school_has_paid_academic BOOLEAN;
BEGIN
  -- Récupérer le school_id de l'utilisateur
  SELECT current_school_id INTO user_school_id
  FROM users
  WHERE id = NEW.user_id;

  -- Si pas de school_id, on laisse passer (sera géré ailleurs)
  IF user_school_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Vérifier si l'école a souscrit à l'App Académique
  SELECT EXISTS (
    SELECT 1
    FROM school_subscriptions
    WHERE school_id = user_school_id
      AND app_id = 'academic'
      AND status IN ('trial', 'active')
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO school_has_paid_academic;

  -- BLOCAGE ABSOLU: Pas de secrétaire en mode App Core gratuite
  IF NOT school_has_paid_academic AND EXISTS (
    SELECT 1 FROM users WHERE id = NEW.user_id AND role = 'secretary'
  ) THEN
    RAISE EXCEPTION 'Les comptes secrétaires ne sont pas disponibles avec App Core gratuite. Souscrivez à App Académique pour débloquer cette fonctionnalité.';
  END IF;

  -- Vérifier la limite d'enseignants (3 max)
  SELECT COUNT(*) INTO current_teacher_count
  FROM teachers
  WHERE school_id = user_school_id;

  IF NOT school_has_paid_academic AND current_teacher_count >= 3 THEN
    RAISE EXCEPTION 'Limite de 3 enseignants atteinte avec App Core gratuite. Souscrivez à App Académique pour créer des comptes enseignants illimités.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer le trigger sur insertion d'enseignant
DROP TRIGGER IF EXISTS enforce_teacher_limit_core ON teachers;
CREATE TRIGGER enforce_teacher_limit_core
  BEFORE INSERT ON teachers
  FOR EACH ROW
  EXECUTE FUNCTION check_teacher_secretary_limit_core();

-- 8. Fonction pour bloquer la création de secrétaire au niveau users
CREATE OR REPLACE FUNCTION check_secretary_creation_core()
RETURNS TRIGGER AS $$
DECLARE
  school_has_paid_academic BOOLEAN;
BEGIN
  -- Vérifier uniquement pour les secrétaires
  IF NEW.role != 'secretary' THEN
    RETURN NEW;
  END IF;

  -- Si pas de school_id, on laisse passer (sera bloqué au niveau création du profil)
  IF NEW.current_school_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Vérifier si l'école a souscrit à l'App Académique
  SELECT EXISTS (
    SELECT 1
    FROM school_subscriptions
    WHERE school_id = NEW.current_school_id
      AND app_id = 'academic'
      AND status IN ('trial', 'active')
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO school_has_paid_academic;

  -- Bloquer création secrétaire si pas d'App Académique
  IF NOT school_has_paid_academic THEN
    RAISE EXCEPTION 'Les comptes secrétaires ne sont pas disponibles avec App Core gratuite. Souscrivez à App Académique (75 000 FCFA/an) pour débloquer cette fonctionnalité.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer le trigger sur insertion/update d'utilisateur avec role secrétaire
DROP TRIGGER IF EXISTS enforce_secretary_block_core ON users;
CREATE TRIGGER enforce_secretary_block_core
  BEFORE INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_secretary_creation_core();

-- 10. Commentaires pour documentation
COMMENT ON FUNCTION check_student_limit_core() IS 'Vérifie que les écoles avec App Core gratuite ne dépassent pas 20 élèves';
COMMENT ON FUNCTION check_class_limit_core() IS 'Vérifie que les écoles avec App Core gratuite ne dépassent pas 1 classe';
COMMENT ON FUNCTION check_teacher_secretary_limit_core() IS 'Vérifie que les écoles avec App Core gratuite ne dépassent pas 3 enseignants et bloque les secrétaires';
COMMENT ON FUNCTION check_secretary_creation_core() IS 'Bloque la création de comptes secrétaires pour les écoles sans App Académique';
COMMENT ON TRIGGER enforce_student_limit_core ON students IS 'Bloque l''insertion d''élèves au-delà de 20 pour App Core gratuite';
COMMENT ON TRIGGER enforce_class_limit_core ON classes IS 'Bloque l''insertion de classes au-delà de 1 pour App Core gratuite';
COMMENT ON TRIGGER enforce_teacher_limit_core ON teachers IS 'Bloque l''insertion d''enseignants au-delà de 3 pour App Core gratuite';
COMMENT ON TRIGGER enforce_secretary_block_core ON users IS 'Bloque la création de comptes secrétaires pour App Core gratuite';

-- ============================================================================
-- Fin de la migration
-- ============================================================================
