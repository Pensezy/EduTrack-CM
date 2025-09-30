// Test direct du service de création de compte principal
// Ce fichier teste la création d'un compte sans interface utilisateur

import { createPrincipalSchool } from './src/services/schoolService.js';
import { supabase } from './src/lib/supabase.js';

async function testAccountCreation() {
  console.log('🧪 Début du test de création de compte...');
  
  const testData = {
    // Données du directeur
    directorName: 'Test Directeur',
    email: 'test.directeur@example.com',
    phone: '+33123456789',
    password: 'TestPassword123!',
    
    // Données de l'école
    schoolName: 'École Test',
    schoolType: 'primaire',
    country: 'France',
    city: 'Paris',
    address: '123 Rue de Test',
    
    // Classes disponibles (optionnel)
    availableClasses: ['CP', 'CE1', 'CE2']
  };

  try {
    // 1. Tester la création d'un utilisateur Supabase Auth
    console.log('📝 Création de l\'utilisateur Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password
    });

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucune donnée utilisateur retournée');
      return;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // 2. Tester la création avec Prisma
    console.log('🏫 Création de l\'école avec Prisma...');
    const result = await createPrincipalSchool({
      ...testData,
      userId: authData.user.id
    });

    if (result.success) {
      console.log('✅ École créée avec succès !', result.data);
      
      // 3. Vérification des données créées
      console.log('📊 Données créées:');
      console.log('- École ID:', result.data.school.id);
      console.log('- Directeur ID:', result.data.user.id);
      console.log('- Auth User ID:', authData.user.id);
      
      return {
        success: true,
        authUserId: authData.user.id,
        schoolId: result.data.school.id,
        directorId: result.data.user.id,
        email: testData.email
      };
    } else {
      console.error('❌ Erreur création école:', result.message);
      return { success: false, error: result.message };
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return { success: false, error: error.message };
  }
}

// Test de connexion avec les données créées
async function testLogin(email, password) {
  console.log('🔐 Test de connexion...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Connexion réussie !', data.user.email);
    return { success: true, user: data.user };

  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    return { success: false, error: error.message };
  }
}

// Exécution du test
testAccountCreation()
  .then(async (result) => {
    if (result.success) {
      console.log('\n🎉 Test de création réussi !');
      
      // Test de connexion
      const loginResult = await testLogin('test.directeur@example.com', 'TestPassword123!');
      
      if (loginResult.success) {
        console.log('\n🎉 Test complet réussi ! Le système fonctionne correctement.');
        console.log('✅ Inscription + Prisma + Connexion = OK');
      } else {
        console.log('\n⚠️ Création OK mais connexion échouée:', loginResult.error);
      }
    } else {
      console.log('\n❌ Test de création échoué:', result.error);
    }
  })
  .catch(error => {
    console.error('❌ Erreur test:', error);
  });