/**
 * Service de données de démonstration pour le dashboard étudiant
 * Fournit des données mockées réalistes pour tester sans connexion BDD
 */

const studentDemoDataService = {
  /**
   * Récupérer le profil de l'étudiant
   */
  getStudentProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        id: 'demo-student-001',
        first_name: 'Marie',
        last_name: 'Dubois',
        full_name: 'Marie Dubois',
        email: 'marie.dubois@example.com',
        matricule: 'STU2024001',
        date_of_birth: '2008-03-15',
        gender: 'Féminin',
        photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        is_active: true,
        class: {
          id: 'class-001',
          name: '1ère S',
          level: 'Première',
          section: 'Scientifique'
        },
        school: {
          id: 'school-001',
          name: 'Lycée Excellence Yaoundé',
          code: 'LEY',
          type: 'lycee',
          city: 'Yaoundé',
          country: 'Cameroun'
        }
      },
      error: null
    };
  },

  /**
   * Récupérer les statistiques de l'étudiant
   */
  getStudentStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: {
        averageGrade: '15.75',
        attendanceRate: '94.5',
        totalAbsences: 3,
        justifiedAbsences: 2,
        unjustifiedAbsences: 1,
        lateArrivals: 2,
        assignmentsDue: 4,
        assignmentsCompleted: 28,
        unreadNotifications: 5
      },
      error: null
    };
  },

  /**
   * Récupérer les notes de l'étudiant
   */
  getStudentGrades: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      data: [
        {
          id: 'grade-001',
          subject: 'Mathématiques',
          subject_code: 'MATH',
          grade: 18,
          max_grade: 20,
          coefficient: 3,
          grade_type: 'Contrôle',
          date: '2024-11-15',
          teacher_name: 'M. Laurent',
          comment: 'Excellent travail sur les dérivées',
          term: 'Trimestre 1',
          average: 16.5,
          rank: 3,
          class_average: 14.2
        },
        {
          id: 'grade-002',
          subject: 'Mathématiques',
          subject_code: 'MATH',
          grade: 15,
          max_grade: 20,
          coefficient: 2,
          grade_type: 'Devoir',
          date: '2024-11-08',
          teacher_name: 'M. Laurent',
          comment: 'Bien, attention aux calculs',
          term: 'Trimestre 1',
          average: 16.5,
          rank: 3,
          class_average: 14.2
        },
        {
          id: 'grade-003',
          subject: 'Physique-Chimie',
          subject_code: 'PC',
          grade: 16,
          max_grade: 20,
          coefficient: 2,
          grade_type: 'TP',
          date: '2024-11-12',
          teacher_name: 'Mme Kamga',
          comment: 'Très bon compte-rendu',
          term: 'Trimestre 1',
          average: 14.8,
          rank: 5,
          class_average: 13.5
        },
        {
          id: 'grade-004',
          subject: 'Physique-Chimie',
          subject_code: 'PC',
          grade: 13,
          max_grade: 20,
          coefficient: 3,
          grade_type: 'Contrôle',
          date: '2024-11-05',
          teacher_name: 'Mme Kamga',
          comment: 'Revoir la mécanique',
          term: 'Trimestre 1',
          average: 14.8,
          rank: 5,
          class_average: 13.5
        },
        {
          id: 'grade-005',
          subject: 'Français',
          subject_code: 'FR',
          grade: 14,
          max_grade: 20,
          coefficient: 3,
          grade_type: 'Dissertation',
          date: '2024-11-10',
          teacher_name: 'M. Nkotto',
          comment: 'Bonne argumentation',
          term: 'Trimestre 1',
          average: 13.2,
          rank: 8,
          class_average: 12.8
        },
        {
          id: 'grade-006',
          subject: 'Anglais',
          subject_code: 'ANG',
          grade: 17,
          max_grade: 20,
          coefficient: 2,
          grade_type: 'Oral',
          date: '2024-11-07',
          teacher_name: 'Mrs. Johnson',
          comment: 'Excellent accent',
          term: 'Trimestre 1',
          average: 15.5,
          rank: 2,
          class_average: 13.9
        },
        {
          id: 'grade-007',
          subject: 'Histoire-Géo',
          subject_code: 'HG',
          grade: 15,
          max_grade: 20,
          coefficient: 2,
          grade_type: 'Contrôle',
          date: '2024-11-03',
          teacher_name: 'M. Owona',
          comment: 'Bonnes connaissances',
          term: 'Trimestre 1',
          average: 14.3,
          rank: 6,
          class_average: 13.1
        },
        {
          id: 'grade-008',
          subject: 'SVT',
          subject_code: 'SVT',
          grade: 16,
          max_grade: 20,
          coefficient: 2,
          grade_type: 'Contrôle',
          date: '2024-11-09',
          teacher_name: 'Mme Fotso',
          comment: 'Très bien, continuez',
          term: 'Trimestre 1',
          average: 15.8,
          rank: 4,
          class_average: 14.5
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer les présences/absences de l'étudiant
   */
  getStudentAttendance: async () => {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    return {
      data: [
        {
          id: 'att-001',
          date: '2024-11-20',
          status: 'absent',
          absence_type: 'absent',
          justified: true,
          justification: 'Certificat médical',
          period: 'Matin',
          subject: 'Mathématiques',
          teacher_name: 'M. Laurent'
        },
        {
          id: 'att-002',
          date: '2024-11-18',
          status: 'late',
          absence_type: 'late',
          justified: false,
          justification: null,
          period: 'Matin',
          arrival_time: '08:15',
          expected_time: '08:00'
        },
        {
          id: 'att-003',
          date: '2024-11-15',
          status: 'present',
          absence_type: null,
          justified: null,
          justification: null,
          period: 'Toute la journée'
        },
        {
          id: 'att-004',
          date: '2024-11-12',
          status: 'absent',
          absence_type: 'absent',
          justified: true,
          justification: 'Rendez-vous médical',
          period: 'Après-midi',
          subject: 'Physique-Chimie',
          teacher_name: 'Mme Kamga'
        },
        {
          id: 'att-005',
          date: '2024-11-08',
          status: 'late',
          absence_type: 'late',
          justified: false,
          justification: null,
          period: 'Matin',
          arrival_time: '08:10',
          expected_time: '08:00'
        },
        {
          id: 'att-006',
          date: '2024-11-05',
          status: 'absent',
          absence_type: 'absent',
          justified: false,
          justification: null,
          period: 'Matin',
          subject: 'Français',
          teacher_name: 'M. Nkotto'
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer les devoirs/assignments de l'étudiant
   */
  getStudentAssignments: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: [
        {
          id: 'assign-001',
          title: 'DM sur les intégrales',
          subject: 'Mathématiques',
          subject_code: 'MATH',
          description: 'Exercices 1 à 5 page 127',
          due_date: '2024-11-25',
          assigned_date: '2024-11-18',
          status: 'pending',
          priority: 'high',
          teacher_name: 'M. Laurent',
          estimated_duration: '2 heures',
          resources: ['Manuel page 127', 'Cours chapitre 5']
        },
        {
          id: 'assign-002',
          title: 'Compte-rendu TP Optique',
          subject: 'Physique-Chimie',
          subject_code: 'PC',
          description: 'Rédiger le compte-rendu du TP sur la réfraction',
          due_date: '2024-11-23',
          assigned_date: '2024-11-19',
          status: 'pending',
          priority: 'high',
          teacher_name: 'Mme Kamga',
          estimated_duration: '1.5 heures',
          resources: ['Protocole TP', 'Cours optique']
        },
        {
          id: 'assign-003',
          title: 'Dissertation sur "Candide"',
          subject: 'Français',
          subject_code: 'FR',
          description: 'Analyser le personnage de Candide',
          due_date: '2024-11-28',
          assigned_date: '2024-11-14',
          status: 'in_progress',
          priority: 'medium',
          teacher_name: 'M. Nkotto',
          estimated_duration: '3 heures',
          resources: ['Candide de Voltaire', 'Cours chapitre 3'],
          progress: 60
        },
        {
          id: 'assign-004',
          title: 'Exposé sur la Révolution française',
          subject: 'Histoire-Géo',
          subject_code: 'HG',
          description: 'Présentation orale de 10 minutes',
          due_date: '2024-11-30',
          assigned_date: '2024-11-10',
          status: 'in_progress',
          priority: 'medium',
          teacher_name: 'M. Owona',
          estimated_duration: '4 heures',
          resources: ['Manuel chapitre 7', 'Documents ressources'],
          progress: 40
        },
        {
          id: 'assign-005',
          title: 'Exercices trigonométrie',
          subject: 'Mathématiques',
          subject_code: 'MATH',
          description: 'Exercices 10 à 15 page 89',
          due_date: '2024-11-15',
          assigned_date: '2024-11-08',
          status: 'completed',
          priority: 'low',
          teacher_name: 'M. Laurent',
          estimated_duration: '1 heure',
          resources: ['Manuel page 89'],
          completion_date: '2024-11-14',
          grade: 18
        },
        {
          id: 'assign-006',
          title: 'TP Chimie - Dosage acide-base',
          subject: 'Physique-Chimie',
          subject_code: 'PC',
          description: 'TP en binôme',
          due_date: '2024-11-12',
          assigned_date: '2024-11-05',
          status: 'completed',
          priority: 'high',
          teacher_name: 'Mme Kamga',
          estimated_duration: '2 heures',
          resources: ['Protocole', 'Cours chimie'],
          completion_date: '2024-11-12',
          grade: 16
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer les notifications de l'étudiant
   */
  getStudentNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return {
      data: [
        {
          id: 'notif-001',
          title: 'Nouvelle note disponible',
          message: 'Votre note de Contrôle de Mathématiques est disponible',
          type: 'grades',
          priority: 'high',
          is_read: false,
          created_at: '2024-11-20T14:30:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            subject: 'Mathématiques',
            grade: 18
          }
        },
        {
          id: 'notif-002',
          title: 'Devoir à rendre',
          message: 'Le DM sur les intégrales est à rendre pour le 25/11',
          type: 'assignments',
          priority: 'high',
          is_read: false,
          created_at: '2024-11-18T09:00:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            assignment_id: 'assign-001',
            due_date: '2024-11-25'
          }
        },
        {
          id: 'notif-003',
          title: 'Absence enregistrée',
          message: 'Une absence a été enregistrée le 20/11 en Mathématiques',
          type: 'absences',
          priority: 'medium',
          is_read: false,
          created_at: '2024-11-20T10:00:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            date: '2024-11-20',
            subject: 'Mathématiques'
          }
        },
        {
          id: 'notif-004',
          title: 'Réunion parents-professeurs',
          message: 'Réunion le 30/11 à 18h pour le conseil de classe',
          type: 'meetings',
          priority: 'medium',
          is_read: false,
          created_at: '2024-11-17T16:00:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            meeting_date: '2024-11-30',
            meeting_time: '18:00'
          }
        },
        {
          id: 'notif-005',
          title: 'Message du professeur',
          message: 'M. Laurent vous a envoyé un message concernant le prochain contrôle',
          type: 'messages',
          priority: 'low',
          is_read: false,
          created_at: '2024-11-16T11:30:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            teacher_name: 'M. Laurent',
            subject: 'Mathématiques'
          }
        },
        {
          id: 'notif-006',
          title: 'Emploi du temps modifié',
          message: 'Le cours de Physique du 22/11 est déplacé à 14h',
          type: 'info',
          priority: 'low',
          is_read: true,
          created_at: '2024-11-15T13:00:00Z',
          school_name: 'Lycée Excellence Yaoundé',
          metadata: {
            date: '2024-11-22',
            subject: 'Physique-Chimie'
          }
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer les badges/achievements de l'étudiant
   */
  getStudentAchievements: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      data: [
        {
          id: 'ach-001',
          title: 'Mathématicien en herbe',
          description: 'Moyenne supérieure à 15 en Mathématiques',
          icon: '🏆',
          category: 'academic',
          earned_date: '2024-11-15',
          level: 'gold',
          points: 50
        },
        {
          id: 'ach-002',
          title: 'Assidu',
          description: 'Aucune absence non justifiée ce mois',
          icon: '⭐',
          category: 'attendance',
          earned_date: '2024-11-01',
          level: 'silver',
          points: 30
        },
        {
          id: 'ach-003',
          title: 'Scientifique accompli',
          description: 'Excellents résultats en sciences',
          icon: '🔬',
          category: 'academic',
          earned_date: '2024-10-20',
          level: 'gold',
          points: 50
        },
        {
          id: 'ach-004',
          title: 'Polyglotte',
          description: 'Très bons résultats en langues',
          icon: '🌍',
          category: 'academic',
          earned_date: '2024-10-15',
          level: 'bronze',
          points: 20
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer le comportement/discipline de l'étudiant
   */
  getStudentBehavior: async () => {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    return {
      data: {
        overall_score: 85,
        participation: 90,
        discipline: 80,
        respect: 95,
        homework: 85,
        incidents: [
          {
            id: 'inc-001',
            date: '2024-11-18',
            type: 'Retard',
            description: 'Arrivée à 8h15 au lieu de 8h00',
            severity: 'minor',
            teacher_name: 'Vie scolaire'
          }
        ],
        positive_notes: [
          {
            id: 'pos-001',
            date: '2024-11-15',
            type: 'Participation excellente',
            description: 'Très bonne participation en cours de Mathématiques',
            teacher_name: 'M. Laurent'
          },
          {
            id: 'pos-002',
            date: '2024-11-10',
            type: 'Entraide',
            description: 'A aidé un camarade en difficulté',
            teacher_name: 'Mme Kamga'
          }
        ],
        comments: [
          {
            teacher_name: 'M. Laurent',
            subject: 'Mathématiques',
            comment: 'Élève sérieuse et investie. Continue ainsi !'
          },
          {
            teacher_name: 'Mme Kamga',
            subject: 'Physique-Chimie',
            comment: 'Bonne participation, attention à la rigueur scientifique.'
          }
        ]
      },
      error: null
    };
  },

  /**
   * Récupérer l'emploi du temps de l'étudiant
   */
  getStudentSchedule: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: {
        monday: [
          { time: '08:00-09:00', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '09:00-10:00', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '10:15-11:15', subject: 'Français', teacher: 'M. Nkotto', room: 'Salle 105' },
          { time: '11:15-12:15', subject: 'Histoire-Géo', teacher: 'M. Owona', room: 'Salle 203' },
          { time: '14:00-15:00', subject: 'Anglais', teacher: 'Mrs. Johnson', room: 'Salle 108' },
          { time: '15:00-16:00', subject: 'EPS', teacher: 'M. Talla', room: 'Gymnase' }
        ],
        tuesday: [
          { time: '08:00-09:00', subject: 'Physique-Chimie', teacher: 'Mme Kamga', room: 'Labo 1' },
          { time: '09:00-10:00', subject: 'Physique-Chimie', teacher: 'Mme Kamga', room: 'Labo 1' },
          { time: '10:15-11:15', subject: 'SVT', teacher: 'Mme Fotso', room: 'Salle 305' },
          { time: '11:15-12:15', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '14:00-15:00', subject: 'Français', teacher: 'M. Nkotto', room: 'Salle 105' },
          { time: '15:00-16:00', subject: 'Anglais', teacher: 'Mrs. Johnson', room: 'Salle 108' }
        ],
        wednesday: [
          { time: '08:00-09:00', subject: 'Histoire-Géo', teacher: 'M. Owona', room: 'Salle 203' },
          { time: '09:00-10:00', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '10:15-11:15', subject: 'Physique-Chimie', teacher: 'Mme Kamga', room: 'Salle 301' },
          { time: '11:15-12:15', subject: 'SVT', teacher: 'Mme Fotso', room: 'Salle 305' }
        ],
        thursday: [
          { time: '08:00-09:00', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '09:00-10:00', subject: 'Français', teacher: 'M. Nkotto', room: 'Salle 105' },
          { time: '10:15-11:15', subject: 'Anglais', teacher: 'Mrs. Johnson', room: 'Salle 108' },
          { time: '11:15-12:15', subject: 'EPS', teacher: 'M. Talla', room: 'Gymnase' },
          { time: '14:00-15:00', subject: 'Physique-Chimie', teacher: 'Mme Kamga', room: 'Labo 1' },
          { time: '15:00-16:00', subject: 'Histoire-Géo', teacher: 'M. Owona', room: 'Salle 203' }
        ],
        friday: [
          { time: '08:00-09:00', subject: 'SVT', teacher: 'Mme Fotso', room: 'Salle 305' },
          { time: '09:00-10:00', subject: 'SVT', teacher: 'Mme Fotso', room: 'Labo 2' },
          { time: '10:15-11:15', subject: 'Mathématiques', teacher: 'M. Laurent', room: 'Salle 201' },
          { time: '11:15-12:15', subject: 'Français', teacher: 'M. Nkotto', room: 'Salle 105' },
          { time: '14:00-15:00', subject: 'Physique-Chimie', teacher: 'Mme Kamga', room: 'Salle 301' },
          { time: '15:00-16:00', subject: 'Anglais', teacher: 'Mrs. Johnson', room: 'Salle 108' }
        ]
      },
      error: null
    };
  },

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead: async (notificationId) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      data: { success: true },
      error: null
    };
  }
};

export default studentDemoDataService;
