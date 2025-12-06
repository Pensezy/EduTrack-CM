// Service pour la gestion centralisée des parents multi-établissements
// VERSION DEMO avec données fictives (pas de connexion base de données)

// Données de test fictives pour la démonstration
const DEMO_DATA = {
  schools: [
    {
      id: 'school-1',
      name: 'École Primaire les Palmiers',
      code: 'EPP_PALMIERS',
      city: 'Yaoundé',
      type: 'primaire'
    },
    {
      id: 'school-2', 
      name: 'Collège-Lycée Excellence',
      code: 'CL_EXCELLENCE',
      city: 'Douala',
      type: 'college_lycee'
    },
    {
      id: 'school-3',
      name: 'Institution Sainte-Thérèse',
      code: 'IST_BAFOUSSAM',
      city: 'Bafoussam',
      type: 'college'
    }
  ],
  parents: [
    {
      id: 'parent-1',
      globalParentId: 'global-parent-1',
      firstName: 'Jean',
      lastName: 'Mballa',
      email: 'jean.mballa@gmail.com',
      phone: '+237678123456',
      address: 'Quartier Melen, Yaoundé',
      profession: 'Ingénieur',
      createdAt: '2024-09-01'
    },
    {
      id: 'parent-2',
      globalParentId: 'global-parent-2',
      firstName: 'Marie',
      lastName: 'Ngono',
      email: 'marie.ngono@yahoo.fr',
      phone: '+237699234567',
      address: 'Bonanjo, Douala',
      profession: 'Médecin',
      createdAt: '2024-08-15'
    },
    {
      id: 'parent-3',
      globalParentId: 'global-parent-3',
      firstName: 'Paul',
      lastName: 'Tchoupi',
      email: 'paul.tchoupi@outlook.com',
      phone: '+237655345678',
      address: 'Centre-ville, Bafoussam',
      profession: 'Commerçant',
      createdAt: '2024-07-20'
    },
    {
      id: 'parent-4',
      globalParentId: 'global-parent-4',
      firstName: 'Françoise',
      lastName: 'Koum',
      email: 'francoise.koum@gmail.com',
      phone: '+237677456789',
      address: 'Emana, Yaoundé',
      profession: 'Enseignante',
      createdAt: '2024-06-10'
    }
  ],
  students: [
    {
      id: 'student-1',
      firstName: 'Kevin',
      lastName: 'Mballa',
      schoolId: 'school-1',
      className: 'CE1 A',
      parentId: 'parent-1',
      dateOfBirth: '2016-03-15',
      gender: 'male',
      studentId: 'YDE001'
    },
    {
      id: 'student-2',
      firstName: 'Sandra',
      lastName: 'Mballa',
      schoolId: 'school-2',
      className: 'CM2 A',
      parentId: 'parent-1',
      dateOfBirth: '2013-07-22',
      gender: 'female',
      studentId: 'DLA001'
    },
    {
      id: 'student-3',
      firstName: 'Alex',
      lastName: 'Ngono',
      schoolId: 'school-2',
      className: 'CP A',
      parentId: 'parent-2',
      dateOfBirth: '2018-11-10',
      gender: 'male',
      studentId: 'DLA002'
    },
    {
      id: 'student-4',
      firstName: 'Laura',
      lastName: 'Ngono',
      schoolId: 'school-3',
      className: 'CE2 A',
      parentId: 'parent-2',
      dateOfBirth: '2015-05-18',
      gender: 'female',
      studentId: 'BAF001'
    }
  ],
  parentStudentSchoolRelations: [
    {
      id: 'relation-1',
      parentId: 'parent-1',
      studentId: 'student-1',
      schoolId: 'school-1',
      relationshipType: 'parent',
      isPrimaryContact: true,
      canPickup: true,
      emergencyContact: true
    },
    {
      id: 'relation-2',
      parentId: 'parent-1',
      studentId: 'student-2',
      schoolId: 'school-2',
      relationshipType: 'parent',
      isPrimaryContact: true,
      canPickup: true,
      emergencyContact: true
    },
    {
      id: 'relation-3',
      parentId: 'parent-2',
      studentId: 'student-3',
      schoolId: 'school-2',
      relationshipType: 'parent',
      isPrimaryContact: true,
      canPickup: true,
      emergencyContact: true
    },
    {
      id: 'relation-4',
      parentId: 'parent-2',
      studentId: 'student-4',
      schoolId: 'school-3',
      relationshipType: 'parent',
      isPrimaryContact: true,
      canPickup: true,
      emergencyContact: true
    }
  ]
};

/**
 * Service pour la gestion centralisée des parents multi-établissements
 * VERSION DEMO avec données fictives - ne touche pas à la base de données
 */
export class ParentMultiSchoolService {

  /**
   * Détecter le type de relation basé sur le prénom du parent
   */
  detectRelationshipType(firstName) {
    // Toujours retourner "Parent" pour une interface neutre
    return 'Parent';
  }
  
  /**
   * Vérifier si un parent existe déjà par email ou téléphone
   */
  async checkExistingParent(email, phone) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const existingParent = DEMO_DATA.parents.find(parent => 
        parent.email === email || parent.phone === phone
      );

      if (existingParent) {
        const relations = DEMO_DATA.parentStudentSchoolRelations.filter(
          rel => rel.parentId === existingParent.id
        );

        const enrichedRelations = relations.map(rel => {
          const student = DEMO_DATA.students.find(s => s.id === rel.studentId);
          const school = DEMO_DATA.schools.find(s => s.id === rel.schoolId);
          
          // Ajuster le type de relation basé sur le prénom du parent
          const adjustedRelationType = this.detectRelationshipType(existingParent.firstName);
          
          return {
            ...rel,
            relationshipType: adjustedRelationType,
            student: {
              ...student,
              school,
              class: { name: student.className }
            },
            school
          };
        });

        return {
          ...existingParent,
          studentRelations: enrichedRelations
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification du parent existant:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau parent ou récupérer un parent existant
   */
  async getOrCreateParent(parentData) {
    try {
      const existingParent = await this.checkExistingParent(
        parentData.email, 
        parentData.phone
      );

      if (existingParent) {
        console.log(`✅ Parent existant trouvé: ${existingParent.firstName} ${existingParent.lastName}`);
        return existingParent;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newParent = {
        id: `parent-${Date.now()}`,
        globalParentId: `global-parent-${Date.now()}`,
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        email: parentData.email,
        phone: parentData.phone,
        address: parentData.address,
        profession: parentData.profession,
        createdAt: new Date().toISOString(),
        studentRelations: []
      };

      DEMO_DATA.parents.push(newParent);

      console.log(`✅ Nouveau parent créé: ${newParent.firstName} ${newParent.lastName}`);
      return newParent;
    } catch (error) {
      console.error('Erreur lors de la création/récupération du parent:', error);
      throw error;
    }
  }

  /**
   * Rechercher les parents existants
   */
  async searchExistingParents(searchTerm, limit = 10) {
    try {
      console.log('🔎 parentMultiSchoolService.searchExistingParents appelé:', searchTerm);
      await new Promise(resolve => setTimeout(resolve, 200));

      if (!searchTerm || searchTerm.length < 2) {
        console.log('❌ Terme de recherche trop court');
        return [];
      }

      const searchLower = searchTerm.toLowerCase();
      console.log('🔍 Recherche dans DEMO_DATA.parents:', DEMO_DATA.parents.length, 'parents');
      console.log('🔤 Terme de recherche (lowercase):', searchLower);
      
      // Log pour chaque parent
      DEMO_DATA.parents.forEach(parent => {
        const matchFirstName = parent.firstName.toLowerCase().includes(searchLower);
        const matchLastName = parent.lastName.toLowerCase().includes(searchLower);
        const matchEmail = parent.email.toLowerCase().includes(searchLower);
        const matchPhone = parent.phone.includes(searchTerm);
        console.log(`  - ${parent.firstName} ${parent.lastName}:`, {
          firstName: matchFirstName,
          lastName: matchLastName,
          email: matchEmail,
          phone: matchPhone,
          match: matchFirstName || matchLastName || matchEmail || matchPhone
        });
      });
      
      const matchingParents = DEMO_DATA.parents.filter(parent => 
        parent.firstName.toLowerCase().includes(searchLower) ||
        parent.lastName.toLowerCase().includes(searchLower) ||
        parent.email.toLowerCase().includes(searchLower) ||
        parent.phone.includes(searchTerm)
      ).slice(0, limit);

      console.log('✅ Parents correspondants trouvés:', matchingParents.length);

      const enrichedParents = matchingParents.map(parent => {
        const relations = DEMO_DATA.parentStudentSchoolRelations.filter(
          rel => rel.parentId === parent.id
        );

        const enrichedRelations = relations.map(rel => {
          const student = DEMO_DATA.students.find(s => s.id === rel.studentId);
          const school = DEMO_DATA.schools.find(s => s.id === rel.schoolId);
          
          return {
            ...rel,
            student: {
              ...student,
              school,
              class: { name: student.className }
            },
            school
          };
        });

        return {
          ...parent,
          studentRelations: enrichedRelations
        };
      });

      console.log('📦 Parents enrichis avec relations:', enrichedParents);
      return enrichedParents;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche des parents:', error);
      throw error;
    }
  }

  /**
   * Obtenir tous les enfants d'un parent
   */
  async getParentChildrenAcrossSchools(globalParentId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const parent = DEMO_DATA.parents.find(p => p.globalParentId === globalParentId);
      if (!parent) {
        return [];
      }

      const relations = DEMO_DATA.parentStudentSchoolRelations.filter(
        rel => rel.parentId === parent.id
      );

      const children = relations.map(rel => {
        const student = DEMO_DATA.students.find(s => s.id === rel.studentId);
        const school = DEMO_DATA.schools.find(s => s.id === rel.schoolId);
        
        return {
          student: {
            ...student,
            class: { name: student.className }
          },
          school,
          relationship: {
            type: rel.relationshipType,
            isPrimaryContact: rel.isPrimaryContact,
            canPickup: rel.canPickup,
            emergencyContact: rel.emergencyContact
          }
        };
      });

      return children;
    } catch (error) {
      console.error('Erreur lors de la récupération des enfants:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques du système
   */
  async getMultiSchoolStats() {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = {
        totalParents: DEMO_DATA.parents.length,
        totalStudents: DEMO_DATA.students.length,
        totalSchools: DEMO_DATA.schools.length,
        totalRelations: DEMO_DATA.parentStudentSchoolRelations.length,
        multiSchoolParents: 0,
        schoolsDistribution: {}
      };

      DEMO_DATA.parents.forEach(parent => {
        const relations = DEMO_DATA.parentStudentSchoolRelations.filter(
          rel => rel.parentId === parent.id
        );
        
        const uniqueSchools = new Set(relations.map(rel => rel.schoolId));
        if (uniqueSchools.size > 1) {
          stats.multiSchoolParents++;
        }
      });

      DEMO_DATA.schools.forEach(school => {
        const schoolRelations = DEMO_DATA.parentStudentSchoolRelations.filter(
          rel => rel.schoolId === school.id
        );
        stats.schoolsDistribution[school.name] = {
          students: schoolRelations.length,
          city: school.city,
          type: school.type
        };
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Scénarios de démonstration
   */
  async getDemoScenarios() {
    return {
      scenario1: {
        title: "Parent avec enfants dans 2 établissements différents",
        parent: DEMO_DATA.parents.find(p => p.firstName === 'Jean'),
        description: "Jean Mballa a Kevin à l'École Primaire les Palmiers (Yaoundé) et Sandra au Collège-Lycée Excellence (Douala)"
      },
      scenario2: {
        title: "Parent avec enfants dans des villes différentes",
        parent: DEMO_DATA.parents.find(p => p.firstName === 'Marie'),
        description: "Marie Ngono a Alex à Douala et Laura à Bafoussam"
      },
      scenario3: {
        title: "Prévention de doublon",
        description: "Si quelqu'un essaie de créer un compte pour jean.mballa@gmail.com, le système détecte qu'il existe déjà"
      }
    };
  }
}

// Instance singleton
export const parentMultiSchoolService = new ParentMultiSchoolService();

// Export par défaut
export default parentMultiSchoolService;