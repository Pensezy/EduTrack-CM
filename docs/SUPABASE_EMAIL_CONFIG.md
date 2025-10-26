# 🔧 Configuration Supabase pour Email de Confirmation

## ⚙️ Étapes de Configuration dans Supabase Dashboard

### 1. Configuration des URLs

1. **Allez sur Supabase Dashboard** : https://app.supabase.com
2. **Sélectionnez votre projet** : EduTrack-CM
3. **Settings** (icône engrenage) → **General**

#### A. Site URL
Trouvez la section **"Configuration"** :
- **Site URL** : `http://localhost:5173` (pour développement local)
- Pour production : `https://votre-domaine.com`

#### B. Redirect URLs
Dans la même section :
- Cliquez sur **"Add redirect URL"**
- Ajoutez ces URLs une par une :
  ```
  http://localhost:5173/**
  http://localhost:5173/auth/callback
  http://localhost:5173/principal-dashboard
  http://localhost:3000/**
  http://localhost:3000/auth/callback
  ```

### 2. Configuration de l'Authentification Email

1. **Settings** → **Authentication**
2. Dans l'onglet **"Email Auth"** :
   - ✅ **Enable email confirmations** : ACTIVÉ
   - ✅ **Confirm email** : ENABLED

### 3. Configuration du Template Email

1. **Settings** → **Authentication** → **Email Templates**
2. Sélectionnez **"Confirm signup"**
3. **Subject** :
   ```
   🎓 EduTrack-CM : Confirmez votre compte de directeur d'établissement
   ```
4. **Body (HTML)** :
   - Copiez le contenu de `supabase/email-templates/confirm-signup.html`
   - Collez-le dans l'éditeur
   - Cliquez sur **Save**

### 4. Vérifier la Configuration

#### Test Rapide :
1. Créez un compte test via votre interface
2. Vérifiez l'email reçu
3. Cliquez sur le lien de confirmation
4. Vous devriez être redirigé vers `/auth/callback` puis vers votre dashboard

## 🎯 Configuration Complète de l'Email Template

### Dans Supabase Dashboard → Email Templates → Confirm signup

**Subject Line:**
```
🎓 EduTrack-CM : Confirmez votre compte de directeur d'établissement
```

**From Name:**
```
EduTrack-CM
```

**Body (copier le contenu de confirm-signup.html):**

Le fichier contient déjà les bonnes variables :
- `{{ .ConfirmationURL }}` - Le lien de confirmation automatique
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .Name }}` - Nom complet
- `{{ .CreatedAt }}` - Date de création
- `{{ .SiteURL }}` - URL du site

## 🔍 Diagnostic

### Vérifier que tout fonctionne :

1. **Créer un compte test**
2. **Vérifier l'email** (boîte de réception + spam)
3. **Analyser le lien** reçu :
   - Doit commencer par : `http://localhost:5173/auth/callback#`
   - Suivi de : `access_token=...&type=signup&...`

4. **Cliquer sur le lien** et observer :
   - Page de chargement "Confirmation en cours..."
   - Redirection automatique vers le dashboard approprié
   - OU message d'erreur clair

### Console du navigateur (F12)

Vous devriez voir ces logs :
```
🔍 === DEBUT CONFIRMATION EMAIL ===
URL complète: http://localhost:5173/auth/callback#access_token=...
Type: signup
Access token présent: true
✅ Type signup détecté, configuration de la session...
✅ Session établie pour: test@example.com
✅ Utilisateur trouvé: Nom Test - Rôle: principal
🔀 Redirection vers le dashboard: principal
```

## ⚠️ Problèmes Courants

### Problème 1 : "Lien expiré" après 24h
**Solution :** Recréer un compte test. Les liens expirent après 24 heures.

### Problème 2 : Redirection vers mauvaise URL
**Solution :** Vérifier que Site URL = `http://localhost:5173` (sans trailing slash)

### Problème 3 : Email non reçu
**Solution :**
- Vérifier les spams
- Vérifier que "Email confirmations" est activé
- Tester avec un autre email (Gmail, Outlook)

### Problème 4 : "Token invalid"
**Solution :**
- Vérifier que la clé `VITE_SUPABASE_ANON_KEY` est correcte dans `.env`
- Redémarrer le serveur Vite après modification du `.env`

### Problème 5 : Page blanche après clic
**Solution :**
- Ouvrir la console (F12)
- Vérifier les erreurs
- Vérifier que la route `/auth/callback` existe (fichier `AuthCallback.jsx`)

## 📝 Checklist Finale

- [ ] Site URL configurée : `http://localhost:5173`
- [ ] Redirect URLs ajoutées (5 URLs)
- [ ] Email confirmations ACTIVÉES
- [ ] Template email personnalisé collé
- [ ] Fichier `.env` contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
- [ ] Route `/auth/callback` existe dans `Routes.jsx`
- [ ] Fichier `AuthCallback.jsx` créé
- [ ] Test avec un nouveau compte réussi

## 🎉 Succès !

Lorsque tout fonctionne :
1. Créez un compte → Email envoyé
2. Cliquez sur le lien → Confirmation en cours
3. Redirection automatique → Dashboard approprié
4. Connexion établie ✅

---

**Dernière mise à jour :** Octobre 2025  
**Fichiers créés :**
- `src/pages/AuthCallback.jsx`
- Route ajoutée dans `src/Routes.jsx`
