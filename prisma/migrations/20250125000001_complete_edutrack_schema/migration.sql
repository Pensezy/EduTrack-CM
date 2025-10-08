-- ============================================================================
-- MIGRATION COMPLÈTE EDUTRACK-CM: Création de toutes les tables
-- ============================================================================
-- Cette migration crée TOUTES les tables nécessaires pour EduTrack-CM
-- À appliquer sur un nouveau projet Supabase vide

-- ============================================================================
-- ÉTAPE 1: Activer les extensions PostgreSQL nécessaires
-- ============================================================================

-- Extension pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Extension pour UUID générés automatiquement
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ÉTAPE 2: Créer les types ENUM personnalisés
-- ============================================================================

-- Type pour les rôles utilisateur
CREATE TYPE "UserRole" AS ENUM ('student', 'teacher', 'parent', 'secretary', 'principal', 'admin');

-- Type pour les types d'école
CREATE TYPE "SchoolType" AS ENUM ('primaire', 'secondaire', 'technique', 'mixte');

-- Type pour les statuts de paiement
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Type pour les types de paiement
CREATE TYPE "PaymentType" AS ENUM ('tuition', 'registration', 'exam', 'transport', 'meal', 'other');

-- Type pour les statuts d'attendance
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');

-- Type pour les types de notification
CREATE TYPE "NotificationType" AS ENUM ('info', 'warning', 'error', 'success');

-- ============================================================================
-- ÉTAPE 3: Créer les tables principales (dans l'ordre des dépendances)
-- ============================================================================

-- Table des utilisateurs (base de l'authentification)
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "full_name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "avatar_url" TEXT,
    "photo" TEXT DEFAULT '/assets/images/no_image.png',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Douala',
    "current_school_id" UUID,
    "last_login" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des écoles
CREATE TABLE "schools" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL UNIQUE,
    "type" "SchoolType" NOT NULL,
    "director_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Cameroun',
    "website" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "available_classes" TEXT[] NOT NULL,
    "settings" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "director_user_id" UUID NOT NULL UNIQUE,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des années académiques
CREATE TABLE "academic_years" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des classes
CREATE TABLE "classes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "section" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "current_enrollment" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des matières
CREATE TABLE "subjects" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT DEFAULT 'Général',
    "description" TEXT,
    "coefficient" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des enseignants
CREATE TABLE "teachers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
    "school_id" UUID NOT NULL,
    "employee_id" TEXT,
    "specialization" TEXT,
    "qualification" TEXT,
    "hire_date" DATE,
    "salary" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des élèves
CREATE TABLE "students" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
    "school_id" UUID NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_id" UUID,
    "parent_id" UUID,
    "date_of_birth" DATE,
    "place_of_birth" TEXT,
    "gender" TEXT,
    "address" TEXT,
    "emergency_contact" TEXT,
    "medical_info" TEXT,
    "enrollment_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des parents
CREATE TABLE "parents" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
    "school_id" UUID NOT NULL,
    "profession" TEXT,
    "workplace" TEXT,
    "relationship" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des paiements
CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "due_date" DATE,
    "paid_date" DATE,
    "payment_method" TEXT,
    "reference" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des présences
CREATE TABLE "attendances" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des notes
CREATE TABLE "grades" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "grade_value" DECIMAL(5,2) NOT NULL,
    "max_grade" DECIMAL(5,2) NOT NULL DEFAULT 20.0,
    "grade_type" TEXT NOT NULL,
    "exam_date" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des notifications
CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "user_id" UUID,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des logs d'audit
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "table_name" TEXT,
    "record_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ÉTAPE 4: Créer les nouvelles tables de configuration
-- ============================================================================

-- Table des périodes d'évaluation
CREATE TABLE "evaluation_periods" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des types de notes configurables
CREATE TABLE "grade_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "coefficient" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des rôles utilisateur personnalisés
CREATE TABLE "user_roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des types de présence configurables
CREATE TABLE "attendance_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des types de paiements configurables
CREATE TABLE "payment_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "school_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ÉTAPE 5: Créer les relations de clés étrangères
-- ============================================================================

-- Relations pour users
ALTER TABLE "users" ADD CONSTRAINT "users_current_school_id_fkey" 
FOREIGN KEY ("current_school_id") REFERENCES "schools"("id") ON DELETE SET NULL;

-- Relations pour schools
ALTER TABLE "schools" ADD CONSTRAINT "schools_director_user_id_fkey" 
FOREIGN KEY ("director_user_id") REFERENCES "users"("id") ON DELETE RESTRICT;

-- Relations pour academic_years
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

-- Relations pour classes
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "classes" ADD CONSTRAINT "classes_academic_year_id_fkey" 
FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE;

-- Relations pour subjects
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

-- Relations pour teachers
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

-- Relations pour students
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" 
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL;

ALTER TABLE "students" ADD CONSTRAINT "students_parent_id_fkey" 
FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE SET NULL;

-- Relations pour parents
ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "parents" ADD CONSTRAINT "parents_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

-- Relations pour payments
ALTER TABLE "payments" ADD CONSTRAINT "payments_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" 
FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;

-- Relations pour attendances
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" 
FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_class_id_fkey" 
FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_academic_year_id_fkey" 
FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE;

-- Relations pour grades
ALTER TABLE "grades" ADD CONSTRAINT "grades_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_fkey" 
FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;

ALTER TABLE "grades" ADD CONSTRAINT "grades_subject_id_fkey" 
FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE;

ALTER TABLE "grades" ADD CONSTRAINT "grades_academic_year_id_fkey" 
FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE;

-- Relations pour notifications
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Relations pour audit_logs
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL;

-- Relations pour les nouvelles tables de configuration
ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_academic_year_id_fkey" 
FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE;

ALTER TABLE "grade_types" ADD CONSTRAINT "grade_types_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "attendance_types" ADD CONSTRAINT "attendance_types_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_school_id_fkey" 
FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;

-- ============================================================================
-- ÉTAPE 6: Créer les index pour optimiser les performances
-- ============================================================================

-- Index pour users
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_current_school_id_idx" ON "users"("current_school_id");
CREATE INDEX "users_role_idx" ON "users"("role");

-- Index pour schools
CREATE INDEX "schools_code_idx" ON "schools"("code");
CREATE INDEX "schools_director_user_id_idx" ON "schools"("director_user_id");

-- Index pour academic_years
CREATE INDEX "academic_years_school_id_idx" ON "academic_years"("school_id");
CREATE INDEX "academic_years_is_current_idx" ON "academic_years"("is_current");

-- Index pour classes
CREATE INDEX "classes_school_id_idx" ON "classes"("school_id");
CREATE INDEX "classes_academic_year_id_idx" ON "classes"("academic_year_id");

-- Index pour subjects
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");
CREATE INDEX "subjects_is_active_idx" ON "subjects"("is_active");

-- Index pour teachers
CREATE INDEX "teachers_user_id_idx" ON "teachers"("user_id");
CREATE INDEX "teachers_school_id_idx" ON "teachers"("school_id");

-- Index pour students
CREATE INDEX "students_user_id_idx" ON "students"("user_id");
CREATE INDEX "students_school_id_idx" ON "students"("school_id");
CREATE INDEX "students_class_id_idx" ON "students"("class_id");
CREATE INDEX "students_student_id_idx" ON "students"("student_id");

-- Index pour parents
CREATE INDEX "parents_user_id_idx" ON "parents"("user_id");
CREATE INDEX "parents_school_id_idx" ON "parents"("school_id");

-- Index pour payments
CREATE INDEX "payments_school_id_idx" ON "payments"("school_id");
CREATE INDEX "payments_student_id_idx" ON "payments"("student_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- Index pour attendances
CREATE INDEX "attendances_school_id_idx" ON "attendances"("school_id");
CREATE INDEX "attendances_student_id_idx" ON "attendances"("student_id");
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- Index pour grades
CREATE INDEX "grades_school_id_idx" ON "grades"("school_id");
CREATE INDEX "grades_student_id_idx" ON "grades"("student_id");
CREATE INDEX "grades_subject_id_idx" ON "grades"("subject_id");

-- Index pour notifications
CREATE INDEX "notifications_school_id_idx" ON "notifications"("school_id");
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- Index pour audit_logs
CREATE INDEX "audit_logs_school_id_idx" ON "audit_logs"("school_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- Index pour les nouvelles tables
CREATE INDEX "evaluation_periods_school_id_idx" ON "evaluation_periods"("school_id");
CREATE INDEX "evaluation_periods_academic_year_id_idx" ON "evaluation_periods"("academic_year_id");
CREATE INDEX "evaluation_periods_is_current_idx" ON "evaluation_periods"("is_current");

CREATE INDEX "grade_types_school_id_idx" ON "grade_types"("school_id");
CREATE INDEX "grade_types_is_active_idx" ON "grade_types"("is_active");

CREATE INDEX "user_roles_school_id_idx" ON "user_roles"("school_id");
CREATE INDEX "user_roles_is_active_idx" ON "user_roles"("is_active");

CREATE INDEX "attendance_types_school_id_idx" ON "attendance_types"("school_id");
CREATE INDEX "attendance_types_is_active_idx" ON "attendance_types"("is_active");

CREATE INDEX "payment_types_school_id_idx" ON "payment_types"("school_id");
CREATE INDEX "payment_types_is_active_idx" ON "payment_types"("is_active");

-- ============================================================================
-- ÉTAPE 7: Créer les contraintes uniques
-- ============================================================================

-- Contraintes uniques importantes
ALTER TABLE "schools" ADD CONSTRAINT "schools_code_key" UNIQUE ("code");
ALTER TABLE "schools" ADD CONSTRAINT "schools_director_user_id_key" UNIQUE ("director_user_id");

ALTER TABLE "students" ADD CONSTRAINT "students_user_id_key" UNIQUE ("user_id");
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_student_id_key" UNIQUE ("school_id", "student_id");

ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_key" UNIQUE ("user_id");

ALTER TABLE "parents" ADD CONSTRAINT "parents_user_id_key" UNIQUE ("user_id");

ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_code_key" UNIQUE ("school_id", "code");

-- Contraintes uniques pour les nouvelles tables
ALTER TABLE "evaluation_periods" ADD CONSTRAINT "evaluation_periods_school_id_academic_year_id_name_key" UNIQUE ("school_id", "academic_year_id", "name");
ALTER TABLE "grade_types" ADD CONSTRAINT "grade_types_school_id_code_key" UNIQUE ("school_id", "code");
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_school_id_code_key" UNIQUE ("school_id", "code");
ALTER TABLE "attendance_types" ADD CONSTRAINT "attendance_types_school_id_code_key" UNIQUE ("school_id", "code");
ALTER TABLE "payment_types" ADD CONSTRAINT "payment_types_school_id_code_key" UNIQUE ("school_id", "code");

-- ============================================================================
-- ÉTAPE 8: Vérification finale
-- ============================================================================

-- Compter toutes les tables créées
SELECT 
    COUNT(*) as total_tables,
    'Tables principales créées avec succès' as message
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
    'users', 'schools', 'academic_years', 'classes', 'subjects', 
    'teachers', 'students', 'parents', 'payments', 'attendances', 
    'grades', 'notifications', 'audit_logs', 'evaluation_periods', 
    'grade_types', 'user_roles', 'attendance_types', 'payment_types'
);

-- Vérifier les types ENUM créés
SELECT 
    COUNT(*) as total_enums,
    'Types ENUM créés avec succès' as message
FROM pg_type 
WHERE typname IN ('UserRole', 'SchoolType', 'PaymentStatus', 'PaymentType', 'AttendanceStatus', 'NotificationType');

-- Message de confirmation final
SELECT 'Migration complète EduTrack-CM appliquée avec succès! 🎉' as status;