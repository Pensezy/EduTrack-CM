# Guide : Système de Demandes d'Accès aux Applications

**Date :** 2 janvier 2026
**Version :** 2.4.0
**Fonctionnalité :** Workflow de demandes d'accès aux applications

---

## 🎯 Vue d'Ensemble

Le système de demandes d'accès permet aux directeurs de **demander** l'activation d'une application pour leur école. L'administrateur doit ensuite **approuver ou rejeter** la demande.

### Avant vs Après

| Aspect | Avant (v2.3) | Après (v2.4) |
|--------|--------------|--------------|
| **Activation** | Directeur active immédiatement | Directeur fait une demande |
| **Validation** | Aucune | Admin approuve/rejette |
| **Apps disponibles** | Toutes | Seulement ready et beta |
| **Traçabilité** | Non | Oui (qui, quand, pourquoi) |

---

## 📋 Workflow Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DIRECTEUR : Demande d'Accès                             │
├─────────────────────────────────────────────────────────────┤
│ - Va sur "App Store"                                        │
│ - Sélectionne une app (ready ou beta uniquement)           │
│ - Clique "Demander l'accès"                                 │
│ - Peut ajouter un message expliquant la demande            │
│ - Statut : "En attente de validation"                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN : Notification                                     │
├─────────────────────────────────────────────────────────────┤
│ - Badge "X demandes" sur Dashboard                          │
│ - Menu "Demandes d'Accès" (nouveau)                         │
│ - Voit : École, App, Directeur, Message, Date              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ADMIN : Décision                                         │
├─────────────────────────────────────────────────────────────┤
│ Option A : APPROUVER                                        │
│   → Crée automatiquement l'abonnement (1 an)               │
│   → École peut utiliser l'app immédiatement                │
│   → Demande marquée "Approuvée"                             │
│                                                             │
│ Option B : REJETER                                          │
│   → Demande marquée "Rejetée"                               │
│   → Peut ajouter un message expliquant le rejet            │
│   → École ne peut pas utiliser l'app                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DIRECTEUR : Notification du Résultat                     │
├─────────────────────────────────────────────────────────────┤
│ - Voit le statut dans "Mes Demandes"                        │
│ - Si approuvé : App apparaît dans "Mes Apps"                │
│ - Si rejeté : Peut voir le message de l'admin               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Structure de la Base de Données

### Table `app_access_requests`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID unique de la demande |
| `school_id` | UUID | École qui demande |
| `app_id` | TEXT | Application demandée |
| `requested_by` | UUID | Directeur qui a fait la demande |
| `status` | TEXT | pending, approved, rejected |
| `request_message` | TEXT | Message du directeur (optionnel) |
| `reviewed_by` | UUID | Admin qui a traité la demande |
| `review_message` | TEXT | Réponse de l'admin |
| `reviewed_at` | TIMESTAMPTZ | Date de traitement |
| `created_at` | TIMESTAMPTZ | Date de la demande |

### Contraintes

- **Unicité** : Une seule demande pending par couple (école, app)
- **Apps éligibles** : Seulement `development_status IN ('ready', 'beta')`
- **RLS** : Directeurs voient seulement leurs demandes, admins voient tout

---

## 🚀 Installation

### Étape 1 : Appliquer la Migration

1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Menu **SQL Editor** → **New Query**
4. Copier le contenu de : `supabase/migrations/20260102_app_access_request_system.sql`
5. Cliquer **Run**

**Résultat attendu :**

```
═══════════════════════════════════════════════════════
✅ SYSTÈME DE DEMANDES D'ACCÈS AUX APPLICATIONS
═══════════════════════════════════════════════════════

📋 Table créée:
   - app_access_requests (avec RLS)

🔧 Fonctions créées:
   - approve_app_request(request_id, admin_id, message)
   - reject_app_request(request_id, admin_id, message)

👁️  Vue créée:
   - v_app_access_requests (détails complets)

✅ Migration terminée avec succès!
```

### Étape 2 : Mettre à Jour le Frontend

Les fichiers suivants seront modifiés :

1. **AppStorePage.jsx** - Bouton "Activer" → "Demander l'accès"
2. **MyAppsPage.jsx** - Afficher statut des demandes
3. **AdminDashboard.jsx** - Ajouter compteur de demandes
4. **Sidebar.jsx** - Ajouter menu "Demandes d'Accès"
5. **AppAccessRequestsPage.jsx** (nouveau) - Gérer les demandes

---

## 📖 Utilisation Directeur

### Demander l'Accès à une App

1. **Connexion** : Se connecter en tant que directeur
2. **App Store** : Cliquer sur "App Store" dans le menu
3. **Sélectionner** : Trouver l'app souhaitée (badge ✅ Prêt ou 🧪 Beta)
4. **Demander** : Cliquer "Demander l'accès"
5. **Message** (optionnel) : Expliquer pourquoi cette app est nécessaire
6. **Envoyer** : Confirmer la demande

**Indication affichée :**

> ⏳ **Demande envoyée**
> Votre demande d'accès a été envoyée à l'administrateur. Vous serez notifié une fois qu'elle sera traitée.

### Suivre ses Demandes

1. **Mes Apps** : Cliquer sur "Mes Apps"
2. **Onglet "Demandes"** : Voir toutes les demandes
3. **Statuts** :
   - 🟡 **En attente** : Pas encore traitée
   - 🟢 **Approuvée** : App activée
   - 🔴 **Rejetée** : Voir le message de l'admin

---

## 📖 Utilisation Admin

### Voir les Demandes en Attente

1. **Connexion** : Se connecter en tant qu'admin
2. **Dashboard** : Voir badge "X demandes en attente"
3. **Menu** : Cliquer "Demandes d'Accès"
4. **Filtrer** : Par statut (pending, approved, rejected)

### Approuver une Demande

1. **Cliquer** : Sur la demande souhaitée
2. **Vérifier** : École, App, Message du directeur
3. **Approuver** : Cliquer "✅ Approuver"
4. **Message** (optionnel) : Ajouter un commentaire
5. **Confirmer** : L'abonnement est créé automatiquement

**Résultat :**
- Statut → `approved`
- Abonnement créé avec `expires_at = now() + 1 an`
- Directeur peut utiliser l'app immédiatement

### Rejeter une Demande

1. **Cliquer** : Sur la demande souhaitée
2. **Rejeter** : Cliquer "❌ Rejeter"
3. **Message** (obligatoire) : Expliquer pourquoi
4. **Confirmer** : La demande est marquée rejetée

**Exemples de messages de rejet :**
- "Budget insuffisant pour le moment"
- "Cette app ne correspond pas à votre type d'établissement"
- "Veuillez d'abord former vos enseignants sur les apps actuelles"

---

## 🔐 Permissions et Sécurité

### Directeurs

✅ **PEUT** :
- Voir ses propres demandes
- Créer des demandes pour son école (apps ready/beta uniquement)
- Annuler une demande en attente

❌ **NE PEUT PAS** :
- Voir les demandes d'autres écoles
- Demander des apps en développement
- Approuver/rejeter des demandes
- Créer directement un abonnement

### Admins

✅ **PEUT** :
- Voir toutes les demandes de toutes les écoles
- Approuver/rejeter n'importe quelle demande
- Voir l'historique complet (qui, quand, pourquoi)
- Supprimer des demandes

---

## 🎨 Composants Frontend

### AppStorePage (Directeur)

**Avant :**
```jsx
<button onClick={() => activateApp(app.id)}>
  Activer maintenant
</button>
```

**Après :**
```jsx
<button onClick={() => requestAppAccess(app.id)}>
  Demander l'accès
</button>

{app.development_status === 'in_development' && (
  <p className="text-xs text-gray-500">
    🚧 En développement - Pas encore disponible
  </p>
)}
```

### MyAppsPage (Directeur)

**Nouvel onglet "Demandes" :**
```jsx
<div className="space-y-4">
  {requests.map(request => (
    <div key={request.id} className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4>{request.app_name}</h4>
          <p className="text-sm text-gray-600">{request.request_message}</p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      {request.status === 'rejected' && (
        <div className="mt-2 p-2 bg-red-50 rounded">
          <p className="text-xs text-red-800">
            Raison: {request.review_message}
          </p>
        </div>
      )}
    </div>
  ))}
</div>
```

### AppAccessRequestsPage (Admin - Nouveau)

**Liste des demandes :**
```jsx
<div className="space-y-4">
  {requests.map(request => (
    <div key={request.id} className="border rounded-lg p-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <h3>{request.school_name}</h3>
          <p className="text-sm text-gray-600">
            Demande: {request.app_name}
          </p>
          <p className="text-xs text-gray-500">
            Par {request.requester_name} le {formatDate(request.created_at)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Message du directeur */}
      {request.request_message && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm">{request.request_message}</p>
        </div>
      )}

      {/* Actions */}
      {request.status === 'pending' && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleApprove(request.id)}
            className="btn-success"
          >
            ✅ Approuver
          </button>
          <button
            onClick={() => handleReject(request.id)}
            className="btn-danger"
          >
            ❌ Rejeter
          </button>
        </div>
      )}
    </div>
  ))}
</div>
```

---

## 🧪 Tests de Validation

### Test 1 : Demande par Directeur ✅

```
1. Connexion : directeur@ecole.cm
2. Menu "App Store"
3. Chercher app avec badge ✅ Prêt ou 🧪 Beta
4. Vérifier : Bouton = "Demander l'accès" (pas "Activer")
5. Cliquer "Demander l'accès"
6. Remplir message : "Besoin pour gestion académique"
7. Envoyer
8. Vérifier : Message "Demande envoyée"
9. Vérifier DB : SELECT * FROM app_access_requests WHERE requested_by = [id directeur]
   → status = 'pending'
```

### Test 2 : Impossible de Demander App En Dev ❌

```
1. Connexion : directeur@ecole.cm
2. App Store
3. Chercher app avec badge 🚧 En Dev
4. Vérifier : Bouton = "Non disponible" (grisé)
5. Message : "Cette application est en cours de développement"
```

### Test 3 : Admin Approuve Demande ✅

```
1. Connexion : admin@edutrack.cm
2. Dashboard : Voir badge "1 demande en attente"
3. Menu "Demandes d'Accès"
4. Voir la demande : École X, App Y, Message Z
5. Cliquer "Approuver"
6. Ajouter message : "Demande approuvée, bonne utilisation !"
7. Confirmer
8. Vérifier DB :
   - app_access_requests : status = 'approved', reviewed_by = [admin id]
   - school_subscriptions : Nouveau row avec status = 'active'
9. Reconnecter en tant que directeur
10. Vérifier "Mes Apps" : App Y apparaît
```

### Test 4 : Admin Rejette Demande ❌

```
1. Connexion : admin@edutrack.cm
2. Demandes d'Accès
3. Sélectionner une demande
4. Cliquer "Rejeter"
5. Ajouter message : "Budget insuffisant cette année"
6. Confirmer
7. Vérifier DB : status = 'rejected'
8. Reconnecter en tant que directeur
9. Mes Apps → Onglet Demandes
10. Voir demande rejetée avec message de l'admin
```

---

## ❌ Dépannage

### Erreur : "Table app_access_requests does not exist"

**Cause :** Migration non appliquée.
**Solution :** Appliquer `20260102_app_access_request_system.sql`

### Erreur : "Permission denied for table app_access_requests"

**Cause :** Politiques RLS bloquent l'accès.
**Solution :**
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'app_access_requests';

-- Doit retourner 6 politiques:
-- - app_requests_select_principal
-- - app_requests_insert_principal
-- - app_requests_update_principal
-- - app_requests_select_admin
-- - app_requests_update_admin
-- - app_requests_delete_admin
```

### Directeur Peut Demander App En Dev

**Cause :** Contrainte CHECK manquante.
**Solution :**
```sql
-- Vérifier la politique INSERT
SELECT * FROM pg_policies
WHERE tablename = 'app_access_requests'
  AND policyname = 'app_requests_insert_principal';

-- with_check doit contenir:
-- AND apps.development_status IN ('ready', 'beta')
```

### Compteur de Demandes N'apparaît Pas

**Cause :** Dashboard pas encore mis à jour.
**Solution :** Vérifier que `DashboardPage.jsx` charge :
```jsx
const { data: pendingRequests } = useQuery({
  queryKey: ['pending-app-requests'],
  queryFn: async () => {
    const { data } = await supabase
      .from('app_access_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    return data;
  }
});
```

---

## 📊 Fonctions SQL Disponibles

### `approve_app_request(request_id, admin_id, message)`

**Description :** Approuve une demande et crée l'abonnement automatiquement.

**Exemple :**
```sql
SELECT approve_app_request(
  'uuid-de-la-demande',
  'uuid-de-ladmin',
  'Demande approuvée, formation prévue le 15/01'
);

-- Retourne:
{
  "success": true,
  "request_id": "...",
  "subscription_id": "...",
  "message": "Demande approuvée et abonnement créé"
}
```

### `reject_app_request(request_id, admin_id, message)`

**Description :** Rejette une demande avec un message.

**Exemple :**
```sql
SELECT reject_app_request(
  'uuid-de-la-demande',
  'uuid-de-ladmin',
  'Budget insuffisant pour cette année scolaire'
);

-- Retourne:
{
  "success": true,
  "request_id": "...",
  "message": "Demande rejetée"
}
```

---

## 📝 Changelog

| Date | Version | Modification |
|------|---------|--------------|
| 2026-01-02 | 2.4.0 | Système de demandes d'accès créé |
| 2026-01-02 | 2.4.0 | Restrictions apps en dev |
| 2026-01-02 | 2.4.0 | Workflow approbation/rejet |

---

**Auteur :** Claude Sonnet 4.5
**Date :** 2 janvier 2026
**Statut :** ✅ Migration prête, Frontend en cours
**Prochaine Étape :** Modifier AppStorePage pour utiliser le système de demandes
