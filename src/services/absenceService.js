// Service de démonstration pour la gestion des absences et justifications
// En production, ces données viendraient d'une base de données

// Données d'exemple pour les étudiants
const studentsData = [
  {
    id: "STU001",
    name: "Amina Nkomo",
    class: "CM2",
    parentName: "Paul Nkomo",
    parentPhone: "+237 6 78 90 12 34",
    parentEmail: "p.nkomo@gmail.com"
  },
  {
    id: "STU002", 
    name: "Junior Mbarga",
    class: "CM1",
    parentName: "Marie Mbarga",
    parentPhone: "+237 6 89 01 23 45",
    parentEmail: "marie.mbarga@yahoo.fr"
  },
  {
    id: "STU003",
    name: "Grace Fouda", 
    class: "CE2",
    parentName: "Jean Fouda",
    parentPhone: "+237 6 90 12 34 56",
    parentEmail: "j.fouda@outlook.com"
  },
  {
    id: "STU004",
    name: "Kevin Biya",
    class: "CM2", 
    parentName: "Esther Biya",
    parentPhone: "+237 6 01 23 45 67",
    parentEmail: "esther.biya@hotmail.com"
  },
  {
    id: "STU005",
    name: "Sarah Atangana",
    class: "CE1",
    parentName: "Michel Atangana",
    parentPhone: "+237 6 12 34 56 78",
    parentEmail: "m.atangana@gmail.com"
  }
];

// Données d'exemple pour les absences
let absencesData = [
  {
    id: 1,
    studentName: "Junior Mbarga",
    studentId: "STU002",
    class: "CM1",
    parentName: "Marie Mbarga",
    parentPhone: "+237 6 89 01 23 45",
    parentEmail: "marie.mbarga@yahoo.fr",
    absenceDate: "15/11/2024",
    type: "absence",
    status: "justified",
    justification: "Rendez-vous médical",
    justificationDate: "16/11/2024",
    notifiedParent: true,
    duration: "Matinée",
    teacherNotified: true,
    notificationHistory: [
      {
        type: "sms",
        date: "15/11/2024 09:30",
        message: "Votre enfant Junior est absent ce matin. Merci de nous contacter.",
        status: "sent"
      }
    ]
  },
  {
    id: 2,
    studentName: "Grace Fouda",
    studentId: "STU003",
    class: "CE2",
    parentName: "Jean Fouda",
    parentPhone: "+237 6 90 12 34 56",
    parentEmail: "j.fouda@outlook.com",
    absenceDate: "16/11/2024",
    type: "absence",
    status: "pending",
    justification: "",
    justificationDate: "",
    notifiedParent: true,
    duration: "Journée complète",
    teacherNotified: true,
    notificationHistory: [
      {
        type: "sms",
        date: "16/11/2024 08:15",
        message: "Grace est absente aujourd'hui. Merci de justifier son absence.",
        status: "sent"
      }
    ]
  },
  {
    id: 3,
    studentName: "Kevin Biya",
    studentId: "STU004",
    class: "CM2",
    parentName: "Esther Biya",
    parentPhone: "+237 6 01 23 45 67",
    parentEmail: "esther.biya@hotmail.com",
    absenceDate: "16/11/2024",
    type: "late",
    status: "unjustified",
    justification: "",
    justificationDate: "",
    notifiedParent: false,
    duration: "30 minutes",
    teacherNotified: true,
    notificationHistory: []
  },
  {
    id: 4,
    studentName: "Sarah Atangana",
    studentId: "STU005",
    class: "CE1",
    parentName: "Michel Atangana",
    parentPhone: "+237 6 12 34 56 78",
    parentEmail: "m.atangana@gmail.com",
    absenceDate: "14/11/2024",
    type: "absence",
    status: "unjustified",
    justification: "",
    justificationDate: "",
    notifiedParent: true,
    duration: "Après-midi",
    teacherNotified: true,
    notificationHistory: [
      {
        type: "email",
        date: "14/11/2024 14:30",
        message: "Sarah était absente cet après-midi. Merci de nous expliquer la raison.",
        status: "sent"
      }
    ]
  },
  {
    id: 5,
    studentName: "Amina Nkomo",
    studentId: "STU001",
    class: "CM2",
    parentName: "Paul Nkomo",
    parentPhone: "+237 6 78 90 12 34",
    parentEmail: "p.nkomo@gmail.com",
    absenceDate: "13/11/2024",
    type: "late",
    status: "justified",
    justification: "Problème de transport",
    justificationDate: "13/11/2024",
    notifiedParent: false,
    duration: "15 minutes",
    teacherNotified: true,
    notificationHistory: []
  }
];

// Formatage des dates
const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (date) => {
  return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Service principal
export const absenceService = {
  // Obtenir toutes les absences
  getAllAbsences: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...absencesData]), 300);
    });
  },

  // Obtenir une absence par ID
  getAbsenceById: async (absenceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const absence = absencesData.find(a => a.id === absenceId);
        resolve(absence || null);
      }, 200);
    });
  },

  // Rechercher des étudiants pour créer une nouvelle absence
  searchStudents: async (searchTerm = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = studentsData.filter(student => {
          const matchesSearch = searchTerm === '' || 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase());
          
          return matchesSearch;
        });
        resolve(filtered);
      }, 300);
    });
  },

  // Créer une nouvelle absence
  createAbsence: async (absenceData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.id === absenceData.studentId);
        if (!student) {
          reject(new Error('Étudiant non trouvé'));
          return;
        }

        const newAbsence = {
          id: Math.max(...absencesData.map(a => a.id), 0) + 1,
          studentName: student.name,
          studentId: student.id,
          class: student.class,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          absenceDate: absenceData.date,
          type: absenceData.type,
          status: 'pending',
          justification: '',
          justificationDate: '',
          notifiedParent: false,
          duration: absenceData.duration,
          teacherNotified: true,
          notificationHistory: []
        };

        absencesData.push(newAbsence);
        resolve(newAbsence);
      }, 400);
    });
  },

  // Justifier une absence
  justifyAbsence: async (absenceId, justificationData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
        if (absenceIndex === -1) {
          reject(new Error('Absence non trouvée'));
          return;
        }

        const absence = absencesData[absenceIndex];
        if (absence.status === 'justified') {
          reject(new Error('Cette absence est déjà justifiée'));
          return;
        }

        absencesData[absenceIndex] = {
          ...absence,
          status: 'justified',
          justification: justificationData.reason,
          justificationDate: formatDate(new Date()),
          documents: justificationData.documents || []
        };

        resolve(absencesData[absenceIndex]);
      }, 500);
    });
  },

  // Marquer une absence comme non justifiée
  markAsUnjustified: async (absenceId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
        if (absenceIndex === -1) {
          reject(new Error('Absence non trouvée'));
          return;
        }

        absencesData[absenceIndex] = {
          ...absencesData[absenceIndex],
          status: 'unjustified'
        };

        resolve(absencesData[absenceIndex]);
      }, 300);
    });
  },

  // Appeler un parent (enregistrer l'appel)
  callParent: async (absenceId, callData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
        if (absenceIndex === -1) {
          reject(new Error('Absence non trouvée'));
          return;
        }

        const callRecord = {
          type: 'call',
          date: formatDateTime(new Date()),
          message: callData.notes || 'Appel effectué concernant l\'absence',
          status: callData.successful ? 'successful' : 'failed',
          duration: callData.duration || '2 min'
        };

        absencesData[absenceIndex] = {
          ...absencesData[absenceIndex],
          notifiedParent: true,
          notificationHistory: [
            ...absencesData[absenceIndex].notificationHistory,
            callRecord
          ]
        };

        resolve(absencesData[absenceIndex]);
      }, 400);
    });
  },

  // Envoyer un rappel SMS
  sendSMSReminder: async (absenceId, message) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
        if (absenceIndex === -1) {
          reject(new Error('Absence non trouvée'));
          return;
        }

        const smsRecord = {
          type: 'sms',
          date: formatDateTime(new Date()),
          message: message || 'Rappel concernant l\'absence de votre enfant.',
          status: 'sent'
        };

        absencesData[absenceIndex] = {
          ...absencesData[absenceIndex],
          notifiedParent: true,
          notificationHistory: [
            ...absencesData[absenceIndex].notificationHistory,
            smsRecord
          ]
        };

        resolve(absencesData[absenceIndex]);
      }, 600);
    });
  },

  // Envoyer un rappel Email
  sendEmailReminder: async (absenceId, emailData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
        if (absenceIndex === -1) {
          reject(new Error('Absence non trouvée'));
          return;
        }

        const emailRecord = {
          type: 'email',
          date: formatDateTime(new Date()),
          message: emailData.message || 'Email de rappel concernant l\'absence',
          status: 'sent',
          subject: emailData.subject || 'Absence de votre enfant'
        };

        absencesData[absenceIndex] = {
          ...absencesData[absenceIndex],
          notifiedParent: true,
          notificationHistory: [
            ...absencesData[absenceIndex].notificationHistory,
            emailRecord
          ]
        };

        resolve(absencesData[absenceIndex]);
      }, 700);
    });
  },

  // Envoyer des rappels en lot
  bulkSendReminders: async (absenceIds, reminderType, message) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        const errors = [];

        absenceIds.forEach(absenceId => {
          const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
          if (absenceIndex === -1) {
            errors.push(`Absence ${absenceId} non trouvée`);
            return;
          }

          const reminderRecord = {
            type: reminderType,
            date: formatDateTime(new Date()),
            message: message || `Rappel ${reminderType} concernant l'absence`,
            status: 'sent'
          };

          absencesData[absenceIndex] = {
            ...absencesData[absenceIndex],
            notifiedParent: true,
            notificationHistory: [
              ...absencesData[absenceIndex].notificationHistory,
              reminderRecord
            ]
          };

          results.push(absencesData[absenceIndex]);
        });

        if (errors.length > 0) {
          reject(new Error(errors.join(', ')));
          return;
        }

        resolve(results);
      }, 800);
    });
  },

  // Justifier plusieurs absences en lot
  bulkJustifyAbsences: async (absenceIds, justificationReason) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        const errors = [];

        absenceIds.forEach(absenceId => {
          const absenceIndex = absencesData.findIndex(a => a.id === absenceId);
          if (absenceIndex === -1) {
            errors.push(`Absence ${absenceId} non trouvée`);
            return;
          }

          const absence = absencesData[absenceIndex];
          if (absence.status === 'justified') {
            errors.push(`L'absence de ${absence.studentName} est déjà justifiée`);
            return;
          }

          absencesData[absenceIndex] = {
            ...absence,
            status: 'justified',
            justification: justificationReason,
            justificationDate: formatDate(new Date())
          };

          results.push(absencesData[absenceIndex]);
        });

        if (errors.length > 0) {
          reject(new Error(errors.join(', ')));
          return;
        }

        resolve(results);
      }, 600);
    });
  },

  // Obtenir les statistiques des absences
  getAbsenceStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          total: absencesData.length,
          pending: absencesData.filter(a => a.status === 'pending').length,
          justified: absencesData.filter(a => a.status === 'justified').length,
          unjustified: absencesData.filter(a => a.status === 'unjustified').length,
          toCall: absencesData.filter(a => !a.notifiedParent && a.status === 'pending').length,
          late: absencesData.filter(a => a.type === 'late').length,
          absence: absencesData.filter(a => a.type === 'absence').length
        };
        resolve(stats);
      }, 200);
    });
  },

  // Obtenir l'historique des notifications d'une absence
  getNotificationHistory: async (absenceId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const absence = absencesData.find(a => a.id === absenceId);
        resolve(absence?.notificationHistory || []);
      }, 200);
    });
  },

  // Filtrer les absences par date
  getAbsencesByDateRange: async (startDate, endDate) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = absencesData.filter(absence => {
          const absenceDate = new Date(absence.absenceDate.split('/').reverse().join('-'));
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          return absenceDate >= start && absenceDate <= end;
        });
        resolve(filtered);
      }, 300);
    });
  }
};

export default absenceService;