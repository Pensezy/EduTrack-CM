// Test pour vérifier si on peut créer les données directement après inscription
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testDirectSchoolCreation() {
  console.log('🧪 Test de création directe école après inscription...\n');

  try {
    // 1. Créer un utilisateur test
    const testEmail = `testdirect${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('📝 Création utilisateur test:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Directeur',
          role: 'principal'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur création utilisateur:', authError);
      return false;
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);
    console.log('📧 Email confirmé automatiquement:', authData.user.email_confirmed_at ? 'Oui' : 'Non');

    // 2. Essayer de créer les données école immédiatement
    console.log('\n🏫 Tentative de création école immédiate...');

    const schoolData = {
      name: 'École Test Direct',
      code: `TEST-${Date.now()}`,
      type: 'primaire',
      director_name: 'Test Directeur',
      phone: '+237123456789',
      address: '123 Rue Test',
      city: 'Yaoundé',
      country: 'Cameroun',
      available_classes: ['CP', 'CE1'],
      status: 'active',
      director_user_id: authData.user.id
    };

    const { data: createdSchool, error: schoolError } = await supabase
      .from('schools')
      .insert(schoolData)
      .select()
      .single();

    if (schoolError) {
      console.error('❌ Erreur création école:', schoolError);
      console.log('Code erreur:', schoolError.code);
      console.log('Message:', schoolError.message);
      
      if (schoolError.code === '42501') {
        console.log('🔒 Erreur de permissions - RLS active');
      } else if (schoolError.message.includes('406')) {
        console.log('🚫 Erreur 406 - Email non confirmé');
      }
      
      return false;
    }

    console.log('✅ École créée avec succès !', createdSchool.id);

    // 3. Essayer de créer l'utilisateur dans la table users
    console.log('\n👤 Création utilisateur dans table users...');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: 'Test Directeur',
        phone: '+237123456789',
        role: 'principal',
        current_school_id: createdSchool.id,
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur création user:', userError);
      return false;
    }

    console.log('✅ Utilisateur créé avec succès !', userData.id);

    console.log('\n🎉 CRÉATION DIRECTE POSSIBLE !');
    console.log('✅ Pas d\'erreur 406');
    console.log('✅ RLS permet la création');
    console.log('✅ Données bien créées en DB');

    return true;

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return false;
  }
}

async function testWithConfirmedUser() {
  console.log('\n🔐 Test avec utilisateur confirmé...');
  
  // Test avec un utilisateur qui confirme son email d'abord
  try {
    const testEmail = `testconfirmed${Date.now()}@gmail.com`;
    
    console.log('📝 Création utilisateur avec confirmation:', testEmail);
    
    // Simuler un utilisateur confirmé (en réalité il faudrait cliquer le lien)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Test Confirmé',
          role: 'principal'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur:', authError);
      return false;
    }

    console.log('✅ Utilisateur créé:', authData.user.id);
    console.log('⏳ En attente de confirmation email...');
    
    return true;

  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

async function runTests() {
  console.log('🏁 Tests de création directe vs différée...\n');

  const directResult = await testDirectSchoolCreation();
  await testWithConfirmedUser();

  console.log('\n📊 RÉSULTATS:');
  console.log('- Création directe:', directResult ? '✅ Possible' : '❌ Impossible');
  
  if (directResult) {
    console.log('\n💡 RECOMMANDATION:');
    console.log('✅ Nous pouvons créer les données directement !');
    console.log('✅ Pas besoin de localStorage');
    console.log('✅ Retour au flux original mais corrigé');
  } else {
    console.log('\n💡 RECOMMANDATION:');
    console.log('⚠️ Garder le flux actuel avec localStorage');
    console.log('⚠️ Données créées à la première connexion');
  }
}

runTests().catch(console.error);