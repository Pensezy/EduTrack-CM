-- =====================================================
-- MIGRATION: Tables manquantes pour EduTrack-CM
-- Date: 2025-10-12
-- Description: Création des tables manquantes identifiées
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: classes - Gestion des classes et niveaux
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(10) NOT NULL, -- CE1, CE2, CM1, CM2
    level INTEGER NOT NULL, -- 1, 2, 3, 4
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    capacity INTEGER DEFAULT 30,
    current_students INTEGER DEFAULT 0,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    classroom VARCHAR(50),
    schedule JSONB, -- Emploi du temps
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, school_id, academic_year)
);

-- =====================================================
-- TABLE: school_years - Gestion des années scolaires
-- =====================================================
CREATE TABLE IF NOT EXISTS school_years (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    year VARCHAR(20) NOT NULL, -- 2024-2025
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_period VARCHAR(50) DEFAULT 'Trimestre 1', -- Trimestre 1, 2, 3
    periods JSONB NOT NULL DEFAULT '[
        {"name": "Trimestre 1", "start": "2024-09-01", "end": "2024-12-20"},
        {"name": "Trimestre 2", "start": "2025-01-06", "end": "2025-03-28"},
        {"name": "Trimestre 3", "start": "2025-04-14", "end": "2025-07-05"}
    ]',
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- active, archived, planned
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, school_id)
);

-- =====================================================
-- TABLE: subjects - Matières enseignées
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Mathématiques, Français, etc.
    code VARCHAR(10) NOT NULL, -- MATH, FR, HIST, etc.
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    level_min INTEGER DEFAULT 1, -- Niveau minimum
    level_max INTEGER DEFAULT 4, -- Niveau maximum
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Couleur pour l'interface
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(code, school_id)
);

-- =====================================================
-- TABLE: teachers - Profils enseignants séparés
-- =====================================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    employee_number VARCHAR(20) UNIQUE,
    specializations TEXT[], -- Matières de spécialisation
    classes_assigned UUID[], -- IDs des classes assignées
    subjects_taught UUID[], -- IDs des matières enseignées
    hire_date DATE,
    contract_type VARCHAR(20) DEFAULT 'permanent', -- permanent, contract, substitute
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on_leave
    max_hours_per_week INTEGER DEFAULT 40,
    current_hours_per_week INTEGER DEFAULT 0,
    qualifications JSONB, -- Diplômes et qualifications
    emergency_contact JSONB, -- Contact d'urgence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, school_id)
);

-- =====================================================
-- TABLE: tasks - Gestion des tâches du secrétariat
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- urgent, high, medium, low
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    category VARCHAR(50) DEFAULT 'general', -- appels, inscriptions, documents, etc.
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    due_date DATE,
    due_time TIME,
    completed_at TIMESTAMP WITH TIME ZONE,
    student_related UUID REFERENCES students(id) ON DELETE SET NULL,
    contact_info JSONB, -- Téléphone, email pour les appels
    attachments JSONB, -- Documents attachés
    tags TEXT[], -- Tags pour organisation
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: student_cards - Cartes scolaires des élèves
-- =====================================================
CREATE TABLE IF NOT EXISTS student_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    card_number VARCHAR(20) UNIQUE NOT NULL,
    qr_code TEXT, -- QR Code généré
    barcode TEXT, -- Code-barres
    photo_url TEXT, -- Photo de l'élève
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, lost, stolen, cancelled
    card_type VARCHAR(20) DEFAULT 'standard', -- standard, temporary, replacement
    print_count INTEGER DEFAULT 0,
    last_printed_at TIMESTAMP WITH TIME ZONE,
    printed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    replacement_reason TEXT,
    fees_paid BOOLEAN DEFAULT false,
    design_template VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, school_id)
);

-- =====================================================
-- TABLE: fees - Types de frais scolaires
-- =====================================================
CREATE TABLE IF NOT EXISTS fees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Frais d'inscription, Cantine, etc.
    description TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'one_time', -- one_time, monthly, quarterly, yearly
    category VARCHAR(50) DEFAULT 'tuition', -- tuition, meals, transport, activities
    level_applicable VARCHAR(20) DEFAULT 'all', -- all, CE1, CE2, CM1, CM2
    mandatory BOOLEAN DEFAULT true,
    due_date_type VARCHAR(20) DEFAULT 'fixed', -- fixed, relative
    due_date DATE, -- Pour frais à date fixe
    due_days_after INTEGER, -- Jours après inscription pour frais relatifs
    late_fee DECIMAL(10,2) DEFAULT 0,
    late_fee_days INTEGER DEFAULT 30, -- Jours avant majoration
    active BOOLEAN DEFAULT true,
    academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout à la table payments d'une référence vers fees
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;

-- =====================================================
-- INDEX pour optimiser les performances
-- =====================================================

-- Index pour classes
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- Index pour school_years
CREATE INDEX IF NOT EXISTS idx_school_years_current ON school_years(school_id, is_current);
CREATE INDEX IF NOT EXISTS idx_school_years_status ON school_years(school_id, status);

-- Index pour subjects
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id, active);

-- Index pour teachers
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id, status);
CREATE INDEX IF NOT EXISTS idx_teachers_user ON teachers(user_id);

-- Index pour tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_school_priority ON tasks(school_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date, status);

-- Index pour student_cards
CREATE INDEX IF NOT EXISTS idx_student_cards_student ON student_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_student_cards_school_status ON student_cards(school_id, status);
CREATE INDEX IF NOT EXISTS idx_student_cards_number ON student_cards(card_number);

-- Index pour fees
CREATE INDEX IF NOT EXISTS idx_fees_school_year ON fees(school_id, academic_year, active);
CREATE INDEX IF NOT EXISTS idx_fees_category ON fees(category, active);

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour toutes les tables
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_school_years_updated_at BEFORE UPDATE ON school_years FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_cards_updated_at BEFORE UPDATE ON student_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Insertion de données de base
-- =====================================================

-- Matières standard pour toutes les écoles
INSERT INTO subjects (name, code, school_id, level_min, level_max, coefficient, color) 
SELECT 
    subjects_data.name,
    subjects_data.code,
    schools.id,
    subjects_data.level_min,
    subjects_data.level_max,
    subjects_data.coefficient,
    subjects_data.color
FROM schools,
(VALUES 
    ('Mathématiques', 'MATH', 1, 4, 2.0, '#FF6B6B'),
    ('Français', 'FR', 1, 4, 2.0, '#4ECDC4'),
    ('Histoire-Géographie', 'HIST', 1, 4, 1.5, '#45B7D1'),
    ('Sciences', 'SCI', 1, 4, 1.5, '#96CEB4'),
    ('Arts Plastiques', 'ART', 1, 4, 1.0, '#FFEAA7'),
    ('Éducation Physique', 'EPS', 1, 4, 1.0, '#DDA0DD'),
    ('Anglais', 'ENG', 2, 4, 1.5, '#74B9FF'),
    ('Informatique', 'INFO', 3, 4, 1.0, '#A29BFE')
) AS subjects_data(name, code, level_min, level_max, coefficient, color)
ON CONFLICT (code, school_id) DO NOTHING;

-- Types de frais standard
INSERT INTO fees (name, description, school_id, amount, frequency, category, mandatory, academic_year)
SELECT 
    fees_data.name,
    fees_data.description,
    schools.id,
    fees_data.amount,
    fees_data.frequency,
    fees_data.category,
    fees_data.mandatory,
    '2024-2025'
FROM schools,
(VALUES 
    ('Frais d''inscription', 'Frais d''inscription annuelle', 50000, 'yearly', 'tuition', true),
    ('Cantine scolaire', 'Repas du midi', 15000, 'monthly', 'meals', false),
    ('Transport scolaire', 'Bus scolaire matin et soir', 20000, 'monthly', 'transport', false),
    ('Activités périscolaires', 'Clubs et activités extra-scolaires', 10000, 'quarterly', 'activities', false),
    ('Fournitures scolaires', 'Livres et matériel pédagogique', 25000, 'yearly', 'supplies', true),
    ('Assurance scolaire', 'Couverture accidents scolaires', 5000, 'yearly', 'insurance', true)
) AS fees_data(name, description, amount, frequency, category, mandatory)
ON CONFLICT DO NOTHING;

-- Année scolaire courante pour toutes les écoles
INSERT INTO school_years (year, school_id, start_date, end_date, is_current, status)
SELECT 
    '2024-2025',
    schools.id,
    '2024-09-01',
    '2025-07-31',
    true,
    'active'
FROM schools
ON CONFLICT (year, school_id) DO NOTHING;

COMMENT ON TABLE classes IS 'Gestion des classes et niveaux scolaires';
COMMENT ON TABLE school_years IS 'Années scolaires et périodes';
COMMENT ON TABLE subjects IS 'Matières enseignées dans l''établissement';
COMMENT ON TABLE teachers IS 'Profils détaillés des enseignants';
COMMENT ON TABLE tasks IS 'Tâches et rappels pour le secrétariat';
COMMENT ON TABLE student_cards IS 'Cartes scolaires des élèves';
COMMENT ON TABLE fees IS 'Types de frais et tarification';