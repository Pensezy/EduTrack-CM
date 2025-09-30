// Test client pour appeler l'API de création de compte
// Utilise fetch natif de Node.js 22

async function testCompleteAccountCreation() {
  try {
    console.log('🧪 Test de création de compte complet via API...');
    
    const response = await fetch('http://localhost:3001/test-create-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Compte créé avec succès !');
      console.log('📊 Données créées:');
      console.log('- Auth User ID:', result.data.authUserId);
      console.log('- User DB ID:', result.data.user.id);
      console.log('- École ID:', result.data.school.id);
      console.log('- École nom:', result.data.school.name);
      console.log('- Classes créées:', result.data.classes.length);
      console.log('- Email confirmation:', result.data.needsEmailConfirmation ? 'Requise' : 'Non requise');
      
      // Test de vérification des données
      console.log('\n🔍 Vérification des données...');
      const verifyResponse = await fetch(`http://localhost:3001/test-verify-data/${result.data.user.id}`);
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success) {
        console.log('✅ Données vérifiées avec succès !');
        console.log('- Utilisateur:', verifyResult.data.full_name);
        console.log('- Email:', verifyResult.data.email);
        console.log('- Écoles dirigées:', verifyResult.data.directed_schools.length);
        console.log('- Classes total:', verifyResult.data.directed_schools.reduce((acc, school) => acc + school.classes.length, 0));
        
        return {
          success: true,
          data: result.data,
          verification: verifyResult.data
        };
      } else {
        console.error('❌ Erreur vérification:', verifyResult.error);
        return { success: false, error: verifyResult.error };
      }
      
    } else {
      console.error('❌ Erreur création compte:', result.error);
      console.error('Détails:', result.details);
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error.message);
    return { success: false, error: error.message };
  }
}

// Test de santé de l'API
async function testAPIHealth() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const result = await response.json();
    console.log('🏥 Santé API:', result.status);
    return result.status === 'OK';
  } catch (error) {
    console.error('❌ API non accessible:', error.message);
    return false;
  }
}

// Exécution des tests
async function runTests() {
  console.log('🏁 Début des tests API complets...\n');
  
  // Test de santé
  const apiHealthy = await testAPIHealth();
  if (!apiHealthy) {
    console.log('❌ API non accessible, arrêt des tests');
    return;
  }
  
  // Test de création complète
  const result = await testCompleteAccountCreation();
  
  console.log('\n📊 RÉSUMÉ FINAL:');
  if (result.success) {
    console.log('✅ TOUS LES TESTS PASSENT !');
    console.log('✅ Supabase Auth: OK');
    console.log('✅ Prisma Database: OK');
    console.log('✅ Création User: OK');
    console.log('✅ Création School: OK');
    console.log('✅ Création Classes: OK');
    console.log('✅ Vérification Données: OK');
    
    console.log('\n🎉 LE SYSTÈME FONCTIONNE PARFAITEMENT !');
    console.log('🔄 Prochaine étape: Tester l\'interface utilisateur');
    
  } else {
    console.log('❌ ÉCHEC DES TESTS');
    console.log('Erreur:', result.error);
  }
}

runTests().catch(console.error);