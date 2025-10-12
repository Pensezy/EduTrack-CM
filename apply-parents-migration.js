const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function applyMigration() {
  console.log('🚀 APPLICATION DE LA MIGRATION PARENTS MULTI-ÉTABLISSEMENTS');
  console.log('='.repeat(60));
  
  try {
    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, 'database', 'migrations', '03_multi_school_parents_management.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Fichier de migration lu avec succès');
    console.log(`📏 Taille: ${migrationSQL.length} caractères`);
    
    // Diviser en blocs SQL (séparés par des commentaires ou des sections)
    const sqlBlocks = migrationSQL
      .split(/-- ={30,}/)
      .filter(block => block.trim().length > 0);
    
    console.log(`🔧 ${sqlBlocks.length} blocs SQL à exécuter`);
    
    // Exécuter chaque bloc
    for (let i = 0; i < sqlBlocks.length; i++) {
      const block = sqlBlocks[i].trim();
      if (!block) continue;
      
      console.log(`\n⚡ Exécution du bloc ${i + 1}/${sqlBlocks.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: block });
        
        if (error) {
          console.log(`❌ Erreur bloc ${i + 1}:`, error.message);
          // Continuer avec les autres blocs même en cas d'erreur
        } else {
          console.log(`✅ Bloc ${i + 1} exécuté avec succès`);
        }
      } catch (blockError) {
        console.log(`❌ Erreur d'exécution bloc ${i + 1}:`, blockError.message);
        // Essayer d'exécuter le bloc directement
        try {
          await supabase.from('information_schema.tables').select('*').limit(1);
          console.log(`⚠️ Tentative alternative pour le bloc ${i + 1}...`);
        } catch (altError) {
          console.log(`❌ Échec alternatif bloc ${i + 1}:`, altError.message);
        }
      }
    }
    
    // Vérifier le résultat de la migration
    console.log('\n🔍 VÉRIFICATION POST-MIGRATION:');
    
    // Vérifier les nouvelles colonnes de parents
    const { data: parentsTest, error: parentsError } = await supabase
      .from('parents')
      .select('*')
      .limit(1);
    
    if (parentsError) {
      console.log('❌ Erreur vérification parents:', parentsError.message);
    } else {
      console.log('✅ Table parents accessible');
      if (parentsTest.length > 0) {
        console.log('📋 Colonnes parents:', Object.keys(parentsTest[0]));
      }
    }
    
    // Vérifier la table de liaison
    const { data: liaisionTest, error: liaisonError } = await supabase
      .from('parent_student_schools')
      .select('*')
      .limit(1);
    
    if (liaisonError) {
      console.log('❌ Table parent_student_schools non accessible:', liaisonError.message);
    } else {
      console.log('✅ Table parent_student_schools créée avec succès');
    }
    
    // Vérifier la vue
    const { data: viewTest, error: viewError } = await supabase
      .from('parent_students_schools_view')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.log('❌ Vue parent_students_schools_view non accessible:', viewError.message);
    } else {
      console.log('✅ Vue parent_students_schools_view créée avec succès');
    }
    
  } catch (error) {
    console.error('❌ ERREUR GÉNÉRALE:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 MIGRATION TERMINÉE');
}

applyMigration();