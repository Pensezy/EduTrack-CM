console.log('🎯 SOLUTION CORRECTE - Créer l\'école manquante pour votre compte existant');
console.log('');
console.log('Vous avez raison ! Votre compte existe, il faut juste créer l\'école associée.');
console.log('');
console.log('Copiez ce code dans la console de votre navigateur:');
console.log('=================================================================');
console.log('');
console.log(`
// Script pour créer l'école manquante pour votre compte existant
async function creerEcoleManquante() {
  console.log('🏫 Création de l\'école manquante pour votre compte...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // 1. Vérifier que vous êtes bien connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Vous devez être connecté avec votre compte');
      console.log('💡 Allez d\'abord vous connecter sur l\'interface');
      return;
    }
    
    console.log('✅ Utilisateur connecté:', user.email);
    console.log('🆔 User ID:', user.id);
    
    // 2. Vérifier si l'école existe déjà
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', user.id)
      .maybeSingle();
    
    if (existingSchool) {
      console.log('✅ École déjà existante:', existingSchool.name);
      console.log('🎉 Vous pouvez vous connecter normalement !');
      return;
    }
    
    // 3. Récupérer les données du localStorage
    const pendingDataStr = localStorage.getItem('pendingSchoolData');
    let schoolData;
    
    if (pendingDataStr) {
      const pendingData = JSON.parse(pendingDataStr);
      console.log('📋 Données localStorage trouvées:', pendingData);
      
      schoolData = {
        name: pendingData.schoolName,
        code: 'BIY-2025-' + Math.floor(Math.random() * 999).toString().padStart(3, '0'),
        director_user_id: user.id,
        status: 'active',
        type: pendingData.schoolType || 'maternelle',
        director_name: pendingData.directorName,
        email: pendingData.email,
        phone: pendingData.phone || '',
        address: pendingData.address || '',
        city: pendingData.city || 'Yaoundé',
        country: pendingData.country || 'Cameroun'
      };
    } else {
      console.log('📋 Pas de données localStorage, utilisation valeurs par défaut');
      
      schoolData = {
        name: 'Biyem assi',
        code: 'BIY-2025-' + Math.floor(Math.random() * 999).toString().padStart(3, '0'),
        director_user_id: user.id,
        status: 'active',
        type: 'maternelle',
        director_name: 'KONGA SANDJI LANDRY YOHAN',
        email: user.email
      };
    }
    
    console.log('🏫 Création école avec données:', schoolData);
    
    // 4. Créer l'école
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select('*')
      .single();
    
    if (schoolError) {
      console.error('❌ Erreur création école:', schoolError);
      
      if (schoolError.code === '23505') {
        console.log('💡 École existe peut-être déjà, essayez de vous connecter');
      }
      return;
    }
    
    console.log('✅ École créée avec succès !');
    console.log('🏫 Nom:', newSchool.name);
    console.log('🔢 Code:', newSchool.code);
    console.log('📧 Email directeur:', newSchool.email);
    
    // 5. Nettoyer localStorage
    localStorage.removeItem('pendingSchoolData');
    console.log('🧹 localStorage nettoyé');
    
    console.log('');
    console.log('🎉 SUCCÈS ! Vous pouvez maintenant vous connecter avec:');
    console.log('📧 Email:', user.email);
    console.log('🔑 Votre mot de passe habituel');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer la création
creerEcoleManquante();
`);

console.log('=================================================================');
console.log('');
console.log('Ce script va:');
console.log('1. Vérifier votre connexion Auth');
console.log('2. Récupérer vos données du localStorage'); 
console.log('3. Créer l\'école manquante pour votre compte');
console.log('4. Nettoyer le localStorage');
console.log('5. Vous permettre de vous connecter normalement');
console.log('');