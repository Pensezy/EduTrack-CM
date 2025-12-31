# 🏫 Types d'Établissements Scolaires - Système Éducatif Camerounais

## 🎯 **Vue d'ensemble**

EduTrack-CM supporte tous les types d'établissements du système éducatif camerounais, de la maternelle au lycée.

## 📋 **Types d'Établissements Supportés**

### **1. École Maternelle** (`maternelle`)
- **🎂 Âge** : 3-6 ans
- **📚 Classes** : 
  - PS (Petite Section)
  - MS (Moyenne Section) 
  - GS (Grande Section)
- **🎯 Objectif** : Éveil et préparation au primaire

### **2. École Primaire** (`primaire`)
- **🎂 Âge** : 6-11 ans
- **📚 Classes** :
  - CP (Cours Préparatoire)
  - CE1 (Cours Élémentaire 1)
  - CE2 (Cours Élémentaire 2)
  - CM1 (Cours Moyen 1)
  - CM2 (Cours Moyen 2)
- **🎯 Objectif** : Apprentissages fondamentaux
- **🏆 Diplôme** : CEP (Certificat d'Études Primaires)

### **3. Collège** (`college`)
- **🎂 Âge** : 11-15 ans
- **📚 Classes** :
  - 6ème (Sixième)
  - 5ème (Cinquième)
  - 4ème (Quatrième)
  - 3ème (Troisième)
- **🎯 Objectif** : Premier cycle secondaire
- **🏆 Diplôme** : BEPC (Brevet d'Études du Premier Cycle)

### **4. Lycée** (`lycee`)
- **🎂 Âge** : 15-18 ans
- **📚 Classes** :
  - 2nde (Seconde)
  - 1ère (Première)
  - Terminale
- **🎯 Objectif** : Second cycle secondaire
- **🏆 Diplôme** : Baccalauréat (BAC)

### **5. Collège-Lycée** (`college_lycee`) ⭐
- **🎂 Âge** : 11-18 ans
- **📚 Classes** : **TOUTES** (6ème → Terminale)
  - **Premier cycle** : 6ème, 5ème, 4ème, 3ème
  - **Second cycle** : 2nde, 1ère, Terminale
- **🎯 Objectif** : Établissement complet secondaire
- **🏆 Diplômes** : BEPC + Baccalauréat
- **✨ Avantage** : Continuité pédagogique complète

## 🗂️ **Configuration dans Prisma**

### **Enum SchoolType**
```prisma
enum SchoolType {
  maternelle     // École Maternelle
  primaire       // École Primaire  
  college        // Collège (6ème-3ème)
  lycee          // Lycée (2nde-Terminale)
  college_lycee  // Collège-Lycée (6ème-Terminale)
}
```

### **Classes Disponibles par Type**
```javascript
const CLASSES_BY_SCHOOL_TYPE = {
  maternelle: ['PS', 'MS', 'GS'],
  primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  college: ['6ème', '5ème', '4ème', '3ème'],
  lycee: ['2nde', '1ère', 'Terminale'],
  college_lycee: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
};
```

## 🎓 **Sections et Filières**

### **Collège - Sections Communes**
- **Section A** : Littéraire
- **Section B** : Scientifique
- **Section C** : Technique

### **Lycée - Filières Spécialisées**
- **Série A** : Littéraire
- **Série C** : Mathématiques-Sciences Physiques
- **Série D** : Mathématiques-Sciences Naturelles
- **Série E** : Mathématiques-Techniques
- **Série F** : Techniques Industrielles
- **Série G** : Techniques Commerciales

## 📊 **Statistiques d'Usage**

### **Répartition des Établissements**
- **Maternelle** : ~25% (petite enfance)
- **Primaire** : ~35% (enseignement de base)
- **Collège** : ~20% (premier cycle)
- **Lycée** : ~15% (second cycle)
- **Collège-Lycée** : ~5% (établissements complets)

### **Avantages du Type `college_lycee`**
- ✅ **Continuité** : Pas de changement d'établissement
- ✅ **Cohérence** : Équipe pédagogique stable
- ✅ **Économie** : Gestion administrative centralisée
- ✅ **Résultats** : Meilleur suivi des élèves

## 🔧 **Implémentation Technique**

### **Validation des Classes**
```javascript
export const validateClassForSchoolType = (schoolType, className) => {
  const validClasses = CLASSES_BY_SCHOOL_TYPE[schoolType] || [];
  return validClasses.includes(className);
};
```

### **Génération Automatique des Classes**
```javascript
export const generateAvailableClasses = (schoolType) => {
  return CLASSES_BY_SCHOOL_TYPE[schoolType] || [];
};
```

## 🌍 **Contexte Camerounais**

### **Particularités Locales**
- **Bilinguisme** : Français + Anglais
- **Système Mixte** : Anglo-saxon + Français
- **Examens Officiels** : CEP, BEPC, BAC

### **Adaptation EduTrack-CM**
- ✅ Support des deux systèmes linguistiques
- ✅ Gestion des examens officiels
- ✅ Adaptation aux programmes camerounais
- ✅ Calendrier scolaire local

## 📅 **Calendrier Scolaire Type**

### **Année Scolaire**
- **Début** : Septembre
- **Fin** : Juillet
- **Vacances** : Décembre, Pâques, Juillet-Août

### **Évaluations**
- **1er Trimestre** : Septembre - Décembre
- **2ème Trimestre** : Janvier - Mars  
- **3ème Trimestre** : Avril - Juillet

---

**✨ EduTrack-CM : Adapté au système éducatif camerounais pour une gestion scolaire complète !**