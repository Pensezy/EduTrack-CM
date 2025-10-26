import { supabase } from './src/lib/supabase.js';

async function testSchoolData() {
  console.log('🔍 Test de récupération des données d\'école...');
  
  try {
    // 1. Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erreur utilisateur:', userError);
      return;
    }
    
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);
    console.log('👤 User ID:', user.id);
    
    // 2. Chercher l'école par director_user_id
    console.log('\n🔍 Recherche de l\'école...');
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', user.id);
    
    if (schoolsError) {
      console.error('❌ Erreur recherche écoles:', schoolsError);
      return;
    }
    
    console.log('📊 Écoles trouvées:', schools?.length || 0);
    
    if (schools && schools.length > 0) {
      const school = schools[0];
      console.log('✅ École trouvée:');
      console.log('  - ID:', school.id);
      console.log('  - Nom:', school.name);
      console.log('  - Type:', school.type);
      console.log('  - Adresse:', school.address);
      console.log('  - Ville:', school.city);
      console.log('  - Pays:', school.country);
      console.log('  - Classes disponibles:', school.available_classes);
      console.log('  - Statut:', school.status);
      console.log('  - Directeur ID:', school.director_user_id);
      
      // 3. Test avec jointure pour récupérer le directeur
      console.log('\n🔍 Test avec jointure directeur...');
      const { data: schoolWithDirector, error: joinError } = await supabase
        .from('schools')
        .select('*, users!director_user_id (id, full_name, email)')
        .eq('id', school.id)
        .single();
      
      if (joinError) {
        console.error('❌ Erreur jointure directeur:', joinError);
      } else {
        console.log('✅ École avec directeur:');
        console.log('  - École:', schoolWithDirector.name);
        console.log('  - Directeur:', schoolWithDirector.users);
      }
      
    } else {
      console.log('❌ Aucune école trouvée pour cet utilisateur');
      
      // Vérifier si il y a des écoles dans la base
      const { data: allSchools, error: allError } = await supabase
        .from('schools')
        .select('id, name, director_user_id');
      
      if (!allError && allSchools) {
        console.log('\n📋 Toutes les écoles dans la base:');
        allSchools.forEach(s => {
          console.log(`  - ${s.name} (ID: ${s.id}, Directeur: ${s.director_user_id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testSchoolData();