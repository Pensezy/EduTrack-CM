-- ====================================
-- SCRIPT DE CRÉATION COMPLÈTE POUR NOUVEAU PROJET SUPABASE
-- EduTrack CM - Schéma complet
-- ====================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. TYPES ÉNUMÉRÉS
-- ====================================

-- Type pour les rôles utilisateur
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin', 'principal', 'secretary', 'teacher', 'student', 'parent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type pour les types d'école
DO $$ BEGIN
    CREATE TYPE school_type AS ENUM (
        'maternelle', 'primaire', 'college', 'lycee', 'universite', 'formation_professionnelle'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type pour les statuts
DO $$ BEGIN
    CREATE TYPE status AS ENUM ('active', 'inactive', 'pending', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Type pour les genres
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('M', 'F', 'Autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================
-- 2. TABLE USERS (Utilisateurs)
-- ====================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role user_role DEFAULT 'student',
    avatar_url TEXT,
    photo TEXT DEFAULT '/assets/images/no_image.png',
    is_active BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true, -- Alias pour compatibilité
    language VARCHAR(5) DEFAULT 'fr',
    timezone VARCHAR(50) DEFAULT 'Africa/Douala',
    current_school_id UUID,
    school_id UUID, -- Pour compatibilité avec les secrétaires
    pin_code VARCHAR(6), -- Code PIN pour authentification alternative (optionnel, principalement pour étudiants/parents)
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================================
-- 3. TABLE SCHOOLS (Écoles)
-- ====================================

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type school_type NOT NULL,
    director_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Cameroun',
    website VARCHAR(255),
    logo TEXT,
    description TEXT,
    available_classes JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{}',
    status status DEFAULT 'pending',
    director_user_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (director_user_id) REFERENCES users(id)
);

-- ====================================
-- 4. TABLE CLASSES
-- ====================================

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50),
    section VARCHAR(10),
    capacity INTEGER DEFAULT 30,
    current_enrollment INTEGER DEFAULT 0,
    academic_year VARCHAR(20),
    main_teacher_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (main_teacher_id) REFERENCES users(id)
);

-- ====================================
-- 5. TABLE SUBJECTS (Matières)
-- ====================================

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    category TEXT DEFAULT 'Général',
    description TEXT,
    coefficient DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- ====================================
-- 6. TABLE STUDENTS (Étudiants)
-- ====================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    school_id UUID NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    class_id UUID,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    place_of_birth VARCHAR(100),
    gender gender,
    address TEXT,
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    emergency_contact VARCHAR(255),
    medical_info TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status status DEFAULT 'active',
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
);

-- ====================================
-- 7. TABLE TEACHERS (Enseignants)
-- ====================================

CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    school_id UUID NOT NULL,
    teacher_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    hire_date DATE DEFAULT CURRENT_DATE,
    status status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- ====================================
-- 8. TABLE PARENTS
-- ====================================

CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profession VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- 9. TABLE PARENT_STUDENT (Relations Parent-Étudiant)
-- ====================================

CREATE TABLE IF NOT EXISTS parent_student (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL,
    student_id UUID NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);

-- ====================================
-- 10. TABLE EVALUATION_PERIODS (Périodes d'évaluation)
-- ====================================

CREATE TABLE IF NOT EXISTS evaluation_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- ====================================
-- 11. TABLE GRADES (Notes)
-- ====================================

CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    evaluation_period_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    grade DECIMAL(5,2),
    max_grade DECIMAL(5,2) DEFAULT 20.0,
    grade_type VARCHAR(50) DEFAULT 'evaluation',
    comment TEXT,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluation_period_id) REFERENCES evaluation_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- ====================================
-- 12. TABLE ASSIGNMENTS (Devoirs/Évaluations)
-- ====================================

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    teacher_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type VARCHAR(50) DEFAULT 'homework',
    due_date DATE,
    max_points DECIMAL(5,2) DEFAULT 20.0,
    instructions TEXT,
    attachments JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- ====================================
-- 13. TABLE NOTIFICATIONS
-- ====================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    school_id UUID,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- ====================================
-- 14. TABLE AUDIT_LOGS (Journaux d'audit)
-- ====================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    school_id UUID,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (school_id) REFERENCES schools(id)
);

-- ====================================
-- 15. TABLE SECRETARIES (Secrétaires avec permissions spécifiques)
-- ====================================

CREATE TABLE IF NOT EXISTS secretaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    school_id UUID NOT NULL,
    secretary_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    permissions JSONB DEFAULT '["student_management", "document_management", "grade_access"]',
    experience_years INTEGER DEFAULT 0,
    hire_date DATE DEFAULT CURRENT_DATE,
    supervisor_id UUID, -- ID du directeur superviseur
    status status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

-- ====================================
-- 16. TABLE TASKS (Tâches pour secrétaires)
-- ====================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL,
    assigned_to UUID, -- ID du secrétaire assigné
    created_by UUID, -- ID du directeur qui a créé la tâche
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ====================================
-- 16. CONTRAINTES ET INDEX
-- ====================================

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_pin_code ON users(pin_code);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_schools_director_user_id ON schools(director_user_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_secretaries_school_id ON secretaries(school_id);
CREATE INDEX IF NOT EXISTS idx_secretaries_supervisor_id ON secretaries(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_school_id ON tasks(school_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Contrainte pour s'assurer qu'un directeur ne dirige qu'une seule école
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_director_user_id ON schools(director_user_id) WHERE director_user_id IS NOT NULL;

-- Mise à jour automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger sur toutes les tables avec updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END
$$;

-- ====================================
-- 16. DONNÉES DE TEST OPTIONNELLES
-- ====================================

-- Insérer un utilisateur admin par défaut (optionnel)
-- Mot de passe sera défini lors de la première connexion
INSERT INTO users (id, email, full_name, role, is_active) 
VALUES (
    'admin-default-uuid', 
    'admin@edutrack.cm', 
    'Administrateur Système', 
    'admin', 
    true
) ON CONFLICT (email) DO NOTHING;

-- ====================================
-- FIN DU SCRIPT
-- ====================================