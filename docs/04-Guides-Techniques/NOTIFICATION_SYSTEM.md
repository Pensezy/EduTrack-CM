# 📧 Système de Notifications - Configuration

## ✅ Fonctionnalités implémentées

### 1. **Sauvegarde dans Supabase** ✓
- Table `notifications` créée avec toutes les colonnes nécessaires
- Policies RLS configurées pour sécurité
- Historique complet des notifications envoyées

### 2. **Envoi d'emails via EmailJS** ✓
- Fonction `sendBulkNotification` pour envoi en masse
- Support de tous les types de destinataires (parents, élèves, enseignants, staff, tous)
- Limitation à 10 emails par envoi pour éviter le spam

### 3. **Interface complète** ✓
- Formulaire de création de notification
- Affichage des notifications récentes
- Mode démo et production
- Loading states et feedback utilisateur

## 🚀 Pour activer le système

### Étape 1: Créer la table dans Supabase

1. Allez dans Supabase → SQL Editor
2. Copiez le contenu de `database/migrations/20251201_create_notifications_table.sql`
3. Exécutez la requête
4. Vérifiez que la table `notifications` existe

### Étape 2: Configurer EmailJS (optionnel mais recommandé)

1. **Créer un compte EmailJS** : https://www.emailjs.com/
2. **Ajouter un service email** (Gmail, Outlook, etc.)
3. **Créer un template** nommé `template_notification` avec ces variables :
   ```
   {{to_email}}
   {{to_name}}
   {{notification_title}}
   {{notification_message}}
   {{priority}}
   {{type}}
   {{school_name}}
   {{sender_name}}
   {{target_group}}
   ```

4. **Récupérer vos clés** dans le Dashboard EmailJS

5. **Ajouter dans votre fichier `.env`** :
   ```env
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_default
   VITE_EMAILJS_PUBLIC_KEY=votre_cle_publique
   ```

6. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

### Étape 3: Tester le système

1. Connectez-vous avec un compte principal
2. Allez dans "Nouveau message" (sidebar)
3. Remplissez le formulaire :
   - Titre
   - Message
   - Destinataires (all, parents, students, teachers, staff)
   - Priorité (low, normal, high, urgent)
   - Type (info, success, warning, error)
4. Cliquez sur "Envoyer la Notification"

## 📊 Ce qui se passe lors de l'envoi

1. **Validation** des champs obligatoires
2. **Récupération des destinataires** depuis Supabase selon le target sélectionné
3. **Sauvegarde de la notification** dans la table `notifications`
4. **Envoi d'emails** (si EmailJS est configuré) aux 10 premiers destinataires
5. **Affichage du résultat** avec nombre d'emails envoyés
6. **Rechargement de la liste** des notifications récentes

## 🔧 Fonctionnement sans EmailJS

Si EmailJS n'est pas configuré :
- ✅ Les notifications sont quand même **sauvegardées dans Supabase**
- ✅ L'historique est **consultable** dans l'interface
- ❌ Aucun email n'est envoyé
- ℹ️ Message affiché : "Service d'email non configuré"

## 📝 Structure de la table `notifications`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique |
| `school_id` | UUID | École émettrice |
| `sender_id` | UUID | Utilisateur émetteur |
| `title` | TEXT | Titre de la notification |
| `message` | TEXT | Contenu du message |
| `target` | TEXT | Destinataires (all, parents, students, teachers, staff) |
| `priority` | TEXT | Priorité (low, normal, high, urgent) |
| `type` | TEXT | Type (info, success, warning, error) |
| `status` | TEXT | Statut (draft, sent, failed) |
| `sent_at` | TIMESTAMP | Date d'envoi |
| `recipients_count` | INTEGER | Nombre de destinataires |

## 🎯 Prochaines améliorations possibles

- [ ] Notification push in-app
- [ ] Templates de messages prédéfinis
- [ ] Planification d'envoi différé
- [ ] Statistiques d'ouverture
- [ ] Pièces jointes
- [ ] Envoi par SMS (via Twilio)

## 🆘 Dépannage

### Les emails ne s'envoient pas
- Vérifiez que les clés EmailJS sont correctes dans `.env`
- Vérifiez que le template `template_notification` existe
- Regardez la console du navigateur pour les erreurs

### La notification ne se sauvegarde pas
- Vérifiez que la table `notifications` existe dans Supabase
- Vérifiez les policies RLS
- Vérifiez que l'utilisateur a un `current_school_id`

### Aucun destinataire trouvé
- Vérifiez qu'il y a des utilisateurs actifs (`is_active = true`) dans la table ciblée
- Vérifiez que les utilisateurs ont des emails renseignés

## ✅ Validation

Pour confirmer que tout fonctionne :

1. ✓ La table `notifications` existe dans Supabase
2. ✓ Les clés EmailJS sont dans `.env` (optionnel)
3. ✓ Le bouton "Nouveau message" fonctionne
4. ✓ Le formulaire de notification s'affiche
5. ✓ L'envoi enregistre dans Supabase
6. ✓ Les notifications récentes s'affichent
7. ✓ Les emails sont envoyés (si EmailJS configuré)
