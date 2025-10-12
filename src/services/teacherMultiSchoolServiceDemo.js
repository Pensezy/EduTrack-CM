// Service pour la gestion centralisée des enseignants multi-établissements
// Version démo avec données fictives

const DEMO_DATA = {
  schools: [
    {
      id: 'school-1',
      name: 'École Primaire Publique Les Palmiers',
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

  teachers: [
    {
      id: 'teacher-1',
      globalTeacherId: 'global-teacher-1',
      firstName: 'Marie',
      lastName: 'Ngueffo',
      email: 'marie.ngueffo@gmail.com',
      phone: '+237699123456',
      address: 'Bastos, Yaoundé',
      specializations: ['Mathématiques', 'Physique'],
      qualification: 'Licence en Mathématiques',
      experience: 8,
      dateOfBirth: '1985-03-15',
      createdAt: '2024-01-15'
    },
    {
      id: 'teacher-2',
      globalTeacherId: 'global-teacher-2',
      firstName: 'Jean',
      lastName: 'Mbarga',
      email: 'jean.mbarga@outlook.com',
      phone: '+237677234567',
      address: 'Bonanjo, Douala',
      specializations: ['Français', 'Histoire-Géographie'],
      qualification: 'Master en Lettres Modernes',
      experience: 12,
      dateOfBirth: '1982-07-22',
      createdAt: '2024-02-01'
    },
    {
      id: 'teacher-3',
      globalTeacherId: 'global-teacher-3',
      firstName: 'Aminata',
      lastName: 'Sidibe',
      email: 'aminata.sidibe@yahoo.fr',
      phone: '+237655345678',
      address: 'Centre-ville, Bafoussam',
      specializations: ['Anglais', 'Sciences Naturelles'],
      qualification: 'Master en Anglais Appliqué',
      experience: 6,
      dateOfBirth: '1988-11-08',
      createdAt: '2024-03-10'
    },
    {
      id: 'teacher-4',
      globalTeacherId: 'global-teacher-4',
      firstName: 'Paul',
      lastName: 'Atangana',
      email: 'paul.atangana@gmail.com',
      phone: '+237612456789',
      address: 'Mendong, Yaoundé',
      specializations: ['Éducation Physique', 'Mathématiques'],
      qualification: 'Licence STAPS',
      experience: 5,
      dateOfBirth: '1990-01-25',
      createdAt: '2024-04-05'
    }
  ],

  // Assignations d'enseignants par établissement
  teacherSchoolAssignments: [
    {
      id: 'assignment-1',
      teacherId: 'teacher-1',
      schoolId: 'school-1',
      position: 'Enseignant titulaire',
      subjects: ['Mathématiques', 'Physique'],
      classes: ['CM1-A', 'CM2-B'],
      weeklyHours: 20,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
      assignmentType: 'principal' // 'principal' ou 'vacataire'
    },
    {
      id: 'assignment-2',
      teacherId: 'teacher-1', // Même enseignant, autre établissement
      schoolId: 'school-2',
      position: 'Enseignant vacataire',
      subjects: ['Mathématiques'],
      classes: ['6ème-A'],
      weeklyHours: 8,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
      assignmentType: 'vacataire'
    },
    {
      id: 'assignment-3',
      teacherId: 'teacher-2',
      schoolId: 'school-1',
      position: 'Enseignant titulaire',
      subjects: ['Français', 'Histoire-Géographie'],
      classes: ['CE2-A', 'CM1-B'],
      weeklyHours: 22,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
      assignmentType: 'principal'
    },
    {
      id: 'assignment-4',
      teacherId: 'teacher-3',
      schoolId: 'school-3',
      position: 'Enseignant titulaire',
      subjects: ['Anglais', 'Sciences Naturelles'],
      classes: ['5ème-A', '4ème-B'],
      weeklyHours: 18,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
      assignmentType: 'principal'
    },
    {
      id: 'assignment-5',
      teacherId: 'teacher-4',
      schoolId: 'school-1',
      position: 'Enseignant vacataire',
      subjects: ['Éducation Physique'],
      classes: ['CE1-A', 'CE2-A', 'CM1-A', 'CM2-B'],
      weeklyHours: 12,
      startDate: '2024-09-01',
      endDate: '2025-06-30',
      isActive: true,
      assignmentType: 'vacataire'
    }
  ],

  // Planning détaillé des enseignants
  teacherSchedules: [
    {
      id: 'schedule-1',
      teacherId: 'teacher-1',
      schoolId: 'school-1',
      classId: 'CM1-A',
      subject: 'Mathématiques',
      dayOfWeek: 'Lundi',
      startTime: '08:00',
      endTime: '10:00',
      room: 'Salle 12'
    },
    {
      id: 'schedule-2',
      teacherId: 'teacher-1',
      schoolId: 'school-1',
      classId: 'CM2-B',
      subject: 'Physique',
      dayOfWeek: 'Mardi',
      startTime: '10:00',
      endTime: '12:00',
      room: 'Laboratoire'
    },
    {
      id: 'schedule-3',
      teacherId: 'teacher-1',
      schoolId: 'school-2', // Autre établissement
      classId: '6ème-A',
      subject: 'Mathématiques',
      dayOfWeek: 'Mercredi',
      startTime: '14:00',
      endTime: '16:00',
      room: 'Salle 5'
    }
  ],

  // Classes disponibles par établissement
  availableClasses: [
    {
      schoolId: 'school-1',
      classes: [
        { id: 'CE1-A', name: 'CE1-A', level: 'CE1', studentsCount: 25 },
        { id: 'CE2-A', name: 'CE2-A', level: 'CE2', studentsCount: 28 },
        { id: 'CM1-A', name: 'CM1-A', level: 'CM1', studentsCount: 30 },
        { id: 'CM1-B', name: 'CM1-B', level: 'CM1', studentsCount: 27 },
        { id: 'CM2-B', name: 'CM2-B', level: 'CM2', studentsCount: 26 }
      ]
    },
    {
      schoolId: 'school-2',
      classes: [
        { id: '6ème-A', name: '6ème-A', level: '6ème', studentsCount: 35 },
        { id: '5ème-A', name: '5ème-A', level: '5ème', studentsCount: 32 },
        { id: '4ème-A', name: '4ème-A', level: '4ème', studentsCount: 29 }
      ]
    },
    {
      schoolId: 'school-3',
      classes: [
        { id: '5ème-A', name: '5ème-A', level: '5ème', studentsCount: 24 },
        { id: '4ème-B', name: '4ème-B', level: '4ème', studentsCount: 26 },
        { id: '3ème-A', name: '3ème-A', level: '3ème', studentsCount: 22 }
      ]
    }
  ]
};

class TeacherMultiSchoolServiceDemo {
  /**
   * Vérifier si un enseignant existe déjà par email ou téléphone
   */
  async checkExistingTeacher(email, phone) {
    try {
      const existingTeacher = DEMO_DATA.teachers.find(teacher => 
        teacher.email.toLowerCase() === email?.toLowerCase() || 
        teacher.phone === phone
      );

      if (existingTeacher) {
        // Récupérer les assignations de cet enseignant
        const assignments = DEMO_DATA.teacherSchoolAssignments.filter(
          assignment => assignment.teacherId === existingTeacher.id && assignment.isActive
        );

        const enrichedAssignments = assignments.map(assignment => {
          const school = DEMO_DATA.schools.find(s => s.id === assignment.schoolId);
          return {
            ...assignment,
            school
          };
        });

        return {
          exists: true,
          teacher: {
            ...existingTeacher,
            assignments: enrichedAssignments,
            totalSchools: enrichedAssignments.length,
            totalWeeklyHours: enrichedAssignments.reduce((sum, a) => sum + a.weeklyHours, 0)
          }
        };
      }

      return { exists: false, teacher: null };
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'enseignant:', error);
      return { exists: false, teacher: null };
    }
  }

  /**
   * Rechercher des enseignants existants
   */
  async searchExistingTeachers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const matchingTeachers = DEMO_DATA.teachers.filter(teacher => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) ||
               teacher.email.toLowerCase().includes(searchLower) ||
               teacher.phone.includes(searchTerm) ||
               teacher.specializations.some(spec => spec.toLowerCase().includes(searchLower));
      });

      // Enrichir avec les informations d'assignation
      const enrichedTeachers = matchingTeachers.map(teacher => {
        const assignments = DEMO_DATA.teacherSchoolAssignments.filter(
          assignment => assignment.teacherId === teacher.id && assignment.isActive
        );

        const enrichedAssignments = assignments.map(assignment => {
          const school = DEMO_DATA.schools.find(s => s.id === assignment.schoolId);
          return {
            ...assignment,
            school
          };
        });

        return {
          ...teacher,
          assignments: enrichedAssignments,
          totalSchools: enrichedAssignments.length,
          totalWeeklyHours: enrichedAssignments.reduce((sum, a) => sum + a.weeklyHours, 0),
          availableHours: Math.max(0, 40 - enrichedAssignments.reduce((sum, a) => sum + a.weeklyHours, 0)) // Supposons 40h max par semaine
        };
      });

      return enrichedTeachers;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'enseignants:', error);
      return [];
    }
  }

  /**
   * Obtenir le détail complet d'un enseignant multi-établissements
   */
  async getTeacherMultiSchoolDetails(globalTeacherId) {
    try {
      const teacher = DEMO_DATA.teachers.find(t => t.globalTeacherId === globalTeacherId);
      
      if (!teacher) {
        return null;
      }

      // Récupérer toutes les assignations
      const assignments = DEMO_DATA.teacherSchoolAssignments.filter(
        assignment => assignment.teacherId === teacher.id && assignment.isActive
      );

      // Enrichir les assignations avec les détails des écoles et planning
      const enrichedAssignments = assignments.map(assignment => {
        const school = DEMO_DATA.schools.find(s => s.id === assignment.schoolId);
        const schedules = DEMO_DATA.teacherSchedules.filter(
          schedule => schedule.teacherId === teacher.id && schedule.schoolId === assignment.schoolId
        );

        // Récupérer les classes disponibles pour cette école
        const schoolClasses = DEMO_DATA.availableClasses.find(sc => sc.schoolId === assignment.schoolId);
        const assignedClasses = assignment.classes.map(className => {
          const classInfo = schoolClasses?.classes.find(c => c.name === className);
          return classInfo || { name: className, studentsCount: 0 };
        });

        return {
          ...assignment,
          school,
          schedules,
          assignedClasses,
          studentsCount: assignedClasses.reduce((sum, c) => sum + c.studentsCount, 0)
        };
      });

      return {
        ...teacher,
        assignments: enrichedAssignments,
        totalSchools: enrichedAssignments.length,
        totalWeeklyHours: enrichedAssignments.reduce((sum, a) => sum + a.weeklyHours, 0),
        totalStudents: enrichedAssignments.reduce((sum, a) => sum + a.studentsCount, 0),
        availableHours: Math.max(0, 40 - enrichedAssignments.reduce((sum, a) => sum + a.weeklyHours, 0))
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'enseignant:', error);
      return null;
    }
  }

  /**
   * Obtenir les classes disponibles pour assignation dans une école
   */
  async getAvailableClassesForSchool(schoolId) {
    try {
      const schoolClasses = DEMO_DATA.availableClasses.find(sc => sc.schoolId === schoolId);
      return schoolClasses?.classes || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  /**
   * Créer une nouvelle assignation d'enseignant
   */
  async createTeacherAssignment(teacherId, schoolId, assignmentData) {
    try {
      const newAssignment = {
        id: `assignment-${Date.now()}`,
        teacherId,
        schoolId,
        position: assignmentData.position || 'Enseignant vacataire',
        subjects: assignmentData.subjects || [],
        classes: assignmentData.classes || [],
        weeklyHours: assignmentData.weeklyHours || 0,
        startDate: assignmentData.startDate || new Date().toISOString().split('T')[0],
        endDate: assignmentData.endDate || '2025-06-30',
        isActive: true,
        assignmentType: assignmentData.assignmentType || 'vacataire'
      };

      // Simuler l'ajout à la base de données
      DEMO_DATA.teacherSchoolAssignments.push(newAssignment);

      return {
        success: true,
        assignment: newAssignment
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'assignation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtenir les statistiques des enseignants multi-établissements
   */
  async getTeacherMultiSchoolStats() {
    try {
      const totalTeachers = DEMO_DATA.teachers.length;
      const activeAssignments = DEMO_DATA.teacherSchoolAssignments.filter(a => a.isActive);
      const multiSchoolTeachers = new Set(activeAssignments.map(a => a.teacherId)).size;
      const teachersWithMultipleSchools = DEMO_DATA.teachers.filter(teacher => {
        const assignments = activeAssignments.filter(a => a.teacherId === teacher.id);
        return assignments.length > 1;
      }).length;

      return {
        totalTeachers,
        multiSchoolTeachers,
        teachersWithMultipleSchools,
        totalAssignments: activeAssignments.length,
        averageHoursPerTeacher: activeAssignments.reduce((sum, a) => sum + a.weeklyHours, 0) / totalTeachers
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }
}

// Instance singleton
const teacherMultiSchoolServiceDemo = new TeacherMultiSchoolServiceDemo();

export default teacherMultiSchoolServiceDemo;