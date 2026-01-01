# 📧 Correction du Lien "Localhost" dans l'Email de Confirmation

## 🐛 Problème

L'email de confirmation Supabase contient un lien avec "localhost" au lieu de l'URL de production.

**Email actuel** :
```
Confirmez votre email : http://localhost:3000/auth/confirm?token=...
```

**Email souhaité** :
```
Confirmez votre email : https://edutrack.cm/auth/confirm?token=...
```

---

## 🔧 Solution

### 1️⃣ Configurer l'URL du Site dans Supabase

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** EduTrack
3. **Allez dans** : **Settings** → **Authentication** → **URL Configuration**

4. **Modifiez ces paramètres** :

   **Site URL** :
   ```
   https://edutrack.cm
   ```
   OU en développement :
   ```
   http://localhost:5173
   ```

   **Redirect URLs** (ajouter tous) :
   ```
   https://edutrack.cm/**
   https://edu-track-cm-admin.vercel.app/**
   http://localhost:5173/**
   http://localhost:5174/**
   ```

5. **Cliquez sur "Save"**

---

### 2️⃣ Configurer les Templates d'Email

1. **Toujours dans Authentication**
2. **Allez dans** : **Email Templates**
3. **Sélectionnez** : **Confirm signup**

4. **Modifiez le template** pour utiliser la variable correcte :

```html
<h2>Confirmez votre inscription à EduTrack</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Confirmer mon email</a></p>
```

**Variables disponibles** :
- `{{ .SiteURL }}` : URL du site (configurée ci-dessus)
- `{{ .TokenHash }}` : Token de confirmation
- `{{ .ConfirmationURL }}` : URL complète générée automatiquement

5. **Cliquez sur "Save"**

---

### 3️⃣ Créer la Route de Confirmation dans le Hub

Le lien pointe vers `/auth/confirm`, il faut créer cette route :

**Fichier** : `apps/hub/src/pages/AuthConfirm/AuthConfirm.jsx`

```jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GraduationCap, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const confirmEmail = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (!tokenHash || type !== 'signup') {
        setStatus('error');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup'
        });

        if (error) throw error;

        setStatus('success');

        // Rediriger vers le login après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Erreur de confirmation:', error);
        setStatus('error');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <GraduationCap className="h-8 w-8 text-primary-600" />
          <span className="text-2xl font-bold text-gray-900">EduTrack</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirmation en cours...</h2>
            <p className="text-gray-600">Veuillez patienter</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email confirmé !</h2>
            <p className="text-gray-600 mb-4">
              Votre compte a été activé avec succès.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers la page de connexion...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de confirmation</h2>
            <p className="text-gray-600 mb-6">
              Le lien de confirmation est invalide ou a expiré.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Créer un nouveau compte
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

**Ajouter la route dans** `apps/hub/src/App.jsx` :

```jsx
import AuthConfirm from './pages/AuthConfirm/AuthConfirm';

// Dans le <Routes>
<Route path="/auth/confirm" element={<AuthConfirm />} />
```

---

### 4️⃣ Alternative : Désactiver la Confirmation Email (Dev seulement)

Pour le développement, vous pouvez désactiver la confirmation :

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. **Email** → **Décocher** "Confirm email"
3. Les utilisateurs seront créés immédiatement sans email de confirmation

⚠️ **À réactiver en production !**

---

## ✅ Vérification

Après avoir configuré :

1. **Créez un nouveau compte** depuis `http://localhost:5173/signup`
2. **Vérifiez l'email** reçu
3. Le lien devrait être :
   - **Dev** : `http://localhost:5173/auth/confirm?token_hash=...`
   - **Prod** : `https://edutrack.cm/auth/confirm?token_hash=...`

4. **Cliquez sur le lien** → Devrait confirmer l'email et rediriger vers login

---

## 📝 Résumé des Changements

| Paramètre | Avant | Après |
|-----------|-------|-------|
| Site URL | localhost:3000 | localhost:5173 (dev) / edutrack.cm (prod) |
| Email Template | Lien hardcodé | Utilise {{ .SiteURL }} |
| Route /auth/confirm | ❌ N'existe pas | ✅ Page de confirmation créée |
| Boutons Onboarding | href="#" | Vrais liens fonctionnels |

---

**Dernière mise à jour** : 2026-01-01
