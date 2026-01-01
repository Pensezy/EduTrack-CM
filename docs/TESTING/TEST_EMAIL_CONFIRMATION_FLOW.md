# 🧪 Test du Flux d'Inscription et Confirmation Email

**Objectif** : Vérifier que le flux complet signup → email → confirmation → onboarding fonctionne correctement

**Date** : 2026-01-01

---

## 📋 Prérequis

- ✅ Supabase configuré (voir `docs/CONFIGURE_SUPABASE_EMAIL.md`)
- ✅ Variables d'environnement `.env` configurées
- ✅ Email de confirmation activé dans Supabase Dashboard
- ✅ Site URL configuré : `http://localhost:5173` (dev) ou `https://edutrack.cm` (prod)
- ✅ Redirect URLs ajoutées dans Supabase

---

## 🚀 Étapes de Test

### 1️⃣ Lancer l'Application Hub

```bash
cd apps/hub
pnpm dev
```

L'app devrait démarrer sur `http://localhost:5173` (ou port suivant si occupé)

---

### 2️⃣ Créer un Nouveau Compte

1. **Ouvrir** : `http://localhost:5173/signup`

2. **Étape 1 - Établissement** :
   - Nom : `Collège de Test`
   - Type : `Collège`
   - Pays : `Cameroun`
   - Ville : `Yaoundé`
   - Adresse : `123 Rue de Test`
   - Cliquer "Continuer"

3. **Étape 2 - Directeur** :
   - Nom complet : `Jean Dupont`
   - Email : **UTILISER UN VRAI EMAIL AUQUEL VOUS AVEZ ACCÈS**
   - Téléphone : `690123456`
   - Mot de passe : `Test1234!`
   - Confirmer mot de passe : `Test1234!`
   - Cliquer "Continuer"

4. **Étape 3 - Classes** :
   - Sélectionner au moins une classe (ex: `6ème`, `5ème`)
   - Cliquer "Créer Mon Compte"

5. **Vérifier la redirection** :
   - ✅ Vous devriez être redirigé vers `/email-verification`
   - ✅ La page affiche l'email que vous avez saisi

---

### 3️⃣ Vérifier l'Email Reçu

1. **Ouvrir votre boîte email** (vérifier aussi les spams)

2. **Vérifier l'expéditeur** :
   ```
   EduTrack <noreply@mail.app.supabase.co>
   ```

3. **Vérifier le lien de confirmation** :
   - **Format attendu (dev)** : `http://localhost:5173/auth/confirm?token_hash=...&type=signup`
   - **Format attendu (prod)** : `https://edutrack.cm/auth/confirm?token_hash=...&type=signup`

4. **❌ VÉRIFIER QUE LE LIEN NE CONTIENT PAS** :
   - ❌ `localhost:3000` (ancien port)
   - ❌ `localhost:5000` (mauvais port)
   - ❌ URL incorrecte

---

### 4️⃣ Cliquer sur le Lien de Confirmation

1. **Cliquer sur le bouton** "Confirmer mon email" dans l'email

2. **Vérifier la page de confirmation** :
   - ✅ URL : `http://localhost:5173/auth/confirm?token_hash=...&type=signup`
   - ✅ Logo EduTrack affiché
   - ✅ Message "Confirmation en cours..." (spinner)
   - ✅ Après ~2 secondes : "Email confirmé !" (checkmark vert)
   - ✅ Message "Redirection vers votre espace d'accueil..."

3. **Vérifier la redirection automatique** :
   - ✅ Après 3 secondes → redirigé vers `/onboarding`

---

### 5️⃣ Vérifier la Page d'Onboarding

1. **URL** : `http://localhost:5173/onboarding`

2. **Vérifier le contenu** :
   - ✅ Message de bienvenue personnalisé
   - ✅ Boutons d'action affichés

---

### 6️⃣ Vérifier la Base de Données

Ouvrir Supabase Dashboard → Table Editor

#### Table `auth.users`
- ✅ Un nouveau user créé
- ✅ `email_confirmed_at` : NON NULL (date/heure)
- ✅ `user_metadata` contient :
  ```json
  {
    "role": "principal",
    "full_name": "Jean Dupont",
    "phone": "690123456",
    "school_id": "uuid-de-l-ecole",
    "school": { ... }
  }
  ```

#### Table `schools`
- ✅ Une nouvelle école créée
- ✅ `name` : "Collège de Test"
- ✅ `code` : "COL-2026-XXX" (format auto-généré)
- ✅ `principal_id` : UUID de l'utilisateur
- ✅ `type` : "college"
- ✅ `available_classes` : ["6ème", "5ème"]

---

## ✅ Critères de Succès

| Critère | Statut |
|---------|--------|
| Page signup accessible | ☐ |
| Formulaire 3 étapes fonctionne | ☐ |
| Redirection vers /email-verification | ☐ |
| Email reçu (vérifier spam) | ☐ |
| Lien email contient bonne URL (localhost:5173) | ☐ |
| Clic lien → page /auth/confirm | ☐ |
| Confirmation réussie (checkmark vert) | ☐ |
| Redirection automatique vers /onboarding | ☐ |
| User créé dans auth.users | ☐ |
| École créée dans schools | ☐ |
| email_confirmed_at est renseigné | ☐ |

---

## 🐛 Problèmes Courants

### Problème 1 : Email non reçu

**Solutions** :
- Vérifier le dossier spam/courrier indésirable
- Vérifier que la confirmation email est activée dans Supabase
- Vérifier les logs Supabase Dashboard → Logs → Auth

### Problème 2 : Lien pointe vers mauvaise URL

**Solutions** :
- ✅ Vérifier que `emailRedirectTo` est présent dans `SignupPage.jsx:253`
- Vérifier Site URL dans Supabase Dashboard → Settings → Authentication
- Vérifier Redirect URLs (doit inclure `http://localhost:5173/**`)

### Problème 3 : Erreur "Invalid token"

**Solutions** :
- Le lien a peut-être expiré (24h)
- Vérifier que les params `token_hash` et `type=signup` sont présents
- Créer un nouveau compte

### Problème 4 : École non créée dans BDD

**Solutions** :
- Ouvrir la console développeur (F12) sur la page `/auth/confirm`
- Vérifier les erreurs dans la console
- Vérifier que `user.user_metadata.school` existe
- Vérifier les permissions RLS sur la table `schools`

---

## 📊 Logs à Vérifier

### Console Navigateur (F12)
```
✅ Confirmation en cours...
✅ User: { id: "...", email: "...", user_metadata: { ... } }
✅ École créée: { id: "...", name: "Collège de Test", ... }
✅ Metadata mis à jour
```

### Supabase Dashboard → Logs
- Auth logs : `supabase.auth.signUp()` → SUCCESS
- Auth logs : `supabase.auth.verifyOtp()` → SUCCESS
- Database logs : `INSERT INTO schools` → SUCCESS

---

## 🔄 Nettoyage Après Test

Si vous voulez refaire le test avec le même email :

```sql
-- Dans Supabase SQL Editor
DELETE FROM schools WHERE name = 'Collège de Test';
DELETE FROM auth.users WHERE email = 'votre-email@test.com';
```

Ou utiliser le script de reset :
```bash
# Vider toute la BDD (⚠️ ATTENTION)
supabase db reset
```

---

## 📝 Notes

- **Temps total du test** : ~5 minutes
- **Pré-production** : Tester avec des emails réels
- **Production** : URL sera automatiquement `https://edutrack.cm`

---

**Dernière mise à jour** : 2026-01-01
**Status** : ✅ Test validé et documenté
