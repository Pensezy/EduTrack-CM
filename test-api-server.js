// API route de test pour créer un compte principal complet
// Utilise Prisma côté serveur pour tester la création de données

import express from 'express';
import cors from 'cors';
import { PrismaClient } from './src/generated/prisma/index.js';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialiser Prisma et Supabase
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Route de test pour créer un compte principal
app.post('/test-create-account', async (req, res) => {
  try {
    console.log('🧪 Début du test de création de compte complet...');
    
    const testData = {
      // Données du directeur
      directorName: 'Directeur Test API',
      email: `testapi${Date.now()}@gmail.com`,
      phone: '+33123456789',
      password: 'TestPassword123!',
      
      // Données de l'école
      schoolName: 'École Test API',
      schoolType: 'primaire',
      country: 'France',
      city: 'Paris',
      address: '123 Rue API Test',
      
      // Classes disponibles
      availableClasses: ['CP', 'CE1', 'CE2']
    };

    console.log('📝 Données de test:', {
      email: testData.email,
      schoolName: testData.schoolName,
      schoolType: testData.schoolType
    });

    // 1. Créer l'utilisateur dans Supabase Auth
    console.log('🔐 Création utilisateur Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          full_name: testData.directorName,
          role: 'principal'
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur Supabase Auth:', authError);
      return res.status(400).json({ 
        success: false, 
        error: 'Erreur création utilisateur Auth',
        details: authError.message 
      });
    }

    if (!authData.user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucune donnée utilisateur retournée' 
      });
    }

    console.log('✅ Utilisateur Auth créé:', authData.user.id);

    // 2. Créer les données dans Prisma
    console.log('🏫 Création des données Prisma...');
    
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur dans la table users
      const user = await tx.users.create({
        data: {
          id: authData.user.id, // Utiliser l'ID de Supabase Auth
          email: testData.email,
          full_name: testData.directorName,
          phone: testData.phone,
          role: 'principal',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ Utilisateur Prisma créé:', user.id);

      // Créer l'école
      const school = await tx.schools.create({
        data: {
          name: testData.schoolName,
          type: testData.schoolType,
          country: testData.country,
          city: testData.city,
          address: testData.address,
          director_user_id: user.id,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ École Prisma créée:', school.id);

      // Créer les classes si spécifiées
      if (testData.availableClasses && testData.availableClasses.length > 0) {
        const classPromises = testData.availableClasses.map(className => 
          tx.classes.create({
            data: {
              name: className,
              level: className,
              school_id: school.id,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          })
        );

        const classes = await Promise.all(classPromises);
        console.log('✅ Classes créées:', classes.length);

        return { user, school, classes };
      }

      return { user, school, classes: [] };
    });

    console.log('🎉 Transaction Prisma complétée avec succès !');

    // 3. Vérification des données créées
    const verification = await prisma.users.findUnique({
      where: { id: authData.user.id },
      include: {
        directed_schools: {
          include: {
            classes: true
          }
        }
      }
    });

    console.log('📊 Vérification données créées:', {
      userId: verification?.id,
      userName: verification?.full_name,
      schoolCount: verification?.directed_schools?.length || 0,
      classCount: verification?.directed_schools?.[0]?.classes?.length || 0
    });

    res.json({
      success: true,
      message: 'Compte principal créé avec succès !',
      data: {
        authUserId: authData.user.id,
        user: result.user,
        school: result.school,
        classes: result.classes,
        needsEmailConfirmation: !authData.session,
        verification: verification
      }
    });

  } catch (error) {
    console.error('❌ Erreur création compte:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne serveur',
      details: error.message
    });
  }
});

// Route de test pour vérifier les données
app.get('/test-verify-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userData = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        directed_schools: {
          include: {
            classes: true,
            students: true
          }
        }
      }
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API de test EduTrack-CM',
    timestamp: new Date().toISOString()
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur de test EduTrack-CM démarré sur http://localhost:${port}`);
  console.log('📍 Routes disponibles:');
  console.log('  POST /test-create-account - Créer un compte complet');
  console.log('  GET  /test-verify-data/:userId - Vérifier les données');
  console.log('  GET  /health - Statut du serveur');
});

// Garder le processus en vie
process.stdin.resume();

// Nettoyage à la fermeture
process.on('SIGINT', async () => {
  console.log('🔄 Fermeture du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Fermeture du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});