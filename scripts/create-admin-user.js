/**
 * Script pour créer un compte administrateur
 *
 * Utilisation:
 * node scripts/create-admin-user.js
 *
 * Variables d'environnement requises:
 * - VITE_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (clé service role, PAS anon key)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Configuration de l'admin à créer
const ADMIN_CONFIG = {
  email: 'admin@edutrack.cm',
  password: 'AdminEduTrack!2026',
  full_name: 'Super Admin',
  phone: '+237600000000',
  role: 'admin',
};

async function createAdminUser() {
  console.log('\n🚀 Création du compte administrateur...\n');

  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL n\'est pas défini dans .env');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY n\'est pas défini dans .env');
    console.error('💡 La clé Service Role est disponible dans:');
    console.error('   Supabase Dashboard > Settings > API > service_role key (secret)');
    process.exit(1);
  }

  // Créer un client Supabase avec la clé service role (bypass RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Étape 1: Vérifier si l'email existe déjà
    console.log('🔍 Vérification de l\'existence de l\'email...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', ADMIN_CONFIG.email)
      .maybeSingle();

    if (existingUser) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Rôle: ${existingUser.role}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log('\n💡 Si vous voulez réinitialiser ce compte, supprimez-le d\'abord dans Supabase Dashboard.');
      process.exit(0);
    }

    // Étape 2: Créer le compte dans Supabase Auth
    console.log('📝 Création du compte Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name: ADMIN_CONFIG.full_name,
        phone: ADMIN_CONFIG.phone,
        role: 'admin',
      },
    });

    if (authError) {
      throw new Error(`Erreur Auth: ${authError.message}`);
    }

    console.log(`✅ Compte Auth créé (ID: ${authData.user.id})`);

    // Étape 3: Créer l'entrée dans la table users
    console.log('📝 Création du profil utilisateur...');
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: ADMIN_CONFIG.email,
          full_name: ADMIN_CONFIG.full_name,
          phone: ADMIN_CONFIG.phone,
          role: ADMIN_CONFIG.role,
          current_school_id: null, // Admin n'est lié à aucune école spécifique
          is_active: true,
        },
      ]);

    if (userError) {
      // Si erreur, supprimer le compte Auth créé
      console.error('❌ Erreur lors de la création du profil, nettoyage...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Erreur profil: ${userError.message}`);
    }

    console.log('✅ Profil utilisateur créé');

    // Récapitulatif
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎉 COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📧 Email       : ${ADMIN_CONFIG.email}`);
    console.log(`🔑 Mot de passe: ${ADMIN_CONFIG.password}`);
    console.log(`👤 Nom         : ${ADMIN_CONFIG.full_name}`);
    console.log(`📱 Téléphone   : ${ADMIN_CONFIG.phone}`);
    console.log(`🆔 User ID     : ${authData.user.id}`);
    console.log(`🎭 Rôle        : ${ADMIN_CONFIG.role}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!');
    console.log('');
    console.log('🌐 Vous pouvez maintenant vous connecter sur:');
    console.log(`   ${process.env.VITE_APP_URL || 'http://localhost:5173'}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors de la création de l\'administrateur:');
    console.error(`   ${error.message}`);
    console.error('');
    process.exit(1);
  }
}

// Exécuter le script
createAdminUser();
