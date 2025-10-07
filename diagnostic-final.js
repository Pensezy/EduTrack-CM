console.log('🔍 DIAGNOSTIC - Pourquoi la connexion ne fonctionne pas');
console.log('');
console.log('L\'école existe, mais la connexion échoue. Diagnostiquons...');
console.log('');
console.log('Copiez ce code dans la console:');
console.log('===============================================');
console.log('');
console.log(`
// Diagnostic complet de la connexion
async function diagnosticConnexion() {
  console.log('🔍 Diagnostic de connexion...');
  
  try {
    const { supabase } = await import('./src/lib/supabase.js');
    
    // 1. Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Pas d\'utilisateur connecté');
      console.log('💡 Connectez-vous d\'abord avec votre email/mot de passe');
      return;
    }
    
    console.log('✅ Utilisateur connecté:');
    console.log('  📧 Email:', user.email);
    console.log('  🆔 ID:', user.id);
    console.log('  ✅ Email confirmé:', user.email_confirmed_at ? 'Oui' : 'Non');
    
    // 2. Rechercher TOUTES les écoles pour voir ce qui existe
    console.log('\\n🏫 Recherche de toutes les écoles...');
    const { data: allSchools, error: allError } = await supabase
      .from('schools')
      .select('id, name, code, director_user_id, director_name');
    
    if (allError) {
      console.error('❌ Erreur recherche écoles:', allError);
      return;
    }
    
    console.log('📊 Total écoles trouvées:', allSchools.length);
    allSchools.forEach((school, index) => {
      console.log(\`  \${index + 1}. \${school.name} (Code: \${school.code})\`);
      console.log(\`     Director ID: \${school.director_user_id}\`);
      console.log(\`     Director Name: \${school.director_name}\`);
      console.log(\`     Correspond à votre ID: \${school.director_user_id === user.id ? '✅ OUI' : '❌ NON'}\`);
      console.log('');
    });
    
    // 3. Rechercher spécifiquement votre école
    console.log('🎯 Recherche de VOTRE école...');
    const { data: yourSchool, error: yourError } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', user.id)
      .maybeSingle();
    
    if (yourError) {
      console.error('❌ Erreur recherche votre école:', yourError);
      return;
    }
    
    if (yourSchool) {
      console.log('✅ VOTRE école trouvée:');
      console.log('  🏫 Nom:', yourSchool.name);
      console.log('  🔢 Code:', yourSchool.code);
      console.log('  👤 Directeur:', yourSchool.director_name);
      console.log('  📊 Statut:', yourSchool.status);
      console.log('  🆔 Director ID:', yourSchool.director_user_id);
      
      console.log('\\n🎉 L\'école existe ! Le problème est ailleurs...');
      console.log('💡 Vérifiez que le statut de l\'école est "active"');
      
    } else {
      console.log('❌ AUCUNE école trouvée pour votre ID utilisateur');
      console.log('');
      console.log('🔧 SOLUTIONS POSSIBLES:');
      console.log('1. La colonne director_user_id est vide ou incorrecte');
      console.log('2. Mettre à jour l\'école existante avec votre ID');
      
      // Chercher une école avec votre nom
      const schoolWithYourName = allSchools.find(s => 
        s.director_name && s.director_name.includes('KONGA') || 
        s.name && s.name.includes('Biyem')
      );
      
      if (schoolWithYourName) {
        console.log('\\n💡 École trouvée avec votre nom:');
        console.log('  🏫', schoolWithYourName.name);
        console.log('  🆔 Director ID actuel:', schoolWithYourName.director_user_id);
        console.log('  🆔 Votre ID:', user.id);
        console.log('\\n🔧 Il faut probablement mettre à jour le director_user_id');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error.message);
  }
}

// Lancer le diagnostic
diagnosticConnexion();
`);

console.log('===============================================');
console.log('');
console.log('Ce diagnostic va nous dire exactement:');
console.log('1. Si votre ID utilisateur correspond à celui de l\'école');
console.log('2. Si la colonne director_user_id est bien remplie');
console.log('3. Quelle est la vraie cause du problème');
console.log('');