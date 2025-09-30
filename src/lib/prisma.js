// Client Prisma pour EduTrack-CM
// Configuration pour fonctionnement côté navigateur et serveur

let prisma;

// Prisma ne fonctionne que côté serveur, pas dans le navigateur
if (typeof window === 'undefined') {
  // Côté serveur (Node.js)
  try {
    const { PrismaClient } = await import('@prisma/client');
    
    const globalForPrisma = globalThis;
    
    prisma = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
    
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
    
  } catch (error) {
    console.error('Erreur initialisation Prisma:', error);
    prisma = null;
  }
} else {
  // Côté client (navigateur) - Prisma n'est pas disponible
  prisma = null;
  console.warn('Prisma n\'est pas disponible côté client. Utilisez les API routes ou Supabase client.');
}

export { prisma };
export default prisma;