# 🔧 Correction - Gestion des Erreurs d'Abonnement

## ❌ Problèmes Identifiés

### 1. **Erreur 500 lors de la création d'une secrétaire sans abonnement payant**

**Erreur rencontrée:**
```
POST https://lbqwbnclknwszdnlxaxz.supabase.co/functions/v1/create-staff-account 500 (Internal Server Error)

Error: Erreur création users: Les comptes secrétaires ne sont pas disponibles avec App Core gratuite. Souscrivez à App Académique (75 000 FCFA/an) pour débloquer cette fonctionnalité.
```

**Problème:**
- L'erreur de limitation d'abonnement retournée par l'Edge Function (500) n'était pas gérée visuellement
- L'utilisateur voyait juste un message d'erreur rouge sans possibilité d'action
- Pas de redirection vers l'App Store pour souscrire

### 2. **Redirection incorrecte dans SchoolRequestModal**

**Problème:**
- Le bouton "Voir les packs disponibles" redirige vers `/bundles`
- Cette route n'existe pas (la bonne route est `/app-store` ou `/bundles-catalog`)
- Résultat: L'utilisateur est envoyé au dashboard au lieu de la page des packs

---

## ✅ Solutions Implémentées

### 1. **Correction de la redirection SchoolRequestModal**

**Fichier:** `apps/admin/src/pages/Schools/components/SchoolRequestModal.jsx`

**Ligne 209:** Changement du href

**Avant:**
```jsx
<a
  href="/bundles"  // ❌ Route inexistante
  className="..."
>
  Voir les packs disponibles
</a>
```

**Après:**
```jsx
<a
  href="/app-store"  // ✅ Route correcte
  className="..."
>
  Voir les packs disponibles
</a>
```

---

### 2. **Gestion des erreurs d'abonnement dans SecretaryFormModal**

**Fichier:** `apps/admin/src/pages/Users/components/SecretaryFormModal.jsx`

#### A. Ajout d'un state pour détecter les erreurs d'abonnement

**Ligne 16:**
```javascript
const [subscriptionError, setSubscriptionError] = useState(false);
```

#### B. Détection de l'erreur lors de la soumission

**Lignes 184-196:**
```javascript
} catch (err) {
  console.error('Error saving secretary:', err);
  const errorMessage = err.message || 'Erreur lors de l\'enregistrement';

  // Détecter si c'est une erreur de limitation d'abonnement
  if (errorMessage.includes('App Core gratuite') ||
      errorMessage.includes('App Académique') ||
      errorMessage.includes('secrétaires ne sont pas disponibles')) {
    setSubscriptionError(true);  // ✅ Marquer comme erreur d'abonnement
    setError(errorMessage);
  } else {
    setError(errorMessage);  // Erreur normale
  }
}
```

**Logique:**
- Si le message d'erreur contient des mots-clés liés à l'abonnement
- Alors on active `subscriptionError = true`
- Sinon, c'est une erreur classique

#### C. Affichage du modal de blocage avec redirection

**Lignes 353-371:**
```jsx
{/* Modal de blocage si erreur d'abonnement */}
{subscriptionError ? (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-red-800 mb-2">Abonnement requis</p>
      <p className="text-sm text-red-700 mb-3">{error}</p>
      <a
        href="/app-store"
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
      >
        Voir les packs disponibles
      </a>
    </div>
  </div>
) : error ? (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-800">{error}</p>
  </div>
) : null}
```

**Fonctionnement:**
- Si `subscriptionError === true` → Affiche le bloc rouge avec bouton de redirection
- Sinon si `error` existe → Affiche un message d'erreur simple
- Sinon → Rien (formulaire normal)

#### D. Réinitialisation lors de la fermeture/ouverture

**Ligne 62:**
```javascript
setSubscriptionError(false);
```

Ajout dans le useEffect pour réinitialiser le state à chaque ouverture du modal.

---

## 🎨 Interface Avant/Après

### Avant

```
┌────────────────────────────────────────────────┐
│  Nouvelle secrétaire                     [X]   │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ ❌ Erreur création users: Les comptes    │ │
│  │    secrétaires ne sont pas disponibles   │ │
│  │    avec App Core gratuite. Souscrivez à  │ │
│  │    App Académique (75 000 FCFA/an)...    │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Formulaire toujours visible mais bloqué]    │
│  Nom: _____________________                    │
│  Email: ___________________                    │
│  ...                                           │
│                                                │
│  [Annuler]  [Créer la secrétaire]             │
└────────────────────────────────────────────────┘
```
❌ **Problème:** Pas de solution proposée, utilisateur bloqué

---

### Après

```
┌────────────────────────────────────────────────┐
│  Nouvelle secrétaire                     [X]   │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  ⚠️  Abonnement requis                   │ │
│  │                                          │ │
│  │  Les comptes secrétaires ne sont pas    │ │
│  │  disponibles avec App Core gratuite.    │ │
│  │  Souscrivez à App Académique (75 000    │ │
│  │  FCFA/an) pour débloquer cette           │ │
│  │  fonctionnalité.                         │ │
│  │                                          │ │
│  │  [Voir les packs disponibles]           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Formulaire toujours visible]                │
│  Nom: _____________________                    │
│  Email: ___________________                    │
│  ...                                           │
│                                                │
│  [Annuler]  [Créer la secrétaire]             │
└────────────────────────────────────────────────┘
```
✅ **Solution:** Bouton clair qui redirige vers `/app-store`

---

## 🔄 Workflow Utilisateur

### Scénario: Directeur avec App Core essaie de créer une secrétaire

```
1. Directeur clique "Nouvelle secrétaire"
   ↓
2. Modal s'ouvre avec formulaire
   ↓
3. Directeur remplit:
   - Nom: Sophie MBARGA
   - Email: sophie@ecole.cm
   - Téléphone: +237 690 XX XX XX
   ↓
4. Directeur clique "Créer la secrétaire"
   ↓
5. Edge Function vérifie abonnement
   ├─ App Core détecté
   └─ Retourne erreur 500 avec message
       ↓
6. Frontend détecte mots-clés dans l'erreur
   └─ Active subscriptionError = true
       ↓
7. Affichage du bloc rouge avec:
   - ⚠️ Titre: "Abonnement requis"
   - Message complet de l'Edge Function
   - Bouton: "Voir les packs disponibles"
       ↓
8. Directeur clique sur le bouton
   ↓
9. Redirection vers /app-store
   ↓
10. Directeur peut souscrire à App Académique
```

---

## 📝 Fichiers Modifiés

### 1. **SchoolRequestModal.jsx**
**Localisation:** `apps/admin/src/pages/Schools/components/SchoolRequestModal.jsx`

**Ligne modifiée:** 209

**Changement:**
```diff
- href="/bundles"
+ href="/app-store"
```

---

### 2. **SecretaryFormModal.jsx**
**Localisation:** `apps/admin/src/pages/Users/components/SecretaryFormModal.jsx`

**Lignes modifiées:**

| Ligne | Changement |
|-------|------------|
| 16    | Ajout state `subscriptionError` |
| 62    | Réinitialisation `setSubscriptionError(false)` |
| 184-196 | Détection erreur abonnement dans catch block |
| 353-371 | Affichage conditionnel du modal de blocage |

**Résumé:**
- +1 state (subscriptionError)
- +1 réinitialisation (ligne 62)
- +15 lignes logique de détection (lignes 184-196)
- +19 lignes affichage modal blocage (lignes 353-371)

**Total:** ~35 lignes ajoutées/modifiées

---

## 🧪 Tests Recommandés

### Test 1: Création secrétaire avec App Core (Blocage)
- [ ] Se connecter en tant que directeur avec uniquement App Core
- [ ] Cliquer sur "Personnel" → "Secrétaire"
- [ ] Remplir le formulaire
- [ ] Cliquer "Créer la secrétaire"
- [ ] Vérifier affichage du bloc rouge avec:
  - ✅ Titre "Abonnement requis"
  - ✅ Message expliquant la limitation
  - ✅ Bouton "Voir les packs disponibles"
- [ ] Cliquer sur le bouton
- [ ] Vérifier redirection vers `/app-store` (et non vers dashboard)

### Test 2: Création secrétaire avec App Académique (Succès)
- [ ] Directeur avec App Académique active
- [ ] Remplir formulaire secrétaire
- [ ] Cliquer "Créer la secrétaire"
- [ ] Vérifier:
  - ✅ Pas d'erreur d'abonnement
  - ✅ Écran de confirmation avec identifiants
  - ✅ Secrétaire créée dans la BDD

### Test 3: Redirection SchoolRequestModal
- [ ] Se connecter en tant que directeur avec App Core
- [ ] Cliquer "Demander un Établissement"
- [ ] Vérifier affichage du message d'erreur d'abonnement
- [ ] Cliquer "Voir les packs disponibles"
- [ ] Vérifier redirection vers `/app-store` (pas dashboard)

### Test 4: Autres erreurs (non-abonnement)
- [ ] Provoquer une erreur différente (ex: email déjà utilisé)
- [ ] Vérifier que le bloc de redirection n'apparaît PAS
- [ ] Vérifier affichage d'une simple erreur rouge

---

## 💡 Améliorations Futures (Optionnelles)

### 1. Vérification Proactive de l'Abonnement
Au lieu d'attendre l'erreur de l'Edge Function, vérifier l'abonnement AVANT d'afficher le formulaire:

```javascript
useEffect(() => {
  if (isOpen && !isEditing) {
    checkSubscription();
  }
}, [isOpen, isEditing]);

const checkSubscription = async () => {
  const supabase = getSupabaseClient();
  const { data: subs } = await supabase
    .from('school_subscriptions')
    .select('app_id')
    .eq('school_id', currentUser.current_school_id)
    .in('status', ['trial', 'active']);

  const hasAcademic = subs?.some(s => s.app_id === 'academic');

  if (!hasAcademic) {
    setSubscriptionError(true);
    setError('Les comptes secrétaires nécessitent App Académique...');
  }
};
```

**Avantages:**
- Pas besoin de soumettre le formulaire pour voir l'erreur
- L'utilisateur sait immédiatement qu'il doit souscrire
- Évite un appel inutile à l'Edge Function

### 2. Désactiver le Bouton de Soumission
Quand `subscriptionError === true`, désactiver le bouton "Créer la secrétaire":

```jsx
<button
  type="submit"
  disabled={loading || subscriptionError}  // ✅ Ajout
  className="..."
>
  {loading ? 'Enregistrement...' : 'Créer la secrétaire'}
</button>
```

### 3. Masquer le Formulaire en Cas d'Erreur d'Abonnement
Au lieu d'afficher le formulaire + erreur, afficher uniquement l'erreur:

```jsx
{subscriptionError ? (
  <div className="p-6">
    {/* Bloc d'erreur uniquement */}
  </div>
) : (
  <form onSubmit={handleSubmit}>
    {/* Formulaire complet */}
  </form>
)}
```

---

## 🔗 Cohérence avec les Autres Modals

Cette correction aligne le comportement de `SecretaryFormModal` avec celui de `SchoolRequestModal`:

| Modal | Vérification | Affichage Erreur | Redirection |
|-------|--------------|------------------|-------------|
| SchoolRequestModal | ✅ Proactive (avant formulaire) | ✅ Bloc rouge + bouton | ✅ /app-store |
| SecretaryFormModal | ✅ Réactive (après soumission) | ✅ Bloc rouge + bouton | ✅ /app-store |

**Note:** On pourrait rendre SecretaryFormModal proactif comme SchoolRequestModal (voir "Améliorations Futures").

---

## 📋 Récapitulatif

### ✅ Problèmes Résolus
1. ✅ Redirection `/bundles` → `/app-store` dans SchoolRequestModal
2. ✅ Détection des erreurs d'abonnement dans SecretaryFormModal
3. ✅ Affichage d'un modal de blocage clair avec action
4. ✅ Redirection vers `/app-store` pour souscrire

### 📁 Fichiers Modifiés (2)
1. `apps/admin/src/pages/Schools/components/SchoolRequestModal.jsx` (1 ligne)
2. `apps/admin/src/pages/Users/components/SecretaryFormModal.jsx` (~35 lignes)

### 🎯 Impact Utilisateur
- **Avant:** Message d'erreur cryptique, aucune solution proposée
- **Après:** Message clair + bouton d'action pour souscrire → UX améliorée

---

**Date:** 04 Janvier 2026
**Version:** 2.5.1
**Statut:** ✅ COMPLÉTÉ
