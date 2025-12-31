# 🔧 Diagnostic - Lien de Confirmation Email ne Fonctionne Pas

## 🔍 Problème
Le lien de confirmation envoyé par email ne fonctionne pas pour valider le compte.

## ✅ Vérifications à Effectuer

### 1. Configuration Supabase Dashboard

#### A. Site URL
1. Allez sur **Supabase Dashboard** → votre projet
2. **Settings** → **General** → **Configuration**
3. Vérifiez **Site URL** :
   - ✅ Dev local : `http://localhost:5173` (port Vite par défaut)
   - ✅ Production : `https://votre-domaine.com`

#### B. Redirect URLs
1. **Settings** → **Authentication** → **URL Configuration**
2. Ajoutez ces URLs dans **Redirect URLs** :
   ```
   http://localhost:5173/**
   http://localhost:5173/auth/callback
   http://localhost:5173/principal-dashboard
   ```

#### C. Email Confirmation
1. **Settings** → **Authentication** → **Email Auth**
2. Vérifiez que **"Enable email confirmations"** est activé
3. **Confirm email** doit être sur **"Enabled"**

### 2. Vérifier le Template Email dans Supabase

1. **Settings** → **Authentication** → **Email Templates**
2. Sélectionnez **"Confirm signup"**
3. Vérifiez que le template contient bien :
   ```html
   <a href="{{ .ConfirmationURL }}">Confirmer mon compte</a>
   ```

### 3. Route de Callback dans votre Application React

Créez ou vérifiez la route `/auth/callback` dans votre application :

#### Fichier : `src/pages/AuthCallback.jsx` (À CRÉER si n'existe pas)

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('🔍 Type de confirmation:', type);
        console.log('🔍 Token présent:', !!accessToken);

        if (type === 'signup' && accessToken) {
          // Définir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          console.log('✅ Session établie:', data.user?.email);

          // Récupérer les infos utilisateur
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (userError) throw userError;

          // Rediriger selon le rôle
          if (userData.role === 'principal') {
            navigate('/principal-dashboard');
          } else if (userData.role === 'teacher') {
            navigate('/teacher-dashboard');
          } else if (userData.role === 'student') {
            navigate('/student-dashboard');
          } else if (userData.role === 'parent') {
            navigate('/parent-dashboard');
          } else {
            navigate('/');
          }
        } else {
          setError('Lien de confirmation invalide ou expiré');
        }
      } catch (error) {
        console.error('❌ Erreur confirmation:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirmation de votre compte en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de Confirmation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Retour à la connexion
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

#### Ajouter la route dans `src/Routes.jsx`

```jsx
import AuthCallback from 'pages/AuthCallback';

// Dans votre configuration de routes
const ProjectRoutes = () => {
  let element = useRoutes([
    // ... autres routes
    { path: "/auth/callback", element: <AuthCallback /> },
    // ... autres routes
  ]);

  return element;
};
```

### 4. Vérifier la Configuration Supabase dans .env

```env
VITE_SUPABASE_URL=https://cgpkhtksdcxtlyprerbj.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

### 5. Test de Diagnostic

Créez un fichier de test pour voir ce qui se passe :

#### `src/pages/TestEmailConfirmation.jsx`

```jsx
import { useEffect } from 'react';

export default function TestEmailConfirmation() {
  useEffect(() => {
    console.log('=== DIAGNOSTIC EMAIL CONFIRMATION ===');
    console.log('URL complète:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search params:', window.location.search);
    
    // Extraire les paramètres du hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    console.log('Type:', hashParams.get('type'));
    console.log('Access token présent:', !!hashParams.get('access_token'));
    console.log('Refresh token présent:', !!hashParams.get('refresh_token'));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnostic Email Confirmation</h1>
      <p>Ouvrez la console pour voir les détails</p>
      <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto">
        {window.location.href}
      </pre>
    </div>
  );
}
```

## 🧪 Procédure de Test

1. **Créer un compte test** via votre interface de signup
2. **Vérifier l'email** reçu dans votre boîte de réception
3. **Copier le lien** de confirmation
4. **Analyser le lien** :
   - Doit ressembler à : `http://localhost:5173/#access_token=...&type=signup&...`
   - OU : `http://localhost:5173/auth/callback#access_token=...`
5. **Ouvrir la console** du navigateur (F12)
6. **Cliquer sur le lien** et observer les logs

## 🐛 Problèmes Courants

### Problème 1 : "Lien expiré"
**Solution :** Le lien est valide 24h. Recréez un compte test.

### Problème 2 : Redirection vers mauvaise URL
**Solution :** Vérifier la Site URL dans Supabase Dashboard.

### Problème 3 : "Token invalid"
**Solution :** 
- Vérifier que l'email confirmation est activée dans Supabase
- Vérifier que la clé ANON est correcte dans .env

### Problème 4 : Route 404
**Solution :** Créer la route `/auth/callback` comme indiqué ci-dessus.

### Problème 5 : CORS Error
**Solution :** Ajouter votre domaine local dans les Redirect URLs de Supabase.

## 📝 Checklist Finale

- [ ] Site URL configurée dans Supabase
- [ ] Redirect URLs ajoutées (localhost:5173/**)
- [ ] Email confirmation activée dans Supabase Auth
- [ ] Template email contient {{ .ConfirmationURL }}
- [ ] Route /auth/callback créée dans React
- [ ] Fichier .env contient les bonnes clés Supabase
- [ ] Test avec un nouveau compte

## 🆘 Besoin d'Aide ?

Si le problème persiste après ces vérifications :

1. Partagez le lien de confirmation reçu (masquez le token)
2. Partagez les logs de la console
3. Vérifiez dans **Supabase Dashboard** → **Authentication** → **Users** si l'utilisateur apparaît avec `email_confirmed_at: null`

---

**Dernière mise à jour :** Octobre 2025  
**Status :** Guide de diagnostic complet
