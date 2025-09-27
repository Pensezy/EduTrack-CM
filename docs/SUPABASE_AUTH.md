# 🔐 Configuration Authentification Supabase - EduTrack-CM

## 🎯 **Vue d'ensemble**

Configuration de l'authentification Supabase pour EduTrack-CM avec gestion des emails de confirmation et flux d'inscription des directeurs d'établissement.

## ⚙️ **Configuration de Base**

### **1. Désactiver la Confirmation Email (Développement)**
**Recommandé pour les tests et le développement :**

1. **Dashboard Supabase** → https://app.supabase.com
2. **Sélectionner votre projet** EduTrack-CM
3. **Authentication** → **Settings**
4. **Décocher** "Enable email confirmations"
5. **Sauvegarder** les modifications

### **2. Templates Email Personnalisés (Production)**
**Pour un environnement professionnel :**

1. **Authentication** → **Email Templates**
2. **Sélectionner** "Confirm signup"
3. **Utiliser le template** depuis `supabase/email-templates/confirm-signup.html`
4. **Personnaliser** le sujet et l'expéditeur
5. **Tester** avec un compte de démonstration

## 🔧 **Configuration Client Supabase**

### **Configuration Recommandée**
```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Plus sécurisé pour production
  }
})
```

### **Variables d'Environnement**
```env
# Frontend (Vite)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-publique-ici

# Backend (Prisma) - Non utilisé pour l'auth
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## 🏫 **Flux d'Inscription Directeur**

### **Étapes du Processus**
1. **Formulaire d'inscription** (`/school-management`)
2. **Création compte Supabase Auth** (email + mot de passe)
3. **Création profil école** (via Prisma)
4. **Email de confirmation** (si activé)
5. **Redirection dashboard principal**

### **Gestion des Erreurs**
```javascript
// Exemple de gestion d'erreur robuste
try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'principal',
        school_name: schoolName
      }
    }
  })
  
  if (error) {
    if (error.message.includes('already_exists')) {
      throw new Error('Un compte existe déjà avec cette adresse email')
    }
    throw error
  }
} catch (error) {
  // Affichage utilisateur-friendly
  setError(getErrorMessage(error))
}
```

## 🔒 **Sécurité et RLS**

### **Politiques Row Level Security**
```sql
-- Politique pour les écoles - Seul le directeur peut voir/modifier
CREATE POLICY "Directors can manage their school" ON schools
FOR ALL USING (director_user_id = auth.uid());

-- Politique pour les utilisateurs - Auto-gestion
CREATE POLICY "Users can manage themselves" ON users  
FOR ALL USING (id = auth.uid());
```

### **Auto-Confirmation Développement** ⚠️
```sql
-- UNIQUEMENT pour le développement
CREATE OR REPLACE FUNCTION auto_confirm_principals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'principal' THEN
    NEW.email_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer le trigger (DEV uniquement)
CREATE TRIGGER auto_confirm_principals_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_principals();
```

## 📧 **Configuration Email Production**

### **Domaine Personnalisé**
1. **Configurer SPF/DKIM** pour votre domaine
2. **Ajouter domaine** dans Supabase Auth
3. **Personnaliser expéditeur** : `noreply@votre-ecole.com`
4. **Tester délivrabilité** avec différents clients email

### **Template Email**
- **Sujet** : `🎓 EduTrack-CM : Confirmez votre compte de directeur`
- **Expéditeur** : `EduTrack-CM <noreply@votre-domaine.com>`
- **Template** : Utiliser `supabase/email-templates/confirm-signup.html`

## 🔍 **Dépannage Courant**

### **Problème : Email Non Reçu**
- ✅ Vérifier configuration SMTP Supabase
- ✅ Contrôler dossier spam/promotions
- ✅ Tester avec adresse email différente
- ✅ Vérifier logs Authentication dans Supabase

### **Problème : Erreur Inscription**
- ✅ Contrôler format email valide
- ✅ Vérifier mot de passe (min 6 caractères)
- ✅ Tester connexion Supabase
- ✅ Vérifier quotas projet Supabase

### **Problème : Redirection Échouée**
- ✅ Contrôler URLs autorisées dans Auth
- ✅ Vérifier configuration React Router
- ✅ Tester en navigation privée
- ✅ Contrôler logs navigateur

## 📊 **Monitoring et Analytics**

### **Métriques à Surveiller**
- **Taux de confirmation** email
- **Erreurs d'inscription** par type
- **Temps de confirmation** moyen
- **Taux d'abandon** processus

### **Outils Supabase**
- **Auth Logs** - Historique connexions
- **Database Logs** - Erreurs SQL
- **Edge Functions** - Logs serverless (si utilisé)

---

**✨ Configuration optimisée pour une authentification fluide et sécurisée dans EduTrack-CM !**