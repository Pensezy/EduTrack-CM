# 🌐 URLs de Déploiement EduTrack CM

**Dernière mise à jour** : 2026-01-01

---

## 📍 URLs de Production (Vercel)

### Hub (Interface Publique)
**URL à configurer dans Supabase** :
```
https://edu-track-cm-hub.vercel.app
```

OU si vous avez configuré un domaine personnalisé :
```
https://edutrack.cm
```

### Admin (Interface d'Administration)
```
https://edu-track-cm-admin.vercel.app
```

---

## 🔧 Configuration Supabase Dashboard

### 1️⃣ Site URL (Authentication Settings)

**Allez dans** : Supabase Dashboard → Settings → Authentication → URL Configuration

**Site URL** :
```
Production:  https://edu-track-cm-hub.vercel.app
OU
Production:  https://edutrack.cm
```

### 2️⃣ Redirect URLs (Authentication Settings)

**Redirect URLs** (ajouter toutes ces URLs) :
```
# Production Hub
https://edu-track-cm-hub.vercel.app/**
https://edutrack.cm/**

# Production Admin
https://edu-track-cm-admin.vercel.app/**

# Développement Local
http://localhost:5173/**
http://localhost:5174/**
http://localhost:5175/**
http://localhost:5176/**
http://localhost:5177/**
http://localhost:5178/**
```

---

## 📧 Configuration Email Templates

Dans Supabase → Authentication → Email Templates → Confirm signup :

### Template Production

```html
<h2>Bienvenue sur EduTrack !</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre adresse email :</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">
    Confirmer mon email
  </a>
</p>

<p>Ce lien expirera dans 24 heures.</p>

<p>
  Si vous n'avez pas créé de compte sur EduTrack, ignorez cet email.
</p>
```

**Variables utilisées** :
- `{{ .SiteURL }}` → Utilise automatiquement l'URL configurée dans "Site URL"
- `{{ .TokenHash }}` → Token unique de confirmation
- `{{ .ConfirmationURL }}` → Alternative : URL complète générée automatiquement

---

## 💻 Configuration dans le Code

### apps/hub/src/pages/Signup/SignupPage.jsx

**Ligne 253** : `emailRedirectTo` utilise automatiquement la bonne URL

```jsx
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    // ✅ Cette ligne s'adapte automatiquement :
    // - Dev   : http://localhost:5173/auth/confirm
    // - Prod  : https://edu-track-cm-hub.vercel.app/auth/confirm
    emailRedirectTo: `${window.location.origin}/auth/confirm`,
    data: { ... }
  }
});
```

**Comment ça marche** :
- `window.location.origin` retourne automatiquement :
  - En **local** : `http://localhost:5173`
  - Sur **Vercel** : `https://edu-track-cm-hub.vercel.app`
  - Avec **domaine custom** : `https://edutrack.cm`

---

## 🚀 Vérification des URLs de Déploiement

### Trouver l'URL de votre Hub sur Vercel

1. **Connectez-vous sur Vercel** : https://vercel.com/dashboard
2. **Cherchez le projet** : `edu-track-cm-hub` ou `edutrack-cm`
3. **Copiez l'URL** affichée dans la section "Domains"

**Format typique** :
- `https://edu-track-cm-hub.vercel.app` (URL auto-générée)
- `https://edu-track-cm-hub-pensezy.vercel.app` (avec nom d'utilisateur)
- `https://edutrack.cm` (si domaine personnalisé configuré)

### Si vous n'avez pas encore déployé le Hub

**Option 1 : Déployer sur Vercel**
```bash
cd apps/hub
vercel --prod
```

**Option 2 : Via GitHub + Vercel Auto-Deploy**
1. Push votre code sur GitHub
2. Connecter le repo à Vercel
3. Vercel détecte automatiquement les apps et les déploie

---

## 📋 Checklist de Configuration

### Dans Supabase Dashboard

- [ ] **Site URL** → `https://edu-track-cm-hub.vercel.app` (ou votre URL)
- [ ] **Redirect URLs** → Toutes les URLs listées ci-dessus
- [ ] **Email Template** → Utilise `{{ .SiteURL }}/auth/confirm`
- [ ] **Sender Name** → Changé de `supabaseAuth` → `EduTrack`

### Dans le Code

- [ ] **SignupPage.jsx:253** → `emailRedirectTo` utilise `window.location.origin` ✅
- [ ] **AuthConfirm.jsx** → Route `/auth/confirm` existe ✅
- [ ] **App.jsx** → Route configurée ✅

### Tests

- [ ] Créer un compte en **local** → Email contient `localhost:5173`
- [ ] Créer un compte en **prod** → Email contient URL Vercel
- [ ] Clic sur lien email → Redirige vers la bonne page
- [ ] Confirmation fonctionne → Redirect vers `/onboarding`

---

## ⚠️ IMPORTANT : Différence Dev vs Production

### En Développement (Local)

```js
window.location.origin → "http://localhost:5173"
Email contient → http://localhost:5173/auth/confirm?token_hash=...
```

### En Production (Vercel)

```js
window.location.origin → "https://edu-track-cm-hub.vercel.app"
Email contient → https://edu-track-cm-hub.vercel.app/auth/confirm?token_hash=...
```

**C'est automatique !** Vous n'avez **rien à changer** dans le code.

---

## 🔍 Comment Vérifier que Tout est Bien Configuré

### Test 1 : Vérifier l'URL dans Supabase

```bash
# Ouvrir Supabase Dashboard
# Settings → Authentication → URL Configuration
# Site URL doit être : https://edu-track-cm-hub.vercel.app
```

### Test 2 : Tester l'Inscription en Production

1. Ouvrir : `https://edu-track-cm-hub.vercel.app/signup`
2. Remplir le formulaire
3. Vérifier l'email reçu
4. Le lien doit contenir : `https://edu-track-cm-hub.vercel.app/auth/confirm`

### Test 3 : Vérifier le Code

```bash
# Chercher "window.location.origin" dans le code
grep -r "window.location.origin" apps/hub/src/

# Résultat attendu :
# apps/hub/src/pages/Signup/SignupPage.jsx:253
```

---

## 📞 Support

Si vous ne trouvez pas l'URL de votre Hub sur Vercel :

1. **Vérifier les déploiements** : https://vercel.com/dashboard
2. **Chercher** : Projets contenant "hub", "edutrack", "edu-track"
3. **Si aucun projet Hub** : Le Hub n'a pas encore été déployé en production

Dans ce cas, vous pouvez :
- Utiliser `http://localhost:5173` pour le développement
- Déployer le Hub sur Vercel avant de configurer Supabase

---

**Dernière vérification** : 2026-01-01
**Status** : ✅ Code correctement configuré avec `window.location.origin`
