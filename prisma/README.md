# 🔗 Configuration de la connexion Supabase avec Prisma

## 📋 Instructions pour récupérer votre chaîne de connexion :

### **Étape 1 : Aller sur votre Dashboard Supabase**
1. Ouvrez https://app.supabase.com
2. Sélectionnez votre projet **EduTrack-CM**

### **Étape 2 : Récupérer l'URL de connexion directe**
1. Allez dans **Settings** → **Database**
2. Cherchez la section **Connection string**
3. Sélectionnez l'onglet **Direct connection** (pas Pooled connection)
4. Copiez l'URL qui ressemble à :
```
postgresql://postgres:[YOUR-PASSWORD]@db.cgpkhtksdcxtlyprerbj.supabase.co:5432/postgres
```

### **Étape 3 : Mettre à jour votre fichier .env**
Remplacez `[VOTRE_PASSWORD]` par votre mot de passe de base de données dans le fichier `.env` :

```env
DATABASE_URL="postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.cgpkhtksdcxtlyprerbj.supabase.co:5432/postgres?sslmode=require"
```

### **Étape 4 : Synchroniser avec la base existante**
Une fois la connexion configurée, exécutez :

```bash
# Pour synchroniser Prisma avec votre base existante
npx prisma db pull

# Pour générer le client avec les vrais modèles
npx prisma generate

# Pour appliquer le schéma à la base (si nécessaire)
npx prisma db push
```

## ⚠️ **Important :**
- **Gardez votre mot de passe secret** (ne le commitez pas dans Git)
- **Utilisez des variables d'environnement** pour la production
- **Testez la connexion** avant de continuer

## 🎯 **Prochaines étapes :**
1. Configurer l'URL de connexion
2. Tester la connexion avec `npx prisma db pull`
3. Adapter les services pour utiliser Prisma au lieu de Supabase direct
4. Migrer progressivement les requêtes existantes