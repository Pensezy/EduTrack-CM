-- Migration: Vue pour les directeurs d'école
-- Date: 2025-09-26
-- Description: Créer une vue pour simplifier l'accès aux données des directeurs

-- Vue pour les directeurs d'école avec leurs établissements
CREATE OR REPLACE VIEW principals_view AS
SELECT 
    u.id as principal_id,
    u.full_name as director_name,
    u.email as director_email,
    u.phone as director_phone,
    u.avatar_url as director_avatar,
    u.language as preferred_language,
    u.is_active as is_active,
    u.last_login,
    u.created_at as account_created,
    u.updated_at as account_updated,
    
    -- Informations de l'école
    s.id as school_id,
    s.name as school_name,
    s.code as school_code,
    s.type as school_type,
    s.phone as school_phone,
    s.email as school_email,
    s.address as school_address,
    s.city as school_city,
    s.country as school_country,
    s.available_classes,
    s.status as school_status,
    s.created_at as school_created,
    s.updated_at as school_updated,
    
    -- Statistiques calculées
    (SELECT COUNT(*) FROM students st WHERE st.current_school_id = s.id) as total_students,
    (SELECT COUNT(*) FROM users ut WHERE ut.current_school_id = s.id AND ut.role = 'teacher') as total_teachers,
    (SELECT COUNT(*) FROM users ut WHERE ut.current_school_id = s.id AND ut.role = 'secretary') as total_secretaries
    
FROM users u
LEFT JOIN schools s ON u.current_school_id = s.id
WHERE u.role = 'principal';

-- Commentaire sur la vue
COMMENT ON VIEW principals_view IS 'Vue complete des directeurs d''ecole avec leurs etablissements et statistiques';

-- Fonction pour obtenir les détails d'un directeur par email
CREATE OR REPLACE FUNCTION get_principal_details(email_input TEXT)
RETURNS TABLE(
    principal_id UUID,
    director_name TEXT,
    director_email TEXT,
    director_phone TEXT,
    school_name TEXT,
    school_type TEXT,
    school_city TEXT,
    school_country TEXT,
    total_students BIGINT,
    total_teachers BIGINT,
    account_status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.principal_id,
        pv.director_name::TEXT,
        pv.director_email::TEXT,
        pv.director_phone::TEXT,
        pv.school_name::TEXT,
        pv.school_type::TEXT,
        pv.school_city::TEXT,
        pv.school_country::TEXT,
        pv.total_students,
        pv.total_teachers,
        CASE 
            WHEN pv.is_active THEN 'Actif'
            ELSE 'Inactif'
        END::TEXT as account_status
    FROM principals_view pv
    WHERE pv.director_email = email_input;
END;
$$;

-- Fonction pour lister tous les directeurs avec pagination
CREATE OR REPLACE FUNCTION list_principals(
    page_offset INTEGER DEFAULT 0,
    page_limit INTEGER DEFAULT 50,
    country_filter TEXT DEFAULT NULL,
    school_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
    principal_id UUID,
    director_name TEXT,
    director_email TEXT,
    school_name TEXT,
    school_type TEXT,
    school_city TEXT,
    school_country TEXT,
    total_students BIGINT,
    is_active BOOLEAN,
    account_created TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.principal_id,
        pv.director_name::TEXT,
        pv.director_email::TEXT,
        pv.school_name::TEXT,
        pv.school_type::TEXT,
        pv.school_city::TEXT,
        pv.school_country::TEXT,
        pv.total_students,
        pv.is_active,
        pv.account_created
    FROM principals_view pv
    WHERE 
        (country_filter IS NULL OR pv.school_country = country_filter)
        AND (school_type_filter IS NULL OR pv.school_type::TEXT = school_type_filter)
    ORDER BY pv.account_created DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$;

-- Fonction pour obtenir les statistiques globales des directeurs
CREATE OR REPLACE FUNCTION get_principals_stats()
RETURNS TABLE(
    total_principals BIGINT,
    active_principals BIGINT,
    inactive_principals BIGINT,
    total_schools BIGINT,
    countries_count BIGINT,
    most_common_country TEXT,
    most_common_school_type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total_principals,
            COUNT(*) FILTER (WHERE is_active = true) as active_principals,
            COUNT(*) FILTER (WHERE is_active = false) as inactive_principals,
            COUNT(DISTINCT school_id) as total_schools,
            COUNT(DISTINCT school_country) as countries_count
        FROM principals_view
    ),
    country_stats AS (
        SELECT school_country, COUNT(*) as country_count
        FROM principals_view 
        WHERE school_country IS NOT NULL
        GROUP BY school_country
        ORDER BY country_count DESC
        LIMIT 1
    ),
    type_stats AS (
        SELECT school_type::TEXT, COUNT(*) as type_count
        FROM principals_view 
        WHERE school_type IS NOT NULL
        GROUP BY school_type
        ORDER BY type_count DESC
        LIMIT 1
    )
    SELECT 
        s.total_principals,
        s.active_principals,
        s.inactive_principals,
        s.total_schools,
        s.countries_count,
        COALESCE(cs.school_country, 'N/A')::TEXT as most_common_country,
        COALESCE(ts.school_type, 'N/A')::TEXT as most_common_school_type
    FROM stats s
    LEFT JOIN country_stats cs ON true
    LEFT JOIN type_stats ts ON true;
END;
$$;

-- Commentaires sur les fonctions
COMMENT ON FUNCTION get_principal_details IS 'Obtient les details complets d''un directeur par email';
COMMENT ON FUNCTION list_principals IS 'Liste les directeurs avec pagination et filtres';
COMMENT ON FUNCTION get_principals_stats IS 'Statistiques globales sur les directeurs d''ecole';