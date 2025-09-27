// Service principal pour l'authentification et la gestion des écoles avec Prisma
// Remplace les fonctions SQL Supabase par des opérations Prisma

import prisma from '../lib/prisma.js';
import { supabase } from '../lib/supabase.js';

/**
 * Service pour créer une école et lier un directeur
 * Remplace la fonction SQL create_principal_school
 */
export const createPrincipalSchool = async ({
  directorName,
  email,
  phone,
  schoolName,
  schoolType,
  schoolAddress,
  schoolCity = 'Yaoundé',
  schoolCountry = 'Cameroun',
  availableClasses = []
}) => {
  try {
    // 1. Vérifier que l'utilisateur existe dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(email);
    
    if (authError || !authUser) {
      throw new Error('Utilisateur non trouvé dans le système d\'authentification');
    }

    const userId = authUser.user.id;

    // 2. Vérifier si l'utilisateur a déjà une école
    const existingSchool = await prisma.school.findFirst({
      where: { directorUserId: userId }
    });

    if (existingSchool) {
      throw new Error('Cet utilisateur a déjà une école associée');
    }

    // 3. Générer un code unique pour l'école
    let schoolCode;
    let isUnique = false;
    
    while (!isUnique) {
      const prefix = schoolName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
      schoolCode = `${prefix}-${year}-${random}`;
      
      const existing = await prisma.school.findUnique({
        where: { code: schoolCode }
      });
      
      isUnique = !existing;
    }

    // 4. Créer l'école et l'utilisateur dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'école
      const school = await tx.school.create({
        data: {
          name: schoolName,
          code: schoolCode,
          type: schoolType,
          directorName,
          phone,
          address: schoolAddress,
          city: schoolCity,
          country: schoolCountry,
          availableClasses,
          status: 'active',
          directorUserId: userId
        }
      });

      // Créer ou mettre à jour l'utilisateur
      const user = await tx.user.upsert({
        where: { id: userId },
        update: {
          fullName: directorName,
          phone,
          role: 'principal',
          currentSchoolId: school.id,
          updatedAt: new Date()
        },
        create: {
          id: userId,
          email,
          fullName: directorName,
          phone,
          role: 'principal',
          currentSchoolId: school.id,
          isActive: true
        }
      });

      // Créer l'année académique par défaut
      const academicYear = await tx.academicYear.create({
        data: {
          schoolId: school.id,
          name: '2024-2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-07-31'),
          isCurrent: true
        }
      });

      return { school, user, academicYear };
    });

    return {
      success: true,
      message: 'École créée et liée avec succès',
      data: result
    };

  } catch (error) {
    console.error('Erreur lors de la création de l\'école:', error);
    return {
      success: false,
      message: error.message || 'Erreur lors de la création de l\'école',
      data: null
    };
  }
};

/**
 * Service pour récupérer les informations d'une école
 */
export const getSchoolByDirector = async (userId) => {
  try {
    const school = await prisma.school.findFirst({
      where: { directorUserId: userId },
      include: {
        director: true,
        academicYears: {
          where: { isCurrent: true },
          take: 1
        },
        classes: true,
        students: {
          include: {
            class: true
          }
        },
        teachers: {
          include: {
            user: true
          }
        }
      }
    });

    return school;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'école:', error);
    throw error;
  }
};

/**
 * Service pour mettre à jour les informations d'une école
 */
export const updateSchool = async (schoolId, updateData) => {
  try {
    const school = await prisma.school.update({
      where: { id: schoolId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        director: true,
        academicYears: true
      }
    });

    return school;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'école:', error);
    throw error;
  }
};

/**
 * Service pour récupérer les statistiques d'une école
 */
export const getSchoolStats = async (schoolId) => {
  try {
    const [
      studentsCount,
      teachersCount,
      classesCount,
      paymentsCount
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId, isActive: true } }),
      prisma.teacher.count({ where: { schoolId, isActive: true } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.payment.count({ 
        where: { 
          schoolId, 
          status: 'completed' 
        } 
      })
    ]);

    return {
      students: studentsCount,
      teachers: teachersCount,
      classes: classesCount,
      payments: paymentsCount
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export default {
  createPrincipalSchool,
  getSchoolByDirector,
  updateSchool,
  getSchoolStats
};