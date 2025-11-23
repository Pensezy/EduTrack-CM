# 📧 Configuration de l'envoi automatique d'emails

Ce guide vous explique comment configurer EmailJS pour l'envoi automatique des identifiants au personnel.

## 🎯 Pourquoi EmailJS ?

- **Gratuit** : 200 emails/mois gratuits
- **Simple** : Pas besoin de serveur backend
- **Sécurisé** : Les emails sont envoyés via leurs serveurs
- **Flexible** : Support de Gmail, Outlook, Yahoo, etc.

## 📝 Étapes de configuration

### 1. Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur "Sign Up" (gratuit)
3. Confirmez votre email

### 2. Ajouter un service email

1. Dans le dashboard EmailJS, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email :
   - **Gmail** (recommandé pour les écoles)
   - Outlook
   - Yahoo
   - Ou autre

4. Pour Gmail :
   - Cliquez sur "Connect Account"
   - Connectez-vous avec votre compte Gmail
   - Autorisez EmailJS

5. Notez le **Service ID** (ex: `service_abc123`)

### 3. Créer le template d'email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Configurez le template :

**Subject (Objet) :**
```
Vos identifiants de connexion - {{school_name}}
```

**Content (Corps de l'email) :**
```html
Bonjour {{to_name}},

Bienvenue sur EduTrack-CM !

{{principal_name}} vous a créé un compte en tant que {{role}} pour {{school_name}}.

🔐 VOS IDENTIFIANTS DE CONNEXION :

Email : {{login_email}}
Mot de passe : {{login_password}}

🌐 LIEN DE CONNEXION :
{{login_url}}

⚠️ IMPORTANT :
• Conservez ces identifiants en lieu sûr
• Changez votre mot de passe après votre première connexion
• Ne partagez jamais vos identifiants

Si vous avez des questions, contactez {{principal_name}}.

Cordialement,
L'équipe EduTrack-CM

---
© {{current_year}} EduTrack-CM - Système de Gestion Scolaire
```

4. **Testez le template** avec l'outil de test d'EmailJS
5. Notez le **Template ID** (ex: `template_xyz789`)

### 4. Obtenir votre clé publique

1. Allez dans **"Account"** > **"General"**
2. Trouvez votre **Public Key** (ex: `aBc123XyZ`)
3. Copiez cette clé

### 5. Configurer les variables d'environnement

1. Ouvrez le fichier `.env` dans votre projet EduTrack-CM
2. Ajoutez ces lignes avec vos vraies valeurs :

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=aBc123XyZ
```

3. Sauvegardez le fichier

### 6. Redémarrer l'application

```bash
npm run dev
```

## ✅ Test de la configuration

1. Connectez-vous en tant que directeur
2. Allez dans **Gestion des Comptes**
3. Créez un nouveau compte personnel (enseignant ou secrétaire)
4. Vérifiez que :
   - Un message confirme l'envoi de l'email
   - L'email arrive dans la boîte du personnel

## 🔧 Dépannage

### L'email n'arrive pas

**Vérifiez :**
- ✅ Les 3 variables d'environnement sont bien configurées dans `.env`
- ✅ Les valeurs sont correctes (pas d'espaces, pas de guillemets)
- ✅ Vous avez redémarré l'application après modification du `.env`
- ✅ Le service email est bien connecté dans EmailJS
- ✅ Vous n'avez pas dépassé la limite de 200 emails/mois

**Vérifiez les spams :**
- Les premiers emails EmailJS peuvent aller dans les spams
- Demandez au personnel de vérifier leur dossier spam

**Console du navigateur :**
- Ouvrez les outils de développement (F12)
- Regardez l'onglet Console pour des erreurs

### Mode fallback (affichage à l'écran)

Si EmailJS n'est pas configuré, le système affichera automatiquement les identifiants à l'écran pour que le directeur les communique manuellement. C'est un comportement normal si :
- Les variables d'environnement ne sont pas configurées
- Une erreur survient lors de l'envoi

## 📊 Limites du plan gratuit

- **200 emails/mois** gratuits
- Largement suffisant pour une école moyenne
- Si vous dépassez, vous pouvez :
  - Passer au plan payant (très abordable)
  - Utiliser un autre compte EmailJS
  - Utiliser le mode manuel (fallback)

## 🔒 Sécurité

- La clé publique EmailJS peut être exposée dans le code
- Elle permet uniquement d'envoyer des emails via votre template
- Personne ne peut lire vos emails ou modifier vos templates
- Les mots de passe sont transmis de manière sécurisée

## 💡 Conseils

1. **Utilisez un email dédié** : Créez un email Gmail spécifique pour l'école
2. **Personnalisez le template** : Ajoutez le logo de votre école
3. **Testez régulièrement** : Vérifiez que ça fonctionne en début d'année
4. **Surveillez la limite** : 200 emails = ~40 créations de comptes/mois

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez la [documentation EmailJS](https://www.emailjs.com/docs/)
2. Vérifiez la console du navigateur pour les erreurs
3. Testez votre configuration dans le dashboard EmailJS

## 🎉 Résultat attendu

Une fois configuré, à chaque création de compte personnel :
1. ✅ Le compte est créé dans la base de données
2. ✅ Un email professionnel est automatiquement envoyé
3. ✅ Le personnel reçoit ses identifiants par email
4. ✅ Le directeur n'a plus à communiquer manuellement les identifiants

**Le directeur gagne un temps précieux !** ⏰
