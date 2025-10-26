// Test de connectivité Supabase avec variables d'environnement Node.js
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Test de connectivité EduTrack-CM avec Node.js...');
console.log('📍 URL Supabase:', supabaseUrl ? '✅ Configurée' : '❌ Manquante');
console.log('🔑 Clé Anon:', supabaseAnonKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Vérifiez votre fichier .env pour VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Pas de persistance en Node.js
  }
});

// Test 1: Connexion de base
async function testConnection() {
  try {
    console.log('\n📡 Test de connexion Supabase...');
    
    // Test simple avec auth
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erreur connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    return false;
  }
}

// Test 2: Inscription test
async function testSignup() {
  try {
    console.log('\n👤 Test d\'inscription...');
    
    const testEmail = `testdirector${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('📧 Email de test:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Directeur Test',
          role: 'principal'
        }
      }
    });
    
    if (error) {
      console.error('❌ Erreur inscription:', error.message);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      console.log('✅ Utilisateur créé avec succès!');
      console.log('- ID:', data.user.id);
      console.log('- Email:', data.user.email);
      console.log('- Confirmation email:', data.user.email_confirmed_at ? 'Confirmé' : 'En attente');
      console.log('- Session:', data.session ? 'Créée' : 'En attente de confirmation');
      
      return { 
        success: true, 
        userId: data.user.id, 
        email: data.user.email,
        needsConfirmation: !data.session 
      };
    }
    
    console.log('⚠️ Aucune donnée utilisateur retournée');
    return { success: false, error: 'Aucune donnée utilisateur' };
    
  } catch (error) {
    console.error('❌ Erreur test inscription:', error.message);
    return { success: false, error: error.message };
  }
}

// Test 3: Connexion avec le compte créé
async function testLogin(email, password) {
  try {
    console.log('\n🔐 Test de connexion...');
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) {
      console.error('❌ Erreur connexion:', error.message);
      
      // Codes d'erreur courants
      if (error.message.includes('Invalid login credentials')) {
        console.log('ℹ️ Compte non confirmé ou identifiants incorrects');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('ℹ️ Email non confirmé - vérifiez votre boîte mail');
      }
      
      return { success: false, error: error.message };
    }
    
    if (data.user && data.session) {
      console.log('✅ Connexion réussie!');
      console.log('- Utilisateur:', data.user.email);
      console.log('- Session valide jusqu\'au:', new Date(data.session.expires_at * 1000));
      return { success: true, user: data.user };
    }
    
    return { success: false, error: 'Pas de session créée' };
    
  } catch (error) {
    console.error('❌ Erreur test connexion:', error.message);
    return { success: false, error: error.message };
  }
}

// Exécution des tests
async function runAllTests() {
  console.log('🏁 Début des tests de connectivité...\n');
  
  // Test 1: Connexion de base
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('❌ Impossible de continuer sans connexion Supabase');
    return;
  }
  
  // Test 2: Inscription
  const signupResult = await testSignup();
  if (!signupResult.success) {
    console.log('❌ Test d\'inscription échoué, arrêt des tests');
    return;
  }
  
  // Test 3: Connexion (seulement si pas de confirmation requise)
  if (!signupResult.needsConfirmation) {
    console.log('\n🔄 Test de connexion avec le compte créé...');
    await testLogin(signupResult.email, 'TestPassword123!');
  } else {
    console.log('\n⏳ Confirmation email requise - test de connexion ignoré');
    console.log('✅ Pour un test complet, confirmez l\'email puis testez la connexion manuellement');
  }
  
  console.log('\n📊 Résumé:');
  console.log('✅ Connexion Supabase: OK');
  console.log('✅ Création de compte: OK');
  console.log('ℹ️ Système prêt pour les tests d\'interface');
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  console.log('1. Démarrer l\'application: npm start');
  console.log('2. Aller sur la page d\'inscription');
  console.log('3. Créer un compte école');
  console.log('4. Confirmer l\'email reçu');
  console.log('5. Se connecter avec les identifiants');
}

runAllTests().catch(console.error);