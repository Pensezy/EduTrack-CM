// Client Prisma pour EduTrack-CM
// Ce fichier configure et exporte une instance unique du client Prisma

import { PrismaClient } from '../generated/prisma';

// Configuration des logs et options de performance
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// En développement, on évite de créer plusieurs instances du client
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Gestion propre de la fermeture de connexion
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;