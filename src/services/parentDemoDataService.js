/**
 * Service de données de démonstration pour le dashboard parent
 * Génère des données mock réalistes pour tester l'interface parent
 */

const parentDemoDataService = {
  /**
   * Récupérer le profil du parent
   */
  getParentProfile: async () => {
    return {
      data: {
        id: "parent-demo-001",
        email: "parent.demo@edutrack.cm",
        full_name: "Kamga Geraldo",
        phone: "+237 677 11 22 33",
        role: "parent",
        is_active: true
      },
      error: null
    };
  },

  /**
   * Récupérer tous les enfants d'un parent
   */
  getChildren: async (parentId) => {
    return {
      data: [
        {
          id: "child-demo-001",
          matricule: "CM-E-2025-0002",
          full_name: "Paul Kamga",
          gender: "M",
          birth_date: "2008-03-15",
          photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          class: {
            id: "class-demo-001",
            name: "Terminale C",
            level: "Terminale",
            section: "C"
          },
          school: {
            id: "school-demo-001",
            name: "Lycée Bilingue Biyem-Assi",
            code: "LBB-2024",
            type: "lycee",
            city: "Yaoundé",
            country: "Cameroun"
          },
          parent_students: [
            {
              relationship: "parent",
              is_primary: true
            }
          ],
          averageGrade: 14.8,
          attendanceRate: 92,
          unreadNotifications: 3,
          pendingPayments: 1
        },
        {
          id: "child-demo-002",
          matricule: "CM-E-2025-0003",
          full_name: "Aminata Kamga",
          gender: "F",
          birth_date: "2010-07-22",
          photo_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          class: {
            id: "class-demo-002",
            name: "2nde A",
            level: "2nde",
            section: "A"
          },
          school: {
            id: "school-demo-002",
            name: "Collège La Rochelle Douala",
            code: "CLR-2024",
            type: "college",
            city: "Douala",
            country: "Cameroun"
          },
          parent_students: [
            {
              relationship: "parent",
              is_primary: true
            }
          ],
          averageGrade: 16.2,
          attendanceRate: 96,
          unreadNotifications: 1,
          pendingPayments: 0
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer les notes d'un enfant
   */
  getChildGrades: async (childId) => {
    const gradesData = {
      "child-demo-001": [
        {
          id: "grade-demo-001",
          subject: "Mathématiques",
          subject_code: "MATH",
          grade: 16,
          max_grade: 20,
          coefficient: 7,
          grade_type: "Contrôle",
          date: "2024-11-12",
          teacher_name: "M. Ngono",
          average: 15.5,
          trend: "up",
          comment: "Très bon travail, continue ainsi !"
        },
        {
          id: "grade-demo-002",
          subject: "Physique",
          subject_code: "PHY",
          grade: 13,
          max_grade: 20,
          coefficient: 6,
          grade_type: "TP",
          date: "2024-11-08",
          teacher_name: "Mme Fouda",
          average: 14.2,
          trend: "down",
          comment: "Attention aux calculs d'erreur"
        },
        {
          id: "grade-demo-003",
          subject: "Français",
          subject_code: "FR",
          grade: 14,
          max_grade: 20,
          coefficient: 5,
          grade_type: "Dissertation",
          date: "2024-11-05",
          teacher_name: "M. Binam",
          average: 13.8,
          trend: "stable",
          comment: "Bonne argumentation"
        },
        {
          id: "grade-demo-004",
          subject: "Anglais",
          subject_code: "ANG",
          grade: 15,
          max_grade: 20,
          coefficient: 4,
          grade_type: "Expression Orale",
          date: "2024-11-10",
          teacher_name: "Mrs. Tanko",
          average: 14.5,
          trend: "up",
          comment: "Good pronunciation!"
        }
      ],
      "child-demo-002": [
        {
          id: "grade-demo-005",
          subject: "Mathématiques",
          subject_code: "MATH",
          grade: 18,
          max_grade: 20,
          coefficient: 6,
          grade_type: "Contrôle",
          date: "2024-11-10",
          teacher_name: "M. Ateba",
          average: 17.2,
          trend: "up",
          comment: "Excellente maîtrise !"
        },
        {
          id: "grade-demo-006",
          subject: "Histoire",
          subject_code: "HIST",
          grade: 16,
          max_grade: 20,
          coefficient: 4,
          grade_type: "Exposé",
          date: "2024-11-07",
          teacher_name: "Mme Mbarga",
          average: 15.8,
          trend: "up",
          comment: "Très bonne présentation"
        },
        {
          id: "grade-demo-007",
          subject: "Anglais",
          subject_code: "ANG",
          grade: 17,
          max_grade: 20,
          coefficient: 4,
          grade_type: "Expression",
          date: "2024-11-04",
          teacher_name: "Mr. Njoya",
          average: 16.5,
          trend: "stable",
          comment: "Excellent work!"
        },
        {
          id: "grade-demo-008",
          subject: "SVT",
          subject_code: "SVT",
          grade: 15,
          max_grade: 20,
          coefficient: 5,
          grade_type: "TP",
          date: "2024-11-09",
          teacher_name: "Mme Eba",
          average: 15.2,
          trend: "stable",
          comment: "Bonne manipulation"
        }
      ]
    };

    return {
      data: gradesData[childId] || [],
      error: null
    };
  },

  /**
   * Récupérer les présences/absences d'un enfant
   */
  getChildAttendance: async (childId) => {
    const attendanceData = {
      "child-demo-001": {
        "2024-11-01": { status: "present", justification: null },
        "2024-11-02": { status: "present", justification: null },
        "2024-11-03": { status: "absent", justification: null },
        "2024-11-04": { status: "present", justification: null },
        "2024-11-05": { status: "late", justification: "Problème de transport" },
        "2024-11-06": { status: "present", justification: null },
        "2024-11-07": { status: "present", justification: null },
        "2024-11-08": { status: "present", justification: null },
        "2024-11-09": { status: "absent", justification: null },
        "2024-11-10": { status: "present", justification: null },
        "2024-11-11": { status: "present", justification: null },
        "2024-11-12": { status: "present", justification: null },
        "2024-11-13": { status: "present", justification: null },
        "2024-11-14": { status: "present", justification: null },
        "2024-11-15": { status: "present", justification: null }
      },
      "child-demo-002": {
        "2024-11-01": { status: "present", justification: null },
        "2024-11-02": { status: "present", justification: null },
        "2024-11-03": { status: "present", justification: null },
        "2024-11-04": { status: "present", justification: null },
        "2024-11-05": { status: "present", justification: null },
        "2024-11-06": { status: "present", justification: null },
        "2024-11-07": { status: "present", justification: null },
        "2024-11-08": { status: "late", justification: "Rendez-vous médical" },
        "2024-11-09": { status: "present", justification: null },
        "2024-11-10": { status: "present", justification: null },
        "2024-11-11": { status: "present", justification: null },
        "2024-11-12": { status: "present", justification: null },
        "2024-11-13": { status: "present", justification: null },
        "2024-11-14": { status: "present", justification: null },
        "2024-11-15": { status: "present", justification: null }
      }
    };

    return {
      data: attendanceData[childId] || {},
      error: null
    };
  },

  /**
   * Récupérer les paiements d'un enfant
   */
  getChildPayments: async (childId) => {
    const paymentData = {
      "child-demo-001": [
        {
          id: "payment-demo-001",
          type: "Frais de scolarité",
          description: "Frais scolaires T1 2024-2025",
          amount: 150000,
          currency: "XAF",
          status: "pending",
          due_date: "2024-11-30",
          payment_method: "MTN Mobile Money",
          created_at: "2024-09-01"
        },
        {
          id: "payment-demo-002",
          type: "Uniforme scolaire",
          description: "Achat uniforme 2024-2025",
          amount: 35000,
          currency: "XAF",
          status: "completed",
          due_date: "2024-09-15",
          paid_date: "2024-09-10",
          payment_method: "Orange Money",
          created_at: "2024-08-20"
        }
      ],
      "child-demo-002": [
        {
          id: "payment-demo-003",
          type: "Frais de scolarité",
          description: "Frais scolaires T1 2024-2025",
          amount: 120000,
          currency: "XAF",
          status: "completed",
          due_date: "2024-10-31",
          paid_date: "2024-10-15",
          payment_method: "Orange Money",
          created_at: "2024-09-01"
        },
        {
          id: "payment-demo-004",
          type: "Activités extra-scolaires",
          description: "Club de danse - Trimestre 1",
          amount: 25000,
          currency: "XAF",
          status: "completed",
          due_date: "2024-10-15",
          paid_date: "2024-10-12",
          payment_method: "MTN Mobile Money",
          created_at: "2024-09-15"
        }
      ]
    };

    return {
      data: paymentData[childId] || [],
      error: null
    };
  },

  /**
   * Récupérer les notifications d'un enfant
   */
  getChildNotifications: async (childId) => {
    const notificationsData = {
      "child-demo-001": [
        {
          id: "notif-demo-001",
          title: "Nouvelle note disponible",
          message: "Note de contrôle de mathématiques : 16/20",
          type: "grades",
          priority: "medium",
          school_name: "Lycée Bilingue Biyem-Assi",
          created_at: "2024-11-12T10:30:00",
          read: false,
          metadata: {
            subject: "Mathématiques",
            grade: 16,
            max_grade: 20
          }
        },
        {
          id: "notif-demo-002",
          title: "Absence non justifiée",
          message: "Absence du 03/11/2024 nécessite une justification",
          type: "absences",
          priority: "high",
          school_name: "Lycée Bilingue Biyem-Assi",
          created_at: "2024-11-03T16:00:00",
          read: false,
          metadata: {
            absence_date: "2024-11-03"
          }
        },
        {
          id: "notif-demo-003",
          title: "Paiement en attente",
          message: "Frais de scolarité T1 à régler avant le 30/11/2024",
          type: "payments",
          priority: "high",
          school_name: "Lycée Bilingue Biyem-Assi",
          created_at: "2024-11-15T09:00:00",
          read: false,
          metadata: {
            amount: 150000,
            due_date: "2024-11-30"
          }
        }
      ],
      "child-demo-002": [
        {
          id: "notif-demo-004",
          title: "Réunion parents-professeurs",
          message: "Réunion programmée le 20/11/2024 à 16h00",
          type: "meetings",
          priority: "medium",
          school_name: "Collège La Rochelle Douala",
          created_at: "2024-11-10T11:00:00",
          read: false,
          metadata: {
            meeting_date: "2024-11-20",
            meeting_time: "16:00",
            location: "Salle des professeurs"
          }
        }
      ]
    };

    return {
      data: notificationsData[childId] || [],
      error: null
    };
  },

  /**
   * Récupérer les événements à venir
   */
  getUpcomingEvents: async (parentId) => {
    return {
      data: [
        {
          id: "event-demo-001",
          title: "Réunion parents-professeurs",
          description: "Discussion sur les résultats du premier trimestre",
          school_name: "Lycée Bilingue Biyem-Assi",
          child_name: "Paul Kamga",
          event_date: "2024-11-20",
          start_time: "16:00",
          end_time: "18:00",
          location: "Salle des conférences",
          type: "meeting",
          status: "upcoming"
        },
        {
          id: "event-demo-002",
          title: "Remise des bulletins",
          description: "Remise des bulletins du premier trimestre",
          school_name: "Collège La Rochelle Douala",
          child_name: "Aminata Kamga",
          event_date: "2024-11-25",
          start_time: "10:00",
          end_time: "12:00",
          location: "Cour principale",
          type: "ceremony",
          status: "upcoming"
        },
        {
          id: "event-demo-003",
          title: "Sortie pédagogique - Musée",
          description: "Visite du Musée National d'Histoire",
          school_name: "Lycée Bilingue Biyem-Assi",
          child_name: "Paul Kamga",
          event_date: "2024-12-02",
          start_time: "08:00",
          end_time: "14:00",
          location: "Musée National",
          type: "excursion",
          status: "upcoming"
        },
        {
          id: "event-demo-004",
          title: "Fête de fin d'année",
          description: "Spectacle et remise de prix",
          school_name: "Collège La Rochelle Douala",
          child_name: "Aminata Kamga",
          event_date: "2024-12-15",
          start_time: "14:00",
          end_time: "17:00",
          location: "Grande salle",
          type: "celebration",
          status: "upcoming"
        }
      ],
      error: null
    };
  },

  /**
   * Récupérer toutes les écoles des enfants
   */
  getSchools: async (parentId) => {
    return {
      data: [
        {
          id: "school-demo-001",
          name: "Lycée Bilingue Biyem-Assi",
          code: "LBB-2024",
          type: "lycee",
          city: "Yaoundé",
          country: "Cameroun",
          childrenCount: 1
        },
        {
          id: "school-demo-002",
          name: "Collège La Rochelle Douala",
          code: "CLR-2024",
          type: "college",
          city: "Douala",
          country: "Cameroun",
          childrenCount: 1
        }
      ],
      error: null
    };
  },

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead: async (notificationId) => {
    return {
      data: { id: notificationId, read: true },
      error: null
    };
  }
};

export default parentDemoDataService;
