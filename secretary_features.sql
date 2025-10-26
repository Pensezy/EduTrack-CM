-- ====================================
-- FONCTIONNALITÉS AVANCÉES POUR LES SECRÉTAIRES
-- À exécuter APRÈS new_project_schema.sql et fix_rls_permissions.sql
-- ====================================

-- NOTE IMPORTANTE: Les secrétaires se connectent avec EMAIL + MOT DE PASSE
-- Le directeur crée le compte et définit le mot de passe qu'il communique à la secrétaire

-- 1. FONCTION POUR CRÉER UN COMPTE SECRÉTAIRE
CREATE OR REPLACE FUNCTION create_secretary_account(
    p_director_id UUID,
    p_full_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_password VARCHAR, -- Mot de passe fourni par le directeur
    p_permissions JSONB DEFAULT '["student_management", "document_management", "grade_access"]'::jsonb
)
RETURNS JSON AS $$
DECLARE
    v_school_id UUID;
    v_secretary_id VARCHAR;
    v_user_id UUID;
    result JSON;
BEGIN
    -- 1. Vérifier que l'utilisateur est bien un directeur
    SELECT id INTO v_school_id
    FROM schools
    WHERE director_user_id = p_director_id;
    
    IF v_school_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Vous devez être directeur pour créer un compte secrétaire'
        );
    END IF;
    
    -- 2. Générer un ID secrétaire unique
    v_secretary_id := 'SEC' || TO_CHAR(NOW(), 'YYYY') || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || LPAD((RANDOM() * 999)::INTEGER::TEXT, 3, '0');
    
    -- 3. Créer l'utilisateur dans la table users (sans PIN, avec école existante)
    INSERT INTO users (
        email,
        full_name,
        phone,
        role,
        school_id,
        current_school_id,
        is_active,
        active
    ) VALUES (
        p_email,
        p_full_name,
        p_phone,
        'secretary',
        v_school_id,
        v_school_id,
        true,
        true
    ) RETURNING id INTO v_user_id;
    
    -- 4. Créer l'entrée dans la table secretaries
    INSERT INTO secretaries (
        user_id,
        school_id,
        secretary_id,
        first_name,
        last_name,
        permissions,
        supervisor_id,
        status
    ) VALUES (
        v_user_id,
        v_school_id,
        v_secretary_id,
        SPLIT_PART(p_full_name, ' ', 1),
        TRIM(SUBSTRING(p_full_name FROM POSITION(' ' IN p_full_name) + 1)),
        p_permissions,
        p_director_id,
        'active'
    );
    
    -- 5. Retourner les informations du compte créé (avec le mot de passe pour communication au secrétaire)
    result := json_build_object(
        'success', true,
        'data', json_build_object(
            'user_id', v_user_id,
            'email', p_email,
            'password', p_password, -- Le directeur doit communiquer ce mot de passe à la secrétaire
            'secretary_id', v_secretary_id,
            'school_id', v_school_id,
            'permissions', p_permissions,
            'message', 'Compte créé avec succès. Communiquez l''email et le mot de passe à la secrétaire.'
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Un compte avec cet email existe déjà'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la création du compte: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FONCTION POUR ASSIGNER DES TÂCHES AUX SECRÉTAIRES
CREATE OR REPLACE FUNCTION assign_task_to_secretary(
    p_director_id UUID,
    p_secretary_id UUID,
    p_title VARCHAR,
    p_description TEXT,
    p_priority VARCHAR DEFAULT 'medium',
    p_due_date DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_school_id UUID;
    v_task_id UUID;
    result JSON;
BEGIN
    -- 1. Vérifier que l'utilisateur est bien un directeur
    SELECT id INTO v_school_id
    FROM schools
    WHERE director_user_id = p_director_id;
    
    IF v_school_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Vous devez être directeur pour assigner des tâches'
        );
    END IF;
    
    -- 2. Vérifier que le secrétaire appartient à cette école
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_secretary_id 
        AND role = 'secretary' 
        AND school_id = v_school_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ce secrétaire n\'appartient pas à votre école'
        );
    END IF;
    
    -- 3. Créer la tâche
    INSERT INTO tasks (
        school_id,
        assigned_to,
        created_by,
        title,
        description,
        priority,
        due_date,
        status
    ) VALUES (
        v_school_id,
        p_secretary_id,
        p_director_id,
        p_title,
        p_description,
        p_priority,
        p_due_date,
        'pending'
    ) RETURNING id INTO v_task_id;
    
    -- 4. Retourner les informations de la tâche créée
    result := json_build_object(
        'success', true,
        'data', json_build_object(
            'task_id', v_task_id,
            'assigned_to', p_secretary_id,
            'school_id', v_school_id,
            'status', 'pending'
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la création de la tâche: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. VUE POUR LES STATISTIQUES DES SECRÉTAIRES
CREATE OR REPLACE VIEW secretary_stats AS
SELECT 
    s.school_id,
    s.id as secretary_id,
    u.full_name,
    u.email,
    s.secretary_id as employee_id,
    s.permissions,
    s.status,
    s.experience_years,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 1 END) as overdue_tasks,
    s.created_at as hire_date
FROM secretaries s
JOIN users u ON s.user_id = u.id
LEFT JOIN tasks t ON s.user_id = t.assigned_to
GROUP BY s.id, s.school_id, u.full_name, u.email, s.secretary_id, s.permissions, s.status, s.experience_years, s.created_at;

-- 5. FONCTION POUR OBTENIR LES STATISTIQUES D'UN DIRECTEUR
CREATE OR REPLACE FUNCTION get_director_secretary_stats(p_director_id UUID)
RETURNS JSON AS $$
DECLARE
    v_school_id UUID;
    v_stats JSON;
BEGIN
    -- Vérifier que l'utilisateur est bien un directeur
    SELECT id INTO v_school_id
    FROM schools
    WHERE director_user_id = p_director_id;
    
    IF v_school_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Vous devez être directeur pour accéder à ces statistiques'
        );
    END IF;
    
    -- Récupérer les statistiques
    SELECT json_agg(
        json_build_object(
            'secretary_id', secretary_id,
            'full_name', full_name,
            'email', email,
            'employee_id', employee_id,
            'status', status,
            'total_tasks', total_tasks,
            'completed_tasks', completed_tasks,
            'pending_tasks', pending_tasks,
            'overdue_tasks', overdue_tasks,
            'completion_rate', 
                CASE 
                    WHEN total_tasks > 0 THEN ROUND((completed_tasks::DECIMAL / total_tasks) * 100, 2)
                    ELSE 0
                END,
            'hire_date', hire_date
        )
    ) INTO v_stats
    FROM secretary_stats
    WHERE school_id = v_school_id;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(v_stats, '[]'::json)
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la récupération des statistiques: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. EXEMPLES D'UTILISATION
/*
-- Créer un compte secrétaire (avec mot de passe défini par le directeur)
SELECT create_secretary_account(
    'director-uuid-here',
    'Marie Secrétaire',
    'marie.secretaire@school.cm',
    '+237123456789',
    'MotDePasse2024!',  -- Mot de passe que le directeur communique à la secrétaire
    '["student_management", "document_management", "grade_access", "parent_communication"]'::jsonb
);

-- NOTE: Le directeur doit ensuite :
-- 1. Créer le compte Supabase Auth avec cet email et mot de passe
-- 2. Communiquer les identifiants à la secrétaire
-- 3. La secrétaire se connecte avec email/mot de passe (pas de PIN)

-- Assigner une tâche
SELECT assign_task_to_secretary(
    'director-uuid-here',
    'secretary-uuid-here',
    'Préparer les bulletins du trimestre',
    'Éditer et imprimer tous les bulletins de notes du premier trimestre',
    'high',
    '2025-11-15'::date
);

-- Obtenir les statistiques
SELECT get_director_secretary_stats('director-uuid-here');
*/

-- ====================================
-- FIN DES FONCTIONNALITÉS SECRÉTAIRES
-- ====================================