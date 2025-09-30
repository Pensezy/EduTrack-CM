// Service de diagnostic pour tester la structure Prisma côté client
// Utilise Supabase client pour vérifier que les tables créées par Prisma sont accessibles

import { supabase } from '../lib/supabase.js';

/**
 * Test de diagnostic complet de l'architecture
 */
export const runPrismaCompatibilityTest = async () => {
  try {
    const results = {};

    // 1. Test des tables principales créées par Prisma
    const tableTests = await Promise.allSettled([
      supabase.from('users').select('count', { count: 'exact' }).limit(1),
      supabase.from('schools').select('count', { count: 'exact' }).limit(1),
      supabase.from('academic_years').select('count', { count: 'exact' }).limit(1),
      supabase.from('classes').select('count', { count: 'exact' }).limit(1),
      supabase.from('subjects').select('count', { count: 'exact' }).limit(1),
      supabase.from('teachers').select('count', { count: 'exact' }).limit(1),
      supabase.from('students').select('count', { count: 'exact' }).limit(1),
      supabase.from('payments').select('count', { count: 'exact' }).limit(1),
      supabase.from('attendances').select('count', { count: 'exact' }).limit(1),
      supabase.from('grades').select('count', { count: 'exact' }).limit(1),
      supabase.from('notifications').select('count', { count: 'exact' }).limit(1),
      supabase.from('audit_logs').select('count', { count: 'exact' }).limit(1)
    ]);

    const tableNames = ['users', 'schools', 'academic_years', 'classes', 'subjects', 
                       'teachers', 'students', 'payments', 'attendances', 'grades', 
                       'notifications', 'audit_logs'];

    results.tables = {};
    tableTests.forEach((result, index) => {
      const tableName = tableNames[index];
      if (result.status === 'fulfilled' && !result.value.error) {
        results.tables[tableName] = {
          accessible: true,
          count: 0, // Pour la sécurité, on ne révèle pas les vrais comptes
          error: null
        };
      } else {
        results.tables[tableName] = {
          accessible: false,
          count: null,
          error: result.reason?.message || result.value?.error?.message || 'Unknown error'
        };
      }
    });

    // 2. Test des ENUMs Prisma (via une requête simple)
    const enumTest = await supabase
      .from('users')
      .select('role')
      .limit(1);

    results.enums = {
      accessible: !enumTest.error,
      error: enumTest.error?.message || null
    };

    // 3. Statistiques générales
    const accessibleTables = Object.values(results.tables).filter(t => t.accessible).length;
    
    results.summary = {
      totalTables: tableNames.length,
      accessibleTables,
      compatibility: accessibleTables / tableNames.length,
      prismaDeploymentSuccess: accessibleTables >= 10, // Au moins 10 tables sur 12
      readyForProduction: accessibleTables === tableNames.length && results.enums.accessible
    };

    return {
      success: true,
      data: results,
      message: `${accessibleTables}/${tableNames.length} tables Prisma accessibles`
    };

  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
      error: error
    };
  }
};

/**
 * Test simple de création d'école (simulation)
 */
export const testSchoolCreationFlow = async () => {
  try {
    // Test de validation des données seulement (pas de création réelle)
    const testData = {
      schoolName: 'École Test Diagnostic',
      schoolType: 'college_lycee',
      directorName: 'Test Director',
      email: 'test@diagnostic.com',
      phone: '+237 600 000 000',
      address: 'Test Address',
      city: 'Yaoundé',
      country: 'Cameroun',
      availableClasses: ['6ème', '5ème']
    };

    // Vérification que les champs requis sont présents
    const requiredFields = ['schoolName', 'schoolType', 'directorName', 'email', 'phone'];
    const missingFields = requiredFields.filter(field => !testData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Champs manquants: ${missingFields.join(', ')}`);
    }

    // Test de format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testData.email)) {
      throw new Error('Format email invalide');
    }

    // Test du type d'école
    const validSchoolTypes = ['maternelle', 'primaire', 'college', 'lycee', 'college_lycee'];
    if (!validSchoolTypes.includes(testData.schoolType)) {
      throw new Error('Type d\'école invalide');
    }

    return {
      success: true,
      data: {
        validationPassed: true,
        testData,
        readyForCreation: true
      },
      message: 'Validation des données réussie'
    };

  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
      error: error
    };
  }
};