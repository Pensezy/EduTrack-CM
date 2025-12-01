# Edge Function : update-student-password

## Description
Cette fonction Supabase Edge Function permet aux parents de modifier le mot de passe de leurs enfants de manière sécurisée.

## Fonctionnalités
- ✅ Vérification de la relation parent-enfant
- ✅ Validation du mot de passe (minimum 8 caractères)
- ✅ Mise à jour sécurisée via l'API Admin Supabase
- ✅ Protection CORS pour les appels depuis le frontend

## Déploiement

### Prérequis
1. [Supabase CLI](https://supabase.com/docs/guides/cli) installé
2. Projet Supabase configuré
3. Accès aux credentials du projet

### Étapes

1. **Se connecter à Supabase**
```bash
supabase login
```

2. **Lier votre projet**
```bash
supabase link --project-ref your-project-ref
```

3. **Déployer la fonction**
```bash
supabase functions deploy update-student-password
```

4. **Vérifier le déploiement**
```bash
supabase functions list
```

### Variables d'environnement
Les variables suivantes sont automatiquement injectées par Supabase :
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé admin pour accéder à l'API

## Utilisation depuis le frontend

### Appel depuis React
```javascript
import { supabase } from './lib/supabase';

const changeStudentPassword = async (studentUserId, newPassword) => {
  // Récupérer la session courante
  const { data: { session } } = await supabase.auth.getSession();
  
  // Appeler la Edge Function
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-student-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        student_user_id: studentUserId,
        new_password: newPassword,
        parent_user_id: session.user.id
      })
    }
  );

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error);
  }
  
  return result;
};
```

## API Endpoint

### POST /update-student-password

#### Request Body
```json
{
  "student_user_id": "uuid-de-l-eleve",
  "new_password": "nouveauMotDePasse123",
  "parent_user_id": "uuid-du-parent"
}
```

#### Response Success (200)
```json
{
  "success": true,
  "message": "Mot de passe mis à jour avec succès",
  "user_id": "uuid-de-l-eleve"
}
```

#### Response Errors
- **400 Bad Request** : Paramètres manquants ou mot de passe trop court
- **403 Forbidden** : Pas de relation parent-enfant trouvée
- **500 Internal Server Error** : Erreur serveur

## Sécurité

### Vérifications effectuées
1. ✅ Validation des paramètres (student_user_id, new_password)
2. ✅ Vérification de la longueur du mot de passe (min 8 caractères)
3. ✅ Vérification de la relation parent-enfant dans `parent_students`
4. ✅ Vérification que le parent appelant est bien le parent autorisé
5. ✅ Utilisation de la clé service_role pour les opérations admin

### Permissions requises
- La fonction utilise `SUPABASE_SERVICE_ROLE_KEY` qui a tous les droits
- Le parent doit être authentifié (Bearer token)
- La relation parent-enfant doit exister dans `parent_students`

## Tests

### Test manuel avec curl
```bash
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/update-student-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "student_user_id": "uuid-eleve",
    "new_password": "TestPassword123",
    "parent_user_id": "uuid-parent"
  }'
```

### Test de la relation parent-enfant
```sql
-- Vérifier qu'une relation existe
SELECT * FROM parent_students 
WHERE parent_id = (SELECT id FROM parents WHERE user_id = 'uuid-parent')
AND student_id = 'uuid-eleve';
```

## Logs et Debug

### Voir les logs
```bash
supabase functions logs update-student-password
```

### Logs en temps réel
```bash
supabase functions logs update-student-password --follow
```

## Troubleshooting

### Erreur "Function not found"
- Vérifier que la fonction est bien déployée : `supabase functions list`
- Redéployer si nécessaire

### Erreur "CORS"
- Vérifier que les headers CORS sont bien configurés
- Vérifier que l'apikey est correcte

### Erreur "Unauthorized"
- Vérifier que le Bearer token est valide
- Vérifier que l'utilisateur est bien connecté

### Erreur "Relation parent-enfant non trouvée"
- Vérifier dans la table `parent_students` que la relation existe
- Vérifier que les UUID sont corrects

## Alternative : Fonction RPC PostgreSQL

Si vous ne souhaitez pas utiliser une Edge Function, une fonction RPC est disponible dans `update_student_password_rpc.sql`.

**Note** : Cette fonction ne peut que vérifier la relation, pas modifier le mot de passe directement. Le changement de mot de passe dans `auth.users` nécessite obligatoirement l'API Admin.

### Déployer la fonction RPC
```bash
psql -h db.your-project-ref.supabase.co -U postgres -d postgres -f supabase/functions/update_student_password_rpc.sql
```

### Utilisation
```javascript
const { data, error } = await supabase.rpc('verify_parent_student_relationship', {
  p_parent_user_id: parentUserId,
  p_student_user_id: studentUserId
});
```

## Support
Pour toute question ou problème, consultez la [documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions).
