/**
 * SCRIPT DE MIGRATION DES MOTS DE PASSE VERS BCRYPT
 *
 * Ce script migre tous les mots de passe en clair vers des hashs bcrypt sécurisés.
 *
 * UTILISATION:
 *   node scripts/migrate-passwords-to-bcrypt.js
 *
 * PRÉREQUIS:
 *   - Variables d'environnement configurées (.env)
 *   - Backup de la base de données effectué
 *
 * ATTENTION:
 *   - Ce script est IRREVERSIBLE (ne peut pas retrouver les mots de passe originaux)
 *   - Faire un backup AVANT d'exécuter
 *   - Tester sur environnement de dev d'abord
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes');
  console.error('Vérifiez que VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env');
  process.exit(1);
}

// Créer client Supabase avec Service Role (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SALT_ROUNDS = 12;

/**
 * Migrer les mots de passe d'un utilisateur
 */
async function migrateUserPasswords() {
  console.log('🔐 MIGRATION DES MOTS DE PASSE VERS BCRYPT');
  console.log('==========================================\n');

  try {
    // 1. Récupérer tous les utilisateurs avec des mots de passe
    console.log('📋 Récupération des utilisateurs avec mots de passe...');

    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role, password_hash')
      .not('password_hash', 'is', null);

    if (fetchError) {
      throw new Error(`Erreur récupération utilisateurs: ${fetchError.message}`);
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  Aucun utilisateur avec mot de passe trouvé');
      return;
    }

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s)\n`);

    // 2. Filtrer ceux qui ont déjà un hash bcrypt
    const usersToMigrate = users.filter(
      user => user.password_hash && !user.password_hash.startsWith('$2')
    );

    const alreadyMigrated = users.filter(
      user => user.password_hash && user.password_hash.startsWith('$2')
    );

    console.log(`✅ ${alreadyMigrated.length} utilisateur(s) déjà migré(s)`);
    console.log(`⚠️  ${usersToMigrate.length} utilisateur(s) à migrer\n`);

    if (usersToMigrate.length === 0) {
      console.log('🎉 Tous les mots de passe sont déjà hashés avec bcrypt !');
      return;
    }

    // 3. Confirmation avant migration
    console.log('⚠️  ATTENTION: Cette opération est IRREVERSIBLE');
    console.log('⚠️  Les mots de passe en clair seront remplacés par des hashs bcrypt');
    console.log('\n📝 Utilisateurs à migrer:');
    usersToMigrate.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
    });

    console.log('\n⏳ Démarrage de la migration dans 3 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Migrer chaque utilisateur
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersToMigrate) {
      try {
        console.log(`🔄 Migration: ${user.email}...`);

        // Hash le mot de passe en clair
        const hashedPassword = await bcrypt.hash(user.password_hash, SALT_ROUNDS);

        // Mettre à jour en base
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password_hash: hashedPassword,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`   ✅ Migré avec succès`);
        successCount++;

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errorCount++;
      }
    }

    // 5. Résumé
    console.log('\n==========================================');
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('==========================================');
    console.log(`✅ Succès:  ${successCount} utilisateur(s)`);
    console.log(`❌ Erreurs: ${errorCount} utilisateur(s)`);
    console.log(`📝 Total:   ${usersToMigrate.length} utilisateur(s)`);
    console.log('==========================================\n');

    if (successCount === usersToMigrate.length) {
      console.log('🎉 Migration terminée avec succès !');
      console.log('✅ Tous les mots de passe sont maintenant hashés avec bcrypt');
    } else {
      console.log('⚠️  Migration terminée avec des erreurs');
      console.log('❌ Vérifiez les erreurs ci-dessus et réessayez pour les comptes échoués');
    }

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Vérifier la configuration avant migration
 */
async function checkConfiguration() {
  console.log('🔍 Vérification de la configuration...\n');

  // Test connexion Supabase
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw new Error(`Impossible de se connecter à Supabase: ${error.message}`);
    }

    console.log('✅ Connexion Supabase OK');
  } catch (error) {
    console.error('❌ Erreur connexion Supabase:', error.message);
    process.exit(1);
  }

  // Vérifier bcrypt
  try {
    const testHash = await bcrypt.hash('test', 10);
    const isValid = await bcrypt.compare('test', testHash);

    if (!isValid) {
      throw new Error('bcrypt ne fonctionne pas correctement');
    }

    console.log('✅ bcrypt OK\n');
  } catch (error) {
    console.error('❌ Erreur bcrypt:', error.message);
    process.exit(1);
  }
}

// Exécution du script
(async () => {
  console.clear();

  // Vérifications préalables
  await checkConfiguration();

  // Migration
  await migrateUserPasswords();

  console.log('\n✅ Script terminé\n');
  process.exit(0);
})();
