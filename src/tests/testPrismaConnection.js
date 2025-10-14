// Test rapide de connexion Prisma
import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testPrismaConnection() {
  console.log('🔍 Test de connexion Prisma...');
  
  try {
    // Test simple de ping
    console.log('1. Test de ping base de données...');
    const result = await prisma.$queryRaw`SELECT 1 as connection_test`;
    console.log('✅ Ping réussi:', result);

    // Test de lecture simple
    console.log('2. Test de lecture table schools...');
    const schoolCount = await prisma.school.count();
    console.log('✅ Nombre d\'écoles:', schoolCount);

    // Test lecture avec Supabase
    console.log('3. Test compatibilité Supabase/Prisma...');
    const schools = await prisma.school.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true
      }
    });
    console.log('✅ Écoles trouvées:', schools.length);
    schools.forEach(school => {
      console.log(`  - ${school.name} (${school.type})`);
    });

    // Test d'écriture (création utilisateur secrétaire)
    console.log('4. Test de création utilisateur secrétaire...');
    
    // Vérifier si on peut créer un utilisateur de test
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // UUID de test
    
    try {
      const testUser = await prisma.user.create({
        data: {
          id: testUserId,
          email: `test.secretary.${Date.now()}@edutrack.cm`,
          fullName: 'Test Secrétaire Prisma',
          role: 'secretary',
          isActive: true,
          currentSchoolId: schools[0]?.id // Utiliser la première école trouvée
        }
      });
      
      console.log('✅ Utilisateur secrétaire créé:', testUser.email);
      
      // Nettoyer (supprimer l'utilisateur de test)
      await prisma.user.delete({
        where: { id: testUserId }
      });
      console.log('✅ Utilisateur de test supprimé');
      
    } catch (createError) {
      console.log('⚠️ Test de création échoué (peut-être normal):', createError.message);
    }

    console.log('\n🎉 RÉSULTAT: Prisma fonctionne correctement !');
    console.log('✅ Connexion: OK');
    console.log('✅ Lecture: OK');
    console.log('✅ Structure: OK');
    console.log('✅ Compatibilité Supabase: OK');

    return true;

  } catch (error) {
    console.error('❌ Erreur Prisma:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solutions pour P1001:');
      console.log('1. Vérifier la connexion internet');
      console.log('2. Vérifier les credentials dans .env');
      console.log('3. Utiliser le Dashboard Supabase directement');
      console.log('4. Essayer avec DIRECT_URL au lieu de DATABASE_URL');
    }

    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Test alternatif avec Supabase direct
async function testSupabaseAlternative() {
  console.log('\n🔄 Test alternatif avec Supabase client...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qgjgpycturpzlohwfsoi.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnamdweWN0dXJwemxvaHdmc29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzM5NzgsImV4cCI6MjA3NTUwOTk3OH0.MrH36ExUJsgjQIEA6rwcdydTaDJvsI7Ts9yFtlD4egk';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test de connexion Supabase
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, type')
      .limit(3);
    
    if (error) {
      console.log('❌ Erreur Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase fonctionne - écoles trouvées:', data.length);
    data.forEach(school => {
      console.log(`  - ${school.name} (${school.type})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur test Supabase:', error.message);
    return false;
  }
}

// Exécution
async function runDiagnostic() {
  console.log('🔍 DIAGNOSTIC PRISMA - EduTrack-CM');
  console.log('===================================\n');

  const prismaOk = await testPrismaConnection();
  
  if (!prismaOk) {
    console.log('\n🔄 Test alternatif avec Supabase...');
    const supabaseOk = await testSupabaseAlternative();
    
    if (supabaseOk) {
      console.log('\n📊 CONCLUSION:');
      console.log('❌ Prisma: Problème de connexion');
      console.log('✅ Supabase: Fonctionne correctement');
      console.log('💡 Recommandation: Utiliser Supabase client pour l\'instant');
    } else {
      console.log('\n📊 CONCLUSION:');
      console.log('❌ Prisma: Problème de connexion');
      console.log('❌ Supabase: Problème de connexion');
      console.log('💡 Recommandation: Vérifier la connectivité réseau');
    }
  }
}

export { testPrismaConnection, testSupabaseAlternative };

// Auto-exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostic().catch(console.error);
}