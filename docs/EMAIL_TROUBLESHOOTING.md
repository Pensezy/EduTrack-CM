# 🔧 Guide de Dépannage - Envoi d'Emails

## ✅ Compte créé mais email non envoyé - Solutions

### 1. Vérifier la Configuration EmailJS

#### A. Vérifier le fichier `.env`
Assurez-vous que ces 3 lignes sont présentes dans votre fichier `.env` :
```env
VITE_EMAILJS_SERVICE_ID=service_tuqh99q
VITE_EMAILJS_TEMPLATE_ID=template_2cxezde
VITE_EMAILJS_PUBLIC_KEY=kFe4QRr9OaQAf8VXZ
```

✅ **Statut actuel** : Ces clés sont déjà présentes dans votre `.env`

#### B. Vérifier que le serveur a bien chargé les variables
1. Redémarrez votre serveur de développement :
   ```bash
   npm start
   ```

2. Ouvrez la console du navigateur (F12)

3. Vérifiez les variables avec :
   ```javascript
   console.log({
     serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
     templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
     publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
   });
   ```

Si une valeur est `undefined`, le serveur n'a pas chargé le `.env`. Redémarrez !

---

### 2. Vérifier la Configuration sur EmailJS.com

#### A. Connectez-vous à EmailJS
1. Allez sur https://dashboard.emailjs.com/
2. Connectez-vous avec votre compte

#### B. Vérifier le Service Email
1. Allez dans **"Email Services"**
2. Vérifiez que vous avez un service actif
3. Le **Service ID** doit correspondre à `service_tuqh99q`
4. Le service doit être **connecté et actif** (icône verte)

**Si le service n'est pas connecté :**
- Cliquez sur "Reconnect Service"
- Autorisez l'accès à votre compte Gmail/Outlook

#### C. Vérifier le Template
1. Allez dans **"Email Templates"**
2. Vérifiez que le template `template_2cxezde` existe
3. Cliquez sur le template pour l'éditer
4. **IMPORTANT** : Le template doit contenir ces variables :
   - `{{to_email}}` - Email du destinataire
   - `{{to_name}}` - Nom du destinataire
   - `{{role}}` - Rôle (Enseignant, Secrétaire...)
   - `{{login_email}}` - Email de connexion
   - `{{login_password}}` - Mot de passe
   - `{{school_name}}` - Nom de l'école
   - `{{principal_name}}` - Nom du directeur
   - `{{login_url}}` - URL de connexion
   - `{{current_year}}` - Année actuelle

#### Template recommandé :

**Sujet :**
```
Vos identifiants de connexion - {{school_name}}
```

**Corps de l'email :**
```
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

---

### 3. Vérifier le Quota EmailJS

EmailJS offre **200 emails gratuits par mois**.

1. Allez dans **"Usage"** sur le dashboard EmailJS
2. Vérifiez que vous n'avez pas atteint la limite
3. Si limite atteinte :
   - Attendez le mois prochain
   - OU passez à un plan payant
   - OU utilisez un autre compte EmailJS

---

### 4. Tester la Configuration

#### Test dans la Console du Navigateur

1. Ouvrez votre application (http://localhost:4028)
2. Ouvrez la console (F12)
3. Collez ce code :

```javascript
// Test de configuration
const config = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY
};

console.log('Configuration EmailJS:', config);

// Test d'envoi
import('@emailjs/browser').then(emailjs => {
  emailjs.default.init(config.publicKey);
  
  emailjs.default.send(
    config.serviceId,
    config.templateId,
    {
      to_email: 'votre-email@test.com', // REMPLACEZ par votre email
      to_name: 'Test User',
      role: 'Enseignant Test',
      login_email: 'test@test.com',
      login_password: 'Test123!',
      school_name: 'École Test',
      principal_name: 'Directeur Test',
      login_url: 'http://localhost:4028/staff-login',
      current_year: new Date().getFullYear()
    }
  ).then(
    response => console.log('✅ Email envoyé !', response),
    error => console.error('❌ Erreur:', error)
  );
});
```

---

### 5. Problèmes Courants et Solutions

#### ❌ Erreur : "Invalid Service ID"
**Cause** : Le Service ID dans `.env` ne correspond pas à celui sur EmailJS.com

**Solution** :
1. Copiez le Service ID depuis EmailJS.com > Email Services
2. Mettez à jour `VITE_EMAILJS_SERVICE_ID` dans `.env`
3. Redémarrez le serveur

---

#### ❌ Erreur : "Invalid Template ID"
**Cause** : Le Template ID dans `.env` ne correspond pas ou le template n'existe pas

**Solution** :
1. Copiez le Template ID depuis EmailJS.com > Email Templates
2. Mettez à jour `VITE_EMAILJS_TEMPLATE_ID` dans `.env`
3. Redémarrez le serveur

---

#### ❌ Erreur : "Invalid Public Key"
**Cause** : La clé publique est incorrecte

**Solution** :
1. Allez sur EmailJS.com > Account > General
2. Copiez la "Public Key"
3. Mettez à jour `VITE_EMAILJS_PUBLIC_KEY` dans `.env`
4. Redémarrez le serveur

---

#### ❌ Erreur : "Failed to fetch" ou "Network error"
**Cause** : Problème de connexion Internet ou firewall

**Solution** :
1. Vérifiez votre connexion Internet
2. Désactivez temporairement votre VPN
3. Vérifiez que `https://api.emailjs.com` n'est pas bloqué par votre pare-feu
4. Essayez depuis un autre réseau

---

#### ❌ Erreur : "Rate limit exceeded"
**Cause** : Limite de 200 emails/mois dépassée

**Solution** :
1. Attendez le mois prochain
2. Créez un nouveau compte EmailJS gratuit
3. OU passez au plan payant

---

### 6. Logs de Débogage

Les logs suivants devraient apparaître dans la console lors de la création d'un compte :

```
📧 Tentative d'envoi d'email...
  - Destinataire: user@example.com
  - Rôle: Enseignant
  - École: Mon École

✓ Configuration EmailJS détectée
  - Service ID: service_tuqh99q
  - Template ID: template_2cxezde

📤 Envoi de l'email via EmailJS...

📬 Réponse EmailJS: { status: 200, text: "OK" }

✅ Email envoyé avec succès à user@example.com
```

**Si vous ne voyez pas ces logs**, il y a un problème dans le flux d'exécution.

---

### 7. Alternative : Affichage Manuel des Identifiants

Si l'email ne fonctionne pas, le système affiche automatiquement les identifiants dans une alerte.

**Workflow actuel :**
1. ✅ Le compte est créé dans la base de données
2. ⚠️ L'email n'est pas envoyé
3. 📋 Les identifiants sont affichés dans une alerte
4. 👤 Le directeur communique manuellement les identifiants

---

## 🎯 Checklist Rapide

- [ ] Les 3 clés EmailJS sont dans `.env`
- [ ] Le serveur a été redémarré après modification de `.env`
- [ ] Le Service est actif sur emailjs.com
- [ ] Le Template existe et contient toutes les variables
- [ ] Le quota de 200 emails/mois n'est pas dépassé
- [ ] La connexion Internet fonctionne
- [ ] Aucun VPN ou firewall ne bloque emailjs.com

---

## 📞 Support

Si le problème persiste après avoir vérifié tous ces points :

1. **Vérifiez les logs dans la console** (F12)
2. **Testez directement sur emailjs.com** avec leur outil de test
3. **Contactez le support EmailJS** : https://www.emailjs.com/docs/

---

## 🔄 Prochaines Améliorations Prévues

1. ✅ Logs détaillés (FAIT)
2. ✅ Messages d'erreur clairs (FAIT)
3. 🔄 Interface de test EmailJS dans le dashboard
4. 🔄 Retry automatique en cas d'échec réseau
5. 🔄 File d'attente pour envoi différé
6. 🔄 Historique des emails envoyés
