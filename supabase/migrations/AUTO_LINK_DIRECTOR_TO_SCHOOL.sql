-- =====================================================
-- MIGRATION: Lien Automatique Directeur ↔ École
-- Date: 2026-01-01
-- Description: Créer un trigger pour associer automatiquement le directeur à son école
-- =====================================================

-- =====================================================
-- 1. FONCTION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION link_director_to_school()
RETURNS TRIGGER AS $$
BEGIN
  -- Si director_user_id est défini, mettre à jour current_school_id du directeur
  IF NEW.director_user_id IS NOT NULL THEN
    UPDATE users
    SET current_school_id = NEW.id
    WHERE id = NEW.director_user_id;

    RAISE NOTICE '✅ Directeur (%) associé à l''école %', NEW.director_user_id, NEW.name;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION link_director_to_school() IS 'Associe automatiquement le directeur à son école lors de la création';

-- =====================================================
-- 2. CRÉER LE TRIGGER
-- =====================================================

DROP TRIGGER IF EXISTS on_school_created_link_director ON schools;

CREATE TRIGGER on_school_created_link_director
  AFTER INSERT ON schools
  FOR EACH ROW
  EXECUTE FUNCTION link_director_to_school();

COMMENT ON TRIGGER on_school_created_link_director ON schools IS 'Déclenché après création d''une école pour lier le directeur';

-- =====================================================
-- 3. CRÉER AUSSI UN TRIGGER POUR UPDATE
-- =====================================================

DROP TRIGGER IF EXISTS on_school_director_updated ON schools;

CREATE TRIGGER on_school_director_updated
  AFTER UPDATE OF director_user_id ON schools
  FOR EACH ROW
  WHEN (NEW.director_user_id IS DISTINCT FROM OLD.director_user_id)
  EXECUTE FUNCTION link_director_to_school();

COMMENT ON TRIGGER on_school_director_updated ON schools IS 'Déclenché quand le directeur change pour mettre à jour le lien';

-- =====================================================
-- 4. VÉRIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ TRIGGERS CRÉÉS AVEC SUCCÈS';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Trigger 1: on_school_created_link_director';
  RAISE NOTICE '  → Lie automatiquement le directeur à l''école lors de la création';
  RAISE NOTICE '';
  RAISE NOTICE 'Trigger 2: on_school_director_updated';
  RAISE NOTICE '  → Met à jour le lien si le directeur change';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Désormais, lors de la création d''une école:';
  RAISE NOTICE '  1. school.director_user_id = ID du directeur';
  RAISE NOTICE '  2. users.current_school_id = ID de l''école (AUTO)';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
