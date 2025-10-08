-- Migration: Ajout des colonnes manquantes et nouvelles tables
-- Date: 2025-01-25
-- Description: Ajoute les colonnes manquantes aux tables existantes et crée les nouvelles tables de configuration

-- Étape 1: Ajouter les colonnes manquantes aux tables existantes
BEGIN;

-- Ajouter la colonne 'photo' à la table users (si elle n'existe pas déjà)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'photo') THEN
        ALTER TABLE users ADD COLUMN photo TEXT;
    END IF;
END $$;

-- Ajouter la colonne 'category' à la table subjects (si elle n'existe pas déjà)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subjects' AND column_name = 'category') THEN
        ALTER TABLE subjects ADD COLUMN category TEXT DEFAULT 'general';
    END IF;
END $$;

-- Ajouter les colonnes 'capacity' et 'current_enrollment' à la table classes (si elles n'existent pas déjà)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'capacity') THEN
        ALTER TABLE classes ADD COLUMN capacity INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'current_enrollment') THEN
        ALTER TABLE classes ADD COLUMN current_enrollment INTEGER DEFAULT 0;
    END IF;
END $$;

COMMIT;

-- Étape 2: Créer les nouvelles tables de configuration
BEGIN;

-- Table des périodes d'évaluation (trimestres, semestres)
CREATE TABLE IF NOT EXISTS evaluation_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, academic_year_id, name)
);

-- Table des types de notes configurables
CREATE TABLE IF NOT EXISTS grade_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, code)
);

-- Table des rôles utilisateur personnalisés
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, code)
);

-- Table des types de présence configurables
CREATE TABLE IF NOT EXISTS attendance_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, code)
);

-- Table des types de paiements configurables
CREATE TABLE IF NOT EXISTS payment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    amount DECIMAL(10,2),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, code)
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_school_id ON evaluation_periods(school_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_academic_year_id ON evaluation_periods(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_periods_is_current ON evaluation_periods(is_current);

CREATE INDEX IF NOT EXISTS idx_grade_types_school_id ON grade_types(school_id);
CREATE INDEX IF NOT EXISTS idx_grade_types_is_active ON grade_types(is_active);

CREATE INDEX IF NOT EXISTS idx_user_roles_school_id ON user_roles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_attendance_types_school_id ON attendance_types(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_types_is_active ON attendance_types(is_active);

CREATE INDEX IF NOT EXISTS idx_payment_types_school_id ON payment_types(school_id);
CREATE INDEX IF NOT EXISTS idx_payment_types_is_active ON payment_types(is_active);

COMMIT;

-- Étape 3: Insérer des données par défaut pour les nouvelles tables de configuration
BEGIN;

-- Types de notes par défaut (seront ajoutés pour chaque école existante)
INSERT INTO grade_types (school_id, name, code, coefficient, description)
SELECT 
    s.id,
    'Interrogation',
    'INT',
    1.0,
    'Note d''interrogation écrite ou orale'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM grade_types gt 
    WHERE gt.school_id = s.id AND gt.code = 'INT'
);

INSERT INTO grade_types (school_id, name, code, coefficient, description)
SELECT 
    s.id,
    'Devoir',
    'DEV',
    2.0,
    'Note de devoir surveillé'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM grade_types gt 
    WHERE gt.school_id = s.id AND gt.code = 'DEV'
);

INSERT INTO grade_types (school_id, name, code, coefficient, description)
SELECT 
    s.id,
    'Composition',
    'COMP',
    3.0,
    'Note de composition trimestrielle'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM grade_types gt 
    WHERE gt.school_id = s.id AND gt.code = 'COMP'
);

-- Types de présence par défaut
INSERT INTO attendance_types (school_id, name, code, description)
SELECT 
    s.id,
    'Présent',
    'P',
    'Élève présent en classe'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types at 
    WHERE at.school_id = s.id AND at.code = 'P'
);

INSERT INTO attendance_types (school_id, name, code, description)
SELECT 
    s.id,
    'Absent',
    'A',
    'Élève absent non justifié'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types at 
    WHERE at.school_id = s.id AND at.code = 'A'
);

INSERT INTO attendance_types (school_id, name, code, description)
SELECT 
    s.id,
    'Absent Justifié',
    'AJ',
    'Élève absent avec justification'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types at 
    WHERE at.school_id = s.id AND at.code = 'AJ'
);

INSERT INTO attendance_types (school_id, name, code, description)
SELECT 
    s.id,
    'Retard',
    'R',
    'Élève en retard'
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_types at 
    WHERE at.school_id = s.id AND at.code = 'R'
);

-- Rôles utilisateur par défaut
INSERT INTO user_roles (school_id, name, code, permissions)
SELECT 
    s.id,
    'Directeur',
    'DIRECTOR',
    '["manage_all", "view_reports", "manage_users", "manage_settings"]'::jsonb
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.school_id = s.id AND ur.code = 'DIRECTOR'
);

INSERT INTO user_roles (school_id, name, code, permissions)
SELECT 
    s.id,
    'Enseignant',
    'TEACHER',
    '["manage_grades", "view_students", "manage_attendance"]'::jsonb
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.school_id = s.id AND ur.code = 'TEACHER'
);

INSERT INTO user_roles (school_id, name, code, permissions)
SELECT 
    s.id,
    'Secrétaire',
    'SECRETARY',
    '["manage_students", "manage_payments", "view_reports"]'::jsonb
FROM schools s
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.school_id = s.id AND ur.code = 'SECRETARY'
);

COMMIT;

-- Notification de fin de migration
SELECT 'Migration terminée avec succès: Colonnes et tables ajoutées' AS message;