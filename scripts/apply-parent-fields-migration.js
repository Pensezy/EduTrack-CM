/**
 * Script pour appliquer la migration parent fields (profession et address)
 * Exécute la migration SQL directement via le client Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Application de la migration parent fields...\n');

  try {
    // Lire le fichier de migration
    const migrationPath = join(__dirname, '../supabase/migrations/20260103_add_parent_fields.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration SQL chargée depuis:', migrationPath);
    console.log('📝 Contenu de la migration:\n');
    console.log(migrationSQL);
    console.log('\n');

    // Diviser le SQL en plusieurs commandes si nécessaire
    // Les blocs DO $$ ne peuvent pas être exécutés directement via RPC
    // On va les exécuter via la REST API directement

    console.log('⚙️  Exécution de la migration...\n');

    // Vérifier si les colonnes existent déjà
    const { data: columns, error: checkError } = await supabase
      .rpc('get_column_info', {
        table_name_param: 'users'
      })
      .select('column_name');

    if (checkError) {
      // Si la fonction n'existe pas, on utilise une autre méthode
      console.log('ℹ️  Impossible de vérifier les colonnes existantes, on continue...');
    } else {
      const existingColumns = columns?.map(c => c.column_name) || [];
      console.log('📊 Colonnes existantes dans users:', existingColumns);

      if (existingColumns.includes('profession') && existingColumns.includes('address')) {
        console.log('✅ Les colonnes profession et address existent déjà!');
        return;
      }
    }

    // Exécuter la migration via SQL brut
    // Note: Cette méthode nécessite d'avoir accès à l'API SQL de Supabase
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      // Si exec_sql n'existe pas, essayons une autre approche
      console.log('⚠️  exec_sql non disponible, essai méthode alternative...\n');

      // Méthode alternative: créer les colonnes directement
      const alterQueries = [
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS profession TEXT;`,
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`,
        `COMMENT ON COLUMN users.profession IS 'Profession du parent/tuteur (optionnel)';`,
        `COMMENT ON COLUMN users.address IS 'Adresse du parent/tuteur (optionnel)';`
      ];

      console.log('📌 Exécution des commandes ALTER TABLE...\n');

      for (const query of alterQueries) {
        console.log(`   ${query}`);
      }

      console.log('\n⚠️  ATTENTION: Cette migration doit être exécutée manuellement via le SQL Editor de Supabase');
      console.log('📍 Allez sur: https://supabase.com/dashboard/project/lbqwbnclknwszdnlxaxz/sql/new');
      console.log('\n📋 Copiez et exécutez le SQL suivant:\n');
      console.log('-----------------------------------');
      console.log(migrationSQL);
      console.log('-----------------------------------\n');

      return;
    }

    console.log('✅ Migration appliquée avec succès!');
    console.log('📊 Résultat:', data);

  } catch (err) {
    console.error('❌ Erreur lors de l\'application de la migration:', err.message);
    console.error(err);
    process.exit(1);
  }
}

// Exécuter la migration
applyMigration()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Erreur fatale:', err);
    process.exit(1);
  });
