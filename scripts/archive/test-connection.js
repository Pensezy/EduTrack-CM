import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('🔄 Test de connexion Prisma à Supabase...');
    
    // Test de connexion simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connexion réussie!', result);
    
    // Test de lecture des tables existantes
    const schools = await prisma.school.findMany({
      take: 1,
      select: { id: true, name: true }
    });
    console.log('✅ Lecture des écoles réussie:', schools);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'P1001') {
      console.log('💡 Solutions possibles:');
      console.log('   1. Vérifier les credentials dans .env');
      console.log('   2. Vérifier que Supabase est accessible depuis votre réseau');
      console.log('   3. Essayer avec DIRECT_URL au lieu de DATABASE_URL');
      console.log('   4. Utiliser le dashboard Supabase pour appliquer la migration');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();