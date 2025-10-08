/**
 * Service de données de démonstration
 * Fournit toutes les données fictives utilisées en mode démo
 */

// Données de démonstration pour les métriques clés
export const demoMetrics = [
  {
    title: 'Élèves inscrits',
    value: '400',
    change: 2.5,
    changeType: 'positive',
    icon: 'Users',
    description: 'Total des inscriptions',
    trend: 85
  },
  {
    title: 'Taux de présence',
    value: '94.2%',
    change: 1.2,
    changeType: 'positive',
    icon: 'UserCheck',
    description: 'Moyenne hebdomadaire',
    trend: 94
  },
  {
    title: 'Moyenne générale',
    value: '84.7/100',
    change: -0.8,
    changeType: 'negative',
    icon: 'BookOpen',
    description: 'Performance académique',
    trend: 85
  },
  {
    title: 'Paiements à jour',
    value: '85.5%',
    change: 3.2,
    changeType: 'positive',
    icon: 'CreditCard',
    description: 'Frais de scolarité',
    trend: 86
  }
];

// Données de démonstration pour les moyennes de classe
export const demoClassAverages = [
  { class: '6ème A', mathematics: 85, french: 78, science: 82, history: 76, average: 80.25 },
  { class: '6ème B', mathematics: 79, french: 84, science: 77, history: 81, average: 80.25 },
  { class: '5ème A', mathematics: 88, french: 82, science: 85, history: 79, average: 83.5 },
  { class: '5ème B', mathematics: 83, french: 79, science: 81, history: 77, average: 80 },
  { class: '4ème A', mathematics: 91, french: 86, science: 89, history: 84, average: 87.5 },
  { class: '4ème B', mathematics: 87, french: 83, science: 85, history: 82, average: 84.25 },
  { class: '3ème A', mathematics: 93, french: 89, science: 91, history: 87, average: 90 },
  { class: '3ème B', mathematics: 89, french: 85, science: 87, history: 83, average: 86 }
];

// Données de démonstration pour l'assiduité
export const demoAttendanceData = [
  { day: 'Lun', present: 380, absent: 20, late: 15, excused: 5 },
  { day: 'Mar', present: 385, absent: 15, late: 12, excused: 3 },
  { day: 'Mer', present: 375, absent: 25, late: 18, excused: 7 },
  { day: 'Jeu', present: 390, absent: 10, late: 8, excused: 2 },
  { day: 'Ven', present: 370, absent: 30, late: 20, excused: 10 },
  { day: 'Sam', present: 395, absent: 5, late: 5, excused: 0 }
];

// Données de démonstration pour les paiements
export const demoPaymentData = [
  { status: 'À jour', count: 342, percentage: 85.5, color: '#22c55e' },
  { status: 'En retard', count: 43, percentage: 10.75, color: '#f59e0b' },
  { status: 'En défaut', count: 15, percentage: 3.75, color: '#ef4444' }
];

// Données de démonstration pour le personnel
export const demoPersonnel = [
  {
    id: 'demo-1',
    name: 'Marie Dubois',
    role: 'teacher',
    department: 'Mathématiques',
    email: 'marie.dubois@demo.com',
    phone: '77 123 45 67',
    joinDate: '2020-09-01',
    status: 'active',
    avatar: null,
    classes: ['6ème A', '5ème B', '4ème A'],
    subjects: ['Mathématiques']
  },
  {
    id: 'demo-2',
    name: 'Jean Martin',
    role: 'teacher',
    department: 'Français',
    email: 'jean.martin@demo.com',
    phone: '77 234 56 78',
    joinDate: '2019-08-15',
    status: 'active',
    avatar: null,
    classes: ['3ème A', '3ème B'],
    subjects: ['Français', 'Littérature']
  },
  {
    id: 'demo-3',
    name: 'Fatou Seck',
    role: 'secretary',
    department: 'Administration',
    email: 'fatou.seck@demo.com',
    phone: '77 345 67 89',
    joinDate: '2021-02-10',
    status: 'active',
    avatar: null
  },
  {
    id: 'demo-4',
    name: 'Amadou Ba',
    role: 'teacher',
    department: 'Sciences',
    email: 'amadou.ba@demo.com',
    phone: '77 456 78 90',
    joinDate: '2018-09-01',
    status: 'active',
    avatar: null,
    classes: ['5ème A', '4ème A', '4ème B'],
    subjects: ['Sciences Physiques', 'Chimie']
  }
];

// Données de démonstration pour les étudiants
export const demoStudents = [
  {
    id: 'demo-student-1',
    firstName: 'Aminata',
    lastName: 'Diallo',
    class: '6ème A',
    age: 12,
    gender: 'female',
    parentPhone: '77 111 22 33',
    enrollmentDate: '2024-09-01',
    status: 'active',
    paymentStatus: 'up_to_date'
  },
  {
    id: 'demo-student-2',
    firstName: 'Moussa',
    lastName: 'Ndiaye',
    class: '5ème B',
    age: 13,
    gender: 'male',
    parentPhone: '77 222 33 44',
    enrollmentDate: '2023-09-01',
    status: 'active',
    paymentStatus: 'late'
  }
  // ... plus d'étudiants si nécessaire
];

// Service principal de données de démonstration
export const demoDataService = {
  // Métriques du dashboard
  async getDashboardMetrics() {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: demoMetrics,
      error: null
    };
  },

  // Moyennes de classe
  async getClassAverages(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let data = [...demoClassAverages];
    
    // Appliquer les filtres si nécessaire
    if (filters.grade && filters.grade !== 'all') {
      data = data.filter(item => item.class.includes(filters.grade + 'ème'));
    }
    
    return {
      data,
      error: null
    };
  },

  // Données d'assiduité
  async getAttendanceData(period = 'week') {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      data: demoAttendanceData,
      error: null
    };
  },

  // Données de paiement
  async getPaymentData() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      data: demoPaymentData,
      error: null
    };
  },

  // Personnel
  async getPersonnel() {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      data: demoPersonnel,
      error: null
    };
  },

  // Étudiants
  async getStudents(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 450));
    let data = [...demoStudents];
    
    if (filters.class) {
      data = data.filter(student => student.class === filters.class);
    }
    
    return {
      data,
      error: null
    };
  },

  // Statistiques générales
  async getSchoolStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      data: {
        totalStudents: 400,
        totalTeachers: 25,
        totalClasses: 8,
        averageAttendance: 94.2,
        averageGrade: 84.7,
        paymentRate: 85.5
      },
      error: null
    };
  },

  // Détails de l'école (démo)
  async getSchoolDetails() {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      data: {
        id: 'demo-school',
        name: 'École Démonstration',
        type: 'Établissement Secondaire',
        address: '123 Rue de la Démonstration',
        city: 'Ville Démo',
        country: 'Pays Démo',
        phone: '+237 123 456 789',
        code: 'DEMO-001',
        status: 'active',
        available_classes: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'],
        director_id: 'demo-director',
        users: {
          id: 'demo-director',
          full_name: 'Directeur Démonstration',
          email: 'directeur@demo.com'
        },
        created_at: new Date().toISOString()
      },
      error: null
    };
  },

  // Classes (démo)
  async getClasses() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: [
        {
          id: 'demo-class-1',
          name: '6ème A',
          level: '6ème',
          section: 'A',
          capacity: 50,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        },
        {
          id: 'demo-class-2',
          name: '6ème B',
          level: '6ème',
          section: 'B',
          capacity: 45,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        },
        {
          id: 'demo-class-3',
          name: '5ème A',
          level: '5ème',
          section: 'A',
          capacity: 48,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        },
        {
          id: 'demo-class-4',
          name: '5ème B',
          level: '5ème',
          section: 'B',
          capacity: 46,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        },
        {
          id: 'demo-class-5',
          name: '4ème A',
          level: '4ème',
          section: 'A',
          capacity: 42,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        },
        {
          id: 'demo-class-6',
          name: '3ème A',
          level: '3ème',
          section: 'A',
          capacity: 40,
          is_active: true,
          created_at: '2024-09-01T08:00:00Z'
        }
      ],
      error: null
    };
  }
};

export default demoDataService;