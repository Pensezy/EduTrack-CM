# 🧪 Test : Création Immédiate de l'École

**Changement** : L'école est maintenant créée **pendant** l'inscription, pas après la confirmation email.

---

## 🎯 Objectif du Test

Vérifier que :
1. ✅ L'école est créée **immédiatement** dans Supabase
2. ✅ Le user peut voir l'école **avant** de confirmer son email
3. ✅ Les logs console affichent chaque étape
4. ✅ Pas d'erreur "Invalid Refresh Token"

---

## 📝 Étapes du Test

### 1️⃣ Push sur GitHub et Attendre le Déploiement

```bash
git push
```

Attendre 2-3 minutes que Vercel redéploie l'app.

### 2️⃣ Ouvrir la Page d'Inscription

1. **URL** : https://edutrack-cm-hub.vercel.app/signup
2. **Appuyer sur F12** → Onglet **Console**
3. **Garder la console ouverte** pendant tout le test

### 3️⃣ Remplir le Formulaire

**Étape 1 - Établissement** :
- Nom : `Test Création Immédiate`
- Type : `Collège`
- Pays : `Cameroun`
- Ville : `Yaoundé`
- Adresse : `123 Test`
- Cliquer "Continuer"

**Étape 2 - Directeur** :
- Nom : `Test Directeur`
- Email : **UTILISER UN NOUVEL EMAIL** (jamais utilisé)
- Téléphone : `690111222`
- Mot de passe : `Test1234!`
- Confirmer : `Test1234!`
- Cliquer "Continuer"

**Étape 3 - Classes** :
- Sélectionner : `6ème`, `5ème`
- Cliquer "Créer Mon Compte"

### 4️⃣ Vérifier les Logs Console

**Vous devriez voir** :
```
📝 Début de l'inscription...
✅ User créé: 12345678-1234-1234-1234-123456789abc
🏫 Création de l'école dans la base...
✅ École créée: 87654321-4321-4321-4321-cba987654321
✅ Metadata mis à jour
✅ Inscription complète - Redirection vers vérification email
```

**Si erreur** :
```
❌ Erreur signUp: {message détaillé}
OU
❌ Erreur création école: {message détaillé}
```

### 5️⃣ Vérifier dans Supabase (SANS attendre l'email)

**IMPORTANT** : Faire cette vérification **immédiatement**, avant de cliquer sur le lien email.

1. **Ouvrir** : https://supabase.com/dashboard
2. **Projet** → **Table Editor** → **auth.users**
3. **Chercher** l'email que vous avez utilisé

**Résultat attendu** :
```
✅ User existe
✅ email: test@example.com
✅ email_confirmed_at: NULL (normal, pas encore confirmé)
```

4. **Table Editor** → **schools**
5. **Chercher** le nom de l'école : `Test Création Immédiate`

**Résultat attendu** :
```
✅ École existe
✅ name: Test Création Immédiate
✅ code: TES-2026-XXX
✅ type: college
✅ principal_id: {UUID du user}
✅ available_classes: ["6ème", "5ème"]
```

### 6️⃣ Vérifier la Page Email Verification

Après inscription, vous devriez être sur :
```
https://edutrack-cm-hub.vercel.app/email-verification
```

**Contenu affiché** :
- ✅ Votre email est affiché
- ✅ Instructions pour confirmer
- ✅ Pas d'erreur affichée

### 7️⃣ (Optionnel) Confirmer l'Email

1. **Vérifier votre boîte email** (+ spams)
2. **Cliquer sur le lien** de confirmation
3. **Vérifier la console** :
   ```
   🔐 Vérification du token...
   ✅ Email confirmé pour: test@example.com
   ```
4. **Redirection** vers `/onboarding`
5. **Vérifier Supabase** : `email_confirmed_at` maintenant rempli

---

## ✅ Critères de Succès

| Critère | Status |
|---------|--------|
| Console affiche tous les logs | ☐ |
| Aucune erreur dans console | ☐ |
| User créé dans auth.users | ☐ |
| École créée dans schools | ☐ |
| `email_confirmed_at` = NULL (avant email) | ☐ |
| Redirection vers `/email-verification` | ☐ |
| Pas d'erreur "Invalid Refresh Token" | ☐ |
| (Après email) `email_confirmed_at` rempli | ☐ |

---

## 🐛 Erreurs Possibles et Solutions

### Erreur 1 : "Missing Supabase environment variables"

**Console** :
```
❌ Missing Supabase environment variables
```

**Cause** : Variables pas configurées sur Vercel

**Solution** :
1. Vercel Dashboard → Projet → Settings → Environment Variables
2. Vérifier `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Redéployer

### Erreur 2 : "insert into schools violates row-level security policy"

**Console** :
```
❌ Erreur création école: new row violates row-level security policy
```

**Cause** : RLS (Row Level Security) bloque l'insertion

**Solution** :
1. Supabase Dashboard → Table Editor → schools
2. Vérifier les politiques RLS
3. Ajouter une politique pour permettre INSERT aux users authentifiés :
   ```sql
   CREATE POLICY "Allow insert for authenticated users"
   ON schools FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = principal_id);
   ```

### Erreur 3 : User créé mais pas l'école

**Console** :
```
✅ User créé: ...
❌ Erreur création école: {erreur}
```

**Cause** : Problème de permissions ou schema

**Diagnostic** :
1. Copier le message d'erreur exact
2. Vérifier que la table `schools` existe
3. Vérifier que toutes les colonnes existent :
   - `name`, `code`, `type`, `phone`, `address`, `city`, `country`
   - `principal_id`, `available_classes`

### Erreur 4 : Aucun log dans la console

**Symptômes** :
- Formulaire soumis
- Redirection vers `/email-verification`
- Mais aucun log dans console

**Cause** : Console vidée ou logs désactivés

**Solution** :
- Rafraîchir la page
- Refaire le test avec console ouverte DÈS LE DÉBUT

---

## 📊 Comparaison Ancien vs Nouveau

### Ancien Système (Problématique)

```
1. signUp() → User créé
2. Données école stockées dans user_metadata uniquement
3. navigate(/email-verification)
4. [User clique email]
5. AuthConfirm → Création école ← PROBLÈME ICI
```

**Problème** : Si l'email de confirmation ne fonctionne pas, l'école n'est jamais créée.

### Nouveau Système (Amélioré)

```
1. signUp() → User créé
2. insert(schools) → École créée IMMÉDIATEMENT ✅
3. updateUser() → Metadata mis à jour
4. navigate(/email-verification)
5. [User clique email]
6. AuthConfirm → Juste confirmation email
```

**Avantage** : L'école existe dès l'inscription, même si l'email n'est pas confirmé.

---

## 📸 Screenshot à Fournir (si erreur)

1. **Console complète** avec tous les logs
2. **Table auth.users** dans Supabase
3. **Table schools** dans Supabase
4. **Message d'erreur exact**

---

**Dernière mise à jour** : 2026-01-01
**Status** : ✅ Prêt pour test
