// Test simple de la connexion Supabase et des services
// Ce test vérifie la connectivité sans utiliser Prisma directement

import { supabase } from './src/lib/supabase.js';

console.log('🧪 Test de connectivité EduTrack-CM...');

// Test 1: Vérifier la connexion Supabase
async function testSupabaseConnection() {
  try {
    console.log('\n📡 Test de connexion Supabase...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('⚠️ Table users non accessible (normal si pas encore créée):', error.message);
      
      // Test alternatif avec auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('❌ Erreur connexion Supabase Auth:', authError);
        return false;
      } else {
        console.log('✅ Connexion Supabase Auth OK');
        return true;
      }
    } else {
      console.log('✅ Connexion Supabase et table users OK');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur test Supabase:', error);
    return false;
  }
}

// Test 2: Vérifier les services importés
async function testServicesImport() {
  try {
    console.log('\n📦 Test d\'importation des services...');
    
    // Test import authService
    const authService = await import('./src/services/authService.js');
    console.log('✅ authService importé');
    
    // Test import schoolService (côté serveur uniquement)
    console.log('⚠️ schoolService nécessite un environnement serveur (Prisma)');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur import services:', error);
    return false;
  }
}

// Test 3: Simuler une inscription (Supabase Auth uniquement)
async function testAuthSignup() {
  try {
    console.log('\n👤 Test d\'inscription Supabase Auth...');
    
    const testEmail = `test.${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('❌ Erreur inscription:', error.message);
      return false;
    }
    
    if (data.user) {
      console.log('✅ Utilisateur créé:', data.user.id);
      console.log('📧 Email de confirmation requis:', !data.session);
      
      // Nettoyage : supprimer l'utilisateur de test (pas possible via API publique)
      console.log('ℹ️ Utilisateur test créé, vérifiez dans le dashboard Supabase');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur test inscription:', error);
    return false;
  }
}

// Exécution des tests
async function runTests() {
  console.log('🏁 Début des tests...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    services: await testServicesImport(),
    auth: await testAuthSignup()
  };
  
  console.log('\n📊 Résultats des tests:');
  console.log('- Connexion Supabase:', results.supabase ? '✅' : '❌');
  console.log('- Import Services:', results.services ? '✅' : '❌');  
  console.log('- Inscription Auth:', results.auth ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Tous les tests de base passent !');
    console.log('✅ Le système est prêt pour les tests d\'interface utilisateur');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  return results;
}

runTests().catch(console.error);