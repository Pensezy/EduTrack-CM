const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnosticDatabase() {
  console.log('🔍 DIAGNOSTIC DE LA BASE DE DONNÉES EduTrack');
  console.log('='.repeat(50));
  
  try {
    // 1. Vérifier les tables existantes
    console.log('\n1. TABLES EXISTANTES:');
    const tables = ['users', 'schools', 'parents', 'students', 'classes', 'academic_years'];
    
    for (const tableName of tables) {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          const columns = data.length > 0 ? Object.keys(data[0]) : [];
          console.log(`✅ ${tableName}: ${count} enregistrements, colonnes: [${columns.join(', ')}]`);
        }
      } catch (e) {
        console.log(`❌ ${tableName}: Erreur - ${e.message}`);
      }
    }
    
    // 2. Vérifier les relations parent-student actuelles
    console.log('\n2. RELATIONS PARENTS-ÉTUDIANTS:');
    
    try {
      const { data: parentsData } = await supabase
        .from('parents')
        .select('*')
        .limit(5);
      
      console.log('Parents échantillon:', parentsData);
      
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .limit(5);
      
      console.log('Students échantillon:', studentsData);
      
    } catch (e) {
      console.log('❌ Erreur lors de la vérification des relations:', e.message);
    }
    
    // 3. Vérifier si des vues existent
    console.log('\n3. VÉRIFICATION DES VUES:');
    
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('parent_students_view')
        .select('*')
        .limit(1);
      
      if (viewError) {
        console.log('❌ Vue parent_students_view n\'existe pas:', viewError.message);
      } else {
        console.log('✅ Vue parent_students_view existe');
      }
    } catch (e) {
      console.log('❌ Erreur vue:', e.message);
    }
    
    // 4. Analyser la structure de users pour les parents
    console.log('\n4. ANALYSE STRUCTURE USERS:');
    
    try {
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'parent')
        .limit(3);
      
      if (usersData.length > 0) {
        console.log('✅ Utilisateurs parents trouvés:', usersData.length);
        console.log('Colonnes users:', Object.keys(usersData[0]));
      } else {
        console.log('❌ Aucun utilisateur parent trouvé');
      }
    } catch (e) {
      console.log('❌ Erreur users:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 DIAGNOSTIC TERMINÉ');
}

diagnosticDatabase();