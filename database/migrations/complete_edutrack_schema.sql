-- Migration complète pour EduTrack CM
-- Ajouter toutes les tables et colonnes manquantes

-- ====================================
-- 1. MISE À JOUR DE LA TABLE SUBJECTS
-- ====================================

-- Ajouter la colonne category si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'category') THEN
        ALTER TABLE subjects ADD COLUMN category TEXT DEFAULT 'Général';
    END IF;
END $$;

-- ====================================
-- 2. MISE À JOUR DE LA TABLE CLASSES
-- ====================================

-- Ajouter les colonnes manquantes à la table classes
DO $$ 
BEGIN 
    -- Colonne capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'classes' AND column_name = 'capacity') THEN
        ALTER TABLE classes ADD COLUMN capacity INTEGER DEFAULT 30;
    END IF;
    
    -- Colonne current_enrollment
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'classes' AND column_name = 'current_enrollment') THEN
        ALTER TABLE classes ADD COLUMN current_enrollment INTEGER DEFAULT 0;
    END IF;
    
    -- Colonne level si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'classes' AND column_name = 'level') THEN
        ALTER TABLE classes ADD COLUMN level TEXT;
    END IF;
    
    -- Colonne section si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'classes' AND column_name = 'section') THEN
        ALTER TABLE classes ADD COLUMN section TEXT;
    END IF;
END $$;

-- ====================================
-- 3. CRÉATION DE LA TABLE EVALUATION_PERIODS
-- ====================================

CREATE TABLE IF NOT EXISTS evaluation_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les périodes d'évaluation
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_school ON evaluation_periods(school_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_academic_year ON evaluation_periods(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_current ON evaluation_periods(is_current) WHERE is_current = true;

-- ====================================
-- 4. CRÉATION DE LA TABLE GRADE_TYPES
-- ====================================

CREATE TABLE IF NOT EXISTS grade_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Index pour les types de notes
CREATE INDEX IF NOT EXISTS idx_grade_types_school ON grade_types(school_id);
CREATE INDEX IF NOT EXISTS idx_grade_types_active ON grade_types(is_active) WHERE is_active = true;

-- ====================================
-- 5. CRÉATION DE LA TABLE USER_ROLES
-- ====================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Index pour les rôles utilisateur
CREATE INDEX IF NOT EXISTS idx_user_roles_school ON user_roles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active) WHERE is_active = true;

-- ====================================
-- 6. CRÉATION DE LA TABLE ATTENDANCE_TYPES
-- ====================================

CREATE TABLE IF NOT EXISTS attendance_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Index pour les types de présence
CREATE INDEX IF NOT EXISTS idx_attendance_types_school ON attendance_types(school_id);

-- ====================================
-- 7. CRÉATION DE LA TABLE PAYMENT_TYPES
-- ====================================

CREATE TABLE IF NOT EXISTS payment_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    amount DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, code)
);

-- Index pour les types de paiement
CREATE INDEX IF NOT EXISTS idx_payment_types_school ON payment_types(school_id);

-- ====================================
-- 8. MISE À JOUR DE LA TABLE USERS
-- ====================================

-- Ajouter la colonne photo si elle n'existe pas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'photo') THEN
        ALTER TABLE users ADD COLUMN photo TEXT DEFAULT '/assets/images/no_image.png';
    END IF;
END $$;

-- ====================================
-- 9. MISE À JOUR DES PERMISSIONS RLS
-- ====================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE evaluation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour evaluation_periods
CREATE POLICY IF NOT EXISTS "Users can view evaluation_periods from their school" 
ON evaluation_periods FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can insert evaluation_periods for their school" 
ON evaluation_periods FOR INSERT 
WITH CHECK (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can update evaluation_periods from their school" 
ON evaluation_periods FOR UPDATE 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- Politiques RLS pour grade_types
CREATE POLICY IF NOT EXISTS "Users can view grade_types from their school" 
ON grade_types FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can insert grade_types for their school" 
ON grade_types FOR INSERT 
WITH CHECK (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can update grade_types from their school" 
ON grade_types FOR UPDATE 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- Politiques RLS pour user_roles
CREATE POLICY IF NOT EXISTS "Users can view user_roles from their school" 
ON user_roles FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can insert user_roles for their school" 
ON user_roles FOR INSERT 
WITH CHECK (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can update user_roles from their school" 
ON user_roles FOR UPDATE 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- Politiques RLS pour attendance_types
CREATE POLICY IF NOT EXISTS "Users can view attendance_types from their school" 
ON attendance_types FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can insert attendance_types for their school" 
ON attendance_types FOR INSERT 
WITH CHECK (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- Politiques RLS pour payment_types
CREATE POLICY IF NOT EXISTS "Users can view payment_types from their school" 
ON payment_types FOR SELECT 
USING (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "Users can insert payment_types for their school" 
ON payment_types FOR INSERT 
WITH CHECK (
    school_id IN (
        SELECT schools.id FROM schools 
        WHERE schools.director_user_id = auth.uid()
    )
);

-- ====================================
-- 10. FONCTIONS UTILITAIRES
-- ====================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at sur les nouvelles tables
CREATE TRIGGER IF NOT EXISTS evaluation_periods_updated_at
    BEFORE UPDATE ON evaluation_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS grade_types_updated_at
    BEFORE UPDATE ON grade_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS attendance_types_updated_at
    BEFORE UPDATE ON attendance_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS payment_types_updated_at
    BEFORE UPDATE ON payment_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ====================================
-- 11. COMMENTAIRES SUR LES TABLES
-- ====================================

COMMENT ON TABLE evaluation_periods IS 'Périodes d''évaluation (trimestres, semestres) pour chaque école';
COMMENT ON TABLE grade_types IS 'Types de notes (DS, DM, Contrôle, etc.) configurables par école';
COMMENT ON TABLE user_roles IS 'Rôles utilisateur personnalisés avec permissions pour chaque école';
COMMENT ON TABLE attendance_types IS 'Types de présence (Présent, Absent, Retard, etc.)';
COMMENT ON TABLE payment_types IS 'Types de paiements scolaires (Scolarité, Cantine, etc.)';

-- ====================================
-- 12. DONNÉES PAR DÉFAUT GLOBALES
-- ====================================

-- Insertion des types d'attendance par défaut (seulement si la table est vide)
INSERT INTO attendance_types (school_id, name, code, description) 
SELECT 
    s.id,
    'Présent',
    'PRESENT',
    'Élève présent en cours'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types 
    WHERE school_id = s.id AND code = 'PRESENT'
);

INSERT INTO attendance_types (school_id, name, code, description) 
SELECT 
    s.id,
    'Absent',
    'ABSENT',
    'Élève absent non justifié'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types 
    WHERE school_id = s.id AND code = 'ABSENT'
);

INSERT INTO attendance_types (school_id, name, code, description) 
SELECT 
    s.id,
    'Retard',
    'LATE',
    'Élève en retard'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types 
    WHERE school_id = s.id AND code = 'LATE'
);

-- Message de fin
DO $$
BEGIN
    RAISE NOTICE '✅ Migration EduTrack CM terminée avec succès !';
    RAISE NOTICE '📊 Toutes les tables et colonnes nécessaires ont été créées ou mises à jour.';
    RAISE NOTICE '🔒 Les politiques RLS ont été configurées pour la sécurité des données.';
END $$;