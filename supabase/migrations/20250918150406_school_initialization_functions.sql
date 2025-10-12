-- =====================================================
-- SCRIPT: Configuration initiale pour nouvelle école
-- Date: 2025-10-12
-- Description: Fonction pour initialiser une nouvelle école
-- =====================================================

-- Fonction pour initialiser une nouvelle école avec ses données de base
CREATE OR REPLACE FUNCTION initialize_new_school(
    school_name TEXT,
    school_address TEXT,
    school_phone TEXT,
    school_email TEXT,
    school_city TEXT,
    school_postal_code TEXT,
    principal_name TEXT,
    principal_email TEXT,
    principal_phone TEXT,
    secretary_name TEXT DEFAULT NULL,
    secretary_email TEXT DEFAULT NULL,
    secretary_phone TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    new_school_id UUID;
    principal_id UUID;
    secretary_id UUID;
    principal_pin TEXT;
    secretary_pin TEXT;
    result JSON;
BEGIN
    -- Générer les IDs
    new_school_id := uuid_generate_v4();
    principal_id := uuid_generate_v4();
    
    -- Générer les codes PIN (4 chiffres aléatoires)
    principal_pin := LPAD((random() * 9999)::integer::text, 4, '0');
    
    -- Créer l'école
    INSERT INTO schools (id, name, address, phone, email, city, postal_code, principal_id)
    VALUES (new_school_id, school_name, school_address, school_phone, school_email, school_city, school_postal_code, principal_id);
    
    -- Créer le compte principal
    INSERT INTO users (id, full_name, email, phone, role, school_id, pin_code, active)
    VALUES (principal_id, principal_name, principal_email, principal_phone, 'principal', new_school_id, principal_pin, true);
    
    -- Créer le compte secrétaire si les informations sont fournies
    IF secretary_name IS NOT NULL AND secretary_email IS NOT NULL THEN
        secretary_id := uuid_generate_v4();
        secretary_pin := LPAD((random() * 9999)::integer::text, 4, '0');
        
        INSERT INTO users (id, full_name, email, phone, role, school_id, pin_code, active, created_by)
        VALUES (secretary_id, secretary_name, secretary_email, secretary_phone, 'secretary', new_school_id, secretary_pin, true, principal_id);
    END IF;
    
    -- Créer l'année scolaire courante
    INSERT INTO school_years (year, school_id, start_date, end_date, is_current, status)
    VALUES ('2024-2025', new_school_id, '2024-09-01', '2025-07-31', true, 'active');
    
    -- Créer les classes standard
    INSERT INTO classes (name, level, school_id, capacity, academic_year)
    VALUES 
        ('CE1', 1, new_school_id, 30, '2024-2025'),
        ('CE2', 2, new_school_id, 30, '2024-2025'),
        ('CM1', 3, new_school_id, 30, '2024-2025'),
        ('CM2', 4, new_school_id, 30, '2024-2025');
    
    -- Créer les matières standard (déjà fait par la migration précédente via trigger)
    -- Les matières sont automatiquement créées pour toutes les écoles
    
    -- Créer les frais standard (déjà fait par la migration précédente via trigger)
    -- Les frais sont automatiquement créés pour toutes les écoles
    
    -- Créer les templates de documents standard (déjà fait par la migration précédente via trigger)
    -- Les templates sont automatiquement créés pour toutes les écoles
    
    -- Mettre à jour le principal_id dans l'école
    UPDATE schools SET principal_id = principal_id WHERE id = new_school_id;
    
    -- Construire le résultat
    SELECT json_build_object(
        'success', true,
        'school', json_build_object(
            'id', new_school_id,
            'name', school_name,
            'address', school_address,
            'phone', school_phone,
            'email', school_email
        ),
        'principal', json_build_object(
            'id', principal_id,
            'name', principal_name,
            'email', principal_email,
            'pin_code', principal_pin
        ),
        'secretary', CASE 
            WHEN secretary_id IS NOT NULL THEN
                json_build_object(
                    'id', secretary_id,
                    'name', secretary_name,
                    'email', secretary_email,
                    'pin_code', secretary_pin
                )
            ELSE NULL
        END,
        'initial_setup', json_build_object(
            'classes_created', 4,
            'subjects_available', (SELECT COUNT(*) FROM subjects WHERE school_id = new_school_id),
            'fees_configured', (SELECT COUNT(*) FROM fees WHERE school_id = new_school_id),
            'templates_available', (SELECT COUNT(*) FROM document_templates WHERE school_id = new_school_id)
        ),
        'next_steps', json_build_array(
            'Connectez-vous avec votre code PIN',
            'Ajoutez les enseignants',
            'Inscrivez les premiers élèves',
            'Configurez les frais spécifiques si nécessaire',
            'Personnalisez les templates de documents'
        )
    ) INTO result;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le statut d'initialisation d'une école
CREATE OR REPLACE FUNCTION get_school_initialization_status(school_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'school_id', school_uuid,
        'initialization_complete', (
            SELECT COUNT(*) > 0 
            FROM users 
            WHERE school_id = school_uuid 
            AND role IN ('principal', 'secretary')
        ),
        'basic_setup', json_build_object(
            'classes_count', (SELECT COUNT(*) FROM classes WHERE school_id = school_uuid),
            'subjects_count', (SELECT COUNT(*) FROM subjects WHERE school_id = school_uuid),
            'fees_count', (SELECT COUNT(*) FROM fees WHERE school_id = school_uuid),
            'templates_count', (SELECT COUNT(*) FROM document_templates WHERE school_id = school_uuid),
            'school_year_configured', (SELECT COUNT(*) > 0 FROM school_years WHERE school_id = school_uuid AND is_current = true)
        ),
        'operational_data', json_build_object(
            'students_count', (SELECT COUNT(*) FROM students WHERE school_id = school_uuid),
            'teachers_count', (SELECT COUNT(*) FROM teachers WHERE school_id = school_uuid),
            'active_tasks', (SELECT COUNT(*) FROM tasks WHERE school_id = school_uuid AND status != 'completed'),
            'recent_documents', (SELECT COUNT(*) FROM documents WHERE school_id = school_uuid AND created_at >= CURRENT_DATE - INTERVAL '30 days')
        ),
        'data_mode_recommendation', CASE 
            WHEN (SELECT COUNT(*) FROM students WHERE school_id = school_uuid) = 0 THEN 'demo'
            WHEN (SELECT COUNT(*) FROM students WHERE school_id = school_uuid) < 10 THEN 'hybrid'
            ELSE 'real'
        END,
        'setup_completion', json_build_object(
            'basic_structure', (
                SELECT (
                    CASE WHEN COUNT(*) >= 4 THEN 100 ELSE (COUNT(*) * 25) END
                ) FROM classes WHERE school_id = school_uuid
            ),
            'administrative_users', (
                SELECT (
                    CASE WHEN COUNT(*) >= 2 THEN 100 
                         WHEN COUNT(*) = 1 THEN 50 
                         ELSE 0 END
                ) FROM users WHERE school_id = school_uuid AND role IN ('principal', 'secretary')
            ),
            'operational_readiness', (
                SELECT (
                    CASE WHEN COUNT(*) > 0 THEN 100 ELSE 0 END
                ) FROM students WHERE school_id = school_uuid
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour nettoyer les données de démonstration
CREATE OR REPLACE FUNCTION cleanup_demo_data(school_uuid UUID)
RETURNS JSON AS $$
DECLARE
    deleted_counts JSON;
BEGIN
    -- Cette fonction supprime toutes les données de test/démo
    -- À utiliser avec précaution !
    
    -- Supprimer dans l'ordre inverse des dépendances
    WITH deletions AS (
        DELETE FROM message_recipients WHERE school_id = school_uuid RETURNING 'message_recipients' as table_name, 1 as count
        UNION ALL
        DELETE FROM messages WHERE school_id = school_uuid RETURNING 'messages', 1
        UNION ALL
        DELETE FROM documents WHERE school_id = school_uuid RETURNING 'documents', 1
        UNION ALL
        DELETE FROM appointments WHERE school_id = school_uuid RETURNING 'appointments', 1
        UNION ALL
        DELETE FROM events WHERE school_id = school_uuid RETURNING 'events', 1
        UNION ALL
        DELETE FROM student_cards WHERE school_id = school_uuid RETURNING 'student_cards', 1
        UNION ALL
        DELETE FROM tasks WHERE school_id = school_uuid RETURNING 'tasks', 1
        UNION ALL
        DELETE FROM payments WHERE student_id IN (SELECT id FROM students WHERE school_id = school_uuid) RETURNING 'payments', 1
        UNION ALL
        DELETE FROM absences WHERE student_id IN (SELECT id FROM students WHERE school_id = school_uuid) RETURNING 'absences', 1
        UNION ALL
        DELETE FROM grades WHERE student_id IN (SELECT id FROM students WHERE school_id = school_uuid) RETURNING 'grades', 1
        UNION ALL
        DELETE FROM students WHERE school_id = school_uuid RETURNING 'students', 1
        UNION ALL
        DELETE FROM teachers WHERE school_id = school_uuid RETURNING 'teachers', 1
        UNION ALL
        DELETE FROM users WHERE school_id = school_uuid AND role NOT IN ('principal') RETURNING 'users', 1
    )
    SELECT json_object_agg(table_name, total_count)
    FROM (
        SELECT table_name, SUM(count) as total_count
        FROM deletions
        GROUP BY table_name
    ) t
    INTO deleted_counts;
    
    RETURN json_build_object(
        'success', true,
        'school_id', school_uuid,
        'deleted_records', deleted_counts,
        'message', 'Données de démonstration supprimées avec succès'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTAIRES SUR LES FONCTIONS
-- =====================================================

COMMENT ON FUNCTION initialize_new_school IS 'Initialise une nouvelle école avec sa structure de base et ses comptes administrateurs';
COMMENT ON FUNCTION get_school_initialization_status IS 'Retourne le statut d''initialisation et de configuration d''une école';
COMMENT ON FUNCTION cleanup_demo_data IS 'Supprime toutes les données de démonstration d''une école (à utiliser avec précaution)';

-- =====================================================
-- EXEMPLE D'UTILISATION
-- =====================================================

/*
-- Pour initialiser une nouvelle école :
SELECT initialize_new_school(
    'École Primaire Exemple',
    '123 Rue de l''École',
    '01.23.45.67.89',
    'contact@ecole-exemple.edu',
    'Ville Exemple',
    '12345',
    'Jean Directeur',
    'directeur@ecole-exemple.edu',
    '01.23.45.67.80',
    'Marie Secrétaire',
    'secretaire@ecole-exemple.edu',
    '01.23.45.67.81'
);

-- Pour vérifier le statut d'une école :
SELECT get_school_initialization_status('uuid-de-l-ecole');

-- Pour nettoyer les données de démo :
SELECT cleanup_demo_data('uuid-de-l-ecole');
*/