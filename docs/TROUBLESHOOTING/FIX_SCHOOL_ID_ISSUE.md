# 🔧 Fix: Associer Utilisateur à une École

## 🎯 Problème Actuel

Votre utilisateur principal (`pensezy.si@gmail.com`) n'est **pas associé à une école**, donc :
- ❌ App Store est vide (0 apps)
- ❌ Mes Apps est vide (0 apps)
- ❌ Aucune donnée liée à l'école ne charge

**Cause** : `user.school_id` est `null`/`undefined`

---

## ✅ Solution en 2 Migrations

### **Migration 1** : Renommer la colonne

La BDD utilise `current_school_id` mais le code utilise `school_id`. Renommons pour cohérence.

**Fichier** : `supabase/migrations/RENAME_CURRENT_SCHOOL_ID.sql`

**Comment appliquer** :
1. Ouvrir https://supabase.com/dashboard → SQL Editor
2. New Query
3. Copier TOUT le contenu de `RENAME_CURRENT_SCHOOL_ID.sql`
4. Run

**Résultat** : ✅ Colonne renommée `current_school_id` → `school_id`

---

### **Migration 2** : Créer école et associer utilisateur

**Fichier** : `supabase/migrations/ASSOCIATE_USER_TO_SCHOOL.sql`

**Ce qu'elle fait** :
- Cherche votre utilisateur (`pensezy.si@gmail.com`)
- Vérifie si une école existe déjà
- Si non : Crée une "École Pilote EduTrack"
- Associe votre utilisateur à cette école
- Met à jour `users.school_id`

**Comment appliquer** :
1. SQL Editor → New Query
2. Copier TOUT le contenu de `ASSOCIATE_USER_TO_SCHOOL.sql`
3. Run

**Résultat** :
```
✅ École créée: École Pilote EduTrack (code: EPT-001)
✅ Utilisateur associé à l'école
✅ user.school_id défini
```

---

## 🧪 Vérification

Après avoir appliqué les 2 migrations, exécutez dans SQL Editor :

```sql
SELECT
  u.email,
  u.full_name,
  u.role,
  u.school_id,
  s.name as school_name,
  s.code as school_code
FROM users u
LEFT JOIN schools s ON s.id = u.school_id
WHERE u.email = 'pensezy.si@gmail.com';
```

**Résultat attendu** :
| email | full_name | role | school_id | school_name | school_code |
|-------|-----------|------|-----------|-------------|-------------|
| pensezy.si@gmail.com | ... | principal | (un UUID) | École Pilote EduTrack | EPT-001 |

---

## 🎉 Résultat Final

Une fois les migrations appliquées, **rafraîchissez votre dashboard** (Ctrl+F5).

Vous devriez maintenant voir :

### **App Store**
- ✅ 8 applications affichées
- ✅ 3 bundles affichés
- ✅ Badges "En Développement" sur 5 apps

### **Mes Apps**
- ✅ 1 app active (l'app "core" gratuite)
- ✅ Stats correctes
- ✅ Carte de l'app core visible

### **Console Logs**
```
📊 [useActiveApps] Résumé:
  - catalogApps: 8
  - activeApps: 1
  - availableApps: 7
  - user.school_id: (un UUID valide)
```

---

## 🏫 À Propos de l'École Créée

L'école "École Pilote EduTrack" est une école de test. Vous pouvez :
- La renommer dans l'onglet **Écoles** du dashboard
- La modifier avec les vrais informations
- Ou la supprimer et créer une vraie école

---

## ⏱️ Temps Estimé : 5 minutes

1. Migration 1 (rename) : 30 sec
2. Migration 2 (create school) : 1 min
3. Vérification SQL : 30 sec
4. Rafraîchir dashboard : 10 sec
5. Test App Store/Mes Apps : 2 min

---

## 🆘 En Cas de Problème

### Erreur: "column current_school_id does not exist"
→ Migration 1 déjà appliquée, passer directement à Migration 2

### Erreur: "user not found"
→ Vous devez vous connecter au moins une fois pour que l'utilisateur soit créé dans la table `users`

### Apps toujours vides après migration
→ Vérifier dans SQL Editor :
```sql
SELECT school_id FROM users WHERE email = 'pensezy.si@gmail.com';
```
→ Si NULL, réexécuter Migration 2

---

**📌 Important** : Après ces migrations, TOUS les utilisateurs doivent avoir un `school_id` pour utiliser l'application correctement.
