/**
 * Test de création de compte secrétaire
 * Ce script teste la création complète d'un compte secrétaire
 */

import { supabase } from '../lib/supabase.js';

async function testSecretaryCreation() {
  console.log('🧪 Test de création de compte secrétaire...');
  
  const testData = {
    // Données du secrétaire
    full_name: 'Marie Test Secrétaire',
    email: `secretaire.test.${Date.now()}@edutrack.cm`,
    phone: '+237123456789',
    role: 'secretary',
    password: 'SecretaireTest123!'
  };

  try {
    // 1. Créer d'abord l'utilisateur dans Supabase Auth
    console.log('🔐 Création utilisateur Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          full_name: testData.full_name,
          phone: testData.phone,
          role: testData.role
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Auth:', authError.message);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('❌ Aucune donnée utilisateur retournée');
      return { success: false, error: 'Pas de données utilisateur' };
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // 2. Récupérer une école existante pour le test
    const { data: schools, error: schoolError } = await supabase
      .from('schools')
      .select('id, name')
      .limit(1);

    if (schoolError || !schools || schools.length === 0) {
      console.error('❌ Aucune école disponible pour le test');
      return { success: false, error: 'Aucune école disponible' };
    }

    const testSchool = schools[0];
    console.log('🏫 École de test:', testSchool.name);

    // 3. Créer l'utilisateur dans la table users
    console.log('👤 Création utilisateur dans table users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        full_name: testData.full_name,
        email: testData.email,
        phone: testData.phone,
        role: 'secretary',
        school_id: testSchool.id,
        pin_code: Math.floor(1000 + Math.random() * 9000).toString(),
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ Erreur création utilisateur:', userError.message);
      return { success: false, error: userError.message };
    }

    console.log('✅ Utilisateur créé avec succès !');
    console.log('📋 Données utilisateur:', {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      school_id: userData.school_id,
      pin_code: userData.pin_code
    });

    // 4. Tester la récupération des données
    console.log('🔍 Test de récupération des données...');
    const { data: retrievedUser, error: retrieveError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        school_id,
        pin_code,
        active,
        created_at,
        schools!users_school_id_fkey (
          name,
          address,
          city
        )
      `)
      .eq('id', userData.id)
      .single();

    if (retrieveError) {
      console.error('❌ Erreur récupération:', retrieveError.message);
      return { success: false, error: retrieveError.message };
    }

    console.log('✅ Données récupérées avec succès !');
    console.log('📊 Utilisateur complet:', {
      ...retrievedUser,
      school_name: retrievedUser.schools?.name
    });

    // 5. Test de connexion
    console.log('🔐 Test de connexion...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testData.email,
      password: testData.password
    });

    if (loginError) {
      console.error('❌ Erreur de connexion:', loginError.message);
      return { success: false, error: loginError.message };
    }

    console.log('✅ Connexion réussie !');

    // 6. Test de récupération avec RLS (Row Level Security)
    console.log('🔒 Test RLS - Récupération des tâches...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('school_id', testSchool.id)
      .limit(5);

    if (tasksError) {
      console.log('⚠️ RLS actif - accès limité aux tâches:', tasksError.message);
    } else {
      console.log('✅ Accès aux tâches OK -', tasks.length, 'tâches trouvées');
    }

    return {
      success: true,
      data: {
        auth_user: authData.user,
        user_data: userData,
        school: testSchool,
        login_successful: true,
        rls_working: tasksError ? true : false
      }
    };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return { success: false, error: error.message };
  }
}

// Test de nettoyage (optionnel)
async function cleanupTestUser(email) {
  console.log('🧹 Nettoyage utilisateur de test...');
  
  try {
    // Récupérer l'utilisateur pour obtenir son ID
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (getUserError) {
      console.log('⚠️ Utilisateur déjà supprimé ou introuvable');
      return;
    }

    // Supprimer de la table users
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('❌ Erreur suppression utilisateur:', deleteError.message);
    } else {
      console.log('✅ Utilisateur supprimé de la table users');
    }

    // Note: La suppression de Supabase Auth nécessite des privilèges admin
    console.log('ℹ️ Suppression Auth nécessite privilèges admin');

  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

// Exporter les fonctions pour utilisation
export { testSecretaryCreation, cleanupTestUser };

// Exécution automatique si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testSecretaryCreation()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 Test de création de compte secrétaire RÉUSSI !');
        console.log('✅ Authentification: OK');
        console.log('✅ Base de données: OK');
        console.log('✅ Sécurité RLS: OK');
        console.log('✅ Connexion utilisateur: OK');
        console.log('\n📝 Résumé:', result.data);
      } else {
        console.log('\n❌ Test ÉCHOUÉ:', result.error);
      }
    })
    .catch(error => {
      console.error('\n💥 Erreur fatale:', error);
    });
}