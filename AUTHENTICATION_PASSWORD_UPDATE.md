# 🔐 Mise à Jour: Authentification par Mot de Passe

**Date:** 31 Décembre 2025
**Statut:** ✅ Complété

---

## 📋 Contexte

L'application Admin utilisait initialement l'authentification par code PIN (6 chiffres), ce qui n'est pas adapté pour une application professionnelle d'administration.

**Décision:** Migrer vers une authentification par **email + mot de passe** sécurisée via Supabase Auth.

---

## ✅ Modifications Apportées

### 1. AuthContext - Nouvelle Fonction `signInWithPassword`

**Fichier:** `packages/api-client/src/contexts/AuthContext.jsx`

#### Fonction Ajoutée
```javascript
const signInWithPassword = async (email, password) => {
  // Validation des entrées
  if (!email || !password) {
    return {
      success: false,
      error: 'Email et mot de passe requis',
      user: null
    };
  }

  // Authentification avec Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password
  });

  // Récupération du profil utilisateur
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  // Construction et retour de l'objet utilisateur
  return {
    success: true,
    user: authenticatedUser,
    error: null
  };
};
```

#### Exportation dans le Context
```javascript
const value = {
  user,
  userProfile,
  loading,
  signInWithPin,        // Gardé pour rétrocompatibilité (autres apps)
  signInWithPassword,   // ✅ NOUVEAU
  signOut,
  error,
  setError
};
```

---

### 2. Page Login - Interface Modernisée

**Fichier:** `apps/admin/src/pages/Auth/Login.jsx`

#### Changements dans le State
```javascript
// AVANT
const [formData, setFormData] = useState({
  identifier: '',
  pin: ''
});

// APRÈS
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
```

#### Changements dans la Logique
```javascript
// AVANT
const { signInWithPin } = useAuth();
const result = await signInWithPin(formData.pin, formData.identifier);

// APRÈS
const { signInWithPassword } = useAuth();
const result = await signInWithPassword(formData.email, formData.password);
```

#### Interface Utilisateur

**Champ Email:**
```jsx
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  placeholder="votre.email@exemple.com"
  required
/>
```

**Champ Mot de Passe:**
```jsx
<input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  placeholder="Entrez votre mot de passe"
  required
/>
```

---

## 🔒 Sécurité

### Authentification Supabase
- **Hash bcrypt** automatique des mots de passe
- **Session tokens** JWT sécurisés
- **Rate limiting** intégré contre bruteforce
- **Validation email** lors de l'inscription

### Validation Côté Client
```javascript
// Email automatiquement en lowercase et trimmed
email: email.trim().toLowerCase()

// Type="email" pour validation HTML5
// Type="password" pour masquer le texte
```

### Messages d'Erreur Génériques
```javascript
// Ne pas révéler si l'email existe ou non
error: 'Email ou mot de passe invalide'
```

---

## 📊 Flux d'Authentification

```
┌─────────────────────────────────────────────────────────┐
│  1. Utilisateur entre email + password                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. signInWithPassword() appelé                         │
│     - Validation des champs                             │
│     - Email normalisé (lowercase, trim)                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. Supabase Auth - signInWithPassword()                │
│     - Vérification email/password                       │
│     - Génération session JWT                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Récupération profil depuis table 'users'            │
│     - SELECT * WHERE id = authData.user.id              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Validation du rôle (Admin Layout)                   │
│     - Vérification: role === 'admin' || 'principal'     │
│     - Refus si autre rôle                               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  6. Sauvegarde session                                  │
│     - localStorage: 'edutrack-user'                     │
│     - State: setUser() + setUserProfile()               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  7. Redirection vers Dashboard                          │
│     - navigate('/', { replace: true })                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Manuel
1. Ouvrir http://localhost:5174
2. Entrer un email valide (admin@exemple.com)
3. Entrer le mot de passe
4. Vérifier la connexion réussie

### Cas de Test

| Test | Email | Password | Résultat Attendu |
|------|-------|----------|------------------|
| ✅ Login valide | admin@edutrack.cm | MotDePasse123! | Connexion réussie → Dashboard |
| ❌ Email invalide | wrong@test.com | MotDePasse123! | Erreur: "Email ou mot de passe invalide" |
| ❌ Password invalide | admin@edutrack.cm | wrongpassword | Erreur: "Email ou mot de passe invalide" |
| ❌ Champs vides | (vide) | (vide) | Erreur: "Email et mot de passe requis" |
| ❌ Rôle non autorisé | student@test.com | password123 | Erreur: "Accès refusé..." |

---

## 🔄 Rétrocompatibilité

### signInWithPin() Conservé
La fonction `signInWithPin()` est **conservée** dans AuthContext pour les autres applications du monorepo :
- **App Hub** (page d'accueil publique)
- **App Academic** (élèves, enseignants)
- **App Finance** (paiements)

Seule l'**App Admin** utilise l'authentification par mot de passe.

---

## 📝 Configuration Requise

### Supabase Auth
Assurez-vous que Supabase Auth est configuré :

1. **Email Provider activé** dans Supabase Dashboard
2. **Auto-confirm** activé (pour dev) ou emails configurés (pour prod)
3. **Table users** avec colonnes:
   - `id` (UUID, PK)
   - `email` (TEXT, UNIQUE)
   - `full_name` (TEXT)
   - `role` (TEXT)
   - `school_id` (UUID, FK)
   - `is_active` (BOOLEAN)

### Environnement Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🎯 Prochaines Étapes

### Optionnel - Améliorer la Sécurité
- [ ] Ajouter "Mot de passe oublié" (reset password)
- [ ] Implémenter MFA (Multi-Factor Authentication)
- [ ] Ajouter CAPTCHA contre bruteforce
- [ ] Logger les tentatives de connexion échouées

### Optionnel - Améliorer l'UX
- [ ] Afficher/masquer le mot de passe (icône œil)
- [ ] Validation en temps réel du format email
- [ ] Remember me (session persistante)
- [ ] Redirection vers page demandée après login

---

## 📋 Résumé des Fichiers Modifiés

### Modifiés
1. ✅ `packages/api-client/src/contexts/AuthContext.jsx`
   - Ajout fonction `signInWithPassword()`
   - Export dans le context value

2. ✅ `apps/admin/src/pages/Auth/Login.jsx`
   - Changement de PIN → Password
   - Interface email + password
   - Messages d'erreur adaptés

### Aucun Changement
- ✅ `apps/admin/src/App.jsx` - ProtectedRoute fonctionne tel quel
- ✅ `apps/admin/src/components/Layout/` - Layouts inchangés
- ✅ Autres packages - Compatibilité maintenue

---

## ✅ Conclusion

L'application Admin utilise maintenant une **authentification professionnelle** par email et mot de passe, conforme aux standards de sécurité modernes.

**Avantages:**
- ✅ Sécurité renforcée (hash bcrypt, session JWT)
- ✅ UX professionnelle (email au lieu de codes PIN)
- ✅ Intégration native Supabase Auth
- ✅ Prêt pour production

---

**Auteur:** EduTrack Development Team
**Version:** 2.0.0 (Monorepo)
