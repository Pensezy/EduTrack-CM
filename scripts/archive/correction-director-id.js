console.log('🔧 SOLUTION - Mise à jour du director_user_id');
console.log('');
console.log('Le problème identifié: Les IDs ne correspondent pas !');
console.log('');
console.log('ID dans les logs:    730805c2-4dbd-4734-bd3c-5b5aec4d1d59');
console.log('ID dans la DB:       9d4994bc-467a-4c59-abdf-db0c9e94b4e0');
console.log('');
console.log('Copiez ce script dans la console:');
console.log('===============================================');
console.log('');
console.log(`
// Script de correction du director_user_id
async function corrigerDirectorUserId() {
  console.log('🔧 Correction du director_user_id...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // 1. Vérifier l'utilisateur actuellement connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Vous devez être connecté avec votre compte');
      console.log('💡 Connectez-vous d\'abord sur l\'interface avec:');
      console.log('   📧 Email: pensezy.si@gmail.com');
      console.log('   🔑 Votre mot de passe');
      return;
    }
    
    console.log('✅ Utilisateur connecté:');
    console.log('  📧 Email:', user.email);
    console.log('  🆔 ID actuel:', user.id);
    
    // 2. Rechercher l'école "Biyem assi"
    console.log('\\n🔍 Recherche de votre école...');
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('name', 'Biyem assi')
      .single();
    
    if (schoolError) {
      console.error('❌ Erreur recherche école:', schoolError);
      return;
    }
    
    if (!school) {
      console.log('❌ École "Biyem assi" non trouvée');
      return;
    }
    
    console.log('✅ École trouvée:');
    console.log('  🏫 Nom:', school.name);
    console.log('  🔢 Code:', school.code);
    console.log('  🆔 Director ID actuel:', school.director_user_id);
    console.log('  🆔 Votre ID:', user.id);
    
    // 3. Vérifier si la mise à jour est nécessaire
    if (school.director_user_id === user.id) {
      console.log('✅ Les IDs correspondent déjà ! Pas de mise à jour nécessaire.');
      console.log('🎉 Vous devriez pouvoir vous connecter normalement.');
      
      // Nettoyer localStorage
      localStorage.removeItem('pendingSchoolData');
      console.log('🧹 localStorage nettoyé');
      return;
    }
    
    // 4. Mettre à jour le director_user_id
    console.log('\\n🔄 Mise à jour du director_user_id...');
    const { data: updatedSchool, error: updateError } = await supabase
      .from('schools')
      .update({ 
        director_user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', school.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      return;
    }
    
    console.log('✅ École mise à jour avec succès !');
    console.log('  🏫 Nom:', updatedSchool.name);
    console.log('  🔢 Code:', updatedSchool.code);
    console.log('  🆔 Nouveau Director ID:', updatedSchool.director_user_id);
    
    // 5. Nettoyer localStorage
    localStorage.removeItem('pendingSchoolData');
    console.log('🧹 localStorage nettoyé');
    
    console.log('\\n🎉 SUCCÈS ! Vous pouvez maintenant vous connecter avec:');
    console.log('  📧 Email: pensezy.si@gmail.com');
    console.log('  🔑 Votre mot de passe habituel');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer la correction
corrigerDirectorUserId();
`);

console.log('===============================================');
console.log('');
console.log('Ce script va:');
console.log('1. Récupérer votre ID utilisateur actuel');
console.log('2. Trouver votre école "Biyem assi"');
console.log('3. Mettre à jour le director_user_id avec le bon ID');
console.log('4. Vous permettre de vous connecter normalement');
console.log('');