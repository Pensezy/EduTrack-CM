-- ====================================
-- SYNCHRONISATION AUTOMATIQUE SUPABASE AUTH → TABLES
-- À exécuter APRÈS new_project_schema.sql
-- Ce script garantit que les comptes créés sont automatiquement sauvés
-- ====================================

-- 1. FONCTION POUR SYNCHRONISER LES NOUVEAUX UTILISATEURS
-- Cette fonction s'exécute automatiquement à chaque inscription Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_value text;
    user_full_name text;
    user_phone text;
BEGIN
    -- Récupérer les métadonnées depuis Supabase Auth
    user_role_value := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
    user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
    
    -- Log pour debug
    RAISE NOTICE 'Synchronisation auto pour utilisateur: % (role: %)', NEW.email, user_role_value;
    
    -- Insérer automatiquement dans la table users
    -- IMPORTANT : ON CONFLICT pour éviter les erreurs si l'app insère manuellement
    INSERT INTO users (
        id,
        email,
        full_name,
        phone,
        role,
        is_active,
        active,
        photo,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_phone,
        user_role_value::user_role,
        true,
        true,
        '/assets/images/no_image.png',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = NOW();
    
    RAISE NOTICE 'Utilisateur % synchronisé dans la table users', NEW.email;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne bloque pas la création Auth
        RAISE WARNING 'Erreur synchronisation utilisateur %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRÉER LE TRIGGER POUR L'AUTO-SYNCHRONISATION
-- Ce trigger s'active à chaque création de compte Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. FONCTION POUR FINALISER LA CRÉATION D'UNE ÉCOLE
-- À appeler depuis votre application après l'inscription
CREATE OR REPLACE FUNCTION finalize_school_creation(
    p_user_id UUID,
    p_school_name VARCHAR,
    p_school_type school_type,
    p_director_name VARCHAR,
    p_phone VARCHAR,
    p_address TEXT,
    p_city VARCHAR,
    p_country VARCHAR DEFAULT 'Cameroun',
    p_available_classes JSONB DEFAULT '[]'
)
RETURNS JSON AS $$
DECLARE
    v_school_code VARCHAR;
    v_school_id UUID;
    result JSON;
BEGIN
    -- 1. Générer un code école unique
    v_school_code := UPPER(SUBSTRING(p_school_name FROM 1 FOR 3)) || '-' || 
                     EXTRACT(YEAR FROM NOW()) || '-' || 
                     LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0');
    
    -- 2. Créer l'école
    INSERT INTO schools (
        name,
        code,
        type,
        director_name,
        phone,
        email,
        address,
        city,
        country,
        available_classes,
        status,
        director_user_id,
        created_at,
        updated_at
    ) VALUES (
        p_school_name,
        v_school_code,
        p_school_type,
        p_director_name,
        p_phone,
        (SELECT email FROM users WHERE id = p_user_id),
        p_address,
        p_city,
        p_country,
        p_available_classes,
        'active',
        p_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO v_school_id;
    
    -- 3. Mettre à jour l'utilisateur avec l'école
    UPDATE users SET
        current_school_id = v_school_id,
        school_id = v_school_id,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- 4. Retourner les données créées
    result := json_build_object(
        'success', true,
        'data', json_build_object(
            'school_id', v_school_id,
            'school_code', v_school_code,
            'user_id', p_user_id,
            'message', 'École créée avec succès !'
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Une école avec ce code existe déjà'
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erreur lors de la création de l''école: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. EXEMPLE D'UTILISATION DEPUIS VOTRE APPLICATION
/*
// Côté JavaScript dans votre application :

// 1. L'utilisateur s'inscrit (déjà géré par Supabase Auth + trigger automatique)
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'directeur@ecole.cm',
  password: 'motdepasse123',
  options: {
    data: {
      full_name: 'Nom du Directeur',
      role: 'principal',
      phone: '+237123456789'
    }
  }
});

// 2. Finaliser la création de l'école (manuel)
const { data: schoolResult, error: schoolError } = await supabase.rpc('finalize_school_creation', {
  p_user_id: authData.user.id,
  p_school_name: 'Mon École',
  p_school_type: 'primaire',
  p_director_name: 'Nom du Directeur',
  p_phone: '+237123456789',
  p_address: 'Adresse de l\'école',
  p_city: 'Yaoundé',
  p_country: 'Cameroun',
  p_available_classes: ['CP', 'CE1', 'CE2']
});
*/

-- 5. FONCTION DE DIAGNOSTIC
CREATE OR REPLACE FUNCTION check_user_sync(p_email VARCHAR)
RETURNS JSON AS $$
DECLARE
    auth_user_exists BOOLEAN := false;
    table_user_exists BOOLEAN := false;
    school_exists BOOLEAN := false;
    result JSON;
BEGIN
    -- Vérifier dans auth.users (nécessite privilèges admin)
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = p_email) INTO auth_user_exists;
    
    -- Vérifier dans table users
    SELECT EXISTS(SELECT 1 FROM users WHERE email = p_email) INTO table_user_exists;
    
    -- Vérifier si une école est associée
    SELECT EXISTS(
        SELECT 1 FROM schools s 
        JOIN users u ON s.director_user_id = u.id 
        WHERE u.email = p_email
    ) INTO school_exists;
    
    result := json_build_object(
        'email', p_email,
        'auth_user_exists', auth_user_exists,
        'table_user_exists', table_user_exists,
        'school_exists', school_exists,
        'sync_status', CASE 
            WHEN auth_user_exists AND table_user_exists AND school_exists THEN 'complete'
            WHEN auth_user_exists AND table_user_exists THEN 'partial'
            WHEN auth_user_exists THEN 'auth_only'
            ELSE 'not_found'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- FIN DE LA SYNCHRONISATION
-- ====================================