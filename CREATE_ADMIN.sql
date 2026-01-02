-- ============================================================================
-- COPIER-COLLER CE SCRIPT DANS L'ÉDITEUR SQL SUPABASE
-- ============================================================================
-- 1. Allez sur https://app.supabase.com
-- 2. Sélectionnez votre projet
-- 3. Menu : SQL Editor → New Query
-- 4. Modifiez les valeurs ci-dessous
-- 5. Cliquez sur "Run" (Ctrl + Enter)
-- ============================================================================

DO $$
DECLARE
  -- 🔐 MODIFIEZ CES VALEURS :
  v_email TEXT := 'admin@edutrack.cm';
  v_password TEXT := 'AdminEduTrack2024!';
  v_full_name TEXT := 'Super Admin';
  v_phone TEXT := '+237600000000';

  -- Variables internes (ne pas modifier)
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_existing_id UUID;
BEGIN
  -- Vérifier si l'email existe
  SELECT id INTO v_existing_id FROM auth.users WHERE email = v_email;
  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION '❌ Email déjà utilisé: %', v_email;
  END IF;

  -- Générer ID et hasher mot de passe
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(v_password, gen_salt('bf'));

  -- Créer dans auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, aud, role,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    v_user_id, '00000000-0000-0000-0000-000000000000', v_email,
    v_encrypted_password, NOW(), NOW(), NOW(), 'authenticated', 'authenticated',
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

  -- Afficher le résultat
  RAISE NOTICE '';
  RAISE NOTICE '✅ ADMIN CRÉÉ AVEC SUCCÈS!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📧 Email      : %', v_email;
  RAISE NOTICE '🔑 Password   : %', v_password;
  RAISE NOTICE '👤 Nom        : %', v_full_name;
  RAISE NOTICE '🆔 User ID    : %', v_user_id;
  RAISE NOTICE '🎭 Rôle       : admin (Super Administrateur)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  CHANGEZ LE MOT DE PASSE APRÈS CONNEXION!';
  RAISE NOTICE '';
END $$;
