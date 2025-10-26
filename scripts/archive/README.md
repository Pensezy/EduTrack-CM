# Archive des Scripts de Débogage

Ce dossier contient tous les scripts et fichiers SQL utilisés pendant la phase de débogage et de résolution des problèmes d'authentification et de création de comptes.

## 📁 Contenu

### Fichiers JavaScript de Test
- `test-*.js` - Scripts de test pour la création de comptes, connexion, API, etc.
- `diagnostic-*.js` - Scripts de diagnostic pour vérifier la base de données
- `fix-*.js`, `solution-*.js` - Scripts de correction d'erreurs
- `apply-*.js`, `correction-*.js` - Scripts d'application de migrations

### Fichiers SQL
- `FIX_*.sql` - Anciennes versions de corrections de triggers (remplacées par `FIX_TRIGGER_ONLY.sql`)
- `SOLUTION_*.sql` - Différentes tentatives de solutions pour les problèmes de permissions
- `TEST_*.sql` - Scripts SQL de test manuel
- `DIAGNOSTIC_*.sql` - Requêtes de diagnostic
- Autres migrations SQL obsolètes

### Fichiers Markdown de Documentation
- `GUIDE_*.md` - Guides de migration et solutions (obsolètes)
- `RESUME_*.md` - Résumés de problèmes et solutions
- `RESOLUTION_*.md` - Documentation de résolution d'erreurs
- `RECAP_*.md` - Récapitulatifs de fichiers de migration
- `MIGRATION_*.md` - Documentation de migrations (remplacée par `docs/`)

### Scripts PowerShell
- `apply-migration.ps1` - Script d'application de migration

## ✅ Solution Finale

La solution finale qui fonctionne se trouve dans les fichiers suivants (à la racine du projet) :

1. **`FIX_TRIGGER_ONLY.sql`** - Trigger avec SECURITY DEFINER qui résout le problème de création de compte
2. **`MIGRATION_COMPLETE_22_TABLES.sql`** - Migration complète des 22 tables du schéma

## 📚 Documentation Actuelle

Pour la documentation à jour, consultez le dossier `docs/` :
- `docs/README.md` - Index de la documentation
- `docs/SUPABASE_AUTH.md` - Configuration de l'authentification
- `docs/PRISMA_MIGRATION.md` - Architecture hybride Prisma + SQL
- `database/README.md` - Structure de la base de données

## 🗑️ Pourquoi ces fichiers sont archivés ?

Ces fichiers ont été créés pendant le processus de débogage et de résolution du problème de création de comptes directeurs. Maintenant que :
- ✅ Le trigger fonctionne correctement
- ✅ Les comptes directeurs peuvent être créés
- ✅ La documentation est à jour dans `docs/`

Ces fichiers ne sont plus nécessaires pour le développement actif, mais sont conservés pour référence historique.

---

**Date d'archivage :** Octobre 2025  
**Raison :** Nettoyage du projet après résolution du problème d'authentification
