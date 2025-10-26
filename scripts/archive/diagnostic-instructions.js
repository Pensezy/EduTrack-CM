console.log('🔍 DIAGNOSTIC DE CONNEXION - Instructions d\'utilisation\n');

console.log('1. Ouvrez la console de votre navigateur (F12)');
console.log('2. Copiez-collez ce code et remplacez EMAIL et PASSWORD par vos vraies données:');
console.log('3. Appuyez sur Entrée pour exécuter\n');

console.log(`
// ===== COPIEZ CE CODE DANS LA CONSOLE DU NAVIGATEUR =====

async function diagnosticConnexion() {
  console.log('🔍 Diagnostic de connexion...');
  
  // ⚠️ REMPLACEZ ces valeurs par vos vraies données
  const EMAIL = 'votre-email@exemple.com';  // ← CHANGEZ ICI
  const PASSWORD = 'votre-mot-de-passe';    // ← CHANGEZ ICI
  
  if (EMAIL === 'votre-email@exemple.com') {
    console.error('❌ Vous devez modifier EMAIL et PASSWORD dans le code !');
    return;
  }
  
  try {
    // Import du client Supabase
    const { supabase } = await import('./src/lib/supabase.js');
    
    // 1. Test de connexion
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD
    });
    
    if (authError) {
      console.error('❌ Erreur de connexion:', authError.message);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('💡 Email ou mot de passe incorrect');
      }
      if (authError.message.includes('Email not confirmed')) {
        console.log('💡 Email non confirmé - vérifiez votre boîte mail');
      }
      return;
    }
    
    console.log('✅ Connexion réussie !');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('Email confirmé:', authData.user.email_confirmed_at ? 'OUI' : 'NON');
    
    // 2. Vérifier les données école
    console.log('\\n2️⃣ Recherche de votre école...');
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', authData.user.id);
    
    if (schoolError) {
      console.error('❌ Erreur récupération école:', schoolError.message);
      return;
    }
    
    if (!schools || schools.length === 0) {
      console.log('❌ PROBLÈME: Aucune école trouvée pour votre compte');
      console.log('💡 Causes possibles:');
      console.log('   • École pas créée lors de l\\'inscription');
      console.log('   • Données restées dans localStorage');
      
      // Vérifier localStorage
      const pending = localStorage.getItem('pendingSchoolData');
      if (pending) {
        console.log('📋 Données en attente trouvées:');
        console.log(JSON.parse(pending));
        console.log('💡 Essayez de finaliser la création d\\'école');
      } else {
        console.log('📋 Aucune donnée en attente dans localStorage');
      }
      return;
    }
    
    console.log('✅ École trouvée:', schools[0].name);
    console.log('Code:', schools[0].code);
    console.log('Statut:', schools[0].status);
    
    // 3. Test du service complet
    console.log('\\n3️⃣ Test du service de connexion...');
    const { loginDirector } = await import('./src/services/authService.js');
    const result = await loginDirector(EMAIL, PASSWORD);
    
    if (result.success) {
      console.log('✅ CONNEXION COMPLÈTE RÉUSSIE !');
      console.log('École:', result.school.name);
      console.log('Vous pouvez maintenant vous connecter normalement');
    } else {
      console.error('❌ Erreur service:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le diagnostic
diagnosticConnexion();

// ===== FIN DU CODE À COPIER =====
`);

console.log('4. Analysez les résultats pour identifier le problème');
console.log('5. Reportez-moi les messages d\\'erreur si nécessaire\n');