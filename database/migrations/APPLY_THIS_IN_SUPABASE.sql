-- =====================================================
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
-- Création de la table enrollment_requests
-- =====================================================

-- 1. Création de la table
CREATE TABLE IF NOT EXISTS enrollment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('nouvelle_inscription', 'redoublement', 'transfert')),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_first_name VARCHAR(100),
  student_last_name VARCHAR(100),
  student_date_of_birth DATE,
  student_gender VARCHAR(10) CHECK (student_gender IN ('Masculin', 'Féminin', 'M', 'F')),
  parent_name VARCHAR(200),
  parent_phone VARCHAR(50),
  parent_email VARCHAR(255),
  parent_address TEXT,
  current_class VARCHAR(50),
  requested_class VARCHAR(50) NOT NULL,
  reason TEXT,
  teacher_recommendation TEXT,
  previous_school VARCHAR(200),
  documents JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_revision', 'approuvee', 'refusee', 'annulee')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'normal', 'faible')),
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_date TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Création des index
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_school ON enrollment_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_status ON enrollment_requests(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_academic_year ON enrollment_requests(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_student ON enrollment_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_submitted_date ON enrollment_requests(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_enrollment_requests_priority ON enrollment_requests(priority);

-- 3. Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_enrollment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_requests_updated_at
  BEFORE UPDATE ON enrollment_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_requests_updated_at();

-- 4. Row Level Security
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enrollment_requests_select_policy ON enrollment_requests;
CREATE POLICY enrollment_requests_select_policy ON enrollment_requests
  FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS enrollment_requests_insert_policy ON enrollment_requests;
CREATE POLICY enrollment_requests_insert_policy ON enrollment_requests
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'secretary', 'admin')
    )
  );

DROP POLICY IF EXISTS enrollment_requests_update_policy ON enrollment_requests;
CREATE POLICY enrollment_requests_update_policy ON enrollment_requests
  FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

DROP POLICY IF EXISTS enrollment_requests_delete_policy ON enrollment_requests;
CREATE POLICY enrollment_requests_delete_policy ON enrollment_requests
  FOR DELETE
  USING (
    status = 'annulee' 
    AND school_id IN (
      SELECT school_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

-- ✅ Migration terminée !
-- Vérifiez avec: SELECT * FROM enrollment_requests;
