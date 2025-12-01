# Récapitulatif Technique : Gestion des Enfants par les Parents

## Date de développement
**Date :** Décembre 2024  
**Version :** 1.0  
**Statut :** ✅ Implémenté (Edge Function à déployer)

## Objectif
Permettre aux parents de gérer les informations de connexion de leurs enfants (mot de passe, téléphone) directement depuis leur dashboard, sans passer par le principal ou le secrétariat.

---

## Composants créés

### 1. ManageChildModal.jsx
**Chemin :** `src/pages/parent-dashboard/components/ManageChildModal.jsx`

**Description :** Modal avec deux onglets pour gérer un enfant

**Props :**
- `child` (Object) : Objet enfant contenant :
  - `user_id` : UUID de l'utilisateur (requis pour changement mdp)
  - `full_name` : Nom complet
  - `matricule` : Matricule de l'élève
  - `class_name` : Nom de la classe
  - `email` : Email de connexion
  - `phone` : Téléphone de contact
- `isOpen` (Boolean) : État d'ouverture du modal
- `onClose` (Function) : Callback de fermeture
- `onUpdate` (Function) : Callback après modification réussie

**Fonctionnalités :**
- Onglet "Informations" :
  - Affichage lecture seule : nom, matricule, classe, email
  - Modification téléphone avec sauvegarde dans `users.phone`
- Onglet "Mot de passe" :
  - Saisie nouveau mot de passe avec confirmation
  - Validation min 8 caractères
  - Toggle affichage/masquage
  - Générateur de mot de passe aléatoire
  - Appel Edge Function pour modification sécurisée

**Dépendances :**
- `Icon` component
- `Button` component
- `Input` component
- `supabase` client

---

### 2. ChildSelector.jsx (modifié)
**Chemin :** `src/pages/parent-dashboard/components/ChildSelector.jsx`

**Modifications :**
- Ajout prop `onManageChild` (Function)
- Ajout bouton ⚙️ Settings en haut à droite de chaque carte
- Le bouton apparaît au survol (opacity-0 → opacity-100 group-hover)
- Appel `onManageChild(child)` avec stopPropagation

---

### 3. Parent Dashboard index.jsx (modifié)
**Chemin :** `src/pages/parent-dashboard/index.jsx`

**Modifications :**
- Import `ManageChildModal`
- Ajout state `managingChild` pour le modal
- Transformation des données enfant pour inclure :
  - `user_id`
  - `full_name`
  - `class_name`
  - `email`
  - `phone`
- Passage de `onManageChild={(child) => setManagingChild(child)}` aux ChildSelector
- Rendu du modal en bas du composant

---

## Backend : Edge Function

### 4. update-student-password Edge Function
**Chemin :** `supabase/functions/update-student-password/index.ts`

**Endpoint :** `POST /functions/v1/update-student-password`

**Request Body :**
```json
{
  "student_user_id": "uuid",
  "new_password": "string (min 8 chars)",
  "parent_user_id": "uuid"
}
```

**Process :**
1. Validation des paramètres
2. Récupération relation dans `parent_students`
3. Vérification que `parent_id` correspond au `parent_user_id`
4. Mise à jour via `supabase.auth.admin.updateUserById()`

**Sécurité :**
- Utilise `SUPABASE_SERVICE_ROLE_KEY`
- Vérifie relation parent-enfant
- Validation longueur mot de passe

**Responses :**
- 200 : `{ success: true, message: "...", user_id: "..." }`
- 400 : Paramètres manquants ou invalides
- 403 : Relation non trouvée
- 500 : Erreur serveur

**État actuel :** ⚠️ Créé mais non déployé (besoin Supabase CLI)

---

### 5. verify_parent_student_relationship RPC (alternative)
**Chemin :** `supabase/functions/update_student_password_rpc.sql`

**Description :** Fonction PostgreSQL pour vérifier la relation parent-enfant

**Usage :**
```javascript
const { data, error } = await supabase.rpc('verify_parent_student_relationship', {
  p_parent_user_id: 'uuid',
  p_student_user_id: 'uuid'
});
```

**Limitation :** Ne peut pas modifier `auth.users` directement (besoin API Admin)

**État actuel :** ⚠️ Alternative documentée mais non recommandée

---

## Documentation

### 6. README Edge Function
**Chemin :** `supabase/functions/update-student-password/README.md`

**Contenu :**
- Description de la fonction
- Instructions de déploiement Supabase CLI
- Exemples d'utilisation frontend
- API documentation
- Tests curl
- Troubleshooting

---

### 7. Guide utilisateur
**Chemin :** `docs/PARENT_CHILD_MANAGEMENT.md`

**Contenu :**
- Guide pour les parents
- Étapes d'utilisation
- Bonnes pratiques sécurité
- Cas d'utilisation
- Support

---

## Flux de données

### Modification du téléphone
```
Parent Dashboard
  ↓
ManageChildModal (onUpdateInfo)
  ↓
supabase.from('users').update({ phone })
  ↓
Database users table
```

### Modification du mot de passe
```
Parent Dashboard
  ↓
ManageChildModal (onPasswordChange)
  ↓
fetch() → Edge Function update-student-password
  ↓
Edge Function vérifie parent_students
  ↓
supabase.auth.admin.updateUserById()
  ↓
Database auth.users table
```

---

## Tables impliquées

### users
- `id` : UUID (PK)
- `email` : Email de connexion
- `phone` : Téléphone de contact (modifiable)
- `is_active` : Statut du compte

### parents
- `id` : UUID (PK)
- `user_id` : FK vers users (UUID)
- `full_name` : Nom du parent
- `profession` : Profession (optional)
- `address` : Adresse (required)

### students
- `id` : UUID (PK)
- `user_id` : FK vers users (UUID)
- `registration_number` : Matricule
- `full_name` : Nom de l'élève
- `class_id` : FK vers classes

### parent_students
- `parent_id` : FK vers parents (UUID)
- `student_id` : FK vers students (UUID)
- **Clé composite** : (parent_id, student_id)

---

## Déploiement

### Étapes nécessaires

1. **Déployer la Edge Function** (Administrateur système)
```bash
supabase login
supabase link --project-ref your-ref
supabase functions deploy update-student-password
```

2. **Tester la fonction**
```bash
# Logs
supabase functions logs update-student-password

# Test curl
curl -X POST https://your-ref.supabase.co/functions/v1/update-student-password \
  -H "Authorization: Bearer TOKEN" \
  -H "apikey: ANON_KEY" \
  -d '{"student_user_id":"...","new_password":"...","parent_user_id":"..."}'
```

3. **Vérifier les variables d'environnement**
- `VITE_SUPABASE_URL` : URL du projet
- `VITE_SUPABASE_ANON_KEY` : Clé anon

---

## Tests à effectuer

### Test 1 : Vérifier relation parent-enfant
```sql
-- Dans Supabase SQL Editor
SELECT 
  p.full_name as parent,
  s.full_name as student,
  s.registration_number as matricule
FROM parent_students ps
JOIN parents p ON ps.parent_id = p.id
JOIN students s ON ps.student_id = s.id
WHERE p.user_id = 'uuid-du-parent';
```

### Test 2 : Vérifier user_id des étudiants
```sql
SELECT 
  s.full_name,
  s.registration_number,
  s.user_id,
  u.email
FROM students s
LEFT JOIN users u ON s.user_id = u.id
WHERE s.user_id IS NULL; -- Ne devrait rien retourner
```

### Test 3 : Workflow complet
1. Se connecter en tant que parent
2. Aller sur "Mes Enfants"
3. Survoler carte d'un enfant
4. Cliquer sur ⚙️
5. Onglet "Informations" : vérifier affichage
6. Modifier téléphone → Enregistrer → Vérifier DB
7. Onglet "Mot de passe" : saisir nouveau mdp
8. Générer mdp aléatoire → Vérifier affichage
9. Modifier → Vérifier message succès/erreur
10. Se déconnecter parent
11. Se connecter avec enfant + nouveau mdp
12. Vérifier connexion réussie

---

## Erreurs connues et solutions

### Erreur : "Service non disponible"
**Cause :** Edge Function non déployée  
**Solution :** Déployer via Supabase CLI ou contacter admin  
**Message utilisateur :** Guide pour contacter établissement

### Erreur : "Relation parent-enfant non trouvée"
**Cause :** Données incohérentes dans `parent_students`  
**Solution :** Vérifier avec SQL, recréer relation si nécessaire  
```sql
INSERT INTO parent_students (parent_id, student_id)
VALUES ('parent-uuid', 'student-uuid');
```

### Erreur : "CORS"
**Cause :** Headers manquants dans Edge Function  
**Solution :** Vérifier corsHeaders dans index.ts  

### Erreur : "Token invalide"
**Cause :** Session expirée  
**Solution :** Redemander connexion parent  

---

## Améliorations futures

### Court terme
- [ ] Notification par email à l'enfant lors du changement de mdp
- [ ] Historique des modifications
- [ ] Confirmation par popup améliorée

### Moyen terme
- [ ] Gestion photo de profil de l'enfant
- [ ] Modification autres infos (date naissance, allergies, etc.)
- [ ] Export PDF des identifiants

### Long terme
- [ ] Authentification à deux facteurs
- [ ] Délégation temporaire des droits
- [ ] Multi-signature pour modifications critiques

---

## Checklist de validation

- [x] Composant ManageChildModal créé
- [x] ChildSelector modifié avec bouton Settings
- [x] Parent dashboard intégré
- [x] Edge Function créée
- [x] Fonction RPC alternative documentée
- [x] Documentation technique complète
- [x] Guide utilisateur rédigé
- [ ] Edge Function déployée sur Supabase
- [ ] Tests manuels effectués
- [ ] Tests avec vrais comptes parents/élèves
- [ ] Validation sécurité

---

## Contact développement
Pour questions techniques sur cette fonctionnalité :
- Fichiers modifiés : voir section "Composants créés"
- Documentation : `docs/PARENT_CHILD_MANAGEMENT.md`
- Edge Function : `supabase/functions/update-student-password/`
