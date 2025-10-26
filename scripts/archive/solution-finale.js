console.log('🔧 SOLUTION FINALE - Script de création d\'école direct');
console.log('');
console.log('Copiez et collez ce code dans la console de votre navigateur:');
console.log('================================================');
console.log('');
console.log(`
// Script de création directe d'école - Version simplifiée
async function creerEcoleFinalement() {
  console.log('🏫 Création directe finale...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    const ecoleData = {
      name: 'Biyem assi',
      code: 'BIY-2025-FINAL',
      director_user_id: '730805c2-4dbd-4734-bd3c-5b5aec4d1d59',
      status: 'active'
    };
    
    console.log('📋 Création avec données:', ecoleData);
    
    const { data, error } = await supabase
      .from('schools')
      .insert(ecoleData)
      .select('id, name, code')
      .single();
    
    if (error) {
      console.error('❌ Erreur:', error);
      
      if (error.code === '23505') {
        console.log('✅ École existe déjà ! Essayez de vous connecter.');
      }
      return;
    }
    
    console.log('✅ École créée:', data);
    console.log('🎉 SUCCÈS ! Vous pouvez maintenant vous connecter.');
    
    // Nettoyer localStorage
    localStorage.removeItem('pendingSchoolData');
    console.log('🧹 localStorage nettoyé');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancer la création
creerEcoleFinalement();
`);

console.log('================================================');
console.log('');
console.log('Après avoir exécuté ce script, essayez de vous connecter avec:');
console.log('Email: pensezy.si@gmail.com'); 
console.log('Mot de passe: [votre mot de passe]');
console.log('');