# 🎓 Système Hybride de Gestion des Élèves

## Vue d'ensemble

Ce système permet une gestion différenciée des élèves selon leur niveau scolaire, adapté au contexte camerounais.

## 🔄 Principe

### **PRIMAIRE (Maternelle à CM2)**
- ❌ **Pas de compte utilisateur** pour l'élève
- ✅ Seulement une entrée dans la table `students`
- 🔗 L'élève est lié au compte parent
- 👨‍👩‍👧 Le parent gère tout depuis son tableau de bord

**Justification :**
- Les jeunes élèves n'ont généralement pas d'email personnel
- Ils ne possèdent pas de téléphone
- La supervision parentale est nécessaire à cet âge
- Simplifie la gestion pour l'école

### **SECONDAIRE (6ème à Terminale)**
- ✅ **Compte utilisateur créé** pour l'élève
- 📧 Email automatique : `matricule@ecole.edutrack.cm`
- 🔑 Mot de passe généré : `PrénomAnnée` (ex: Marie2025)
- 📱 Identifiants envoyés au parent
- 🎯 L'élève peut se connecter seul

**Justification :**
- Les élèves sont plus autonomes
- Ils ont besoin de consulter leurs notes/devoirs
- Responsabilisation progressive
- Préparation à l'université

---

## 📊 Structure de la base de données

### Table `students`

```sql
students (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL,
  user_id UUID NULL,              -- NULL pour primaire, UUID pour secondaire
  matricule TEXT UNIQUE,          -- NULL pour primaire, STD2025XXX pour secondaire
  school_level TEXT NOT NULL,     -- 'primary' ou 'secondary'
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  class_id UUID,
  date_of_birth TIMESTAMP,
  parent_name TEXT,
  parent_phone TEXT,              -- OBLIGATOIRE (au moins pour communication)
  parent_email TEXT,              -- Optionnel
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Contraintes automatiques

Le trigger `validate_student_data_trigger` vérifie :
- **Secondaire** : `matricule` et `user_id` obligatoires
- **Primaire** : `user_id` doit être NULL
- **Tous** : `parent_phone` recommandé (warning si absent)

---

## 🔧 Implémentation dans le code

### 1. Détection automatique du niveau scolaire

```javascript
const determineSchoolLevel = (schoolType, className) => {
  // Type d'école défini clairement
  if (schoolType === 'primary' || schoolType === 'Primaire') {
    return 'primary';
  }
  if (schoolType === 'secondary' || schoolType === 'Collège' || schoolType === 'Lycée') {
    return 'secondary';
  }
  
  // École mixte : détection selon le nom de la classe
  const secondaryKeywords = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle', 'terminale'];
  if (secondaryKeywords.some(keyword => className.toLowerCase().includes(keyword))) {
    return 'secondary';
  }
  
  return 'primary'; // Maternelle, CP, CE, CM
}

// Mise à jour automatique quand l'utilisateur sélectionne la classe
useEffect(() => {
  if (newUser.classId) {
    const selectedClass = availableClasses.find(c => c.value === newUser.classId);
    const detectedLevel = determineSchoolLevel(user.school_type, selectedClass.label);
    setNewUser(prev => ({ ...prev, schoolLevel: detectedLevel }));
  }
}, [newUser.classId]);
```

### 2. Génération du matricule

```javascript
const generateStudentMatricule = async (schoolId) => {
  const year = new Date().getFullYear();
  // Compte les élèves existants cette année
  // Retourne: STD2025001, STD2025002, etc.
}
```

### 3. Génération de l'email

```javascript
const generateStudentEmail = (matricule, schoolName) => {
  // Nettoie le nom de l'école
  // Retourne: std2025042@ecolestjean.edutrack.cm
}
```

### 4. Génération du mot de passe

```javascript
const generateStudentPassword = (firstName) => {
  const year = new Date().getFullYear();
  // Retourne: Marie2025, Jean2025, etc.
}
```

### 5. Logique de création

```javascript
// Le niveau est déjà déterminé automatiquement selon la classe
if (schoolLevel === 'secondary') {
  // 1. Générer matricule
  // 2. Créer compte user avec email auto
  // 3. Créer entrée students avec user_id
  // 4. Envoyer identifiants au parent
} else {
  // 1. Créer entrée students avec user_id NULL
  // 2. Informer que l'élève n'a pas de compte
  // 3. Le parent doit avoir/créer son compte
}
```

---

## 📧 Communication avec les parents

### Élève du primaire
```
✅ Élève inscrit avec succès !

Nom : Marie NGUEMA
Classe : CE1
Niveau : Primaire

👶 AUCUN COMPTE PERSONNEL CRÉÉ
L'élève n'a pas d'identifiants de connexion.

👨‍👩‍👧 Gestion par le parent :
• Le parent doit créer/avoir un compte
• Il verra cet enfant dans son tableau de bord
• Il pourra suivre ses notes et absences

📞 Contact parent : +237 6XX XX XX XX
📧 Email parent : parent@email.com
```

### Élève du secondaire
```
✅ Compte élève créé avec succès !

Nom : Jean MBONGO
Classe : 3ème
Niveau : Secondaire

🎓 COMPTE PERSONNEL CRÉÉ :
📋 Matricule : STD2025042
📧 Email : std2025042@ecolestjean.edutrack.cm
🔑 Mot de passe : Jean2025

📨 Email envoyé au parent :
Un email a été envoyé à parent@email.com

📞 SMS recommandé au : +237 6XX XX XX XX

L'élève peut maintenant :
• Se connecter à la plateforme
• Consulter ses notes et devoirs
• Voir son emploi du temps
```

---

## 🎯 Avantages du système

### Pour l'école
- ✅ Moins de comptes à gérer (primaire)
- ✅ Système adapté à l'âge des élèves
- ✅ Communication simplifiée avec les parents
- ✅ Génération automatique des identifiants
- ✅ **Détection automatique** du niveau selon la classe (pas d'erreur humaine)

### Pour les directeurs
- ✅ **Aucun choix manuel** : sélectionner la classe suffit
- ✅ Le système détecte automatiquement si compte nécessaire
- ✅ Badges visuels clairs (primaire vs secondaire)
- ✅ Impossible de créer un compte par erreur pour un élève de maternelle

### Pour les parents
- ✅ **Primaire** : Contrôle total via leur compte
- ✅ **Secondaire** : Reçoivent les identifiants de l'enfant
- ✅ Peuvent toujours suivre via leur propre compte parent

### Pour les élèves
- ✅ **Primaire** : Pas de confusion avec identifiants
- ✅ **Secondaire** : Autonomie et responsabilisation
- ✅ Email professionnel de l'école
- ✅ Mot de passe simple à retenir

---

## 🔄 Migration des données existantes

Si vous avez déjà des élèves dans votre base :

```sql
-- Marquer les élèves existants comme "primaire" par défaut
UPDATE students 
SET school_level = 'primary' 
WHERE school_level IS NULL;

-- Identifier les élèves du secondaire (selon la classe)
UPDATE students 
SET school_level = 'secondary' 
WHERE class_id IN (
  SELECT id FROM classes 
  WHERE level IN ('6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle')
);

-- Pour les élèves du secondaire, générer les matricules
-- (à faire avec un script car nécessite séquençage unique)
```

---

## 📱 Cas particuliers

### Parent sans email
- ✅ **Solution** : Téléphone obligatoire
- ✅ Communication par SMS/WhatsApp
- ✅ Peut créer un compte avec un email simple (ex: numero@temp.cm)

### Élève du secondaire sans parent enregistré
- ⚠️ **Attention** : Toujours demander un contact parent
- ✅ Créer quand même le compte élève
- ✅ Marquer pour suivi manuel

### Changement de niveau (CM2 → 6ème)
- 🔄 Mettre à jour `school_level` de 'primary' à 'secondary'
- 📧 Générer matricule et email
- 👤 Créer le compte utilisateur
- 📨 Informer le parent du nouveau statut

---

## 🧪 Tests

### Test 1 : École primaire uniquement
1. Créer un élève
2. Sélectionner une classe (CP, CE1, CM2...)
3. **Vérifier** : Badge bleu "Primaire - Pas de compte personnel"
4. **Résultat** : Entrée students sans user_id

### Test 2 : École secondaire uniquement
1. Créer un élève
2. Sélectionner une classe (6ème, 3ème, Tle...)
3. **Vérifier** : Badge vert "Secondaire - Compte personnel créé"
4. **Résultat** : Entrée students + users avec matricule/email

### Test 3 : École mixte (primaire + secondaire)
1. Créer élève en CE2
   - **Vérifier** : Badge bleu automatique
2. Créer élève en 4ème
   - **Vérifier** : Badge vert automatique
3. **Résultat** : Détection automatique correcte selon la classe

### Test 4 : Parent voit ses enfants
1. Créer parent avec email
2. Lier à des élèves (primaire et secondaire)
3. Connecter avec compte parent
4. **Vérifier** : Voir tous les enfants dans le dashboard

---

## 📚 Documentation connexe

- `/docs/PARENT_MULTI_SCHOOL_GUIDE.md` - Gestion multi-établissements pour parents
- `/docs/CONFIGURATION_EMAILJS.md` - Configuration envoi emails
- `/database/migrations/20251130_add_student_hybrid_system.sql` - Script SQL

---

## 🚀 Prochaines étapes

### Phase 2 (optionnelle)
- [ ] Génération automatique de SMS via API
- [ ] QR Code pour partage identifiants
- [ ] Import en masse d'élèves depuis CSV
- [ ] Espace élève avec contenus adaptés à l'âge
- [ ] Notifications push pour parents (mobile app)

---

**Date de création** : 30 novembre 2025  
**Auteur** : Système EduTrack-CM  
**Version** : 1.0
