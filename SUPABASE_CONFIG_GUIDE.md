# Guide de Configuration Supabase pour EduTrack-CM

## Problème : Email de confirmation obligatoire

### Solution 1 : Désactiver la confirmation d'email (Recommandé pour le développement)

1. **Accédez à votre dashboard Supabase** : https://app.supabase.com
2. **Sélectionnez votre projet** EduTrack-CM
3. **Allez dans Authentication > Settings**
4. **Décochez "Enable email confirmations"**
5. **Cliquez sur "Save"**

### Solution 2 : Configurer un template d'email personnalisé

1. **Allez dans Authentication > Email Templates**
2. **Sélectionnez "Confirm signup"**
3. **Personnalisez le message** pour votre école
4. **Ajoutez votre domaine** dans les URLs autorisées

### Solution 3 : Configuration avancée avec domaine personnalisé

```javascript
// Dans src/lib/supabase.js, ajoutez :
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Plus sécurisé
  }
});
```

### Solution 4 : Auto-confirmation en développement

Dans le dashboard Supabase, vous pouvez ajouter une politique RLS pour auto-confirmer les comptes :

```sql
-- Politique pour auto-confirmer les comptes principaux en développement
CREATE POLICY "Auto-confirm principals in dev" ON auth.users
FOR UPDATE USING (
  auth.role() = 'service_role' OR 
  (raw_user_meta_data->>'role' = 'principal' AND 
   email_confirmed_at IS NULL)
);
```

## Configuration recommandée pour la production

1. **Garder la confirmation d'email activée**
2. **Configurer un domaine d'email personnalisé**
3. **Personnaliser les templates d'email**
4. **Ajouter une page de confirmation réussie**

## Test du système

Après configuration :
1. Remplir le formulaire d'inscription
2. Vérifier la création du compte
3. Tester la connexion
4. Vérifier les données dans la base

## Dépannage

### Email non confirmé
- Vérifier la configuration Auth dans Supabase
- Regarder les logs d'authentification
- Tester avec un email temporaire

### Erreur de création d'école
- Vérifier les migrations appliquées
- Tester la fonction `create_principal_school` dans l'éditeur SQL
- Regarder les logs de la base de données

### Page d'erreur après soumission
- Vérifier les routes React
- Regarder la console développeur
- Tester la gestion d'état du formulaire