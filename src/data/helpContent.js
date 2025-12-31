/**
 * Structure et contenu du système d'aide EduTrack
 * Organisé par catégories selon les rôles utilisateurs
 */

// ==========================================
// CONTENU UTILISATEURS (GUIDES PRATIQUES)
// ==========================================

export const userHelpCategories = [
  {
    id: 'parent-guide',
    title: '👪 Guide Parent',
    icon: 'Users',
    description: 'Tout ce dont vous avez besoin en tant que parent',
    roles: ['parent'],
    articles: [
      {
        id: 'parent-first-login',
        title: 'Première connexion au compte parent',
        category: 'Guide Parent',
        tags: ['connexion', 'démarrage', 'mot de passe'],
        description: 'Comment vous connecter la première fois et configurer votre compte',
        content: `# Première connexion au compte parent

## 📧 Réception de vos identifiants

Vous avez reçu un email contenant :
- Votre **adresse email** (identifiant)
- Votre **mot de passe temporaire**

## 🔐 Se connecter

1. Allez sur la page de connexion EduTrack
2. Entrez votre **email**
3. Entrez votre **mot de passe temporaire**
4. Cliquez sur **"Se connecter"**

## ✏️ Changer votre mot de passe

**Important :** Pour votre sécurité, changez immédiatement votre mot de passe temporaire.

1. Une fois connecté, cliquez sur votre **nom** en haut à droite
2. Sélectionnez **"Paramètres du compte"**
3. Dans la section **"Sécurité"**, cliquez sur **"Changer le mot de passe"**
4. Entrez votre mot de passe actuel
5. Entrez votre nouveau mot de passe (minimum 8 caractères)
6. Confirmez le nouveau mot de passe
7. Cliquez sur **"Enregistrer"**

## ❓ Mot de passe oublié ?

Si vous oubliez votre mot de passe :
1. Cliquez sur **"Mot de passe oublié ?"** sur la page de connexion
2. Entrez votre email
3. Vous recevrez un lien de réinitialisation par email
4. Cliquez sur le lien et créez un nouveau mot de passe

## 📱 Pas d'email ?

Si vous n'avez pas d'adresse email, contactez le secrétariat de l'école. Ils peuvent créer votre compte avec un numéro de téléphone.`
      },
      {
        id: 'parent-view-grades',
        title: 'Consulter les notes de mon enfant',
        category: 'Guide Parent',
        tags: ['notes', 'résultats', 'moyennes'],
        description: 'Comment voir les notes, moyennes et résultats scolaires',
        content: `# Consulter les notes de mon enfant

## 📊 Accéder aux notes

1. **Connectez-vous** à votre compte parent
2. Sur le tableau de bord, **sélectionnez votre enfant** (si vous avez plusieurs enfants)
3. Les notes apparaissent dans la section **"Aperçu des Notes"**

## 📈 Comprendre l'affichage

Pour chaque matière, vous verrez :
- **Moyenne actuelle** : Note sur 20
- **Coefficient** : Importance de la matière
- **Tendance** : ⬆️ en progression, ⬇️ en baisse, ➡️ stable
- **Dernière évaluation** : Note la plus récente avec le type (Devoir, Examen, etc.)

### Code couleur des moyennes :
- 🟢 **Vert** (16+) : Excellent
- 🔵 **Bleu** (14-15.9) : Très bien
- 🟠 **Orange** (12-13.9) : Bien
- 🔴 **Rouge** (<12) : À améliorer

## 📋 Détails par matière

Cliquez sur une matière pour voir :
- Toutes les notes obtenues
- Les types d'évaluation
- Les dates
- Les commentaires de l'enseignant

## 💡 Plusieurs enfants ?

Si vous avez plusieurs enfants :
1. Utilisez le **sélecteur en haut** pour changer d'enfant
2. Ou activez la **vue Multi-Établissements** pour voir tous vos enfants en même temps

## 🔔 Notifications

Vous recevez une notification à chaque nouvelle note ajoutée.`
      },
      {
        id: 'parent-check-attendance',
        title: 'Vérifier les présences et absences',
        category: 'Guide Parent',
        tags: ['présence', 'absence', 'retard'],
        description: 'Suivre l\'assiduité et les présences de votre enfant',
        content: `# Vérifier les présences et absences

## 📅 Accéder au suivi de présence

1. Connectez-vous à votre compte
2. Sélectionnez votre enfant
3. La section **"Suivi des Présences"** affiche le calendrier

## 📊 Statistiques rapides

En haut de la section, vous voyez :
- ✅ **Jours présents** (en vert)
- ❌ **Jours absents** (en rouge)
- ⏰ **Retards** (en orange)
- 📄 **Absences excusées** (en bleu)
- 📈 **Taux de présence global** (pourcentage)

## 📆 Calendrier des 14 derniers jours

Le calendrier montre jour par jour :
- **Point vert** : Présent
- **Point rouge** : Absent
- **Point orange** : Retard
- **Point bleu** : Absence excusée

💡 **Cliquez sur un jour** pour voir les détails (heure, motif, etc.)

## 🚨 Absences non justifiées

Les absences en rouge doivent être justifiées auprès du secrétariat.

## 📞 Signaler une absence

Pour prévenir d'une absence :
1. Contactez le secrétariat par téléphone
2. Ou envoyez un message via le **Centre de Communication**
3. Fournissez un justificatif si nécessaire`
      },
      {
        id: 'parent-multi-school',
        title: 'Gérer plusieurs enfants dans différentes écoles',
        category: 'Guide Parent',
        tags: ['multi-école', 'plusieurs enfants'],
        description: 'Utiliser la vue multi-établissements pour gérer tous vos enfants',
        content: `# Gérer plusieurs enfants dans différentes écoles

## 🏫 Vue Multi-Établissements

Si vos enfants sont dans **différentes écoles**, EduTrack vous permet de tout gérer depuis un seul compte !

## 🔄 Activer la vue Multi-Établissements

1. Sur votre tableau de bord
2. Cliquez sur le bouton **"Multi-Établissements"** en haut
3. Vous voyez maintenant **tous vos enfants** regroupés par école

## 👁️ Ce que vous voyez

- **Nombre total d'enfants**
- **Nombre d'écoles différentes**
- **Carte pour chaque enfant** avec :
  - Photo et nom
  - École et classe
  - Moyenne générale
  - Taux de présence
  - Notifications non lues
  - Paiements en attente

## 🎯 Sélectionner un enfant

Cliquez sur la carte d'un enfant pour voir :
- Ses notes détaillées
- Ses présences/absences
- Ses paiements
- Ses notifications

## 🔙 Revenir à la vue classique

Cliquez sur **"Vue Traditionnelle"** pour revenir au mode un enfant à la fois.

## 💡 Avantage

Un seul compte, un seul mot de passe, toutes vos écoles au même endroit !`
      },
      {
        id: 'parent-payments',
        title: 'Consulter et effectuer les paiements',
        category: 'Guide Parent',
        tags: ['paiement', 'frais', 'mobile money'],
        description: 'Gérer les frais de scolarité et autres paiements',
        content: `# Consulter et effectuer les paiements

## 💳 Accéder aux paiements

1. Connectez-vous à votre compte
2. Sélectionnez votre enfant
3. Section **"Statut des Paiements"**

## 📊 Vue d'ensemble

Vous voyez deux totaux :
- ✅ **Montant payé** (en vert)
- ⏰ **Montant en attente** (en orange)

## 📋 Liste des paiements

Pour chaque paiement, vous voyez :
- **Type** : Scolarité, inscription, uniforme, etc.
- **Montant** en FCFA
- **Statut** :
  - 🟢 Payé : Paiement effectué
  - 🟠 En attente : À payer
  - 🔴 En retard : Échéance dépassée
- **Date d'échéance** ou date de paiement

## 📱 Payer via Mobile Money

Pour un paiement en attente :
1. Cliquez sur le bouton **"Payer via Mobile Money"**
2. Choisissez votre opérateur (MTN, Orange, etc.)
3. Suivez les instructions à l'écran
4. Vous recevez une confirmation par SMS

## 📄 Reçu de paiement

Après chaque paiement réussi :
- Un reçu est généré automatiquement
- Vous pouvez le télécharger en PDF
- Il est aussi envoyé par email

## ❓ Problème de paiement ?

Contactez le secrétariat de l'école.`
      },
      {
        id: 'parent-communication',
        title: 'Communiquer avec l\'école',
        category: 'Guide Parent',
        tags: ['messages', 'notifications', 'communication'],
        description: 'Lire les messages et communiquer avec les enseignants',
        content: `# Communiquer avec l'école

## 📬 Centre de Communication

Accédez à tous vos messages dans la section **"Centre de Communication"**.

## 🔔 Types de notifications

### 📚 Notes (vert)
Nouvelles notes ajoutées

### 📅 Absences (rouge)
Alertes d'absence

### 💳 Paiements (orange)
Rappels de paiement

### 👥 Réunions (bleu)
Convocations à des réunions

### 📢 Annonces (violet)
Informations générales de l'école

## 🔍 Filtrer les messages

Cliquez sur un type pour voir uniquement ces notifications.

## ✉️ Lire un message

1. Cliquez sur une notification
2. Le message complet s'affiche
3. Les détails incluent :
   - Titre et contenu
   - Date et heure
   - Expéditeur (enseignant, direction, etc.)
   - Priorité (importante, normale)

## 📩 Messages non lus

Les messages non lus ont :
- Un **point bleu** à gauche
- Un fond légèrement coloré

## 🔕 Marquer comme lu

Les messages sont automatiquement marqués comme lus quand vous les ouvrez.

## 💬 Répondre

Pour répondre à un message, contactez l'expéditeur via ses coordonnées indiquées dans le message.`
      }
    ]
  },
  {
    id: 'teacher-guide',
    title: '👨‍🏫 Guide Enseignant',
    icon: 'GraduationCap',
    description: 'Outils et guides pour les enseignants',
    roles: ['teacher'],
    articles: [
      {
        id: 'teacher-first-steps',
        title: 'Premiers pas sur la plateforme',
        category: 'Guide Enseignant',
        tags: ['démarrage', 'connexion', 'découverte'],
        description: 'Découvrir votre espace enseignant',
        content: `# Premiers pas sur la plateforme

## 🎓 Bienvenue sur EduTrack !

Vous êtes enseignant et voici comment utiliser efficacement la plateforme.

## 🔐 Première connexion

1. Vous avez reçu un email avec vos identifiants
2. Connectez-vous sur la page de connexion
3. **Changez immédiatement votre mot de passe** dans les paramètres

## 📊 Votre tableau de bord

Après connexion, vous accédez à votre tableau de bord qui affiche :

### 📚 Mes classes
- Liste de toutes vos classes assignées
- Nombre d'élèves par classe
- Matières que vous enseignez

### 📅 Emploi du temps
- Vos cours de la semaine
- Prochaines séances
- Salles de classe

### ✅ Tâches rapides
- Marquer les présences du jour
- Saisir des notes récentes
- Consulter les messages

## 🎯 Actions principales

### 1️⃣ Gérer les présences
Marquez qui est présent, absent ou en retard chaque jour.

### 2️⃣ Saisir les notes
Ajoutez les notes d'évaluations, devoirs, examens.

### 3️⃣ Communiquer
Envoyez des messages aux parents ou à la direction.

### 4️⃣ Suivre les progrès
Consultez les moyennes et progressions de vos élèves.

## 💡 Conseil

Explorez chaque section pour découvrir toutes les fonctionnalités !`
      },
      {
        id: 'teacher-attendance',
        title: 'Marquer les présences et absences',
        category: 'Guide Enseignant',
        tags: ['présence', 'appel', 'absence'],
        description: 'Comment faire l\'appel et gérer les présences',
        content: `# Marquer les présences et absences

## ✅ Faire l'appel quotidien

### Accéder à la liste

1. Sur votre tableau de bord
2. Section **"Mes Classes"**
3. Cliquez sur une classe
4. Bouton **"Marquer les présences"**

### Marquer les statuts

Pour chaque élève, cochez :
- ✅ **Présent** : Élève en classe
- ❌ **Absent** : Élève absent (sera signalé aux parents)
- ⏰ **Retard** : Arrivé en retard (précisez l'heure)
- 📄 **Absence excusée** : Absent avec justificatif

### Enregistrer

Cliquez sur **"Enregistrer les présences"** en bas de page.

## 📊 Statistiques de présence

Vous pouvez voir :
- Taux de présence de la classe
- Élèves souvent absents
- Tendances par jour de la semaine

## 🚨 Alertes automatiques

Quand vous marquez un élève absent :
- Les parents reçoivent une **notification automatique**
- La direction est informée des absences répétées

## ⏱️ Modifier les présences

Si vous vous êtes trompé :
1. Retournez à la liste
2. Changez le statut
3. Réenregistrez

## 💡 Conseil

Faites l'appel au **début de chaque cours** pour un suivi précis.`
      },
      {
        id: 'teacher-grades',
        title: 'Saisir et gérer les notes',
        category: 'Guide Enseignant',
        tags: ['notes', 'évaluation', 'devoirs'],
        description: 'Comment entrer les notes et gérer les évaluations',
        content: `# Saisir et gérer les notes

## 📝 Ajouter des notes

### Étapes

1. Section **"Gestion des Notes"**
2. Sélectionnez votre **classe**
3. Cliquez sur **"Nouvelle évaluation"**

### Informations à fournir

- **Type d'évaluation** :
  - Devoir
  - Interrogation
  - Examen
  - Travail pratique
  - Exposé
  
- **Titre** : Ex: "Devoir sur la géométrie"
- **Date** : Date de l'évaluation
- **Coefficient** : Importance de l'évaluation
- **Note maximale** : Généralement sur 20

### Saisir les notes

Pour chaque élève :
1. Entrez la note obtenue
2. Ajoutez un commentaire (optionnel)
3. Marquez absent si non fait

### Enregistrer

Cliquez sur **"Enregistrer toutes les notes"**.

## 📊 Calcul automatique

Le système calcule automatiquement :
- **Moyennes** de chaque élève
- **Classement** de la classe
- **Moyenne générale** de la classe

## 🔔 Notification aux parents

Dès que vous enregistrez :
- Les parents reçoivent une notification
- Ils peuvent voir la note dans leur espace

## ✏️ Modifier une note

Si erreur :
1. Retrouvez l'évaluation
2. Cliquez sur **"Modifier"**
3. Changez la note
4. Réenregistrez

## 📈 Consulter les progressions

Dans **"Statistiques"**, voyez :
- Évolution des moyennes
- Élèves en difficulté
- Élèves excellents

## 💡 Bonnes pratiques

- Saisissez les notes **rapidement** après correction
- Ajoutez des **commentaires constructifs**
- Variez les types d'évaluation`
      },
      {
        id: 'teacher-multi-school',
        title: 'Gérer plusieurs établissements',
        category: 'Guide Enseignant',
        tags: ['multi-école', 'plusieurs écoles'],
        description: 'Si vous enseignez dans plusieurs écoles',
        content: `# Gérer plusieurs établissements

## 🏫 Enseignement multi-écoles

Si vous enseignez dans plusieurs établissements, EduTrack facilite votre gestion.

## 🔄 Changer d'établissement

1. En haut à droite, **sélecteur d'école**
2. Cliquez dessus
3. Choisissez l'école souhaitée
4. Le tableau de bord affiche les informations de cette école

## 📊 Ce qui change

Quand vous changez d'école :
- **Vos classes** de cette école
- **Votre emploi du temps** spécifique
- **Vos élèves** de cette école

## 🎯 Données séparées

Les données de chaque école sont **complètement séparées** :
- Notes saisies dans école A restent dans école A
- Présences marquées dans école B restent dans école B

## 💡 Vue globale

Dans votre profil, section **"Statistiques globales"** :
- Nombre total d'élèves (toutes écoles)
- Nombre total de classes
- Répartition par établissement

## ⚡ Basculement rapide

Le changement d'école est **instantané**, vous ne perdez pas de temps.

## 📅 Emploi du temps unifié

L'emploi du temps combine tous vos cours de toutes les écoles.`
      },
      {
        id: 'teacher-communication',
        title: 'Communiquer avec les parents',
        category: 'Guide Enseignant',
        tags: ['messages', 'parents', 'communication'],
        description: 'Envoyer des messages et notifications',
        content: `# Communiquer avec les parents

## 💬 Centre de Communication

Accédez à **"Messages"** dans votre tableau de bord.

## 📨 Envoyer un message individuel

### À un parent spécifique

1. Cliquez sur **"Nouveau message"**
2. Sélectionnez **"Parent individuel"**
3. Cherchez le nom de l'élève
4. Sélectionnez le parent
5. Écrivez votre message
6. Cliquez sur **"Envoyer"**

Le parent reçoit :
- Une notification dans son espace
- Un email (si activé)
- Un SMS (si urgent)

## 📢 Message à toute une classe

### Pour informer tous les parents d'une classe

1. **"Nouveau message"**
2. Sélectionnez **"Classe entière"**
3. Choisissez la classe
4. Écrivez le message
5. **"Envoyer à tous"**

Tous les parents de cette classe sont notifiés.

## 🚨 Message urgent

Pour les messages importants :
1. Cochez **"Marquer comme urgent"**
2. Les parents reçoivent une notification prioritaire
3. Le message apparaît en haut de leur liste

## 📋 Types de messages

Choisissez le type :
- 📚 **Notes et résultats**
- 📅 **Absences et retards**
- 👥 **Convocation réunion**
- 📢 **Information générale**

## ✅ Accusés de lecture

Vous voyez qui a :
- ✓ Lu le message (coché vert)
- ⏱️ Pas encore lu (horloge)

## 📥 Boîte de réception

Les parents peuvent vous répondre. Consultez régulièrement votre **boîte de réception**.

## 💡 Bonnes pratiques

- Messages **clairs et concis**
- Utilisez **"urgent"** avec parcimonie
- Répondez dans les **24-48h**`
      }
    ]
  },
  {
    id: 'secretary-guide',
    title: '👩‍💼 Guide Secrétaire',
    icon: 'Briefcase',
    description: 'Gestion administrative et inscriptions',
    roles: ['secretary'],
    articles: [
      {
        id: 'secretary-overview',
        title: 'Rôle et responsabilités',
        category: 'Guide Secrétaire',
        tags: ['rôle', 'responsabilités', 'permissions'],
        description: 'Comprendre votre rôle de secrétaire',
        content: `# Rôle et responsabilités du secrétaire

## 📋 Vos missions principales

En tant que secrétaire sur EduTrack, vous êtes responsable de :

### 1. Gestion des inscriptions
- Inscrire de nouveaux élèves
- Créer les comptes parents
- Assigner les élèves aux classes

### 2. Gestion des comptes
- Créer des comptes utilisateurs
- Réinitialiser les mots de passe
- Gérer les informations personnelles

### 3. Communication
- Envoyer des notifications aux parents
- Transmettre les informations de la direction
- Répondre aux demandes

### 4. Paiements
- Enregistrer les paiements reçus
- Suivre les impayés
- Générer des reçus

### 5. Documents
- Gérer les documents administratifs
- Imprimer les certificats
- Archiver les dossiers

## 🔐 Vos permissions

Vous avez accès à :
- ✅ Création de comptes élèves et parents
- ✅ Modification des informations personnelles
- ✅ Gestion des paiements
- ✅ Envoi de notifications
- ✅ Génération de documents

Vous N'avez PAS accès à :
- ❌ Notes et évaluations (réservé aux enseignants)
- ❌ Paramètres de l'école (réservé au directeur)
- ❌ Gestion des enseignants (réservé au directeur)

## 🎯 Outils à votre disposition

- **Tableau de bord** : Vue d'ensemble
- **Gestion des comptes** : Créer/modifier
- **Inscriptions** : Nouveaux élèves
- **Paiements** : Suivi financier
- **Communications** : Messages
- **Documents** : Certificats et attestations

## 💡 Contact

Pour toute question, contactez le directeur.`
      },
      {
        id: 'secretary-new-student',
        title: 'Inscrire un nouvel élève',
        category: 'Guide Secrétaire',
        tags: ['inscription', 'élève', 'nouveau'],
        description: 'Processus complet d\'inscription d\'un élève',
        content: `# Inscrire un nouvel élève

## 📝 Étape 1 : Rassembler les informations

Avant de commencer, assurez-vous d'avoir :
- **Informations de l'élève** :
  - Nom complet
  - Date de naissance
  - Sexe
  - Photo (optionnelle)
  
- **Informations du parent/tuteur** :
  - Nom complet
  - Email (si disponible)
  - Numéro de téléphone
  - Adresse
  
- **Informations scolaires** :
  - Classe d'inscription
  - Année académique
  - Numéro de matricule (si existant)

## 📋 Étape 2 : Créer le compte élève

1. Allez dans **"Gestion des Comptes"**
2. Cliquez sur **"Nouveau Compte"**
3. Sélectionnez **"Élève"**

### Formulaire élève

Remplissez :
- **Prénom et Nom**
- **Date de naissance**
- **Sexe** (Masculin/Féminin)
- **Classe** (sélectionnez dans la liste)
- **Photo** (téléchargez si disponible)

**Pour le Secondaire uniquement** :
- **Email** (pour la connexion de l'élève)
- Un mot de passe temporaire sera généré

**Pour le Primaire** :
- Pas de connexion élève nécessaire
- Seuls les parents auront accès

## 👪 Étape 3 : Ajouter le parent

Après avoir créé l'élève :

### Si le parent existe déjà
1. Recherchez son nom dans la liste
2. Cliquez sur **"Lier cet élève au parent"**
3. Confirmez

### Si c'est un nouveau parent
1. Cliquez sur **"Créer le compte parent"**
2. Remplissez :
   - Nom complet du parent
   - Email (si disponible)
   - Téléphone
   - Adresse
3. Cliquez sur **"Créer et lier"**

## 📧 Étape 4 : Envoi des identifiants

Le système envoie automatiquement :

**Pour le parent** :
- Email avec identifiant et mot de passe
- Ou SMS si pas d'email

**Pour l'élève (Secondaire seulement)** :
- Email avec identifiant et mot de passe

## ✅ Étape 5 : Vérification

Vérifiez que :
- L'élève apparaît dans sa classe
- Le parent apparaît dans la liste
- Le lien parent-élève est établi

## 💡 Parent sans email ?

Si le parent n'a pas d'email :
1. Cochez **"Pas d'email"**
2. Le système utilisera uniquement le téléphone
3. Les identifiants seront envoyés par SMS
4. Le parent pourra se connecter avec son numéro

## 🔄 Plusieurs enfants ?

Si un parent inscrit plusieurs enfants :
1. Créez chaque élève séparément
2. Liez-les tous au même parent existant
3. Le parent verra tous ses enfants dans un seul compte`
      },
      {
        id: 'secretary-create-parent',
        title: 'Créer un compte parent',
        category: 'Guide Secrétaire',
        tags: ['parent', 'compte', 'création'],
        description: 'Comment créer et configurer un compte parent',
        content: `# Créer un compte parent

## 👤 Quand créer un compte parent ?

Créez un compte parent lors de :
- L'inscription d'un nouvel élève
- Un changement de tuteur
- Un parent qui n'avait pas de compte

## 📝 Informations requises

### Obligatoires
- **Nom complet** du parent/tuteur
- **Numéro de téléphone** (format: +237...)

### Recommandées
- **Email** (pour connexion et notifications)
- **Adresse** physique
- **Profession** (optionnel)

## 🔄 Deux méthodes de création

### Méthode 1 : Lors de l'inscription élève
1. Créez d'abord l'élève
2. Puis créez directement le parent
3. Le lien est automatique

### Méthode 2 : Parent seul
1. **"Gestion des Comptes"** > **"Nouveau Compte"**
2. Sélectionnez **"Parent"**
3. Remplissez le formulaire
4. **"Créer le compte"**

## 📧 Avec email

Si le parent a un email :
1. Entrez l'email
2. Le système génère un mot de passe
3. Un email est envoyé automatiquement avec :
   - Identifiant (l'email)
   - Mot de passe temporaire
   - Lien de connexion

## 📱 Sans email

Si pas d'email :
1. Cochez **"Connexion par téléphone"**
2. Entrez le numéro de téléphone
3. Le système génère un mot de passe
4. **Notez les identifiants** pour les donner au parent
5. Un SMS est envoyé (si configuré)

### Identifiants sans email
- **Identifiant** : Numéro de téléphone
- **Mot de passe** : À noter et remettre au parent

## 🔗 Lier des enfants

Après création du parent :
1. Allez dans sa fiche
2. Section **"Enfants liés"**
3. Cliquez sur **"Ajouter un enfant"**
4. Recherchez l'élève
5. Cliquez sur **"Lier"**

## 🔄 Plusieurs enfants

Un parent peut avoir plusieurs enfants :
- Dans la même école : Ils les verront tous
- Dans des écoles différentes : Vue multi-établissements activée

## ⚠️ Vérifications importantes

Avant de finaliser :
- ✅ Email correct (pas de fautes)
- ✅ Téléphone valide (format international)
- ✅ Nom bien orthographié
- ✅ Au moins un enfant lié

## 📄 Remettre les identifiants

Si pas d'envoi automatique :
1. Imprimez la **fiche d'identifiants**
2. Remettez-la au parent en main propre
3. Demandez-lui de changer le mot de passe dès la première connexion`
      },
      {
        id: 'secretary-payments',
        title: 'Enregistrer les paiements',
        category: 'Guide Secrétaire',
        tags: ['paiement', 'frais', 'reçu'],
        description: 'Gérer les paiements et générer des reçus',
        content: `# Enregistrer les paiements

## 💳 Accéder à la gestion des paiements

1. Menu principal > **"Paiements"**
2. Ou depuis le profil d'un élève

## 📋 Enregistrer un paiement

### Étape 1 : Identifier l'élève
1. Recherchez l'élève par :
   - Nom
   - Matricule
   - Classe
2. Cliquez sur son nom

### Étape 2 : Voir les frais
Vous voyez :
- **Frais totaux** de l'année
- **Montant déjà payé**
- **Montant restant**
- Détail des échéances

### Étape 3 : Enregistrer le paiement
1. Cliquez sur **"Enregistrer un paiement"**
2. Sélectionnez le **type de frais** :
   - Frais de scolarité
   - Frais d'inscription
   - Frais d'uniforme
   - Frais de cantine
   - Autres frais
3. Entrez le **montant reçu**
4. Sélectionnez le **mode de paiement** :
   - Espèces
   - Mobile Money (MTN, Orange)
   - Virement bancaire
   - Chèque
5. Ajoutez une **note** (optionnel)
6. Cliquez sur **"Enregistrer"**

## 🧾 Générer le reçu

Automatiquement après l'enregistrement :
1. Un reçu est généré
2. Vous pouvez :
   - **Imprimer** le reçu
   - **Envoyer par email** au parent
   - **Télécharger** en PDF

## 📊 Le reçu contient

- Numéro de reçu unique
- Date du paiement
- Nom de l'élève
- Classe
- Type de frais
- Montant payé
- Mode de paiement
- Signature et cachet de l'école

## 💰 Paiements partiels

Si le parent paie en plusieurs fois :
1. Enregistrez chaque paiement séparément
2. Le solde se met à jour automatiquement
3. Générez un reçu à chaque fois

## 📅 Historique des paiements

Pour voir l'historique :
1. Profil de l'élève
2. Onglet **"Paiements"**
3. Liste de tous les paiements avec dates

## 🔔 Notifications

Quand vous enregistrez un paiement :
- Le parent reçoit une notification
- Le reçu est envoyé par email automatiquement

## 📈 Rapports

Générez des rapports pour :
- Paiements du jour
- Paiements de la semaine/mois
- Impayés par classe
- État général des paiements

## ⚠️ Cas particuliers

### Réduction ou bourse
1. Créez d'abord une **remise**
2. Puis enregistrez le paiement réduit

### Erreur de saisie
1. Accédez au paiement
2. Cliquez sur **"Annuler"**
3. Ressaisissez correctement

### Remboursement
Contactez le directeur pour validation.`
      }
    ]
  },
  {
    id: 'student-guide',
    title: '🎓 Guide Élève',
    icon: 'BookOpen',
    description: 'Utiliser votre espace élève',
    roles: ['student'],
    articles: [
      {
        id: 'student-first-login',
        title: 'Ma première connexion',
        category: 'Guide Élève',
        tags: ['connexion', 'démarrage', 'compte'],
        description: 'Comment se connecter et découvrir son espace',
        content: `# Ma première connexion

## 👋 Bienvenue sur EduTrack !

Tu es au **secondaire** et tu as maintenant ton propre espace sur EduTrack.

## 📧 Recevoir tes identifiants

Tu as reçu un email contenant :
- Ton **email** (ton identifiant)
- Ton **mot de passe temporaire**

💡 Si tu n'as pas reçu l'email, contacte le secrétariat.

## 🔐 Se connecter

1. Va sur la page de connexion EduTrack
2. Entre ton **email**
3. Entre ton **mot de passe**
4. Clique sur **"Se connecter"**

## ✏️ Changer ton mot de passe

**Important** : Change ton mot de passe dès la première connexion !

1. Clique sur ton nom en haut à droite
2. Sélectionne **"Mon compte"**
3. Dans **"Sécurité"**, clique sur **"Changer le mot de passe"**
4. Entre ton mot de passe actuel
5. Entre ton nouveau mot de passe
   - Minimum 8 caractères
   - Facile à retenir mais difficile à deviner
6. Confirme le nouveau mot de passe
7. Clique sur **"Enregistrer"**

## 📱 Mot de passe oublié ?

Si tu oublies ton mot de passe :
1. Sur la page de connexion, clique sur **"Mot de passe oublié ?"**
2. Entre ton email
3. Tu recevras un lien pour créer un nouveau mot de passe

## 🎯 Découvre ton espace

Après connexion, tu accèdes à ton **tableau de bord** qui affiche :
- Tes notes et moyennes
- Tes absences et présences
- Ton emploi du temps
- Les messages de tes professeurs
- Les événements à venir

## 💡 Conseil

Garde tes identifiants en lieu sûr et ne les partage avec personne !`
      },
      {
        id: 'student-view-grades',
        title: 'Consulter mes notes',
        category: 'Guide Élève',
        tags: ['notes', 'moyennes', 'résultats'],
        description: 'Comment voir tes notes et résultats',
        content: `# Consulter mes notes

## 📊 Accéder à mes notes

1. Connecte-toi à ton compte
2. Tu arrives sur ton tableau de bord
3. La section **"Mes Notes"** affiche tes résultats

## 📈 Ce que tu vois

### Par matière
Pour chaque matière, tu vois :
- **Ta moyenne actuelle** sur 20
- **Coefficient** de la matière
- **Ta tendance** : 
  - ⬆️ Tu progresses
  - ➡️ Tu es stable  
  - ⬇️ Tu dois t'améliorer
- **Dernière note** reçue

### Code couleur
- 🟢 **Vert** (16+) : Excellent ! Continue !
- 🔵 **Bleu** (14-15.9) : Très bien !
- 🟠 **Orange** (12-13.9) : Bien, tu peux mieux faire
- 🔴 **Rouge** (<12) : Attention, tu dois travailler plus

## 📋 Détails d'une matière

Clique sur une matière pour voir :
- **Toutes tes notes** avec les dates
- **Type d'évaluation** (Devoir, Interrogation, Examen)
- **Commentaires** du professeur
- **Évolution** de ta moyenne

## 📊 Ma moyenne générale

En haut de la page :
- **Moyenne générale** (toutes matières)
- **Ton rang** dans la classe
- **Meilleure note**
- **Note à améliorer**

## 🎯 Graphiques

Tu as des graphiques pour voir :
- Évolution de tes moyennes dans le temps
- Comparaison entre tes matières
- Ta progression trimestre par trimestre

## 🔔 Nouvelles notes

Tu reçois une notification à chaque nouvelle note ajoutée.

## 💡 Conseils

- Consulte régulièrement tes notes
- Identifie tes points faibles
- Demande de l'aide si tu as des difficultés
- Félicite-toi pour tes réussites !`
      },
      {
        id: 'student-schedule',
        title: 'Mon emploi du temps',
        category: 'Guide Élève',
        tags: ['emploi du temps', 'cours', 'horaires'],
        description: 'Consulter ton emploi du temps et tes cours',
        content: `# Mon emploi du temps

## 📅 Accéder à l'emploi du temps

1. Dans le menu, clique sur **"Emploi du temps"**
2. Tu vois ta semaine de cours

## 🗓️ Vue hebdomadaire

L'emploi du temps montre :
- **Jours de la semaine** (Lundi à Vendredi)
- **Heures de cours** 
- Pour chaque cours :
  - 📚 Matière
  - 👨‍🏫 Professeur
  - 🚪 Salle de classe
  - ⏰ Horaires

## 📱 Vue du jour

Pour voir seulement aujourd'hui :
1. Clique sur **"Aujourd'hui"**
2. Tu vois uniquement tes cours du jour

## 🔔 Prochain cours

Sur ton tableau de bord, une carte affiche :
- **Ton prochain cours**
- Matière et professeur
- Salle
- Dans combien de temps il commence

## 📥 Télécharger

Tu peux télécharger ton emploi du temps :
1. Clique sur **"Télécharger"**
2. Choisis le format :
   - PDF (pour imprimer)
   - Image (pour ton téléphone)

## 📱 Ajouter à ton calendrier

Tu peux synchroniser avec ton téléphone :
1. Clique sur **"Synchroniser"**
2. Choisis ton calendrier (Google, Outlook, iPhone)
3. Tous tes cours apparaissent dans ton téléphone

## 🔄 Changements

Si un cours change :
- Tu recevras une notification
- L'emploi du temps se met à jour automatiquement
- La modification sera en couleur différente

## 💡 Astuce

Consulte ton emploi du temps **chaque soir** pour préparer ton sac pour le lendemain !`
      },
      {
        id: 'student-attendance',
        title: 'Mes présences et absences',
        category: 'Guide Élève',
        tags: ['présence', 'absence', 'assiduité'],
        description: 'Suivre tes présences et absences',
        content: `# Mes présences et absences

## 📊 Voir mes présences

1. Section **"Mes Présences"** sur ton tableau de bord
2. Tu vois un calendrier de tes présences

## 📅 Calendrier

Chaque jour est coloré :
- 🟢 **Vert** : Tu étais présent
- 🔴 **Rouge** : Tu étais absent
- 🟠 **Orange** : Tu étais en retard
- 🔵 **Bleu** : Absence justifiée (avec certificat médical)

## 📈 Tes statistiques

En haut, tu vois :
- ✅ Nombre de jours présents
- ❌ Nombre d'absences
- ⏰ Nombre de retards
- 📊 **Ton taux de présence** (pourcentage)

### Objectif
Essaie de maintenir un taux de présence **supérieur à 95%** !

## 🚨 Absences injustifiées

Les absences en rouge doivent être justifiées :
- Tes parents sont automatiquement prévenus
- Tu dois apporter un justificatif au secrétariat
- Après justification, ça devient bleu

## 📄 Justifier une absence

Si tu étais malade :
1. Demande à tes parents d'informer le secrétariat
2. Apporte un certificat médical
3. Remets-le au secrétariat
4. L'absence devient "excusée"

## ⚠️ Trop d'absences

Si tu as trop d'absences :
- Tes parents reçoivent une alerte
- Le CPE peut te convoquer
- Ça peut affecter ton passage en classe supérieure

## 💡 Conseils

- Viens à l'école même si tu n'aimes pas une matière
- Si tu es malade, préviens vite
- Rattrape les cours manqués
- Demande les devoirs aux camarades`
      }
    ]
  },
  {
    id: 'principal-guide',
    title: '👨‍💼 Guide Directeur',
    icon: 'Crown',
    description: 'Administration et gestion de l\'établissement',
    roles: ['principal'],
    articles: [
      {
        id: 'principal-overview',
        title: 'Vue d\'ensemble de l\'administration',
        category: 'Guide Directeur',
        tags: ['administration', 'gestion', 'directeur'],
        description: 'Comprendre vos outils de direction',
        content: `# Vue d'ensemble de l'administration

## 🎯 Votre rôle de directeur

En tant que directeur sur EduTrack, vous avez **tous les pouvoirs** pour gérer votre établissement.

## 📊 Tableau de bord directeur

Votre tableau de bord affiche :

### 📈 Statistiques globales
- Nombre total d'élèves
- Nombre d'enseignants
- Nombre de classes
- Taux de présence général
- Moyenne générale de l'école

### 💰 Situation financière
- Paiements reçus ce mois
- Paiements en attente
- Impayés
- Graphiques de trésorerie

### 👥 Gestion des comptes
- Enseignants actifs
- Secrétaires
- Parents inscrits
- Élèves par classe

### 🔔 Alertes importantes
- Absences répétées
- Résultats préoccupants
- Problèmes de discipline
- Retards de paiement

## 🛠️ Outils à votre disposition

### 1. Gestion des comptes
- Créer des comptes enseignants
- Créer des comptes secrétaires
- Gérer les permissions
- Réinitialiser les mots de passe

### 2. Configuration de l'école
- Informations de l'établissement
- Structure des classes
- Années académiques
- Paramètres généraux

### 3. Gestion des classes
- Créer/supprimer des classes
- Assigner les enseignants
- Répartir les élèves
- Définir les coefficients

### 4. Rapports et statistiques
- Rapports académiques
- Rapports financiers
- Rapports de présence
- Exports Excel/PDF

### 5. Communication
- Envoyer des circulaires
- Notifications générales
- Messages aux parents
- Communication avec le personnel

## 🔐 Permissions spéciales

Vous seul pouvez :
- Créer des comptes enseignants et secrétaires
- Modifier la structure de l'école
- Accéder aux statistiques globales
- Gérer les paramètres système
- Valider les décisions importantes

## 💡 Bonnes pratiques

- Consultez le tableau de bord **quotidiennement**
- Vérifiez les **alertes** régulièrement
- Générez des **rapports mensuels**
- Communiquez avec votre équipe
- Sauvegardez les données importantes`
      },
      {
        id: 'principal-create-teacher',
        title: 'Créer un compte enseignant',
        category: 'Guide Directeur',
        tags: ['enseignant', 'compte', 'création'],
        description: 'Ajouter un nouveau professeur',
        content: `# Créer un compte enseignant

## 👨‍🏫 Ajouter un enseignant

### Étape 1 : Accéder à la gestion
1. Menu **"Gestion des Comptes"**
2. Cliquez sur **"Nouveau Compte"**
3. Sélectionnez **"Enseignant"**

### Étape 2 : Informations personnelles

Remplissez :
- **Nom complet**
- **Email** (pour la connexion)
- **Téléphone**
- **Date de naissance**
- **Sexe**
- **Adresse**
- **Photo** (optionnelle)

### Étape 3 : Informations professionnelles

- **Matières enseignées** (sélection multiple)
- **Diplômes et certifications**
- **Années d'expérience**
- **Date d'embauche**

### Étape 4 : Classes assignées

Assignez l'enseignant à ses classes :
1. Section **"Classes"**
2. Cliquez sur **"Assigner à une classe"**
3. Sélectionnez :
   - La classe
   - La matière qu'il y enseigne
4. Répétez pour toutes ses classes

### Étape 5 : Permissions

Définissez les permissions :
- ✅ **Gestion des notes** (généralement OUI)
- ✅ **Gestion des présences** (généralement OUI)
- ✅ **Communication parents** (généralement OUI)
- ⚠️ **Accès aux paiements** (généralement NON)

## 📧 Envoi des identifiants

Après création :
1. Un **email automatique** est envoyé avec :
   - Email de connexion
   - Mot de passe temporaire
   - Lien vers la plateforme
2. L'enseignant devra changer son mot de passe à la première connexion

## 📱 Si pas d'email

Si l'enseignant n'a pas d'email :
1. Le système génère un identifiant unique
2. **Notez les identifiants** et remettez-les en main propre
3. Activez la **connexion par téléphone**

## 🏫 Enseignant multi-établissements

Si l'enseignant travaille dans plusieurs écoles :
1. Cochez **"Enseigne dans plusieurs établissements"**
2. Il pourra basculer entre les écoles
3. Ses données seront séparées par école

## ✏️ Modifier un enseignant

Pour modifier :
1. Liste des enseignants
2. Cliquez sur le nom
3. Bouton **"Modifier"**
4. Changez les informations
5. **"Enregistrer"**

## 🗑️ Supprimer un enseignant

**Attention** : La suppression est définitive !
1. Profil de l'enseignant
2. Menu **"Actions"**
3. **"Désactiver le compte"** (recommandé) ou **"Supprimer définitivement"**

## 💡 Conseil

Créez les comptes enseignants **avant la rentrée** pour qu'ils puissent se familiariser avec la plateforme.`
      },
      {
        id: 'principal-school-settings',
        title: 'Configurer l\'établissement',
        category: 'Guide Directeur',
        tags: ['configuration', 'paramètres', 'école'],
        description: 'Paramétrer les informations de l\'école',
        content: `# Configurer l'établissement

## ⚙️ Accéder aux paramètres

Menu **"Paramètres de l'École"** (visible uniquement par vous)

## 🏫 Informations générales

### Identité de l'école
- **Nom officiel** de l'établissement
- **Type d'établissement** :
  - École Primaire
  - Collège/Lycée (Secondaire)
  - Établissement Combiné (Primaire + Secondaire)
- **Numéro d'agrément**
- **Logo** de l'école

### Coordonnées
- **Adresse** complète
- **Téléphone** principal
- **Email** officiel
- **Site web** (si existant)
- **Localisation GPS** (optionnel)

### Direction
- **Nom du directeur**
- **Email du directeur**
- **Téléphone du directeur**

## 📚 Structure académique

### Année académique
- **Année en cours** (ex: 2024-2025)
- **Date de début**
- **Date de fin**
- **Nombre de trimestres**
- **Dates des vacances**

### Classes et niveaux

**Pour le Primaire** :
- SIL (Classe d'initiation)
- CP (Cours Préparatoire)
- CE1, CE2 (Cours Élémentaire)
- CM1, CM2 (Cours Moyen)

**Pour le Secondaire** :
- 6ème, 5ème, 4ème, 3ème (Collège)
- 2nde, 1ère, Tle (Lycée)

### Créer une classe
1. Section **"Classes"**
2. Bouton **"Nouvelle Classe"**
3. Remplissez :
   - Niveau (ex: CM2)
   - Section (A, B, C...)
   - Capacité maximum
   - Salle de classe
4. **"Créer"**

## 💰 Configuration financière

### Frais de scolarité
Par niveau, définissez :
- **Frais d'inscription** (une fois)
- **Frais de scolarité** (par trimestre ou année)
- **Frais de cantine** (optionnel)
- **Frais d'uniforme** (optionnel)
- **Autres frais**

### Modes de paiement acceptés
- ✅ Espèces
- ✅ Mobile Money (MTN, Orange)
- ✅ Virement bancaire
- ✅ Chèque

### Échéancier
Définissez les dates limites de paiement par trimestre.

## 🔔 Notifications

### Email
- Configurer le serveur d'envoi
- Templates d'emails
- Notifications automatiques

### SMS
- Service SMS (si activé)
- Crédits SMS disponibles

## 🎨 Personnalisation

### Thème de l'école
- Couleurs principales
- Logos et images
- En-têtes de documents

### Documents officiels
- En-tête des bulletins
- Modèle de certificat
- Modèle de reçu

## 💡 Conseil important

**Faites ces configurations AVANT la rentrée** pour éviter les problèmes pendant l'année.`
      },
      {
        id: 'principal-reports',
        title: 'Générer des rapports',
        category: 'Guide Directeur',
        tags: ['rapports', 'statistiques', 'exports'],
        description: 'Créer des rapports et statistiques',
        content: `# Générer des rapports

## 📊 Accéder aux rapports

Menu **"Rapports et Statistiques"**

## 📈 Types de rapports disponibles

### 1. Rapports académiques

**Résultats par classe**
- Moyennes générales
- Taux de réussite
- Classements
- Évolution trimestre par trimestre

**Résultats par matière**
- Performance dans chaque matière
- Comparaison entre classes
- Identification des points faibles

**Bulletins de notes**
- Génération en masse
- Export PDF
- Envoi automatique aux parents

### 2. Rapports de présence

**Assiduité globale**
- Taux de présence de l'école
- Absences par classe
- Élèves souvent absents
- Tendances par jour/semaine

**Retards**
- Nombre de retards
- Élèves retardataires
- Heures de pointe

### 3. Rapports financiers

**État des paiements**
- Paiements reçus (jour/semaine/mois)
- Paiements en attente
- Impayés par classe
- Prévisions de trésorerie

**Détails des recettes**
- Par type de frais
- Par mode de paiement
- Par période

**Reçus émis**
- Liste de tous les reçus
- Montants totaux
- Reçus annulés

### 4. Rapports du personnel

**Enseignants**
- Liste complète
- Charges d'enseignement
- Présence/absence
- Performances des classes

**Personnel administratif**
- Secrétaires actifs
- Activités récentes

### 5. Rapports d'inscription

**Nouvelles inscriptions**
- Par période
- Par classe
- Évolution

**Effectifs**
- Total élèves
- Répartition par classe
- Comparaison annuelle

## 🔧 Générer un rapport

### Étape 1 : Choisir le type
Sélectionnez le rapport souhaité

### Étape 2 : Filtres
Définissez :
- **Période** : Date de début et fin
- **Classes** : Toutes ou spécifiques
- **Niveaux** : Primaire/Secondaire/Tous
- **Autres critères** selon le rapport

### Étape 3 : Format
Choisissez :
- 📄 **PDF** : Pour imprimer ou archiver
- 📊 **Excel** : Pour analyser les données
- 📧 **Email** : Envoi direct

### Étape 4 : Générer
1. Cliquez sur **"Générer le rapport"**
2. Attendez le traitement (quelques secondes)
3. Le fichier se télécharge automatiquement

## 📅 Rapports automatiques

Vous pouvez planifier des rapports récurrents :
1. Dans les paramètres du rapport
2. Cochez **"Générer automatiquement"**
3. Choisissez la fréquence :
   - Quotidien
   - Hebdomadaire
   - Mensuel
   - Trimestriel
4. Le rapport sera envoyé par email automatiquement

## 💡 Rapports recommandés

**Chaque semaine** :
- État des présences
- Nouvelles inscriptions

**Chaque mois** :
- Rapport financier
- Résultats académiques

**Chaque trimestre** :
- Rapport complet de performance
- Bulletins de notes

## 📈 Tableaux de bord personnalisés

Créez vos propres tableaux de bord avec les indicateurs qui vous intéressent le plus.`
      }
    ]
  }
];

// ==========================================
// CONTENU TECHNIQUE (POUR ADMINISTRATEURS)
// ==========================================

export const technicalHelpCategories = [
  {
    id: 'getting-started',
    title: '🚀 Démarrage',
    icon: 'Rocket',
    description: 'Premiers pas avec EduTrack (Documentation technique)',
    roles: ['admin'],
    articles: [
      {
        id: 'overview',
        title: 'Vue d\'ensemble du système',
        file: 'README.md',
        category: 'Documentation Technique',
        tags: ['débutant', 'introduction'],
        description: 'Découvrez les fonctionnalités principales d\'EduTrack'
      },
      {
        id: 'organization',
        title: 'Organisation du projet',
        file: 'PROJECT_ORGANIZATION.md',
        category: 'Documentation Technique',
        tags: ['structure', 'architecture'],
        description: 'Comprendre l\'organisation des dossiers et fichiers'
      },
    ]
  },
  {
    id: 'technical-accounts',
    title: '👥 Gestion Technique des Comptes',
    icon: 'Users',
    description: 'Documentation technique de gestion des utilisateurs',
    roles: ['admin'],
    articles: [
      {
        id: 'account-creation',
        title: 'Création de comptes utilisateurs',
        file: 'FORMULAIRE_CREATION_COMPTE_DYNAMIQUE.md',
        category: 'Documentation Technique',
        tags: ['comptes', 'création', 'utilisateurs'],
        description: 'Guide complet pour créer des comptes (enseignants, parents, élèves, secrétaires)'
      },
      {
        id: 'student-system',
        title: 'Système hybride élèves (Primaire/Secondaire)',
        file: 'STUDENT_HYBRID_SYSTEM.md',
        category: 'Documentation Technique',
        tags: ['élèves', 'primaire', 'secondaire'],
        description: 'Comprendre le système de gestion des élèves avec ou sans compte'
      },
      {
        id: 'parent-no-email',
        title: 'Parents sans email (technique)',
        file: 'PARENT_CONNEXION_SANS_EMAIL.md',
        category: 'Documentation Technique',
        tags: ['parents', 'email', 'connexion'],
        description: 'Comment gérer les parents qui n\'ont pas d\'adresse email'
      },
      {
        id: 'parent-multi-school-tech',
        title: 'Parents multi-établissements (technique)',
        file: 'PARENT_MULTI_SCHOOL_GUIDE.md',
        category: 'Documentation Technique',
        tags: ['parents', 'multi-école'],
        description: 'Gestion centralisée des parents avec enfants dans plusieurs écoles'
      },
      {
        id: 'teacher-multi-school-tech',
        title: 'Enseignants multi-établissements (technique)',
        file: 'TEACHER_MULTI_SCHOOL_GUIDE.md',
        category: 'Documentation Technique',
        tags: ['enseignants', 'multi-école'],
        description: 'Gestion des enseignants intervenant dans plusieurs établissements'
      },
      {
        id: 'secretary-system-tech',
        title: 'Système de gestion secrétaire (technique)',
        file: 'SYSTEME_GESTION_SECRETAIRE.md',
        category: 'Documentation Technique',
        tags: ['secrétaire', 'permissions'],
        description: 'Rôles et permissions des secrétaires'
      },
      {
        id: 'account-deletion-tech',
        title: 'Suppression de comptes (technique)',
        file: 'ACCOUNT_DELETION.md',
        category: 'Documentation Technique',
        tags: ['suppression', 'sécurité'],
        description: 'Procédure complète pour supprimer un compte utilisateur'
      }
    ]
  },
  {
    id: 'email-system-tech',
    title: '📧 Système d\'Email (Technique)',
    icon: 'Mail',
    description: 'Configuration et utilisation des emails',
    roles: ['admin'],
    articles: [
      {
        id: 'email-auto-send',
        title: 'Envoi automatique d\'identifiants',
        file: 'SYSTEME_ENVOI_EMAIL_AUTOMATIQUE.md',
        category: 'Documentation Technique',
        tags: ['email', 'automatique', 'identifiants'],
        description: 'Comment le système envoie automatiquement les identifiants par email'
      },
      {
        id: 'emailjs-config',
        title: 'Configuration EmailJS',
        file: 'CONFIGURATION_EMAILJS.md',
        category: 'Documentation Technique',
        tags: ['configuration', 'emailjs'],
        description: 'Guide pas à pas pour configurer EmailJS'
      },
      {
        id: 'email-guide',
        title: 'Guide rapide email',
        file: 'GUIDE_RAPIDE_EMAIL.md',
        category: 'Documentation Technique',
        tags: ['guide', 'email'],
        description: 'Résumé rapide du système d\'email'
      },
      {
        id: 'email-examples',
        title: 'Exemples d\'emails',
        file: 'EXEMPLES_EMAILS.md',
        category: 'Documentation Technique',
        tags: ['exemples', 'templates'],
        description: 'Exemples de templates d\'emails utilisés'
      },
      {
        id: 'email-troubleshooting-tech',
        title: 'Résolution de problèmes email',
        file: 'EMAIL_TROUBLESHOOTING.md',
        category: 'Documentation Technique',
        tags: ['dépannage', 'erreurs'],
        description: 'Solutions aux problèmes courants d\'envoi d\'email'
      },
      {
        id: 'supabase-email',
        title: 'Configuration Supabase Email',
        file: 'SUPABASE_EMAIL_CONFIG.md',
        category: 'Documentation Technique',
        tags: ['supabase', 'configuration'],
        description: 'Configurer les emails avec Supabase'
      }
    ]
  },
  {
    id: 'database-tech',
    title: '🗄️ Base de Données (Technique)',
    icon: 'Database',
    description: 'Gestion de la base de données',
    roles: ['admin'],
    articles: [
      {
        id: 'supabase-auth',
        title: 'Authentification Supabase',
        file: 'SUPABASE_AUTH.md',
        category: 'Documentation Technique',
        tags: ['supabase', 'authentification'],
        description: 'Configuration de l\'authentification avec Supabase'
      },
      {
        id: 'prisma-migration',
        title: 'Migration Prisma',
        file: 'PRISMA_MIGRATION.md',
        category: 'Documentation Technique',
        tags: ['prisma', 'migration'],
        description: 'Guide de migration Prisma vers Supabase'
      }
    ]
  }
];

// Fusionner les catégories selon le rôle
export const getHelpCategoriesByRole = (role) => {
  // Administrateur voit tout (contenu utilisateur + technique)
  if (role === 'admin') {
    return [...userHelpCategories, ...technicalHelpCategories];
  }
  
  // Les autres rôles voient uniquement leur contenu spécifique
  return userHelpCategories.filter(cat => {
    // Si la catégorie n'a pas de restriction de rôle, elle est visible par tous
    if (!cat.roles || cat.roles.length === 0) {
      return true;
    }
    // Sinon vérifier si le rôle de l'utilisateur est dans la liste
    return cat.roles.includes(role);
  });
};

// Pour compatibilité - retourne toutes les catégories utilisateur par défaut
export const helpCategories = userHelpCategories;

/**
 * Recherche dans les articles d'aide
 * @param {string} query - Terme de recherche
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Array} - Articles correspondants
 */
export const searchHelp = (query, role = 'student') => {
  const lowercaseQuery = query.toLowerCase();
  const results = [];
  const categories = getHelpCategoriesByRole(role);

  categories.forEach(category => {
    category.articles.forEach(article => {
      const matchesTitle = article.title.toLowerCase().includes(lowercaseQuery);
      const matchesDescription = article.description.toLowerCase().includes(lowercaseQuery);
      const matchesTags = article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
      const matchesCategory = category.title.toLowerCase().includes(lowercaseQuery);

      if (matchesTitle || matchesDescription || matchesTags || matchesCategory) {
        results.push({
          ...article,
          category: category.title,
          categoryId: category.id
        });
      }
    });
  });

  return results;
};

/**
 * Obtenir un article par ID
 * @param {string} articleId - ID de l'article
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Object|null} - Article trouvé ou null
 */
export const getArticleById = (articleId, role = 'student') => {
  const categories = getHelpCategoriesByRole(role);
  for (const category of categories) {
    const article = category.articles.find(a => a.id === articleId);
    if (article) {
      return {
        ...article,
        category: category.title,
        categoryId: category.id
      };
    }
  }
  return null;
};

/**
 * Obtenir les articles recommandés selon le rôle
 * @param {string} role - Rôle de l'utilisateur
 * @returns {Array} - Articles recommandés
 */
export const getRecommendedArticles = (role) => {
  const recommendations = {
    'principal': ['principal-overview', 'principal-create-teacher', 'principal-school-settings', 'principal-reports'],
    'teacher': ['teacher-first-steps', 'teacher-attendance', 'teacher-grades', 'teacher-communication'],
    'secretary': ['secretary-overview', 'secretary-new-student', 'secretary-create-parent', 'secretary-payments'],
    'parent': ['parent-first-login', 'parent-view-grades', 'parent-check-attendance', 'parent-multi-school'],
    'student': ['student-first-login', 'student-view-grades', 'student-schedule', 'student-attendance'],
    'admin': ['overview', 'organization', 'data-mode', 'supabase-auth']
  };

  const articleIds = recommendations[role] || recommendations['student'];
  return articleIds.map(id => getArticleById(id, role)).filter(a => a !== null);
};
