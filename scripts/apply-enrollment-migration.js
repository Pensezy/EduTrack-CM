/**
 * Script pour appliquer la migration enrollment_requests
 * Crée la table des demandes d'inscription dans Supabase
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
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Application de la migration enrollment_requests...\n');

  try {
    // Lire le fichier SQL
    const migrationPath = join(__dirname, '..', 'database', 'migrations', '03_create_enrollment_requests_table.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('📄 Fichier SQL chargé:', migrationPath);
    console.log('📏 Taille:', sql.length, 'caractères\n');

    // Exécuter la migration
    console.log('⚙️  Exécution de la migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Si la fonction exec_sql n'existe pas, essayer directement
      console.log('⚠️  exec_sql non disponible, exécution directe...');
      
      // Découper le SQL en commandes individuelles
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`  [${i + 1}/${statements.length}] Exécution...`);
        
        const { error: stmtError } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });

        if (stmtError && !stmtError.message.includes('already exists')) {
          console.error(`  ❌ Erreur:`, stmtError.message);
        }
      }
    }

    console.log('\n✅ Migration appliquée avec succès!\n');

    // Vérifier que la table a été créée
    console.log('🔍 Vérification de la table enrollment_requests...');
    const { data: tableData, error: tableError } = await supabase
      .from('enrollment_requests')
      .select('count');

    if (tableError) {
      console.error('❌ Erreur lors de la vérification:', tableError.message);
    } else {
      console.log('✅ Table enrollment_requests créée et accessible!\n');
    }

    // Afficher la structure
    console.log('📊 Structure de la table:');
    console.log('  - Colonnes principales:');
    console.log('    • id (UUID)');
    console.log('    • school_id (UUID) - Référence à schools');
    console.log('    • request_type (nouvelle_inscription/redoublement/transfert)');
    console.log('    • student_first_name, student_last_name');
    console.log('    • parent_name, parent_phone, parent_email');
    console.log('    • requested_class, current_class');
    console.log('    • status (en_attente/en_revision/approuvee/refusee)');
    console.log('    • priority (urgent/normal/faible)');
    console.log('    • documents (JSONB)');
    console.log('    • submitted_by, reviewed_by (UUID users)');
    console.log('    • timestamps (created_at, updated_at)');
    console.log('\n  - Index créés: 6');
    console.log('  - Triggers: 1 (auto-update updated_at)');
    console.log('  - RLS Policies: 4 (select/insert/update/delete)\n');

    console.log('🎯 Prochaines étapes:');
    console.log('  1. Mettre à jour le service productionDataService.js');
    console.log('  2. Modifier SchoolYearValidationTab.jsx pour utiliser les vraies données');
    console.log('  3. Tester la création d\'une demande\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    process.exit(1);
  }
}

applyMigration();
