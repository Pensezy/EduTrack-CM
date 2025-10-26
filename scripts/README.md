# Scripts EduTrack-CM

Ce dossier contient les scripts utilitaires pour le projet EduTrack-CM.

## 📁 Structure

```
scripts/
├── seedDemoData.js    # Script de génération de données de démonstration
└── archive/           # Fichiers de débogage archivés (historique)
```

## 🌱 seedDemoData.js

Script Node.js pour générer des données de démonstration dans la base de données avec le système multi-établissements.

### Fonctionnalités

- Crée 3 écoles (Yaoundé, Douala, Bafoussam)
- Crée 5 parents avec identifiants globaux
- Génère des étudiants avec relations multi-établissements
- Démontre le système de parents ayant des enfants dans plusieurs écoles
- Génère des classes, années académiques, etc.

### Utilisation

```bash
# Générer les données de démonstration
node scripts/seedDemoData.js

# Réinitialiser (nettoyer puis générer)
node scripts/seedDemoData.js --reset

# Nettoyer uniquement
node scripts/seedDemoData.js --clean
```

### Exemples de Scénarios

1. **Jean Mballa** - 2 enfants dans 2 écoles différentes :
   - Kevin Mballa à l'École Primaire les Palmiers (Yaoundé)
   - Sandra Mballa au Collège-Lycée Excellence (Douala)

2. **Marie Ngono** - 2 enfants dans 2 villes différentes :
   - Alex Ngono au Collège-Lycée Excellence (Douala)
   - Laura Ngono à l'Institution Sainte-Thérèse (Bafoussam)

### Prérequis

- Node.js installé
- Prisma configuré avec la connexion Supabase
- Base de données avec toutes les tables créées

### Notes

- Utilise Faker.js pour générer des données réalistes en français
- Respecte le schéma Prisma (22+ tables)
- Démontre le système `parent_student_schools` (relation N-N-N)

## 🗄️ archive/

Contient tous les fichiers de débogage, tests et anciennes migrations utilisés pendant la phase de développement. Consultez `archive/README.md` pour plus de détails.

---

**Dernière mise à jour :** Octobre 2025
