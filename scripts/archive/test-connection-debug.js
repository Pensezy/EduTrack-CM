// Test pour diagnostiquer les problèmes de connexion après création de compte
import { supabase } from './src/lib/supabase.js';

async function testLogin() {
  console.log('🔐 Test de connexion après création de compte\n');
  
  // Demander les informations de connexion
  console.log('📝 Entrez vos informations de connexion:');
  
  // Pour le test, utilisez les vraies infos de votre compte créé
  const email = 'test@example.com'; // REMPLACEZ par votre vraie adresse
  const password = 'votre-mot-de-passe'; // REMPLACEZ par votre vrai mot de passe
  
  console.log(`Tentative de connexion avec: ${email}`);
  
  try {
    // 1. Test de connexion Supabase Auth direct
    console.log('\n1️⃣ Test connexion Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('❌ Erreur Auth:', authError.message);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('💡 SOLUTION: Vérifiez votre email et mot de passe');
      }
      if (authError.message.includes('Email not confirmed')) {
        console.log('💡 SOLUTION: Confirmez votre email d\'abord');
      }
      return;
    }
    
    console.log('✅ Connexion Auth réussie!');
    console.log('User ID:', authData.user.id);
    console.log('Email confirmé:', authData.user.email_confirmed_at ? 'Oui' : 'Non');
    
    // 2. Test de récupération des données école
    console.log('\n2️⃣ Test récupération données école...');
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('director_user_id', authData.user.id);
    
    if (schoolError) {
      console.error('❌ Erreur récupération école:', schoolError.message);
      return;
    }
    
    if (!schoolData || schoolData.length === 0) {
      console.log('❌ Aucune école trouvée pour cet utilisateur');
      console.log('💡 SOLUTIONS POSSIBLES:');
      console.log('  • L\'école n\'a pas été créée lors de l\'inscription');
      console.log('  • Problème de liaison director_user_id');
      console.log('  • Données en localStorage non finalisées');
      
      // Vérifier localStorage
      const pendingData = localStorage.getItem('pendingSchoolData');
      if (pendingData) {
        console.log('📋 Données en attente trouvées:', JSON.parse(pendingData));
        console.log('💡 Exécutez la finalisation des données');
      }
      
      return;
    }
    
    console.log('✅ École trouvée:', schoolData[0].name);
    console.log('Code école:', schoolData[0].code);
    console.log('Statut:', schoolData[0].status);
    
    // 3. Test du service authService complet
    console.log('\n3️⃣ Test service authService...');
    const { loginDirector } = await import('./src/services/authService.js');
    
    const result = await loginDirector(email, password);
    
    if (result.success) {
      console.log('✅ Service loginDirector fonctionnel!');
      console.log('École:', result.school.name);
      console.log('Statut:', result.school.status);
    } else {
      console.error('❌ Erreur service loginDirector:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// IMPORTANT: Modifiez les constantes email/password ci-dessus avec vos vraies données
console.log('⚠️  IMPORTANT: Modifiez les constantes email/password dans ce fichier');
testLogin().catch(console.error);