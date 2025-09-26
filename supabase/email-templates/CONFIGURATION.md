# 📧 Configuration des Emails EduTrack-CM dans Supabase

## 🎯 Étapes pour personnaliser les emails de confirmation

### 1. **Accéder à la configuration Supabase**
1. Aller sur https://app.supabase.com
2. Sélectionner votre projet EduTrack-CM
3. Dans le menu de gauche : **Settings** → **Authentication**
4. Cliquer sur l'onglet **Email Templates**

### 2. **Configurer "Confirm signup"**
- **Subject (Sujet) :** `🎓 EduTrack-CM : Confirmez votre compte de directeur d'établissement`
- **Body (Corps) :** Utiliser le contenu du fichier `confirm-signup.html`

### 3. **Personnaliser l'expéditeur**
- **From Name :** `EduTrack-CM`
- **From Email :** `noreply@votre-domaine.com` ou utiliser le domaine Supabase par défaut

### 4. **Variables Supabase disponibles**
```
{{ .Email }}          - Email de l'utilisateur
{{ .Name }}           - Nom complet de l'utilisateur  
{{ .ConfirmationURL }} - Lien de confirmation unique
{{ .SiteURL }}        - URL de votre site
{{ .Token }}          - Token de confirmation
{{ .CreatedAt }}      - Date de création du compte
```

## 🎨 Aperçu du rendu final

L'email personnalisé comprendra :

✅ **Header avec branding EduTrack-CM**
- Logo et couleurs de la marque
- Titre clair et professionnel

✅ **Message de bienvenue personnalisé**
- Salutation avec le nom du directeur
- Explication claire du processus

✅ **Bouton d'action proéminent**  
- Design attrayant et sécurisé
- Texte d'action clair

✅ **Informations récapitulatives**
- Email, rôle, plateforme
- Date d'inscription

✅ **Fonctionnalités à venir**
- Liste des capacités de la plateforme
- Motivation pour l'utilisateur

✅ **Notes de sécurité**
- Validité du lien (24h)
- Instructions si email non sollicité

✅ **Footer professionnel**
- Informations de contact
- Liens utiles

## 📱 Responsive Design

Le template est optimisé pour :
- 📧 Clients email desktop (Outlook, Thunderbird, etc.)
- 📱 Applications mobiles (Gmail, Apple Mail, etc.)
- 🌐 Webmail (Gmail web, Yahoo, etc.)

## 🔧 Instructions de déploiement

1. Copier le contenu de `confirm-signup.html`
2. Le coller dans Supabase Dashboard → Email Templates → Confirm signup
3. Personnaliser le sujet si nécessaire
4. Sauvegarder les modifications
5. Tester avec un compte de test

## ⚠️ Points importants

- **Délivrabilité :** Configurer SPF/DKIM pour éviter les spams
- **Test :** Toujours tester l'email avant la production
- **Domaine :** Utiliser un domaine personnalisé améliore la confiance
- **Contenu :** Rester concis et actionnable

## 🎯 Résultat attendu

L'utilisateur recevra un email professionnel, clairement identifié comme provenant d'EduTrack-CM, avec toutes les informations nécessaires pour confirmer son compte en toute confiance.