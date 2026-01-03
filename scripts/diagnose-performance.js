/**
 * Script de diagnostic des performances
 * Vérifie la configuration de la base de données et identifie les problèmes
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Diagnostic de Performance - EduTrack CM\n');
console.log('='.repeat(60));

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return { exists: false, error: 'Table non trouvée' };
      }
      return { exists: false, error: error.message };
    }

    return { exists: true, count: data };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function checkColumnExists(tableName, columnName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columnName, { count: 'exact', head: true });

    if (error) {
      if (error.code === '42703') {
        return { exists: false, error: `Colonne '${columnName}' non trouvée` };
      }
      return { exists: false, error: error.message };
    }

    return { exists: true };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function diagnose() {
  console.log('\n📊 VÉRIFICATION DES TABLES\n');

  const tables = [
    'users',
    'schools',
    'students',
    'teachers',
    'parents',
    'secretaries',
    'classes',
    'subjects',
    'notifications',
    'user_notifications',
    'bundles',
    'bundle_access_requests'
  ];

  for (const table of tables) {
    const result = await checkTableExists(table);
    if (result.exists) {
      console.log(`  ✅ ${table.padEnd(25)} - Existe`);
    } else {
      console.log(`  ❌ ${table.padEnd(25)} - ${result.error}`);
    }
  }

  console.log('\n📊 VÉRIFICATION DES COLONNES CRITIQUES\n');

  const columns = [
    { table: 'users', column: 'profession' },
    { table: 'users', column: 'address' },
    { table: 'user_notifications', column: 'user_id' },
    { table: 'user_notifications', column: 'is_read' }
  ];

  for (const { table, column } of columns) {
    const result = await checkColumnExists(table, column);
    if (result.exists) {
      console.log(`  ✅ ${table}.${column.padEnd(20)} - Existe`);
    } else {
      console.log(`  ❌ ${table}.${column.padEnd(20)} - ${result.error}`);
    }
  }

  console.log('\n📊 TEST DE REQUÊTES\n');

  // Test 1: Récupérer un utilisateur
  console.log('  Test 1: Récupération utilisateur...');
  const start1 = Date.now();
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role, current_school_id')
    .limit(1);
  const time1 = Date.now() - start1;

  if (usersError) {
    console.log(`    ❌ Erreur: ${usersError.message} (${time1}ms)`);
  } else {
    console.log(`    ✅ Succès (${time1}ms) - ${users.length} résultat(s)`);
    if (time1 > 500) {
      console.log(`    ⚠️  Lent! Devrait être < 500ms`);
    }
  }

  // Test 2: Récupérer des notifications utilisateur
  if (users && users.length > 0) {
    console.log('  Test 2: Récupération notifications...');
    const start2 = Date.now();
    const { data: notifs, error: notifsError } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', users[0].id)
      .limit(20);
    const time2 = Date.now() - start2;

    if (notifsError) {
      console.log(`    ❌ Erreur: ${notifsError.message} (${time2}ms)`);
    } else {
      console.log(`    ✅ Succès (${time2}ms) - ${notifs.length} résultat(s)`);
      if (time2 > 500) {
        console.log(`    ⚠️  Lent! Devrait être < 500ms`);
      }
    }
  }

  // Test 3: Récupérer des écoles
  console.log('  Test 3: Récupération écoles...');
  const start3 = Date.now();
  const { data: schools, error: schoolsError } = await supabase
    .from('schools')
    .select('id, name, is_active')
    .limit(10);
  const time3 = Date.now() - start3;

  if (schoolsError) {
    console.log(`    ❌ Erreur: ${schoolsError.message} (${time3}ms)`);
  } else {
    console.log(`    ✅ Succès (${time3}ms) - ${schools.length} résultat(s)`);
    if (time3 > 500) {
      console.log(`    ⚠️  Lent! Devrait être < 500ms`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 RÉSUMÉ\n');

  const issues = [];

  // Vérifier user_notifications
  const userNotifsCheck = await checkTableExists('user_notifications');
  if (!userNotifsCheck.exists) {
    issues.push({
      severity: '🔴 CRITIQUE',
      title: 'Table user_notifications manquante',
      solution: 'Exécuter la migration: supabase/migrations/20260103_create_user_notifications.sql'
    });
  }

  // Vérifier colonnes parents
  const professionCheck = await checkColumnExists('users', 'profession');
  const addressCheck = await checkColumnExists('users', 'address');
  if (!professionCheck.exists || !addressCheck.exists) {
    issues.push({
      severity: '🟠 IMPORTANT',
      title: 'Colonnes profession/address manquantes dans users',
      solution: 'Exécuter la migration: supabase/migrations/20260103_add_parent_fields.sql'
    });
  }

  if (issues.length === 0) {
    console.log('  ✅ Aucun problème critique détecté!\n');
  } else {
    console.log(`  ⚠️  ${issues.length} problème(s) détecté(s):\n`);
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.severity} ${issue.title}`);
      console.log(`     → Solution: ${issue.solution}\n`);
    });
  }

  console.log('📖 Documentation complète: CRITICAL_FIXES_REQUIRED.md');
  console.log('='.repeat(60) + '\n');
}

diagnose()
  .then(() => {
    console.log('✅ Diagnostic terminé\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Erreur fatale:', err);
    process.exit(1);
  });
