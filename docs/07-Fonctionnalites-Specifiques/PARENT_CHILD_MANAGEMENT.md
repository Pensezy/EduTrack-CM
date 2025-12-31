# Guide de Gestion des Enfants par les Parents

## Vue d'ensemble
Le système EduTrack CM permet maintenant aux parents de gérer les informations de connexion de leurs enfants directement depuis leur dashboard.

## Fonctionnalités disponibles

### 1. Voir les informations de l'enfant
- Nom complet
- Matricule
- Classe
- Email de connexion
- Téléphone de contact

### 2. Modifier le mot de passe de l'enfant
Les parents peuvent réinitialiser le mot de passe de connexion de leurs enfants.

**Étapes :**
1. Accéder au dashboard parent
2. Aller dans "Mes Enfants" ou sur le dashboard principal
3. Survoler la carte de l'enfant concerné
4. Cliquer sur l'icône ⚙️ (Settings) qui apparaît
5. Sélectionner l'onglet "Mot de passe"
6. Saisir le nouveau mot de passe (minimum 8 caractères)
7. Confirmer le mot de passe
8. Cliquer sur "Modifier le mot de passe"

**Option rapide :**
- Utiliser le bouton "Générer un mot de passe aléatoire" pour créer un mot de passe sécurisé automatiquement

**⚠️ Important :**
- Notez bien le nouveau mot de passe avant de valider
- Communiquez-le à votre enfant de manière sécurisée
- L'enfant devra utiliser ce nouveau mot de passe lors de sa prochaine connexion

### 3. Mettre à jour le téléphone de contact
Les parents peuvent modifier le numéro de téléphone de contact de l'enfant.

**Étapes :**
1. Ouvrir le modal de gestion de l'enfant (icône ⚙️)
2. Rester sur l'onglet "Informations"
3. Modifier le champ "Téléphone de contact"
4. Cliquer sur "Enregistrer"

## Sécurité

### Vérifications en place
✅ Seuls les parents peuvent gérer leurs propres enfants  
✅ Vérification de la relation parent-enfant dans la base de données  
✅ Exigence d'un mot de passe de minimum 8 caractères  
✅ Confirmation du mot de passe obligatoire  

### Bonnes pratiques
- 📌 Créez des mots de passe forts mélangeant lettres, chiffres et caractères spéciaux
- 📌 Ne partagez jamais les mots de passe par SMS non crypté
- 📌 Encouragez votre enfant à changer son mot de passe régulièrement
- 📌 Notez les mots de passe dans un endroit sûr

## Interface utilisateur

### Bouton de gestion
Le bouton de gestion (⚙️) apparaît en haut à droite de chaque carte d'enfant au survol.

### Modal de gestion
Le modal s'ouvre avec deux onglets :
- **Informations** : Voir et modifier les informations basiques
- **Mot de passe** : Changer le mot de passe de connexion

## Prérequis techniques

### Pour utiliser la fonctionnalité complète
La modification de mot de passe nécessite le déploiement d'une fonction Supabase Edge Function.

**Si la fonction n'est pas déployée :**
- Le système affichera un message informatif
- Les parents pourront noter le mot de passe souhaité
- Ils devront contacter l'établissement pour effectuer le changement

**Pour les administrateurs :**
Consultez le fichier `supabase/functions/update-student-password/README.md` pour les instructions de déploiement.

## Cas d'utilisation

### Scénario 1 : Enfant a oublié son mot de passe
1. Parent se connecte au dashboard
2. Ouvre le modal de gestion de l'enfant
3. Génère un nouveau mot de passe
4. Note le mot de passe
5. Le communique à l'enfant

### Scénario 2 : Changement de téléphone
1. Parent se connecte au dashboard
2. Ouvre le modal de gestion de l'enfant
3. Met à jour le numéro de téléphone
4. Enregistre les modifications

### Scénario 3 : Vérification des identifiants
1. Parent se connecte au dashboard
2. Ouvre le modal de gestion de l'enfant
3. Consulte l'email de connexion de l'enfant
4. Vérifie le matricule

## Support et assistance

### Problèmes courants

**Le bouton ⚙️ n'apparaît pas**
- Assurez-vous de survoler la carte de l'enfant avec la souris
- Sur mobile, le bouton peut être toujours visible

**Message "Service non disponible"**
- La fonction de changement de mot de passe n'est pas encore déployée
- Contactez l'établissement pour effectuer le changement
- Notez le mot de passe souhaité dans le message

**Erreur "Relation parent-enfant non trouvée"**
- Contactez l'établissement pour vérifier votre compte
- Il peut y avoir un problème de configuration

### Contact
Pour toute question ou problème, contactez :
- Le secrétariat de l'établissement
- L'administrateur système de EduTrack CM

## Évolutions futures
- 📧 Envoi automatique du nouveau mot de passe par email à l'enfant
- 📱 Authentification à deux facteurs
- 🔐 Historique des changements de mot de passe
- 👤 Gestion de la photo de profil de l'enfant
