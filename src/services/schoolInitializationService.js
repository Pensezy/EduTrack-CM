/**
 * Service d'initialisation de l'école
 * Gère la configuration initiale des établissements scolaires
 */

import dataModeService from './dataModeService';

class SchoolInitializationService {
  constructor() {
    this.isInitializing = false;
  }

  /**
   * Vérifie si une école est initialisée
   */
  async checkSchoolInitialization(schoolId) {
    try {
      // TODO: Implémenter la vérification avec Prisma
      // Pour l'instant, simuler une vérification
      console.log(`Vérification de l'initialisation pour l'école ${schoolId}`);
      
      // Simuler une école non initialisée pour les nouveaux comptes
      return {
        isInitialized: false,
        hasStudents: false,
        hasTeachers: false,
        hasClasses: false,
        hasAcademicYear: false
      };
    } catch (error) {
      console.error('Erreur lors de la vérification d\'initialisation:', error);
      return {
        isInitialized: false,
        hasStudents: false,
        hasTeachers: false,
        hasClasses: false,
        hasAcademicYear: false
      };
    }
  }

  /**
   * Initialise une école avec les données de base nécessaires
   */
  async initializeSchool(schoolId, initializationData) {
    if (this.isInitializing) {
      throw new Error('Une initialisation est déjà en cours');
    }

    this.isInitializing = true;
    
    try {
      console.log('Début de l\'initialisation de l\'école:', schoolId);
      
      // Étapes d'initialisation
      const steps = [
        'Création de l\'année scolaire courante',
        'Configuration des classes',
        'Configuration des matières',
        'Création des types de notes',
        'Configuration des types de paiements',
        'Configuration des types d\'absences',
        'Finalisation'
      ];

      for (let i = 0; i < steps.length; i++) {
        console.log(`Étape ${i + 1}/${steps.length}: ${steps[i]}`);
        
        // Simuler le traitement
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Notifier le progrès
        this.notifyProgress(i + 1, steps.length, steps[i]);
      }

      // Marquer comme initialisé
      dataModeService.markAsInitialized();
      
      console.log('École initialisée avec succès');
      
      return {
        success: true,
        message: 'École initialisée avec succès'
      };
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Notifie le progrès de l'initialisation
   */
  notifyProgress(current, total, step) {
    const event = new CustomEvent('schoolInitializationProgress', {
      detail: { current, total, step, progress: (current / total) * 100 }
    });
    window.dispatchEvent(event);
  }

  /**
   * Génère les données de base pour une école
   */
  generateSchoolBaseData(schoolInfo) {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    return {
      academicYear: {
        name: academicYear,
        startDate: `${currentYear}-09-01`,
        endDate: `${currentYear + 1}-07-31`,
        isCurrent: true
      },
      
      classes: this.generateDefaultClasses(schoolInfo.type),
      
      subjects: this.generateDefaultSubjects(),
      
      gradeTypes: [
        { name: 'Devoir', code: 'DEV', coefficient: 1.0 },
        { name: 'Composition', code: 'COMP', coefficient: 2.0 },
        { name: 'Examen', code: 'EXAM', coefficient: 3.0 },
        { name: 'Contrôle', code: 'CTRL', coefficient: 1.5 },
        { name: 'Participation', code: 'PART', coefficient: 0.5 }
      ],
      
      paymentTypes: [
        { name: 'Frais de scolarité', code: 'SCOL', amount: 150000 },
        { name: 'Frais d\'inscription', code: 'INSC', amount: 50000 },
        { name: 'Frais de cantine', code: 'CANT', amount: 25000 },
        { name: 'Frais de transport', code: 'TRANS', amount: 30000 },
        { name: 'Fournitures scolaires', code: 'FOUR', amount: 40000 }
      ],
      
      attendanceTypes: [
        { name: 'Présent', code: 'PRES' },
        { name: 'Absent', code: 'ABS' },
        { name: 'Retard', code: 'RET' },
        { name: 'Absent excusé', code: 'ABS_EXC' }
      ]
    };
  }

  /**
   * Génère les classes par défaut selon le type d'école
   */
  generateDefaultClasses(schoolType) {
    const classTemplates = {
      maternelle: [
        { name: 'Petite Section A', level: 'PS', capacity: 25 },
        { name: 'Petite Section B', level: 'PS', capacity: 25 },
        { name: 'Moyenne Section A', level: 'MS', capacity: 30 },
        { name: 'Moyenne Section B', level: 'MS', capacity: 30 },
        { name: 'Grande Section A', level: 'GS', capacity: 30 },
        { name: 'Grande Section B', level: 'GS', capacity: 30 }
      ],
      
      primaire: [
        { name: 'CP A', level: 'CP', capacity: 35 },
        { name: 'CP B', level: 'CP', capacity: 35 },
        { name: 'CE1 A', level: 'CE1', capacity: 35 },
        { name: 'CE1 B', level: 'CE1', capacity: 35 },
        { name: 'CE2 A', level: 'CE2', capacity: 35 },
        { name: 'CE2 B', level: 'CE2', capacity: 35 },
        { name: 'CM1 A', level: 'CM1', capacity: 35 },
        { name: 'CM1 B', level: 'CM1', capacity: 35 },
        { name: 'CM2 A', level: 'CM2', capacity: 35 },
        { name: 'CM2 B', level: 'CM2', capacity: 35 }
      ],
      
      college: [
        { name: '6ème A', level: '6ème', capacity: 40 },
        { name: '6ème B', level: '6ème', capacity: 40 },
        { name: '6ème C', level: '6ème', capacity: 40 },
        { name: '5ème A', level: '5ème', capacity: 40 },
        { name: '5ème B', level: '5ème', capacity: 40 },
        { name: '5ème C', level: '5ème', capacity: 40 },
        { name: '4ème A', level: '4ème', capacity: 40 },
        { name: '4ème B', level: '4ème', capacity: 40 },
        { name: '4ème C', level: '4ème', capacity: 40 },
        { name: '3ème A', level: '3ème', capacity: 40 },
        { name: '3ème B', level: '3ème', capacity: 40 },
        { name: '3ème C', level: '3ème', capacity: 40 }
      ],
      
      lycee: [
        { name: '2nde A', level: '2nde', capacity: 45 },
        { name: '2nde B', level: '2nde', capacity: 45 },
        { name: '2nde C', level: '2nde', capacity: 45 },
        { name: '1ère A4', level: '1ère', capacity: 45 },
        { name: '1ère C', level: '1ère', capacity: 45 },
        { name: '1ère D', level: '1ère', capacity: 45 },
        { name: 'Tle A4', level: 'Tle', capacity: 45 },
        { name: 'Tle C', level: 'Tle', capacity: 45 },
        { name: 'Tle D', level: 'Tle', capacity: 45 }
      ]
    };

    return classTemplates[schoolType] || classTemplates.college;
  }

  /**
   * Génère les matières par défaut
   */
  generateDefaultSubjects() {
    return [
      { name: 'Mathématiques', code: 'MATH', coefficient: 4, category: 'Sciences' },
      { name: 'Français', code: 'FR', coefficient: 4, category: 'Langues' },
      { name: 'Anglais', code: 'ANG', coefficient: 3, category: 'Langues' },
      { name: 'Histoire-Géographie', code: 'HG', coefficient: 3, category: 'Sciences Humaines' },
      { name: 'Sciences Physiques', code: 'PC', coefficient: 3, category: 'Sciences' },
      { name: 'Sciences de la Vie et de la Terre', code: 'SVT', coefficient: 2, category: 'Sciences' },
      { name: 'Éducation Physique et Sportive', code: 'EPS', coefficient: 1, category: 'Sport' },
      { name: 'Arts Plastiques', code: 'ART', coefficient: 1, category: 'Arts' },
      { name: 'Informatique', code: 'INFO', coefficient: 2, category: 'Technologie' },
      { name: 'Philosophie', code: 'PHILO', coefficient: 4, category: 'Sciences Humaines' }
    ];
  }

  /**
   * Obtient le statut d'initialisation formaté
   */
  async getInitializationStatus(schoolId) {
    const status = await this.checkSchoolInitialization(schoolId);
    
    return {
      ...status,
      completionPercentage: this.calculateCompletionPercentage(status),
      nextSteps: this.getNextSteps(status)
    };
  }

  /**
   * Calcule le pourcentage de completion
   */
  calculateCompletionPercentage(status) {
    const checks = [
      status.hasAcademicYear,
      status.hasClasses,
      status.hasStudents,
      status.hasTeachers
    ];
    
    const completed = checks.filter(Boolean).length;
    return (completed / checks.length) * 100;
  }

  /**
   * Détermine les prochaines étapes
   */
  getNextSteps(status) {
    const steps = [];
    
    if (!status.hasAcademicYear) {
      steps.push('Configurer l\'année scolaire courante');
    }
    
    if (!status.hasClasses) {
      steps.push('Créer les classes');
    }
    
    if (!status.hasTeachers) {
      steps.push('Ajouter les enseignants');
    }
    
    if (!status.hasStudents) {
      steps.push('Inscrire les premiers élèves');
    }
    
    return steps;
  }
}

// Instance singleton
const schoolInitializationService = new SchoolInitializationService();

export default schoolInitializationService;