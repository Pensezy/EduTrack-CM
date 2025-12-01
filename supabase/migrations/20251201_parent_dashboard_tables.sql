-- ====================================
-- MIGRATION: Parent Dashboard Support
-- Date: 2025-12-01
-- Description: Ajoute les tables et colonnes nécessaires pour le dashboard parent
-- ====================================

-- ====================================
-- ETAPE 1: Modifier la table students
-- ====================================

-- Ajouter les colonnes manquantes à la table students
ALTER TABLE students 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS matricule TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Créer un trigger pour générer automatiquement full_name
CREATE OR REPLACE FUNCTION generate_student_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(CONCAT(NEW.first_name, ' ', NEW.last_name));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS student_full_name_trigger ON students;
CREATE TRIGGER student_full_name_trigger
  BEFORE INSERT OR UPDATE OF first_name, last_name ON students
  FOR EACH ROW
  EXECUTE FUNCTION generate_student_full_name();

-- Mettre à jour les données existantes
UPDATE students 
SET full_name = TRIM(CONCAT(first_name, ' ', last_name))
WHERE full_name IS NULL;

-- Copier registration_number vers matricule
UPDATE students 
SET matricule = registration_number
WHERE matricule IS NULL AND registration_number IS NOT NULL;

-- Créer un index sur matricule
CREATE INDEX IF NOT EXISTS idx_students_matricule ON students(matricule);

-- ====================================
-- ETAPE 2: Créer la table parent_students
-- ====================================

-- Table de liaison simplifiée pour le dashboard parent
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  student_id UUID NOT NULL,
  relationship TEXT DEFAULT 'parent' NOT NULL,
  is_primary BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE (parent_id, student_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON parent_students(student_id);

-- Migrer les données de parent_student_schools vers parent_students
INSERT INTO parent_students (parent_id, student_id, relationship, is_primary, created_at, updated_at)
SELECT DISTINCT 
  parent_id, 
  student_id, 
  relationship_type,
  is_primary_contact,
  created_at,
  updated_at
FROM parent_student_schools
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- ====================================
-- ETAPE 3: Modifier la table grades
-- ====================================

-- Ajouter les colonnes manquantes
ALTER TABLE grades
  ADD COLUMN IF NOT EXISTS grade DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS max_grade DECIMAL(5, 2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS grade_type TEXT,
  ADD COLUMN IF NOT EXISTS comment TEXT,
  ADD COLUMN IF NOT EXISTS coefficient INTEGER DEFAULT 1;

-- Créer un trigger pour synchroniser value <-> grade
CREATE OR REPLACE FUNCTION sync_grade_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Si grade est modifié, mettre à jour value
  IF NEW.grade IS DISTINCT FROM OLD.grade THEN
    NEW.value := NEW.grade;
  END IF;
  
  -- Si value est modifié, mettre à jour grade
  IF NEW.value IS DISTINCT FROM OLD.value THEN
    NEW.grade := NEW.value;
  END IF;
  
  -- Synchroniser max_grade et max_value
  IF NEW.max_grade IS DISTINCT FROM OLD.max_grade THEN
    NEW.max_value := NEW.max_grade;
  END IF;
  
  IF NEW.max_value IS DISTINCT FROM OLD.max_value THEN
    NEW.max_grade := NEW.max_value;
  END IF;
  
  -- Synchroniser grade_type et type
  IF NEW.grade_type IS NOT NULL THEN
    NEW.type := NEW.grade_type::grade_type;
  END IF;
  
  -- Synchroniser comment et description
  IF NEW.comment IS DISTINCT FROM OLD.comment THEN
    NEW.description := NEW.comment;
  END IF;
  
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    NEW.comment := NEW.description;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS grade_sync_trigger ON grades;
CREATE TRIGGER grade_sync_trigger
  BEFORE INSERT OR UPDATE ON grades
  FOR EACH ROW
  EXECUTE FUNCTION sync_grade_value();

-- Mettre à jour les données existantes
UPDATE grades 
SET 
  grade = value,
  max_grade = max_value,
  grade_type = type::text,
  comment = description
WHERE grade IS NULL;

-- ====================================
-- ETAPE 4: Créer la table absences
-- ====================================

-- Table absences pour le dashboard parent (vue simplifiée de attendances)
CREATE TABLE IF NOT EXISTS absences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  absence_date DATE NOT NULL,
  absence_type TEXT DEFAULT 'absent' NOT NULL,
  justified BOOLEAN DEFAULT false NOT NULL,
  justification TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE (student_id, absence_date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_absences_student ON absences(student_id);
CREATE INDEX IF NOT EXISTS idx_absences_date ON absences(absence_date);

-- Migrer les données de attendances vers absences
INSERT INTO absences (student_id, absence_date, absence_type, justified, justification, created_at, updated_at)
SELECT 
  student_id,
  date,
  CASE 
    WHEN status = 'absent' THEN 'absent'
    WHEN status = 'late' THEN 'late'
    WHEN status = 'excused' THEN 'absent'
    ELSE 'absent'
  END,
  CASE 
    WHEN status = 'excused' THEN true
    ELSE false
  END,
  notes,
  created_at,
  updated_at
FROM attendances
WHERE status IN ('absent', 'late', 'excused')
ON CONFLICT (student_id, absence_date) DO NOTHING;

-- ====================================
-- ETAPE 5: Modifier la table payments
-- ====================================

-- Ajouter les colonnes manquantes
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Frais de scolarité',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XAF',
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Copier method vers payment_method
UPDATE payments 
SET payment_method = method
WHERE payment_method IS NULL AND method IS NOT NULL;

-- Mettre à jour le type basé sur la description
UPDATE payments
SET type = CASE
  WHEN description ILIKE '%scolarité%' OR description ILIKE '%frais scolaire%' THEN 'Frais de scolarité'
  WHEN description ILIKE '%uniforme%' THEN 'Uniforme scolaire'
  WHEN description ILIKE '%transport%' THEN 'Transport'
  WHEN description ILIKE '%cantine%' OR description ILIKE '%repas%' THEN 'Cantine'
  WHEN description ILIKE '%activité%' OR description ILIKE '%extra%' THEN 'Activités extra-scolaires'
  WHEN description ILIKE '%livre%' OR description ILIKE '%fourniture%' THEN 'Fournitures scolaires'
  ELSE 'Frais de scolarité'
END
WHERE type IS NULL OR type = 'Frais de scolarité';

-- ====================================
-- ETAPE 6: Créer la table user_notifications
-- ====================================

-- Table pour les notifications individuelles aux utilisateurs (parents)
-- La table "notifications" existante gère les envois de masse
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' NOT NULL,
  priority TEXT DEFAULT 'medium' NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_notifications_school ON user_notifications(school_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON user_notifications(created_at DESC);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS user_notifications_updated_at ON user_notifications;
CREATE TRIGGER user_notifications_updated_at
  BEFORE UPDATE ON user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- ETAPE 7: Créer la table events
-- ====================================

-- Table events pour les événements à venir
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL,
  student_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  type TEXT DEFAULT 'meeting',
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_events_school ON events(school_id);
CREATE INDEX IF NOT EXISTS idx_events_student ON events(student_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ====================================
-- ETAPE 8: Ajouter global_parent_id si manquant
-- ====================================

-- S'assurer que global_parent_id existe et est unique
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parents' AND column_name = 'global_parent_id'
  ) THEN
    ALTER TABLE parents ADD COLUMN global_parent_id UUID UNIQUE DEFAULT gen_random_uuid() NOT NULL;
  END IF;
END $$;

-- Générer des global_parent_id pour les parents existants qui n'en ont pas
UPDATE parents 
SET global_parent_id = gen_random_uuid()
WHERE global_parent_id IS NULL;

-- ====================================
-- ETAPE 9: Créer des fonctions utilitaires
-- ====================================

-- Fonction pour obtenir tous les enfants d'un parent
CREATE OR REPLACE FUNCTION get_parent_children(p_parent_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  matricule TEXT,
  class_name TEXT,
  school_name TEXT,
  school_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    s.matricule,
    c.name,
    sch.name,
    sch.id
  FROM parent_students ps
  JOIN students s ON ps.student_id = s.id
  LEFT JOIN classes c ON s.school_id = c.school_id
  LEFT JOIN schools sch ON s.school_id = sch.id
  WHERE ps.parent_id = p_parent_id
  AND s.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques d'un étudiant
CREATE OR REPLACE FUNCTION get_student_stats(p_student_id UUID)
RETURNS TABLE (
  average_grade DECIMAL,
  attendance_rate DECIMAL,
  unread_notifications INTEGER,
  pending_payments INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(g.grade), 0) as average_grade,
    COALESCE(
      (COUNT(*) FILTER (WHERE a.absence_date IS NULL) * 100.0 / 
       NULLIF(COUNT(*), 0))::DECIMAL, 
      100
    ) as attendance_rate,
    COALESCE(
      (SELECT COUNT(*) FROM user_notifications n 
       WHERE n.user_id = (SELECT user_id FROM students WHERE id = p_student_id) 
       AND n.is_read = false)::INTEGER, 
      0
    ) as unread_notifications,
    COALESCE(
      (SELECT COUNT(*) FROM payments p 
       WHERE p.student_id = p_student_id 
       AND p.status = 'pending')::INTEGER, 
      0
    ) as pending_payments
  FROM students s
  LEFT JOIN grades g ON s.id = g.student_id
  LEFT JOIN absences a ON s.id = a.student_id 
    AND a.absence_date >= CURRENT_DATE - INTERVAL '30 days'
  WHERE s.id = p_student_id
  GROUP BY s.id;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- ETAPE 10: Mettre à jour les triggers updated_at
-- ====================================

-- Fonction générique pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter le trigger sur parent_students
DROP TRIGGER IF EXISTS parent_students_updated_at ON parent_students;
CREATE TRIGGER parent_students_updated_at
  BEFORE UPDATE ON parent_students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ajouter le trigger sur absences
DROP TRIGGER IF EXISTS absences_updated_at ON absences;
CREATE TRIGGER absences_updated_at
  BEFORE UPDATE ON absences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ajouter le trigger sur events
DROP TRIGGER IF EXISTS events_updated_at ON events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- COMMENTAIRES ET DOCUMENTATION
-- ====================================

COMMENT ON TABLE parent_students IS 'Table de liaison simplifiée entre parents et étudiants pour le dashboard parent';
COMMENT ON TABLE absences IS 'Table des absences pour le dashboard parent (vue simplifiée de attendances)';
COMMENT ON TABLE events IS 'Table des événements scolaires (réunions, sorties, cérémonies, etc.)';
COMMENT ON TABLE user_notifications IS 'Notifications individuelles pour les utilisateurs (parents, étudiants)';

COMMENT ON COLUMN students.full_name IS 'Nom complet généré automatiquement depuis first_name + last_name';
COMMENT ON COLUMN students.matricule IS 'Numéro matricule de l''étudiant (copie de registration_number)';
COMMENT ON COLUMN students.photo_url IS 'URL de la photo de profil de l''étudiant';

COMMENT ON COLUMN grades.grade IS 'Note obtenue (synchronisée avec value)';
COMMENT ON COLUMN grades.max_grade IS 'Note maximale (synchronisée avec max_value)';
COMMENT ON COLUMN grades.grade_type IS 'Type de note (synchronisé avec type)';
COMMENT ON COLUMN grades.comment IS 'Commentaire du professeur (synchronisé avec description)';

COMMENT ON COLUMN payments.type IS 'Type de paiement (Frais de scolarité, Uniforme, etc.)';
COMMENT ON COLUMN payments.currency IS 'Devise du paiement (par défaut XAF)';
COMMENT ON COLUMN payments.payment_method IS 'Méthode de paiement (synchronisée avec method)';

COMMENT ON COLUMN user_notifications.type IS 'Type de notification (grades, absences, payments, meetings, info, etc.)';
COMMENT ON COLUMN user_notifications.is_read IS 'Notification lue par l''utilisateur';
COMMENT ON COLUMN user_notifications.metadata IS 'Métadonnées supplémentaires au format JSON';

-- ====================================
-- VERIFICATION
-- ====================================

-- Vérifier que toutes les tables existent
DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  SELECT ARRAY_AGG(table_name) INTO missing_tables
  FROM (
    SELECT unnest(ARRAY['parent_students', 'absences', 'events', 'user_notifications']) AS table_name
  ) t
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = t.table_name
  );
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Tables manquantes: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ Toutes les tables nécessaires ont été créées';
  END IF;
END $$;

-- Afficher un résumé
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE 'MIGRATION TERMINÉE';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Tables créées/modifiées:';
  RAISE NOTICE '  ✅ students (colonnes ajoutées: full_name, matricule, photo_url)';
  RAISE NOTICE '  ✅ parent_students (nouvelle table)';
  RAISE NOTICE '  ✅ grades (colonnes ajoutées: grade, max_grade, grade_type, comment, coefficient)';
  RAISE NOTICE '  ✅ absences (nouvelle table)';
  RAISE NOTICE '  ✅ payments (colonnes ajoutées: type, currency, payment_method)';
  RAISE NOTICE '  ✅ user_notifications (nouvelle table pour notifications individuelles)';
  RAISE NOTICE '  ✅ events (nouvelle table)';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Le dashboard parent est maintenant prêt à fonctionner !';
  RAISE NOTICE '====================================';
END $$;
