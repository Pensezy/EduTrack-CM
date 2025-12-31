# 📧 Exemples d'emails envoyés automatiquement

## Email 1 : Création de compte secrétaire

**De :** notifications@emailjs.com (via votre Gmail configuré)  
**À :** marie.kamga@email.com  
**Objet :** Vos identifiants de connexion - École Primaire Les Bambins

---

### Aperçu de l'email :

```
┌─────────────────────────────────────────────────┐
│          🎓 EduTrack-CM                        │
│     Système de Gestion Scolaire                │
│  [Fond violet/gradient professionnel]          │
└─────────────────────────────────────────────────┘

Bonjour Marie Kamga,

Bienvenue sur EduTrack-CM !

M. Jean Directeur vous a créé un compte en tant que 
Secrétaire pour École Primaire Les Bambins.

┌─────────────────────────────────────────────────┐
│ 🔐 VOS IDENTIFIANTS DE CONNEXION               │
│                                                 │
│ 📧 Email : marie.kamga@email.com               │
│ 🔑 Mot de passe : SecurePass123!               │
└─────────────────────────────────────────────────┘

        [🌐 Se connecter maintenant]
         (Bouton violet stylé)

┌─────────────────────────────────────────────────┐
│ ⚠️ IMPORTANT - Sécurité                        │
│                                                 │
│ • Conservez ces identifiants en lieu sûr       │
│ • Changez votre mot de passe après connexion   │
│ • Ne partagez jamais vos identifiants          │
│ • En cas de problème, contactez M. Jean Direct │
└─────────────────────────────────────────────────┘

Si vous avez des questions ou rencontrez des 
difficultés, n'hésitez pas à contacter votre directeur.

Cordialement,
L'équipe EduTrack-CM

─────────────────────────────────────────────────
© 2025 EduTrack-CM - Système de Gestion Scolaire

Cet email a été envoyé automatiquement. 
Veuillez ne pas y répondre.
```

---

## Email 2 : Création de compte enseignant

**De :** notifications@emailjs.com (via votre Gmail)  
**À :** paul.nguembou@email.com  
**Objet :** Vos identifiants de connexion - Collège d'Excellence

---

### Aperçu de l'email :

```
┌─────────────────────────────────────────────────┐
│          🎓 EduTrack-CM                        │
│     Système de Gestion Scolaire                │
└─────────────────────────────────────────────────┘

Bonjour Paul Nguembou,

Bienvenue sur EduTrack-CM !

Mme Claire Responsable vous a créé un compte en tant 
que Enseignant pour Collège d'Excellence.

┌─────────────────────────────────────────────────┐
│ 🔐 VOS IDENTIFIANTS DE CONNEXION               │
│                                                 │
│ 📧 Email : paul.nguembou@email.com             │
│ 🔑 Mot de passe : Teacher2025!                 │
└─────────────────────────────────────────────────┘

        [🌐 Se connecter maintenant]

[... reste identique ...]
```

---

## Ce que le personnel voit

### 1. Email dans la boîte de réception

```
📬 Boîte de réception

De: École Primaire Les Bambins <votremail@gmail.com>
Objet: 🔐 Vos identifiants de connexion - École Primaire...
Aperçu: Bonjour Marie Kamga, Bienvenue sur EduTrack-CM...

[Email avec design professionnel violet/gradient]
```

### 2. Email sur mobile

```
┌─────────────────────────┐
│  🎓 EduTrack-CM        │
│                         │
│  Bonjour Marie Kamga,   │
│                         │
│  Bienvenue !            │
│                         │
│  🔐 IDENTIFIANTS        │
│  📧 marie.kamga@...    │
│  🔑 SecurePass123!      │
│                         │
│  [Se connecter]         │
│                         │
│  ⚠️ Important...        │
└─────────────────────────┘
[Design responsive optimisé mobile]
```

---

## Ce que le directeur voit

### Avec EmailJS configuré :

```
┌────────────────────────────────────────────┐
│  ✅ Compte créé avec succès !              │
│                                            │
│  Utilisateur : Marie Kamga                 │
│  Email : marie.kamga@email.com             │
│  Rôle : Secrétaire                         │
│                                            │
│  📧 Un email a été envoyé à                │
│  marie.kamga@email.com avec les            │
│  identifiants de connexion.                │
│                                            │
│  L'utilisateur recevra :                   │
│  • Son email de connexion                  │
│  • Son mot de passe temporaire             │
│  • Le lien pour se connecter               │
│                                            │
│              [ OK ]                        │
└────────────────────────────────────────────┘
```

### Sans EmailJS (fallback) :

```
┌────────────────────────────────────────────┐
│  ✅ Compte créé avec succès !              │
│                                            │
│  Utilisateur : Marie Kamga                 │
│  Email : marie.kamga@email.com             │
│  Rôle : Secrétaire                         │
│                                            │
│  ⚠️ L'email n'a pas pu être envoyé         │
│  automatiquement.                          │
│                                            │
│  📋 IDENTIFIANTS À COMMUNIQUER :           │
│                                            │
│  Email : marie.kamga@email.com             │
│  Mot de passe : SecurePass123!             │
│                                            │
│  ⚠️ IMPORTANT :                            │
│  • Notez ces identifiants en lieu sûr     │
│  • Communiquez-les directement à Marie    │
│  • L'utilisateur pourra se connecter      │
│  • Ces identifiants ne seront plus        │
│    affichés après fermeture               │
│                                            │
│  ⚙️ Pour activer l'envoi automatique,     │
│  configurez EmailJS dans vos variables    │
│  d'environnement.                          │
│                                            │
│              [ OK ]                        │
└────────────────────────────────────────────┘
```

---

## Statistiques EmailJS

### Dans le dashboard EmailJS, vous verrez :

```
📊 Statistiques du mois

Emails envoyés : 15 / 200
Status : 
  ✅ Livrés : 14 (93%)
  ❌ Échoués : 1 (7%)

Derniers emails :
  [15:30] marie.kamga@email.com - ✅ Livré
  [14:20] paul.nguembou@email.com - ✅ Livré
  [10:15] jean.eleve@email.com - ❌ Échec
```

---

## Personnalisation possible

### Vous pouvez modifier :

1. **Les couleurs du template**
   - Gradient violet → Bleu/vert de votre école
   - Modifier dans `docs/email-template.html`

2. **Le texte**
   - Ajouter le logo de l'école
   - Modifier les instructions
   - Ajouter des liens utiles

3. **Les informations incluses**
   - Ajouter numéro de téléphone du secrétariat
   - Ajouter horaires d'ouverture
   - Ajouter lien vers tutoriel vidéo

---

## Exemple de personnalisation

### Email avec logo école :

```html
┌─────────────────────────────────────────────────┐
│   [LOGO ÉCOLE]                                  │
│   École Primaire Les Bambins                    │
│   🎓 EduTrack-CM                               │
└─────────────────────────────────────────────────┘

Bonjour Marie Kamga,

Bienvenue dans notre équipe !

[... reste de l'email ...]

📞 Besoin d'aide ?
   Appelez le secrétariat : +237 XXX XXX XXX
   Lundi - Vendredi : 8h - 17h

🎥 Tutoriel vidéo :
   [Voir comment se connecter]
```

---

## Bonnes pratiques

### ✅ À faire :
- Utiliser un compte Gmail dédié à l'école
- Tester l'envoi avec votre propre email d'abord
- Vérifier les spams lors des premiers envois
- Garder le template professionnel et clair

### ❌ À éviter :
- Utiliser votre email personnel
- Modifier les variables `{{xxx}}` dans le template
- Envoyer trop d'emails en une fois (limite : 200/mois)
- Supprimer les informations de sécurité

---

## FAQ Personnel

**Q : Je n'ai pas reçu l'email ?**
- Vérifiez vos spams
- Vérifiez l'adresse email correcte
- Contactez le directeur

**Q : Le lien ne fonctionne pas ?**
- Copiez-collez l'URL dans votre navigateur
- Ou allez sur [votre-site.com]/staff-login

**Q : J'ai oublié mon mot de passe ?**
- Contactez le directeur pour réinitialisation
- Il recevra vos nouveaux identifiants

---

**✨ Résultat : Communication professionnelle et automatisée !**
