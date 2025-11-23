# 🚀 Guide de démarrage rapide - Envoi automatique d'emails

## Option 1 : Avec EmailJS (Recommandé - emails automatiques)

### Configuration rapide (10 minutes)

1. **Créer un compte EmailJS** → [emailjs.com](https://www.emailjs.com/)

2. **Connecter Gmail** :
   - Dashboard → Email Services → Add New Service
   - Choisir Gmail → Connect Account
   - Copier le **Service ID** (ex: `service_abc123`)

3. **Créer le template** :
   - Dashboard → Email Templates → Create New Template
   - **Objet** : `Vos identifiants de connexion - {{school_name}}`
   - **Contenu** : Copiez-collez le fichier `docs/email-template.html`
   - Copier le **Template ID** (ex: `template_xyz789`)

4. **Récupérer la clé publique** :
   - Account → General → Public Key
   - Copier la **Public Key** (ex: `aBc123XyZ`)

5. **Configurer le .env** :
   ```env
   VITE_EMAILJS_SERVICE_ID=service_abc123
   VITE_EMAILJS_TEMPLATE_ID=template_xyz789
   VITE_EMAILJS_PUBLIC_KEY=aBc123XyZ
   ```

6. **Redémarrer l'app** :
   ```bash
   npm run dev
   ```

### Test

1. Connectez-vous comme directeur
2. Gestion des Comptes → Créer un compte secrétaire
3. ✅ Un email sera envoyé automatiquement !

---

## Option 2 : Sans EmailJS (mode manuel - pas d'email)

Si vous ne configurez pas EmailJS, le système fonctionnera toujours :
- ✅ Le compte sera créé normalement
- 📋 Les identifiants seront affichés à l'écran
- 👤 Le directeur devra les communiquer manuellement

**Aucune configuration nécessaire !**

---

## 📊 Comparaison

| Fonctionnalité | Avec EmailJS | Sans EmailJS |
|----------------|--------------|--------------|
| Création de compte | ✅ | ✅ |
| Email automatique | ✅ | ❌ |
| Communication manuelle | ❌ | ✅ |
| Configuration | 10 min | 0 min |
| Coût | Gratuit (200/mois) | Gratuit |
| Gain de temps | ⭐⭐⭐⭐⭐ | - |

---

## 🎯 Recommandation

**Pour une école active** : Configurez EmailJS (10 minutes d'investissement)
- Gain de temps énorme pour le directeur
- Professionnel et automatique
- Gratuit jusqu'à 200 emails/mois

**Pour un test rapide** : Utilisez le mode manuel
- Aucune configuration
- Fonctionne immédiatement

---

## 📞 Besoin d'aide ?

Consultez `docs/CONFIGURATION_EMAILJS.md` pour un guide détaillé.
