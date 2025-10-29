# ✅ Vérification : Création de Compte Secrétaire

**Date:** 27 Octobre 2025  
**Objectif:** Vérifier que la base de données a toutes les tables nécessaires pour créer un compte secrétaire sans bugs et sans données fictives

---

## 📋 Tables Nécessaires pour un Compte Secrétaire

### ✅ Tables ESSENTIELLES (OBLIGATOIRES)

| Table | Statut | Description | Colonnes Clés |
|-------|--------|-------------|---------------|
| **users** | ✅ EXISTE | Table principale des utilisateurs | `id`, `email`, `full_name`, `phone`, `role`, `current_school_id`, `is_active` |
| **schools** | ✅ EXISTE | Informations des écoles | `id`, `name`, `code`, `director_user_id` |
| **academic_years** | ✅ EXISTE | Années scolaires | `id`, `school_id`, `name`, `is_current` |
| **user_roles** | ✅ EXISTE | Rôles et permissions | `id`, `school_id`, `code`, `permissions` |

### ✅ Tables FONCTIONNELLES (pour les opérations secrétaires)

| Table | Statut | Utilité | Colonnes Principales |
|-------|--------|---------|---------------------|
| **students** | ✅ EXISTE | Gestion des élèves | `id`, `school_id`, `user_id`, `class_id` |
| **classes** | ✅ EXISTE | Classes de l'école | `id`, `school_id`, `name`, `level`, `capacity` |
| **teachers** | ✅ EXISTE | Enseignants | `id`, `school_id`, `user_id`, `specialty` |
| **payment_types** | ✅ EXISTE | Types de paiements | `id`, `school_id`, `name`, `code`, `amount` |
| **attendance_types** | ✅ EXISTE | Types de présence | `id`, `school_id`, `name`, `code` |
| **grade_types** | ✅ EXISTE | Types de notes | `id`, `school_id`, `name`, `coefficient` |
| **evaluation_periods** | ✅ EXISTE | Périodes d'évaluation | `id`, `school_id`, `academic_year_id`, `name` |
| **enrollment_requests** | ✅ EXISTE | Demandes d'inscription | `id`, `school_id`, `request_type`, `status` |

---

## 🔐 Processus de Création d'un Compte Secrétaire

### Méthode 1️⃣ : Via Supabase Auth (RECOMMANDÉ)

#### Étapes :
1. Le directeur utilise le formulaire dans `AccountsManagement.jsx`
2. Le système appelle Supabase Auth pour créer un compte
3. Le **trigger automatique** `on_auth_user_created` s'exécute
4. Le trigger insère les données dans la table `users`

#### Code Actuel (AccountsManagement.jsx) :
```javascript
const handleCreateUser = () => {
  // Validation des champs
  if (!newUser.fullName || !newUser.email || !newUser.password) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  // En mode PRODUCTION (actuellement manquant)
  // Il faut appeler Supabase pour créer le compte
}
```

#### ⚠️ PROBLÈME IDENTIFIÉ :
**Le code actuel n'appelle PAS Supabase en mode production !**

Il faut ajouter :
```javascript
if (!isDemo) {
  // Appeler Supabase pour créer le compte
  const { data, error } = await supabase.auth.signUp({
    email: newUser.email,
    password: newUser.password,
    options: {
      data: {
        full_name: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role // 'secretary'
      }
    }
  });
}
```

---

### Méthode 2️⃣ : Via RPC Function (ALTERNATIVE)

Créer une fonction Supabase RPC pour gérer la création :

```sql
CREATE OR REPLACE FUNCTION create_secretary_account(
  p_email TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_school_id UUID,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 1. Créer dans auth.users (nécessite extension pgcrypto)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', p_full_name, 'phone', p_phone, 'role', 'secretary'),
    NOW(),
    NOW()
  )
  RETURNING id INTO new_user_id;

  -- 2. Créer dans public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    role,
    current_school_id,
    is_active
  )
  VALUES (
    new_user_id,
    p_email,
    p_full_name,
    p_phone,
    'secretary',
    p_school_id,
    true
  );

  RETURN json_build_object('success', true, 'user_id', new_user_id);
END;
$$;
```

---

## 📊 État Actuel du Code

### ✅ Ce qui FONCTIONNE :

1. **Interface de création** : Formulaire complet dans `AccountsManagement.jsx`
2. **Validation des champs** : Email, nom, téléphone, rôle, mot de passe
3. **Génération de mot de passe** : Fonction `generateSecurePassword()`
4. **Mode démo** : Simulation complète de la création

### ❌ Ce qui MANQUE :

1. **Appel Supabase en production** : Pas d'appel à `supabase.auth.signUp()`
2. **Gestion d'erreurs** : Pas de try/catch pour gérer les erreurs Supabase
3. **Vérification d'email unique** : Pas de vérification si email existe déjà
4. **Envoi d'email** : Fonction `sendCredentialsByEmail()` non implémentée

---

## 🔧 Corrections à Apporter

### 1️⃣ Modifier `handleCreateUser` dans AccountsManagement.jsx

**Fichier:** `src/pages/principal-dashboard/components/AccountsManagement.jsx`

**Ligne ~255** - Remplacer le code actuel par :

```javascript
const handleCreateUser = async () => {
  if (!newUser.fullName || !newUser.email || !newUser.password) {
    alert('Veuillez remplir tous les champs obligatoires');
    return;
  }

  if (newUser.password.length < 8) {
    alert('Le mot de passe doit contenir au moins 8 caractères');
    return;
  }

  setLoading(true);

  try {
    if (isDemo) {
      // Mode démo (actuel)
      const confirmSend = confirm(
        `Mode démo : Compte créé pour ${newUser.fullName} (${newUser.role})\n\n` +
        `Voulez-vous envoyer les identifiants par email à ${newUser.email} ?\n\n` +
        `Email : ${newUser.email}\n` +
        `Mot de passe temporaire : ${newUser.password}`
      );
      
      if (confirmSend) {
        alert('Mode démo : Email d\'identifiants envoyé avec succès !');
      }
    } else {
      // ✅ MODE PRODUCTION - Appel Supabase
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.fullName,
            phone: newUser.phone,
            role: newUser.role // 'secretary', 'teacher', etc.
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Vérifier si l'utilisateur a été créé
      if (data.user) {
        alert(
          `✅ Compte créé avec succès !\n\n` +
          `Utilisateur : ${newUser.fullName}\n` +
          `Email : ${newUser.email}\n` +
          `Rôle : ${newUser.role}\n\n` +
          `Un email de confirmation a été envoyé à ${newUser.email}`
        );

        // Rafraîchir la liste des comptes
        await loadAccounts();
      }
    }

    // Reset du formulaire
    setNewUser({
      fullName: '',
      email: '',
      phone: '',
      role: 'student',
      password: '',
      status: 'active'
    });
    setActiveTab('accounts');

  } catch (error) {
    console.error('Erreur création compte:', error);
    alert(`❌ Erreur lors de la création du compte :\n\n${error.message}`);
  } finally {
    setLoading(false);
  }
};
```

### 2️⃣ Ajouter la fonction `loadAccounts`

```javascript
const loadAccounts = async () => {
  if (isDemo) {
    // Charger comptes démo (actuel)
    return;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('current_school_id', user.current_school_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    setAccounts(data || []);
  } catch (error) {
    console.error('Erreur chargement comptes:', error);
  }
};
```

---

## 🧪 Tests à Effectuer

### Test 1 : Création d'un compte secrétaire

1. Se connecter en tant que directeur
2. Aller dans **Comptes** > **Créer**
3. Remplir le formulaire :
   - **Nom complet** : "Marie Dupont"
   - **Email** : "marie.dupont@ecole.cm"
   - **Téléphone** : "+237 677 123 456"
   - **Rôle** : "Secrétaire"
   - **Mot de passe** : Générer automatiquement
4. Cliquer sur **Créer le compte**
5. ✅ Vérifier : Compte créé dans Supabase
6. ✅ Vérifier : Entrée dans table `users` avec `role='secretary'`

### Test 2 : Connexion avec le compte secrétaire

1. Se déconnecter
2. Aller sur la page de connexion
3. Entrer l'email et le mot de passe créé
4. ✅ Vérifier : Redirection vers `/secretary-dashboard`
5. ✅ Vérifier : Toutes les fonctions accessibles

### Test 3 : Vérification des permissions

1. Connecté en tant que secrétaire
2. Tester les onglets :
   - ✅ Élèves (lecture/écriture)
   - ✅ Paiements (lecture/écriture)
   - ✅ Justificatifs (lecture/écriture)
   - ❌ Gestion du personnel (non accessible)

---

## 📝 Checklist de Vérification

### Base de Données ✅

- [x] Table `users` existe
- [x] Table `schools` existe
- [x] Table `academic_years` existe
- [x] Table `user_roles` existe avec rôle 'SECRETARY'
- [x] Trigger `on_auth_user_created` actif
- [x] Enum `user_role` contient 'secretary'

### Code Frontend ⚠️

- [x] Formulaire de création existe
- [x] Validation des champs fonctionne
- [ ] **MANQUE** : Appel Supabase en production
- [ ] **MANQUE** : Gestion d'erreurs
- [ ] **MANQUE** : Fonction de chargement des comptes

### Sécurité RLS (Row Level Security) 🔒

À vérifier dans Supabase :
- [ ] Politique SELECT sur `users` pour secrétaires
- [ ] Politique INSERT sur `students` pour secrétaires
- [ ] Politique UPDATE sur `students` pour secrétaires
- [ ] Politique SELECT sur `payment_types` pour secrétaires

---

## 🎯 Conclusion

### ✅ État Actuel :
**La base de données est COMPLÈTE** - Toutes les tables nécessaires existent.

### ❌ Problème Principal :
**Le code frontend n'appelle PAS Supabase en mode production !**

### 🔧 Solution :
Ajouter l'appel à `supabase.auth.signUp()` dans la fonction `handleCreateUser` comme montré ci-dessus.

### 📊 Résumé :
- **Tables DB** : ✅ 100% Prêtes
- **Trigger automatique** : ✅ Actif
- **Interface** : ✅ Complète
- **Logique production** : ❌ Manquante (à implémenter)

---

**Prochaine étape recommandée :**  
Implémenter l'appel Supabase dans `AccountsManagement.jsx` pour activer la création de comptes en production.
