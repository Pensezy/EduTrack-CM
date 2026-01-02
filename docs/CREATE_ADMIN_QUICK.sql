-- ============================================================================
-- CRÉATION RAPIDE D'UN COMPTE SUPER ADMIN
-- ============================================================================
-- À copier/coller directement dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- 🔐 PERSONNALISEZ CES VALEURS :
-- ============================================================================

DO $$
DECLARE
  v_email TEXT := 'admin@edutrack.cm';              -- ⚠️ CHANGEZ L'EMAIL
  v_password TEXT := 'ChangeMe123!';                 -- ⚠️ CHANGEZ LE MOT DE PASSE
  v_full_name TEXT := 'Super Admin';
  v_phone TEXT := '+237600000000';

  v_user_id UUID;
  v_encrypted_password TEXT;
BEGIN
  -- Générer UUID et hasher le mot de passe
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(v_password, gen_salt('bf'));

  -- Créer dans auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    v_email,
    v_encrypted_password,
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', v_full_name, 'phone', v_phone),
    '', '', '', ''
  );

  -- Créer le profil
  INSERT INTO public.users (
    id, email, full_name, phone, role, current_school_id, created_at, updated_at
  ) VALUES (
    v_user_id, v_email, v_full_name, v_phone, 'admin', NULL, NOW(), NOW()
  );

  -- Créer l'identité
  INSERT INTO auth.identities (
    provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id::text, v_user_id, v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email', NOW(), NOW(), NOW()
  );

  -- Afficher les informations
  RAISE NOTICE '✅ ADMIN CRÉÉ: % (ID: %)', v_email, v_user_id;
  RAISE NOTICE '🔑 Mot de passe: %', v_password;
END $$;
