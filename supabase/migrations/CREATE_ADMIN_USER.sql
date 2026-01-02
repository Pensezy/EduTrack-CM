-- ============================================================================
-- Script: Création d'un compte Super Admin
-- ============================================================================
-- Ce script crée cette année un compte administrateur complet dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- ⚠️ IMPORTANT: Modifiez ces valeurs avant d'exécuter le script
-- ============================================================================

DO $$
DECLARE
  -- 🔐 VARIABLES À PERSONNALISER
  v_email TEXT := 'admin@edutrack.cm';              -- Email de l'admin
  v_password TEXT := 'AdminEduTrack!';          -- Mot de passe (min 8 caractères)
  v_full_name TEXT := 'Super Admin';                -- Nom complet
  v_phone TEXT := '+237600000000';                   -- Téléphone

  -- Variables internes
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_auth_user_id UUID;
BEGIN
  -- ============================================================================
  -- ÉTAPE 1: Vérifier si l'email existe déjà
  -- ============================================================================

  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_auth_user_id IS NOT NULL THEN
    RAISE NOTICE '⚠️ Un utilisateur avec cet email existe déjà: %', v_email;
    RAISE NOTICE '   User ID: %', v_auth_user_id;
    RETURN;
  END IF;

  -- ============================================================================
  -- ÉTAPE 2: Créer l'utilisateur dans auth.users (Supabase Auth)
  -- ============================================================================

  -- Générer un UUID pour le nouvel utilisateur
  v_user_id := gen_random_uuid();

  -- Hasher le mot de passe avec bcrypt (Supabase utilise crypt avec bf)
  v_encrypted_password := crypt(v_password, gen_salt('bf'));

  -- Insérer dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    v_email,
    v_encrypted_password,
    NOW(),                                    -- Email déjà confirmé
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', v_full_name,
      'phone', v_phone
    ),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  RAISE NOTICE '✅ Utilisateur Auth créé: % (ID: %)', v_email, v_user_id;

  -- ============================================================================
  -- ÉTAPE 3: Créer le profil dans la table users
  -- ============================================================================

  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    current_school_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_email,
    v_full_name,
    v_phone,
    'admin',                                  -- Rôle super admin
    NULL,                                     -- Pas d'école spécifique pour admin
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Profil utilisateur créé dans public.users';

  -- ============================================================================
  -- ÉTAPE 4: Créer une identité dans auth.identities
  -- ============================================================================

  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id::text,
    v_user_id,
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Identité créée dans auth.identities';

  -- ============================================================================
  -- RÉCAPITULATIF
  -- ============================================================================

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email    : %', v_email;
  RAISE NOTICE '🔑 Mot de passe : %', v_password;
  RAISE NOTICE '👤 Nom      : %', v_full_name;
  RAISE NOTICE '🆔 User ID  : %', v_user_id;
  RAISE NOTICE '🎭 Rôle     : Super Admin';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Changez le mot de passe après la première connexion!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERREUR lors de la création de l''administrateur:';
    RAISE NOTICE '   %', SQLERRM;
    RAISE NOTICE '';
    RAISE;
END $$;
