# 📧 Guide de Configuration - Système d'Envoi d'Emails

## Vue d'ensemble

Ce guide explique comment configurer le système d'envoi automatique d'emails pour les identifiants des nouveaux comptes créés via le dashboard directeur.

---

## 🏗️ Architecture

### Composants créés

1. **Edge Function Supabase** : `supabase/functions/send-credentials-email/index.ts`
   - Service serverless pour l'envoi d'emails
   - Utilise l'API Resend pour la livraison

2. **Modification Frontend** : `AccountsManagement.jsx`
   - Appelle automatiquement l'Edge Function après création de compte
   - Gestion des erreurs avec fallback manuel

3. **Template HTML** : Intégré dans l'Edge Function
   - Email professionnel responsive
   - Inclut identifiants, bouton de connexion, avertissements de sécurité

---

## 📋 Prérequis

### 1. Compte Resend

Vous devez créer un compte sur [Resend.com](https://resend.com) pour envoyer des emails.

**Étapes :**
1. Créer un compte sur https://resend.com
2. Vérifier votre domaine (ou utiliser le domaine de test)
3. Générer une clé API

### 2. Variables d'environnement Supabase

Vous devez configurer la clé API Resend dans Supabase.

---

## 🚀 Configuration

### Étape 1 : Déployer l'Edge Function

```bash
# Se connecter à Supabase CLI
npx supabase login

# Lier votre projet
npx supabase link --project-ref VOTRE_PROJECT_ID

# Déployer la fonction
npx supabase functions deploy send-credentials-email
```

### Étape 2 : Configurer les variables d'environnement

#### Via le Dashboard Supabase :

1. Aller sur https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans **Settings** → **Edge Functions** → **Environment Variables**
4. Ajouter la variable :
   - **Name** : `RESEND_API_KEY`
   - **Value** : Votre clé API Resend (commence par `re_...`)

#### Via la CLI :

```bash
npx supabase secrets set RESEND_API_KEY=re_votre_clé_api_resend
```

### Étape 3 : Configurer le domaine d'envoi

Dans le fichier `supabase/functions/send-credentials-email/index.ts`, ligne 139 :

```typescript
from: 'EduTrack-CM <noreply@edutrack-cm.com>',
```

**Remplacez** `edutrack-cm.com` par :
- Votre propre domaine vérifié dans Resend
- OU `onboarding@resend.dev` pour les tests (limité à 1 email/jour)

### Étape 4 : Vérifier l'URL de connexion

Dans le template HTML (ligne 84), vérifiez que l'URL de connexion est correcte :

```typescript
const loginUrl = `${req.headers.get('origin') || 'https://your-app.com'}/login`
```

L'Edge Function récupère automatiquement l'origine de la requête. Vous pouvez aussi mettre une URL fixe :

```typescript
const loginUrl = 'https://edutrack-cm.com/login'
```

---

## 🧪 Test de l'installation

### Test 1 : Tester l'Edge Function directement

```bash
# Invoke la fonction via CLI
npx supabase functions invoke send-credentials-email \
  --body '{"email":"test@example.com","fullName":"Test User","password":"Test1234","role":"secretary","schoolName":"École Test"}'
```

### Test 2 : Créer un compte via le dashboard

1. Connectez-vous en tant que directeur
2. Allez dans **Gestion des comptes** → **Nouveau compte**
3. Remplissez le formulaire et créez un compte secrétaire
4. Vérifiez la boîte email du destinataire

---

## 📧 Contenu de l'Email

L'email envoyé contient :

✅ **Header** : Bienvenue avec logo EduTrack-CM  
✅ **Message personnalisé** : Nom de l'utilisateur + nom de l'école  
✅ **Identifiants** : Email + mot de passe dans une boîte formatée  
✅ **Bouton CTA** : "Se connecter maintenant" avec lien direct  
✅ **Avertissement sécurité** : Recommandation de changer le mot de passe  
✅ **Footer** : Mentions légales et copyright  

---

## 🔒 Sécurité

### Recommandations

1. **Clé API Resend** : Ne jamais exposer dans le code frontend
2. **CORS** : L'Edge Function accepte uniquement les requêtes authentifiées
3. **Validation** : Tous les champs sont validés avant envoi
4. **Fallback** : Si l'email échoue, le directeur reçoit une alerte avec les identifiants

### Gestion des erreurs

Le système a 3 niveaux de protection :

1. **Création compte réussie** → Email envoyé → ✅ Message succès
2. **Création compte réussie** → Email échoue → ⚠️ Affichage manuel des identifiants
3. **Création compte échoue** → ❌ Message d'erreur explicite

---

## 🎯 Flux complet

```
1. Directeur crée compte secrétaire
   ↓
2. supabase.auth.signUp() → Compte créé
   ↓
3. Update table users (created_by_user_id)
   ↓
4. Appel Edge Function send-credentials-email
   ↓
5. Edge Function → API Resend → Email envoyé
   ↓
6. Secrétaire reçoit email avec identifiants
   ↓
7. Secrétaire clique sur bouton "Se connecter"
   ↓
8. Connexion automatique avec identifiants
```

---

## ⚙️ Personnalisation

### Modifier le template email

Le template se trouve dans `index.ts` à partir de la ligne 65 :

```typescript
const htmlContent = `
<!DOCTYPE html>
...
</html>
`
```

Vous pouvez personnaliser :
- Les couleurs (gradient, bordures)
- Le texte des messages
- Le logo (ajouter une image)
- Les icônes emoji
- Le style CSS inline

### Modifier l'expéditeur

Ligne 139 dans `index.ts` :

```typescript
from: 'Votre École <noreply@votre-domaine.com>',
```

### Modifier le sujet

Ligne 140 dans `index.ts` :

```typescript
subject: `🎓 Vos identifiants - ${schoolName}`,
```

---

## 🐛 Dépannage

### Problème : Email non reçu

**Solutions :**
1. Vérifier les **spams**
2. Vérifier que la clé API Resend est correcte
3. Vérifier que le domaine est vérifié dans Resend
4. Vérifier les logs de la fonction : Dashboard Supabase → Edge Functions → Logs

### Problème : Erreur "RESEND_API_KEY not found"

**Solution :** Configurer la variable d'environnement (voir Étape 2)

### Problème : Erreur CORS

**Solution :** L'Edge Function est appelée côté serveur par Supabase, pas de problème CORS normalement. Si problème, vérifier que l'appel est fait via `supabase.functions.invoke()`.

### Problème : Email en spam

**Solutions :**
1. Vérifier que votre domaine a des enregistrements SPF/DKIM/DMARC
2. Utiliser un domaine personnalisé vérifié dans Resend
3. Éviter les mots-clés spam dans le sujet/contenu

---

## 📊 Monitoring

### Voir les logs de la fonction

```bash
npx supabase functions logs send-credentials-email
```

OU via le dashboard :
1. Aller sur https://app.supabase.com
2. Sélectionner votre projet
3. Aller dans **Edge Functions** → **send-credentials-email** → **Logs**

### Statistiques Resend

Connectez-vous sur https://resend.com/emails pour voir :
- Nombre d'emails envoyés
- Taux de livraison
- Emails en erreur
- Historique complet

---

## 💡 Améliorations futures possibles

1. **Emails transactionnels** : Notifications de changement de mot de passe
2. **Templates multiples** : Différents templates selon le rôle
3. **Emails multilingues** : Support français + anglais
4. **Pièces jointes** : Guide d'utilisation PDF
5. **Tracking** : Savoir si l'email a été ouvert
6. **Retry logic** : Réessayer automatiquement en cas d'échec

---

## 📞 Support

En cas de problème :
1. Vérifier ce guide en premier
2. Consulter les logs Edge Function
3. Consulter la documentation Resend : https://resend.com/docs
4. Consulter la documentation Supabase Edge Functions : https://supabase.com/docs/guides/functions

---

## ✅ Checklist de déploiement

Avant la mise en production :

- [ ] Compte Resend créé
- [ ] Domaine vérifié dans Resend (ou utiliser onboarding@resend.dev pour test)
- [ ] Clé API Resend générée
- [ ] Variable RESEND_API_KEY configurée dans Supabase
- [ ] Edge Function déployée (`npx supabase functions deploy`)
- [ ] Email "from" mis à jour avec votre domaine
- [ ] URL de connexion mise à jour
- [ ] Test envoi email effectué
- [ ] Vérification boîte de réception (pas en spam)

---

**Date de création** : 29 octobre 2025  
**Version** : 1.0  
**Auteur** : EduTrack-CM Team
