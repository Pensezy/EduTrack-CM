// Script pour créer directement votre école et nettoyer localStorage
// À exécuter dans la console du navigateur

async function creerEcoleDirectement() {
  console.log('🔧 Création directe de votre école...');
  
  try {
    // Import du client Supabase
    const { supabase } = await import('./src/lib/supabase.js');
    
    // Vos données d'après l'erreur
    const userId = '730805c2-4dbd-4734-bd3c-5b5aec4d1d59';
    const schoolData = {
      name: 'Biyem assi',
      code: 'BIY-2025-079',
      type: 'maternelle',
      director_name: 'KONGA SANDJI LANDRY YOHAN',
      phone: 'votre-telephone', // Ajoutez votre téléphone
      email: 'pensezy.si@gmail.com',
      address: 'votre-adresse', // Ajoutez votre adresse
      city: 'Yaoundé',
      country: 'Cameroun',
      available_classes: [],
      status: 'active',
      director_user_id: userId
    };
    
    console.log('📋 Données école à créer:', schoolData);
    
    // 1. Vérifier si l'école existe déjà
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('id, name, code')
      .eq('director_user_id', userId)
      .maybeSingle();
    
    if (existingSchool) {
      console.log('✅ École déjà existante:', existingSchool.name);
      localStorage.removeItem('pendingSchoolData');
      console.log('🧹 localStorage nettoyé');
      return;
    }
    
    // 2. Créer l'école directement
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select('id, name, code, status')
      .single();
    
    if (schoolError) {
      console.error('❌ Erreur création école:', schoolError);
      return;
    }
    
    console.log('✅ École créée avec succès:', newSchool);
    
    // 3. Nettoyer localStorage
    localStorage.removeItem('pendingSchoolData');
    console.log('🧹 localStorage nettoyé');
    
    console.log('🎉 SUCCÈS ! Vous pouvez maintenant vous connecter normalement');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter la création
creerEcoleDirectement();