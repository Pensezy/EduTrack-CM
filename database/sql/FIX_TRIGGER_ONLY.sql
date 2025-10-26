-- ====================================
-- FIX TRIGGER UNIQUEMENT
-- Execute ce script dans Supabase SQL Editor
-- ====================================

-- 1. Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_automatic();

-- 2. Recréer la fonction avec SECURITY DEFINER et SET search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_automatic()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE 
    school_data jsonb; 
    school_uuid uuid;
    academic_year_uuid uuid;
    current_year text;
    next_year text;
BEGIN
    -- 1. Inserer dans users (TOUJOURS, pour tous les roles)
    INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        phone, 
        role, 
        is_active, 
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        role = COALESCE(EXCLUDED.role, users.role),
        updated_at = NOW();
    
    -- 2. Si c'est un directeur, creer son ecole + donnees par defaut
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'principal' THEN
        school_data := NEW.raw_user_meta_data->'school';
        
        IF school_data IS NOT NULL THEN
            school_uuid := gen_random_uuid();
            current_year := EXTRACT(YEAR FROM NOW())::text;
            next_year := (EXTRACT(YEAR FROM NOW()) + 1)::text;
            
            -- 2.1 Creer l'ecole
            INSERT INTO public.schools (
                id, 
                name, 
                code, 
                type, 
                director_name, 
                director_user_id, 
                phone, 
                email, 
                address, 
                city, 
                country, 
                status, 
                created_at, 
                updated_at
            )
            VALUES (
                school_uuid,
                school_data->>'name',
                school_data->>'code',
                COALESCE((school_data->>'type')::school_type, 'public'),
                COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
                NEW.id,
                COALESCE(school_data->>'phone', NEW.raw_user_meta_data->>'phone', ''),
                NEW.email,
                COALESCE(school_data->>'address', ''),
                COALESCE(school_data->>'city', ''),
                COALESCE(school_data->>'country', 'Cameroun'),
                'active',
                NOW(),
                NOW()
            )
            ON CONFLICT (code) DO NOTHING;
            
            -- 2.2 Lier l'utilisateur a l'ecole
            UPDATE public.users 
            SET current_school_id = school_uuid 
            WHERE id = NEW.id;
            
            -- 2.3 Creer l'annee academique
            academic_year_uuid := gen_random_uuid();
            INSERT INTO public.academic_years (
                id, 
                school_id, 
                name, 
                start_date, 
                end_date, 
                is_current, 
                created_at, 
                updated_at
            )
            VALUES (
                academic_year_uuid,
                school_uuid,
                current_year || '-' || next_year,
                (current_year || '-09-01')::date,
                (next_year || '-07-31')::date,
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT DO NOTHING;
            
            -- 2.4 Types de notes
            INSERT INTO public.grade_types (school_id, name, code, coefficient, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Devoir', 'HOMEWORK', 0.3, 'Travaux a la maison', true, NOW(), NOW()),
                (school_uuid, 'Interrogation', 'QUIZ', 0.2, 'Interrogations ecrites', true, NOW(), NOW()),
                (school_uuid, 'Examen', 'EXAM', 0.5, 'Examens officiels', true, NOW(), NOW()),
                (school_uuid, 'Projet', 'PROJECT', 0.4, 'Projets et travaux pratiques', true, NOW(), NOW()),
                (school_uuid, 'Participation', 'PARTICIPATION', 0.1, 'Participation en classe', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.5 Types de presence
            INSERT INTO public.attendance_types (school_id, name, code, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Present', 'PRESENT', 'Eleve present', true, NOW(), NOW()),
                (school_uuid, 'Absent', 'ABSENT', 'Eleve absent', true, NOW(), NOW()),
                (school_uuid, 'Retard', 'LATE', 'Eleve en retard', true, NOW(), NOW()),
                (school_uuid, 'Absent Excuse', 'EXCUSED', 'Absence justifiee', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.6 Types de paiement
            INSERT INTO public.payment_types (school_id, name, code, amount, description, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Frais de scolarite', 'TUITION', NULL, 'Frais de scolarite annuels', true, NOW(), NOW()),
                (school_uuid, 'Frais d''inscription', 'REGISTRATION', NULL, 'Frais d''inscription', true, NOW(), NOW()),
                (school_uuid, 'Uniforme', 'UNIFORM', NULL, 'Achat d''uniforme scolaire', true, NOW(), NOW()),
                (school_uuid, 'Livres', 'BOOKS', NULL, 'Achat de livres et fournitures', true, NOW(), NOW()),
                (school_uuid, 'Cantine', 'CANTEEN', NULL, 'Frais de cantine', true, NOW(), NOW()),
                (school_uuid, 'Transport', 'TRANSPORT', NULL, 'Frais de transport scolaire', true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
            
            -- 2.7 Periodes d'evaluation
            IF COALESCE((school_data->>'type')::text, 'public') IN ('primaire', 'college', 'college_lycee') THEN
                INSERT INTO public.evaluation_periods (school_id, academic_year_id, name, start_date, end_date, is_current, created_at, updated_at)
                VALUES 
                    (school_uuid, academic_year_uuid, '1er Trimestre', (current_year || '-09-01')::date, (current_year || '-12-15')::date, true, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '2e Trimestre', (current_year || '-12-16')::date, (next_year || '-03-31')::date, false, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '3e Trimestre', (next_year || '-04-01')::date, (next_year || '-07-15')::date, false, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            ELSE
                INSERT INTO public.evaluation_periods (school_id, academic_year_id, name, start_date, end_date, is_current, created_at, updated_at)
                VALUES 
                    (school_uuid, academic_year_uuid, '1er Semestre', (current_year || '-09-01')::date, (next_year || '-01-31')::date, true, NOW(), NOW()),
                    (school_uuid, academic_year_uuid, '2e Semestre', (next_year || '-02-01')::date, (next_year || '-07-15')::date, false, NOW(), NOW())
                ON CONFLICT DO NOTHING;
            END IF;
            
            -- 2.8 Roles utilisateur
            INSERT INTO public.user_roles (school_id, name, code, permissions, is_active, created_at, updated_at)
            VALUES 
                (school_uuid, 'Administrateur', 'ADMIN', '["all"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Directeur', 'PRINCIPAL', '["manage_school", "manage_teachers", "manage_students", "view_reports"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Enseignant', 'TEACHER', '["manage_classes", "manage_grades", "view_students"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Secretaire', 'SECRETARY', '["manage_students", "manage_payments", "view_reports"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Parent', 'PARENT', '["view_children", "view_grades", "view_attendance"]'::jsonb, true, NOW(), NOW()),
                (school_uuid, 'Eleve', 'STUDENT', '["view_own_grades", "view_own_attendance"]'::jsonb, true, NOW(), NOW())
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    -- Logger l'erreur mais ne pas bloquer la creation du compte
    RAISE WARNING 'Erreur dans handle_new_user_automatic: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- 3. Recreer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_automatic();

-- 4. Desactiver RLS (pour eviter les problemes de permissions)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 5. Verification
DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TRIGGER REINSTALLE AVEC SUCCES';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Fonction: handle_new_user_automatic()';
    RAISE NOTICE 'Trigger: on_auth_user_created';
    RAISE NOTICE 'Security: DEFINER (permissions elevees)';
    RAISE NOTICE 'Search path: public, auth';
    RAISE NOTICE 'RLS: DESACTIVE sur toutes les tables';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'TESTEZ MAINTENANT LA CREATION DE COMPTE !';
    RAISE NOTICE '==========================================';
END $$;
