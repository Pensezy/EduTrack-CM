# 📧 Système d'Envoi d'Email Automatique

## 📋 Vue d'ensemble

Le système EduTrack envoie automatiquement les identifiants de connexion par email lors de la création d'un compte. La logique d'envoi varie selon que l'utilisateur possède un email personnel ou non.

---

## 🎯 Logique d'envoi automatique

### ✅ Règle générale

```
SI utilisateur a un EMAIL PERSONNEL
  └─> Email envoyé À L'UTILISATEUR directement
  
SINON (email technique généré : enseignant237...@edutrack.cm)
  └─> Email envoyé AU DIRECTEUR
      └─> Le directeur communique les identifiants par téléphone
```

---

## 📱 Cas d'utilisation détaillés

### 1️⃣ **Parent avec email personnel**

**Exemple :**
```
Parent : Marie NGONO
Téléphone : +237 677 234 567
Email : marie.ngono@gmail.com ✅
```

**Résultat :**
- ✅ Email envoyé à : `marie.ngono@gmail.com`
- 📧 Contenu : Identifiants de connexion du parent
- 👤 Destinataire : Marie NGONO (le parent lui-même)

---

### 2️⃣ **Parent sans email personnel**

**Exemple :**
```
Parent : Pierre KAMGA
Téléphone : +237 699 111 222
Email : (vide - email technique généré)
→ Email généré : parent237699111222@edutrack.cm
```

**Résultat :**
- ✅ Email envoyé à : `directeur@ecole.cm` (EMAIL DU DIRECTEUR)
- 📧 Contenu : 
  ```
  Bonjour Directeur,

  Un compte parent a été créé pour Pierre KAMGA.
  
  Comme ce parent n'a pas d'email personnel, veuillez lui 
  communiquer ces identifiants par téléphone : +237 699 111 222
  
  Identifiants de connexion :
  • Email : parent237699111222@edutrack.cm
  • Mot de passe : Pierre2025
  
  Le parent utilisera ces identifiants pour se connecter.
  ```
- 👤 Destinataire : Le directeur (pour transmission au parent)

---

### 3️⃣ **Enseignant avec email personnel**

**Exemple :**
```
Enseignant : Jean NKOLO
Téléphone : +237 655 333 444
Email : jean.nkolo@yahoo.fr ✅
```

**Résultat :**
- ✅ Email envoyé à : `jean.nkolo@yahoo.fr`
- 📧 Contenu : Identifiants de connexion de l'enseignant
- 👤 Destinataire : Jean NKOLO (l'enseignant lui-même)

---

### 4️⃣ **Enseignant sans email personnel**

**Exemple :**
```
Enseignant : Paul TCHOUPI
Téléphone : +237 677 555 666
Email : (vide - email technique généré)
→ Email généré : enseignant237677555666@edutrack.cm
```

**Résultat :**
- ✅ Email envoyé à : `directeur@ecole.cm` (EMAIL DU DIRECTEUR)
- 📧 Contenu :
  ```
  Bonjour Directeur,

  Un compte enseignant a été créé pour Paul TCHOUPI.
  
  Comme cet enseignant n'a pas d'email personnel, veuillez lui 
  communiquer ces identifiants par téléphone : +237 677 555 666
  
  Identifiants de connexion :
  • Email : enseignant237677555666@edutrack.cm
  • Mot de passe : Paul2025
  
  L'enseignant utilisera ces identifiants pour se connecter.
  ```
- 👤 Destinataire : Le directeur (pour transmission à l'enseignant)

---

### 5️⃣ **Élève du secondaire (parent avec email)**

**Exemple :**
```
Élève : Kevin MBALLA (Secondaire)
Parent : Jean MBALLA
Email parent : jean.mballa@gmail.com ✅
```

**Résultat :**
- ✅ Email envoyé à : `jean.mballa@gmail.com`
- 📧 Contenu : Identifiants de connexion de l'élève
- 👤 Destinataire : Jean MBALLA (le parent)

---

### 6️⃣ **Élève du secondaire (parent sans email)**

**Exemple :**
```
Élève : Sandra NGONO (Secondaire)
Parent : Marie NGONO
Téléphone parent : +237 677 234 567
Email parent : parent237677234567@edutrack.cm (technique)
```

**Résultat :**
- ✅ Email envoyé à : `directeur@ecole.cm` (EMAIL DU DIRECTEUR)
- 📧 Contenu :
  ```
  Bonjour Directeur,

  Un compte élève a été créé pour Sandra NGONO (Secondaire).
  
  Le parent Marie NGONO n'a pas d'email personnel.
  Veuillez lui communiquer ces identifiants par téléphone : +237 677 234 567
  
  Identifiants de connexion de l'élève :
  • Matricule : STD2025123
  • Email : std2025123@ecole.edutrack.cm
  • Mot de passe : Sandra2025
  
  Le parent pourra suivre la scolarité de son enfant.
  ```
- 👤 Destinataire : Le directeur (pour transmission au parent)

---

## 🎨 Messages affichés dans l'interface

### ✅ Avec email personnel

```
✅ Compte créé avec succès !

Utilisateur : Marie NGONO
Téléphone : +237 677 234 567
Email connexion : marie.ngono@gmail.com
Rôle : Parent

🔑 Identifiants de connexion :
• Email : marie.ngono@gmail.com
• Mot de passe : Marie2025

📨 EMAIL ENVOYÉ :
✅ Envoyé à l'utilisateur : marie.ngono@gmail.com
   Le parent a reçu ses identifiants de connexion.
```

---

### ⚠️ Sans email personnel (email technique)

```
✅ Compte créé avec succès !

Utilisateur : Pierre KAMGA
Téléphone : +237 699 111 222
Email connexion : parent237699111222@edutrack.cm
Rôle : Parent

🔑 Identifiants de connexion :
• Email : parent237699111222@edutrack.cm
• Mot de passe : Pierre2025

📨 EMAIL ENVOYÉ :
✅ Envoyé au directeur : directeur@ecole.cm
   ⚠️ Le parent n'a pas d'email personnel.
   Un email technique a été généré : parent237699111222@edutrack.cm
   Les identifiants ont été envoyés à votre adresse.
   Veuillez les communiquer par téléphone : +237 699 111 222

💡 Email technique généré automatiquement.
   L'utilisateur se connectera avec : parent237699111222@edutrack.cm
```

---

## 📞 Rôle du directeur

### Quand recevoir les emails ?

Le directeur reçoit les identifiants lorsque :
1. ✅ Un **parent** sans email personnel est créé
2. ✅ Un **enseignant** sans email personnel est créé
3. ✅ Une **secrétaire** sans email personnel est créée
4. ✅ Un **élève du secondaire** dont le parent n'a pas d'email

### Que faire après réception ?

1. **Vérifier votre boîte email**
   - Consultez les emails de notification d'EduTrack
   - Notez les identifiants communiqués

2. **Contacter l'utilisateur par téléphone**
   - Appelez le numéro indiqué dans l'email
   - Communiquez les identifiants de connexion

3. **Guider l'utilisateur**
   ```
   "Bonjour [Nom],
   
   Votre compte EduTrack a été créé.
   
   Pour vous connecter :
   1. Allez sur www.edutrack.cm
   2. Cliquez sur "Connexion"
   3. Email : [email technique]
   4. Mot de passe : [mot de passe]
   
   Gardez ces identifiants en sécurité.
   Vous pourrez changer votre mot de passe après connexion."
   ```

4. **Vérifier la première connexion**
   - Assurez-vous que l'utilisateur arrive à se connecter
   - Aidez-le en cas de difficulté

---

## 🔧 Configuration EmailJS

Pour que le système fonctionne, vous devez configurer EmailJS :

### 1. Créer un compte EmailJS
- Allez sur https://www.emailjs.com/
- Créez un compte gratuit (plan gratuit : 200 emails/mois)

### 2. Configurer un service email
- Ajoutez Gmail, Outlook, ou autre
- Autorisez EmailJS à envoyer des emails

### 3. Créer un template
Le template doit gérer deux cas :

**Variables du template :**
```
{{to_email}}             // Email du destinataire (utilisateur ou directeur)
{{to_name}}              // Nom du destinataire
{{role}}                 // Rôle (Parent, Enseignant, etc.)
{{login_email}}          // Email de connexion du compte
{{login_password}}       // Mot de passe
{{school_name}}          // Nom de l'école
{{principal_name}}       // Nom du directeur
{{has_personal_email}}   // "yes" ou "no"
{{staff_name}}           // Nom du personnel (si envoi au directeur)
{{staff_phone}}          // Téléphone (si envoi au directeur)
{{is_student}}           // "yes" ou "no"
{{student_name}}         // Nom de l'élève
{{matricule}}            // Matricule de l'élève
{{parent_name}}          // Nom du parent
{{parent_phone}}         // Téléphone du parent
```

**Exemple de template HTML :**
```html
{{#if (eq has_personal_email "yes")}}
  <!-- Email direct à l'utilisateur -->
  <h2>Bienvenue sur EduTrack, {{to_name}} !</h2>
  <p>Votre compte a été créé avec succès.</p>
  <p><strong>Identifiants de connexion :</strong></p>
  <ul>
    <li>Email : {{login_email}}</li>
    <li>Mot de passe : {{login_password}}</li>
  </ul>
{{else}}
  <!-- Email au directeur pour transmission -->
  <h2>Nouveau compte créé - Transmission requise</h2>
  <p>Bonjour {{principal_name}},</p>
  <p>Un compte {{role}} a été créé pour <strong>{{staff_name}}</strong>.</p>
  <p>Comme cette personne n'a pas d'email personnel, veuillez lui communiquer 
     ces identifiants par téléphone : <strong>{{staff_phone}}</strong></p>
  <p><strong>Identifiants à communiquer :</strong></p>
  <ul>
    <li>Email : {{login_email}}</li>
    <li>Mot de passe : {{login_password}}</li>
  </ul>
{{/if}}
```

### 4. Configurer dans EduTrack
Créez un fichier `.env` :
```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxx
```

---

## 📊 Avantages du système

### ✅ Pour l'utilisateur avec email
- Reçoit directement ses identifiants
- Peut se connecter immédiatement
- Autonome

### ✅ Pour l'utilisateur sans email
- Reçoit ses identifiants par téléphone du directeur
- Peut toujours se connecter (email technique)
- Pas besoin d'avoir un email personnel

### ✅ Pour le directeur
- Informé de tous les comptes créés
- Peut assurer le suivi
- Garantit que personne n'est oublié
- Contrôle de la transmission des identifiants

### ✅ Pour l'établissement
- Tous les utilisateurs peuvent avoir un compte
- Pas de frais SMS
- Traçabilité des créations de comptes
- Communication sécurisée

---

## ❓ FAQ

### Q : Que faire si je ne reçois pas l'email ?
**R :** Vérifiez :
1. Votre dossier spam/courrier indésirable
2. Que EmailJS est correctement configuré (.env)
3. Votre connexion Internet
4. Les logs dans la console du navigateur (F12)

### Q : Puis-je modifier le template d'email ?
**R :** Oui, connectez-vous sur emailjs.com et modifiez votre template.

### Q : L'utilisateur peut-il changer son mot de passe ?
**R :** Oui, après connexion, l'utilisateur peut changer son mot de passe dans son profil.

### Q : Que faire si l'utilisateur perd ses identifiants ?
**R :** Le directeur peut :
1. Réinitialiser le mot de passe dans "Gestion des comptes"
2. Renvoyer les identifiants par SMS
3. Régénérer un nouveau mot de passe

### Q : Le système fonctionne-t-il sans EmailJS ?
**R :** Non, EmailJS est nécessaire pour l'envoi automatique. Sans EmailJS, les identifiants sont seulement affichés à l'écran (à communiquer manuellement).

---

## 📞 Support

Pour toute question sur ce système, contactez l'équipe technique EduTrack.

**Date de création :** 30 novembre 2025  
**Version :** 1.0  
**Auteur :** EduTrack Team
