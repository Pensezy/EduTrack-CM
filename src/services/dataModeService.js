/**
 * Service de gestion des modes de données
 * Permet de basculer entre données fictives et données réelles
 */

class DataModeService {
  constructor() {
    this.currentMode = 'demo'; // 'demo', 'real', 'hybrid'
    this.schoolId = null;
    this.isSchoolInitialized = false;
  }

  /**
   * Initialise le service avec les informations de l'école
   */
  initialize(schoolId, isInitialized = false, userInfo = null) {
    this.schoolId = schoolId;
    this.isSchoolInitialized = isInitialized;
    this.userInfo = userInfo;
    
    // Détecter automatiquement le mode selon le type de compte
    this.currentMode = this.detectDataMode(userInfo, isInitialized);
  }

  /**
   * Détecte automatiquement le mode de données selon le contexte utilisateur
   */
  detectDataMode(userInfo, isInitialized) {
    console.log('Détection du mode de données:', { userInfo, isInitialized });
    
    // Si l'utilisateur est connecté via un compte démo (email contient 'demo')
    if (userInfo?.email?.includes('demo.com') || (userInfo?.id && String(userInfo.id).includes('demo-'))) {
      console.log('Compte démo détecté - Mode démo activé');
      return 'demo';
    }
    
    // Si utilisateur réel (non-démo), utiliser le mode réel
    if (userInfo?.email && !userInfo.email.includes('demo')) {
      console.log('Compte réel détecté - Mode réel activé');
      return 'real';
    }
    
    // Par défaut, mode démo
    console.log('Mode démo par défaut');
    return 'demo';
  }

  /**
   * Obtient le mode de données actuel
   */
  getCurrentMode() {
    return this.currentMode;
  }



  /**
   * Vérifie si l'école est initialisée
   */
  isInitialized() {
    return this.isSchoolInitialized;
  }

  /**
   * Marque l'école comme initialisée
   */
  markAsInitialized() {
    this.isSchoolInitialized = true;
    this.currentMode = 'real';
    this.notifyModeChange();
  }

  /**
   * Notifie le changement de mode aux composants
   */
  notifyModeChange() {
    const event = new CustomEvent('dataModeChanged', {
      detail: { mode: this.currentMode, schoolId: this.schoolId }
    });
    window.dispatchEvent(event);
  }

  /**
   * Génère des données de démonstration pour les tâches
   */
  getDemoTasks() {
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        title: 'Préparer les bulletins du 1er trimestre',
        description: 'Compiler et vérifier tous les bulletins scolaires',
        priority: 'high',
        status: 'pending',
        dueDate: nextWeek.toISOString().split('T')[0],
        dueTime: '14:00',
        category: 'documents',
        assignedTo: 'Secrétaire principale',
        studentRelated: 'Toutes les classes',
        contact: '',
        estimatedDuration: '2 heures',
        createdAt: today.toISOString()
      },
      {
        id: '2',
        title: 'Mise à jour des dossiers étudiants',
        description: 'Vérifier et mettre à jour les informations personnelles',
        priority: 'medium',
        status: 'in_progress',
        dueDate: threeDays.toISOString().split('T')[0],
        dueTime: '10:00',
        category: 'inscriptions',
        assignedTo: 'Assistant secrétaire',
        studentRelated: '15 élèves concernés',
        contact: '',
        estimatedDuration: '1 heure',
        createdAt: today.toISOString()
      },
      {
        id: '3',
        title: 'Organisation réunion parents-professeurs',
        description: 'Planifier et coordonner la réunion du mois prochain',
        priority: 'medium',
        status: 'completed',
        dueDate: yesterday.toISOString().split('T')[0],
        dueTime: '16:00',
        category: 'planning',
        completedAt: yesterday.toISOString(),
        assignedTo: 'Secrétaire principale',
        studentRelated: '',
        contact: '',
        estimatedDuration: '30 min',
        createdAt: today.toISOString()
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les étudiants
   */
  getDemoStudents() {
    return [
      {
        id: '1',
        studentId: 'ETU001',
        firstName: 'Amara',
        lastName: 'Ngono',
        dateOfBirth: '2010-03-15',
        gender: 'female',
        class: '6ème A',
        parentPhone: '+237 696 123 456',
        address: 'Yaoundé, Cameroun',
        enrollmentDate: '2024-09-01',
        isActive: true
      },
      {
        id: '2',
        studentId: 'ETU002',
        firstName: 'Kevin',
        lastName: 'Mballa',
        dateOfBirth: '2009-07-22',
        gender: 'male',
        class: '5ème B',
        parentPhone: '+237 677 987 654',
        address: 'Douala, Cameroun',
        enrollmentDate: '2023-09-01',
        isActive: true
      },
      {
        id: '3',
        studentId: 'ETU003',
        firstName: 'Fatima',
        lastName: 'Adamou',
        dateOfBirth: '2011-01-10',
        gender: 'female',
        class: '6ème C',
        parentPhone: '+237 655 456 789',
        address: 'Garoua, Cameroun',
        enrollmentDate: '2024-09-01',
        isActive: true
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les professeurs
   */
  getDemoTeachers() {
    return [
      {
        id: '1',
        employeeId: 'PROF001',
        firstName: 'Marie',
        lastName: 'Essomba',
        email: 'marie.essomba@school.cm',
        phone: '+237 698 111 222',
        speciality: 'Mathématiques',
        subjects: ['Mathématiques', 'Physique'],
        classes: ['6ème A', '6ème B', '5ème A'],
        hireDate: '2020-09-01',
        isActive: true
      },
      {
        id: '2',
        employeeId: 'PROF002',
        firstName: 'Jean',
        lastName: 'Nkomo',
        email: 'jean.nkomo@school.cm',
        phone: '+237 677 333 444',
        speciality: 'Français',
        subjects: ['Français', 'Littérature'],
        classes: ['5ème B', '5ème C', '4ème A'],
        hireDate: '2019-09-01',
        isActive: true
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les cartes d'étudiants
   */
  getDemoStudentCards() {
    return [
      {
        id: '1',
        studentId: 'ETU001',
        cardNumber: 'CARD001',
        status: 'active',
        issueDate: '2024-09-15',
        expiryDate: '2025-07-31',
        student: {
          firstName: 'Amara',
          lastName: 'Ngono',
          class: '6ème A',
          photo: '/assets/images/no_image.png'
        }
      },
      {
        id: '2',
        studentId: 'ETU002',
        cardNumber: 'CARD002',
        status: 'active',
        issueDate: '2023-09-15',
        expiryDate: '2024-07-31',
        student: {
          firstName: 'Kevin',
          lastName: 'Mballa',
          class: '5ème B',
          photo: '/assets/images/no_image.png'
        }
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les absences
   */
  getDemoAbsences() {
    return [
      {
        id: '1',
        studentId: 'ETU001',
        date: '2024-10-10',
        status: 'absent',
        reason: 'Maladie',
        justified: true,
        student: {
          firstName: 'Amara',
          lastName: 'Ngono',
          class: '6ème A'
        }
      },
      {
        id: '2',
        studentId: 'ETU002',
        date: '2024-10-11',
        status: 'late',
        reason: 'Transport',
        justified: false,
        student: {
          firstName: 'Kevin',
          lastName: 'Mballa',
          class: '5ème B'
        }
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les paiements
   */
  getDemoPayments() {
    return [
      {
        id: '1',
        studentId: 'ETU001',
        amount: 150000,
        description: 'Frais de scolarité - 1er trimestre',
        dueDate: '2024-10-31',
        status: 'pending',
        student: {
          firstName: 'Amara',
          lastName: 'Ngono',
          class: '6ème A'
        }
      },
      {
        id: '2',
        studentId: 'ETU002',
        amount: 150000,
        description: 'Frais de scolarité - 1er trimestre',
        dueDate: '2024-10-31',
        paidDate: '2024-10-05',
        status: 'completed',
        method: 'Espèces',
        student: {
          firstName: 'Kevin',
          lastName: 'Mballa',
          class: '5ème B'
        }
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les plannings
   */
  getDemoSchedule() {
    return {
      appointments: [
        {
          id: '1',
          title: 'Réunion avec les parents de Kevin',
          startTime: '2025-10-15T14:00:00',
          endTime: '2025-10-15T15:00:00',
          type: 'meeting',
          location: 'Bureau secrétariat',
          status: 'scheduled'
        },
        {
          id: '2',
          title: 'Formation nouveau système',
          startTime: '2025-10-16T09:00:00',
          endTime: '2025-10-16T12:00:00',
          type: 'training',
          location: 'Salle informatique',
          status: 'confirmed'
        }
      ],
      events: [
        {
          id: '1',
          title: 'Journée portes ouvertes',
          startDate: '2025-10-20',
          endDate: '2025-10-20',
          type: 'general',
          location: 'École entière',
          description: 'Présentation de l\'école aux futurs élèves'
        }
      ]
    };
  }

  /**
   * Génère des données de démonstration pour l'année scolaire
   */
  getDemoSchoolYear() {
    return {
      current: {
        id: '1',
        name: '2024-2025',
        startDate: '2024-09-01',
        endDate: '2025-07-31',
        isCurrent: true,
        periods: [
          { name: '1er Trimestre', startDate: '2024-09-01', endDate: '2024-12-15' },
          { name: '2ème Trimestre', startDate: '2025-01-07', endDate: '2025-04-15' },
          { name: '3ème Trimestre', startDate: '2025-04-28', endDate: '2025-07-31' }
        ]
      },
      classes: [
        { id: '1', name: '6ème A', level: '6ème', capacity: 30, currentEnrollment: 28 },
        { id: '2', name: '6ème B', level: '6ème', capacity: 30, currentEnrollment: 25 },
        { id: '3', name: '5ème A', level: '5ème', capacity: 30, currentEnrollment: 27 },
        { id: '4', name: '5ème B', level: '5ème', capacity: 30, currentEnrollment: 29 }
      ],
      validationRequests: [
        {
          id: 1,
          type: 'nouvelle_inscription',
          studentName: 'Marie Talla (DÉMO)',
          parentName: 'Joseph Talla',
          requestedClass: 'CE1',
          submittedBy: 'Secrétaire',
          submittedDate: '2024-09-15',
          status: 'en_attente',
          documents: ['Certificat de naissance', 'Carnet de vaccination'],
          priority: 'normal'
        }
      ],
      statistics: {
        totalDemandes: 15,
        enAttente: 3,
        approuvees: 8,
        refusees: 1,
        enRevision: 3
      },
      classTransitions: {
        ce1_to_ce2: { total: 8, approved: 6, pending: 2 },
        ce2_to_cm1: { total: 12, approved: 10, pending: 2 },
        cm1_to_cm2: { total: 7, approved: 5, pending: 2 },
        cm2_graduates: { total: 15, approved: 15, pending: 0 }
      }
    };
  }

  /**
   * Génère des données de démonstration pour la communication
   */
  getDemoCommunication() {
    return {
      messages: [
        {
          id: '1',
          subject: 'Réunion parents-professeurs',
          content: 'Rappel de la réunion prévue le 20 octobre...',
          type: 'announcement',
          priority: 'normal',
          recipients: ['parents', 'teachers'],
          status: 'sent',
          sentAt: new Date().toISOString()
        }
      ],
      templates: [
        {
          id: '1',
          name: 'Convocation réunion',
          type: 'email',
          content: 'Cher(e) parent, nous vous convions à...'
        }
      ]
    };
  }

  /**
   * Génère des données de démonstration pour les documents
   */
  getDemoDocuments() {
    return [
      {
        id: '1',
        title: 'Règlement intérieur 2024-2025',
        category: 'administrative',
        fileName: 'reglement_interieur_2024.pdf',
        fileSize: 245760,
        uploadDate: '2024-08-15',
        version: 1,
        isPublic: true
      },
      {
        id: '2',
        title: 'Liste des fournitures 6ème',
        category: 'academic',
        fileName: 'fournitures_6eme.pdf',
        fileSize: 156432,
        uploadDate: '2024-07-20',
        version: 1,
        isPublic: true
      }
    ];
  }

  /**
   * Génère des données de démonstration pour les transferts
   */
  getDemoTransfers() {
    return [
      {
        id: '1',
        studentId: 'ETU004',
        student: {
          firstName: 'Alice',
          lastName: 'Biya',
          class: '4ème A'
        },
        fromSchool: 'Lycée Bilingue de Yaoundé',
        toSchool: 'Collège Saint-Joseph',
        reason: 'Déménagement familial',
        requestDate: '2024-09-15',
        status: 'pending',
        documents: ['bulletin_notes.pdf', 'certificat_scolarite.pdf']
      }
    ];
  }

  /**
   * Récupère les données selon le mode actuel
   */
  async getData(dataType, params = {}) {
    switch (this.currentMode) {
      case 'demo':
        return this.getDemoData(dataType, params);
      case 'real':
        return this.getRealData(dataType, params);
      default:
        return this.getDemoData(dataType, params);
    }
  }

  /**
   * Récupère les données de démonstration
   */
  getDemoData(dataType, params) {
    const demoMethods = {
      tasks: () => this.getDemoTasks(),
      students: () => this.getDemoStudents(),
      teachers: () => this.getDemoTeachers(),
      cards: () => this.getDemoStudentCards(),
      absences: () => this.getDemoAbsences(),
      payments: () => this.getDemoPayments(),
      schedule: () => this.getDemoSchedule(),
      schoolYear: () => this.getDemoSchoolYear(),
      communication: () => this.getDemoCommunication(),
      documents: () => this.getDemoDocuments(),
      transfers: () => this.getDemoTransfers()
    };

    const method = demoMethods[dataType];
    return method ? Promise.resolve(method()) : Promise.resolve([]);
  }

  /**
   * Récupère les données réelles de la base de données
   */
  async getRealData(dataType, params) {
    console.log(`Récupération des données réelles pour ${dataType}`, params);
    
    try {
      // Utiliser les services existants pour récupérer les données réelles
      switch (dataType) {
        case 'tasks':
          // TODO: Implémenter le service de tâches réelles
          return [];
          
        case 'students':
          // TODO: Utiliser le service d'étudiants existant
          return [];
          
        case 'schoolYear':
          // Récupérer les données réelles d'année scolaire
          return await this.getRealSchoolYearData(params);
          
        case 'teachers':
          // TODO: Utiliser le service enseignants existant
          return [];
          
        case 'teachers':
          // TODO: Utiliser le service de professeurs existant
          return [];
          
        case 'payments':
          // TODO: Utiliser le service de paiements existant
          return [];
          
        case 'absences':
          // TODO: Utiliser le service d'absences existant
          return [];
          
        default:
          console.warn(`Type de données non supporté: ${dataType}`);
          return [];
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération des données réelles pour ${dataType}:`, error);
      return [];
    }
  }

  /**
   * Récupère les données réelles d'année scolaire depuis Supabase
   */
  async getRealSchoolYearData(params) {
    try {
      const { supabase } = await import('../lib/supabase');
      const schoolId = params.schoolId || this.schoolId;

      if (!schoolId) {
        console.warn('Aucun ID école fourni pour les données d\'année scolaire');
        return {
          current: null,
          classes: [],
          validationRequests: [],
          statistics: {
            totalDemandes: 0,
            enAttente: 0,
            approuvees: 0,
            refusees: 0,
            enRevision: 0
          },
          classTransitions: {}
        };
      }

      // Récupérer l'année scolaire courante
      const { data: currentYear, error: yearError } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (yearError && yearError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération de l\'année scolaire:', yearError);
      }

      // Récupérer les classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          level,
          capacity,
          current_enrollment
        `)
        .eq('school_id', schoolId);

      if (classesError) {
        console.error('Erreur lors de la récupération des classes:', classesError);
      }

      // Récupérer les demandes de validation (pour l'instant vides, à implémenter)
      // Ces données viendraient des tables comme transfers, student_cards, etc.
      const validationRequests = [];

      // Statistiques de validation (calculées depuis les vraies données)
      const statistics = {
        totalDemandes: 0,
        enAttente: 0,
        approuvees: 0,
        refusees: 0,
        enRevision: 0
      };

      // Transitions de classes (calculées depuis les grades et classes)
      const classTransitions = {};

      return {
        current: currentYear || null,
        classes: classes || [],
        validationRequests,
        statistics,
        classTransitions
      };

    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'année scolaire:', error);
      
      // Retourner des données vides en cas d'erreur
      return {
        current: null,
        classes: [],
        validationRequests: [],
        statistics: {
          totalDemandes: 0,
          enAttente: 0,
          approuvees: 0,
          refusees: 0,
          enRevision: 0
        },
        classTransitions: {}
      };
    }
  }
}

// Instance singleton
const dataModeService = new DataModeService();

export default dataModeService;