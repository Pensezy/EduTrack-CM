# Guide : Créer un Compte Super Admin

## 📋 Méthode 1 : Via l'éditeur SQL Supabase (Recommandée)

### Étape 1 : Accéder à l'éditeur SQL

1. Connectez-vous à votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet EduTrack
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**
4. Cliquez sur **"New Query"**

### Étape 2 : Copier le script

Copiez ce script complet dans l'éditeur :

```sql
-- ============================================================================
-- CRÉATION COMPTE SUPER ADMIN
-- ============================================================================

DO $$
DECLARE
  -- 🔐 PERSONNALISEZ ICI :
  v_email TEXT := 'admin@edutrack.cm';              -- Votre email
  v_password TEXT := 'VotreMotDePasse123!';         -- Minimum 8 caractères
  v_full_name TEXT := 'Super Admin';                -- Nom complet
  v_phone TEXT := '+237600000000';                   -- Téléphone

  -- Variables internes
  v_user_id UUID;
  v_encrypted_password TEXT;
  v_existing_id UUID;
BEGIN
  -- Vérifier si l'email existe déjà
  SELECT id INTO v_existing_id
  FROM auth.users
  WHERE email = v_email;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION '❌ Un compte avec cet email existe déjà: %', v_email;
  END IF;

  -- Générer UUID et hasher le mot de passe
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt(v_password, gen_salt('bf'));

  -- Créer dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
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
    jsonb_build_object(
      'full_name', v_full_name,
      'phone', v_phone
    ),
    '', '', '', ''
  );

  -- Créer le profil
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
    'admin',
    NULL,
    NOW(),
    NOW()
  );

  -- Créer l'identité
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

  -- Afficher le récapitulatif
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS!';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Email     : %', v_email;
  RAISE NOTICE '🔑 Password  : %', v_password;
  RAISE NOTICE '👤 Nom       : %', v_full_name;
  RAISE NOTICE '🆔 User ID   : %', v_user_id;
  RAISE NOTICE '🎭 Rôle      : admin';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Changez le mot de passe après la 1ère connexion!';
  RAISE NOTICE '';

END $$;
```

### Étape 3 : Personnaliser les valeurs

**Modifiez ces lignes** (lignes 24-27) :

```sql
v_email TEXT := 'admin@edutrack.cm';              -- Votre email
v_password TEXT := 'VotreMotDePasse123!';         -- Minimum 8 caractères
v_full_name TEXT := 'Super Admin';                -- Nom complet
v_phone TEXT := '+237600000000';                   -- Téléphone
```

### Étape 4 : Exécuter le script

1. Cliquez sur le bouton **"Run"** (ou `Ctrl + Enter`)
2. Attendez quelques secondes
3. Vérifiez les messages dans l'onglet **"Results"**

### Étape 5 : Vérifier la création

Vous devriez voir ce message :

```
✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS!
═══════════════════════════════════════════════════════
📧 Email     : admin@edutrack.cm
🔑 Password  : VotreMotDePasse123!
👤 Nom       : Super Admin
🆔 User ID   : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
🎭 Rôle      : admin
```

### Étape 6 : Tester la connexion

1. Allez sur votre application EduTrack
2. Connectez-vous avec l'email et le mot de passe créés
3. **Changez immédiatement le mot de passe** depuis les paramètres

---

## 📋 Méthode 2 : Via migration SQL (Pour développement)

Si vous voulez créer l'admin automatiquement lors du déploiement :

1. Le fichier de migration existe déjà : `supabase/migrations/CREATE_ADMIN_USER.sql`
2. Personnalisez les valeurs dans ce fichier
3. Appliquez la migration :

```bash
# Si vous utilisez Supabase CLI
supabase db push
```

---

## 🔐 Sécurité - Bonnes Pratiques

### ✅ À FAIRE :

1. **Utilisez un mot de passe fort** :
   - Minimum 12 caractères
   - Majuscules + minuscules + chiffres + symboles
   - Exemple : `Admin@2024!EduTrack`

2. **Changez le mot de passe** :
   - Immédiatement après la première connexion
   - Utilisez un gestionnaire de mots de passe

3. **Sécurisez l'accès** :
   - Activez l'authentification à deux facteurs (2FA) si disponible
   - Ne partagez jamais les identifiants admin

4. **Supprimez le script** :
   - Après création, supprimez le fichier SQL avec les identifiants
   - Ou commentez les lignes avec les mots de passe

### ❌ À NE PAS FAIRE :

- ❌ Utiliser `admin@admin.com` ou `password123`
- ❌ Partager les identifiants par email non chiffré
- ❌ Laisser le mot de passe par défaut en production
- ❌ Créer plusieurs comptes admin sans raison

---

## 🔍 Vérification manuelle

Pour vérifier que le compte admin existe, exécutez :

```sql
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.role = 'admin';
```

---

## ❓ Dépannage

### Erreur : "Un compte avec cet email existe déjà"

**Solution** : L'email est déjà utilisé. Soit :
- Utilisez un autre email
- Supprimez l'ancien compte d'abord :

```sql
-- ATTENTION: Supprime définitivement le compte
DELETE FROM auth.users WHERE email = 'admin@edutrack.cm';
DELETE FROM public.users WHERE email = 'admin@edutrack.cm';
```

### Erreur : "permission denied for table auth.users"

**Solution** : Vous n'avez pas les permissions nécessaires.
- Assurez-vous d'être propriétaire du projet Supabase
- Exécutez le script en tant que service_role

### Le compte est créé mais je ne peux pas me connecter

**Vérifications** :
1. L'email est-il confirmé ? → Vérifiez que `email_confirmed_at` est défini
2. Le mot de passe est-il correct ? → Essayez de le réinitialiser
3. Le rôle est-il bien 'admin' ? → Vérifiez dans la table `users`

```sql
-- Confirmer l'email manuellement
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'admin@edutrack.cm';
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans l'éditeur SQL Supabase
2. Consultez la documentation Supabase Auth
3. Contactez le support technique EduTrack

---

**Dernière mise à jour** : 2026-01-01
