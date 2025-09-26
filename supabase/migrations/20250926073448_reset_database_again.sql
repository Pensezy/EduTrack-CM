-- Reset complet de la base de données - Nouvelle version
-- Date: 2025-09-26
-- Description: Supprime TOUT le contenu actuel et recrée une base vierge

-- =============================================================================
-- PHASE 1: NETTOYAGE COMPLET ET RADICAL
-- =============================================================================

-- Supprimer toutes les vues
DROP VIEW IF EXISTS principals_view CASCADE;

-- Supprimer toutes les fonctions personnalisées
DROP FUNCTION IF EXISTS create_principal_account CASCADE;
DROP FUNCTION IF EXISTS create_principal_school CASCADE;
DROP FUNCTION IF EXISTS get_principal_details CASCADE;
DROP FUNCTION IF EXISTS list_principals CASCADE;
DROP FUNCTION IF EXISTS get_principals_stats CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS handle_user_update CASCADE;

-- Supprimer tous les triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Supprimer toutes les tables dans l'ordre correct (dépendances)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.academic_years CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

-- Supprimer tous les types ENUM personnalisés
DROP TYPE IF EXISTS public.school_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.attendance_status CASCADE;
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;

-- Supprimer toutes les données utilisateur dans auth.users (ATTENTION!)
-- DELETE FROM auth.users;

-- =============================================================================
-- PHASE 2: CRÉATION DU NOUVEAU SCHÉMA VIERGE
-- =============================================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Créer les types ENUM
CREATE TYPE public.school_type AS ENUM (
  'primary',
  'secondary', 
  'nursery',
  'technical',
  'bilingual'
);

CREATE TYPE public.user_role AS ENUM (
  'admin',
  'principal', 
  'teacher',
  'student',
  'parent',
  'secretary'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'absent',
  'late',
  'excused'
);

CREATE TYPE public.document_type AS ENUM (
  'certificate',
  'transcript',
  'report',
  'assignment',
  'administrative'
);

CREATE TYPE public.notification_type AS ENUM (
  'info',
  'warning',
  'success',
  'error',
  'reminder'
);

-- =============================================================================
-- CRÉATION DES TABLES
-- =============================================================================

-- Table des écoles
CREATE TABLE public.schools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  type public.school_type NOT NULL,
  address text,
  city varchar(100),
  country varchar(100) DEFAULT 'Cameroon',
  phone varchar(50),
  email varchar(255),
  director_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT schools_name_check CHECK (length(name) >= 2),
  CONSTRAINT schools_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table des utilisateurs
CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) UNIQUE NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  phone varchar(50),
  address text,
  city varchar(100),
  country varchar(100) DEFAULT 'Cameroon',
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  last_login timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT users_name_check CHECK (length(first_name) >= 2 AND length(last_name) >= 2),
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Ajouter la contrainte foreign key pour director_user_id après création de users
ALTER TABLE public.schools 
ADD CONSTRAINT schools_director_user_id_fkey 
FOREIGN KEY (director_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Table des professeurs
CREATE TABLE public.teachers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  subject varchar(100),
  hire_date date,
  salary decimal(10,2),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, school_id)
);

-- Table des étudiants
CREATE TABLE public.students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  student_number varchar(50) UNIQUE,
  class_level varchar(50),
  enrollment_date date DEFAULT CURRENT_DATE,
  parent_contact varchar(255),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(user_id, school_id)
);

-- Table des années académiques
CREATE TABLE public.academic_years (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT academic_years_dates_check CHECK (end_date > start_date),
  UNIQUE(school_id, name)
);

-- Table des présences
CREATE TABLE public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes text,
  marked_by uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(student_id, date)
);

-- Table des paiements
CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency varchar(3) DEFAULT 'XAF',
  description text,
  status public.payment_status DEFAULT 'pending',
  due_date date,
  paid_date date,
  payment_method varchar(50),
  reference varchar(100) UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT payments_amount_check CHECK (amount > 0)
);

-- Table des notifications
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  type public.notification_type DEFAULT 'info',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT notifications_title_check CHECK (length(title) >= 1)
);

-- Table des documents
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  type public.document_type NOT NULL,
  file_path text,
  file_size bigint,
  mime_type varchar(100),
  uploaded_by uuid REFERENCES public.users(id),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT documents_name_check CHECK (length(name) >= 1),
  CONSTRAINT documents_file_size_check CHECK (file_size > 0)
);

-- =============================================================================
-- CRÉATION DES INDEX POUR PERFORMANCE
-- =============================================================================

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_school_id ON public.users(school_id);
CREATE INDEX idx_schools_type ON public.schools(type);
CREATE INDEX idx_schools_director ON public.schools(director_user_id);
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_class ON public.students(class_level);
CREATE INDEX idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_payments_student_status ON public.payments(student_id, status);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_documents_school_type ON public.documents(school_id, type);

-- =============================================================================
-- CRÉATION DES VUES
-- =============================================================================

-- Vue pour les directeurs d'école
CREATE VIEW principals_view AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.address,
  u.city,
  u.country,
  s.id as school_id,
  s.name as school_name,
  s.type as school_type,
  s.address as school_address,
  s.city as school_city,
  s.phone as school_phone,
  s.email as school_email,
  u.created_at,
  u.last_login
FROM public.users u
JOIN public.schools s ON s.director_user_id = u.id
WHERE u.role = 'principal' AND u.is_active = true;

-- =============================================================================
-- FONCTIONS UTILITAIRES
-- =============================================================================

-- Fonction pour créer un compte directeur
CREATE OR REPLACE FUNCTION create_principal_account(
  p_email varchar,
  p_password varchar,
  p_first_name varchar,
  p_last_name varchar,
  p_phone varchar DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_city varchar DEFAULT NULL,
  p_country varchar DEFAULT 'Cameroon'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  auth_user_id uuid;
  result json;
BEGIN
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    now(),
    now()
  )
  RETURNING id INTO auth_user_id;
  
  -- Créer l'utilisateur dans public.users
  INSERT INTO public.users (
    auth_user_id, email, first_name, last_name, role, 
    phone, address, city, country
  )
  VALUES (
    auth_user_id, p_email, p_first_name, p_last_name, 'principal',
    p_phone, p_address, p_city, p_country
  )
  RETURNING id INTO new_user_id;
  
  -- Retourner les informations
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'auth_user_id', auth_user_id,
    'email', p_email,
    'message', 'Compte directeur créé avec succès'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la création du compte'
    );
END;
$$;

-- Fonction pour créer une école
CREATE OR REPLACE FUNCTION create_principal_school(
  p_user_id uuid,
  p_name varchar,
  p_type public.school_type,
  p_address text DEFAULT NULL,
  p_city varchar DEFAULT NULL,
  p_country varchar DEFAULT 'Cameroon',
  p_phone varchar DEFAULT NULL,
  p_email varchar DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_school_id uuid;
  result json;
BEGIN
  -- Vérifier que l'utilisateur existe et est un directeur
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = p_user_id AND role = 'principal' AND is_active = true
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found or not a principal',
      'message', 'Utilisateur non trouvé ou pas un directeur'
    );
  END IF;
  
  -- Créer l'école
  INSERT INTO public.schools (
    name, type, address, city, country, phone, email, director_user_id
  )
  VALUES (
    p_name, p_type, p_address, p_city, p_country, p_phone, p_email, p_user_id
  )
  RETURNING id INTO new_school_id;
  
  -- Associer l'école à l'utilisateur
  UPDATE public.users 
  SET school_id = new_school_id, updated_at = now()
  WHERE id = p_user_id;
  
  result := json_build_object(
    'success', true,
    'school_id', new_school_id,
    'message', 'École créée avec succès'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Erreur lors de la création de l''école'
    );
END;
$$;

-- =============================================================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- =============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = auth_user_id::text);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Politiques pour la table schools
CREATE POLICY "Principals can view their school" ON public.schools
  FOR SELECT USING (
    director_user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Principals can update their school" ON public.schools
  FOR UPDATE USING (
    director_user_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- Message de confirmation
SELECT 'Base de données complètement réinitialisée et recréée avec succès!' as status;
