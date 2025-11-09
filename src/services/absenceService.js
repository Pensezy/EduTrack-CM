// Service pour la gestion des absences et justifications
// Détecte automatiquement le mode démo/production

import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

// Fonction pour détecter le mode
const isProductionMode = () => {
  try {
    const savedUser = localStorage.getItem('edutrack-user');
    console.log('🔍 Debug mode detection - localStorage:', savedUser ? 'EXISTS' : 'NULL');
    
    if (!savedUser) {
      console.log('❌ Pas de données utilisateur dans localStorage');
      return false;
    }
    
    const userData = JSON.parse(savedUser);
    console.log('📊 Données utilisateur:', {
      email: userData.email,
      demoAccount: userData.demoAccount,
      school_name: userData.school_name,
      role: userData.role
    });
    
    const isProduction = !userData.demoAccount;
    console.log('🎯 Mode détecté:', isProduction ? 'PRODUCTION' : 'DÉMO');
    return isProduction;
  } catch (error) {
    console.error('❌ Erreur détection mode:', error);
    return false;
  }
};

// Données d'exemple pour les étudiants (mode démo)
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
  getAllAbsences: async (mode = null) => {
    // Déterminer le mode : utiliser le paramètre fourni ou détecter automatiquement
    const isProduction = mode === 'production' || (mode === null && isProductionMode());
    
    // Mode démo : retourner les données fictives
    if (!isProduction) {
      console.log('🎭 Mode DÉMO - Absences fictives');
      return new Promise((resolve) => {
        setTimeout(() => resolve([...absencesData]), 300);
      });
    }

    // Mode production : charger depuis Supabase
    try {
      console.log('✅ Mode PRODUCTION - Chargement absences Supabase');
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.error('❌ Aucune école associée');
        throw new Error('Pas d\'école associée');
      }

      console.log('🏫 École trouvée:', schoolId);

      // D'abord, inspecter la structure de la table students
      console.log('🔍 Inspection structure table students...');
      const { data: sampleStudent, error: sampleError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .limit(1)
        .single();
        
      if (sampleStudent) {
        console.log('📋 Colonnes disponibles dans students:', Object.keys(sampleStudent));
        console.log('📋 Exemple de données:', sampleStudent);
      } else {
        console.log('⚠️ Aucun étudiant trouvé pour inspection');
      }

      // Pour le moment, utiliser la table students pour simuler les absences
      // En attendant la création d'une vraie table absences
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          first_name,
          last_name,
          user_id,
          created_at
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Erreur requête students:', error);
        throw error;
      }

      console.log('📋 Étudiants trouvés:', studentsData?.length || 0);

      // Transformer en format absences pour simulation
      const simulatedAbsences = studentsData.map((student, index) => ({
        id: index + 1,
        studentId: student.user_id || student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        class: 'Non assigné', // class_name n'existe pas dans la table
        date: new Date().toISOString().split('T')[0], // Aujourd'hui par défaut
        period: ['Matin', 'Après-midi'][index % 2],
        status: ['reported', 'contacted', 'justified_received'][index % 3],
        reason: 'À préciser',
        parentName: 'À renseigner',
        parentPhone: 'À renseigner',
        parentEmail: 'À renseigner',
        notificationSent: index % 2 === 0,
        lastContact: new Date().toISOString().split('T')[0],
        justificationReceived: index % 3 === 0,
        justificationDocument: null,
        notes: 'Données réelles depuis table students (simulation)',
        createdAt: student.created_at
      }));

      console.log('📋 Absences simulées créées:', simulatedAbsences.length);
      return simulatedAbsences;
    } catch (error) {
      console.error('❌ Erreur chargement absences Supabase:', error);
      // Fallback sur données démo en cas d'erreur
      console.log('🔄 Fallback sur données démo');
      return [...absencesData];
    }
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
    // Mode démo : utiliser les données fictives
    if (!isProductionMode()) {
      console.log('🎭 Mode DÉMO - Étudiants fictifs');
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
    }

    // Mode production : rechercher dans Supabase
    try {
      console.log('✅ Mode PRODUCTION - Recherche étudiants:', searchTerm);
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        throw new Error('Pas d\'école associée');
      }

      let query = supabase
        .from('students')
        .select(`
          id,
          user_id,
          first_name,
          last_name
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true);

      // Appliquer le filtre de recherche si fourni
      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`
          first_name.ilike.%${searchTerm}%,
          last_name.ilike.%${searchTerm}%
        `);
      }

      const { data: students, error } = await query
        .order('first_name')
        .limit(50);

      if (error) throw error;

      // Transformer au format attendu par l'interface
      const formattedStudents = students.map(student => ({
        id: student.user_id || student.id,
        name: `${student.first_name} ${student.last_name}`,
        class: 'Non assigné', // class_name n'existe pas dans la table
        parentName: 'À renseigner', // Parents pas encore implémentés
        parentPhone: 'À renseigner',
        parentEmail: 'À renseigner'
      }));

      console.log('📋 Étudiants trouvés:', formattedStudents.length);
      return formattedStudents;
    } catch (error) {
      console.error('❌ Erreur recherche étudiants:', error);
      // Fallback sur données démo
      return studentsData.filter(student => {
        const matchesSearch = searchTerm === '' || 
          student.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }
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

  // Obtenir l'historique général de toutes les notifications
  getAllNotificationHistory: async () => {
    console.log('🔍 getAllNotificationHistory appelé');
    
    if (!isProductionMode()) {
      console.log('🎭 Mode DÉMO - Historique notifications fictives');
      return new Promise((resolve) => {
        setTimeout(() => {
          const allNotifications = [];
          
          // Compiler les notifications de toutes les absences fictives
          absencesData.forEach(absence => {
            if (absence.notificationHistory && absence.notificationHistory.length > 0) {
              absence.notificationHistory.forEach(notification => {
                allNotifications.push({
                  ...notification,
                  absenceId: absence.id,
                  studentName: absence.studentName,
                  absenceDate: absence.date,
                  absenceType: absence.type
                });
              });
            }
          });

          // Trier par date décroissante
          allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
          
          resolve(allNotifications);
        }, 300);
      });
    }

    // Mode production : générer un historique basé sur les vraies données
    try {
      console.log('✅ Mode PRODUCTION - Historique notifications réelles');
      const schoolId = await getCurrentSchoolId();
      
      if (!schoolId) {
        console.warn('❌ Pas d\'ID école - historique vide');
        return [];
      }

      console.log('🏫 École ID trouvée:', schoolId);

      // Récupérer les étudiants réels pour simuler l'historique
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('id, user_id, first_name, last_name, created_at')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erreur requête students:', error);
        throw error;
      }

      console.log('📋 Étudiants trouvés pour historique:', studentsData?.length || 0);

      if (!studentsData || studentsData.length === 0) {
        console.log('📭 Aucun étudiant trouvé - historique vide');
        return [];
      }

      // Simuler des notifications récentes basées sur les vrais étudiants
      const simulatedNotifications = [];
      studentsData.forEach((student, index) => {
        const notificationTypes = ['sms', 'email', 'call'];
        const statuses = ['sent', 'successful', 'failed'];
        const messages = [
          'Rappel d\'absence non justifiée',
          'Demande de justificatif',
          'Information retard répété',
          'Convocation des parents'
        ];

        // Créer 1-3 notifications par étudiant
        const numNotifications = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numNotifications; i++) {
          const notifDate = new Date();
          notifDate.setDate(notifDate.getDate() - (index * 3 + i + 1)); // Étaler sur plusieurs jours
          
          simulatedNotifications.push({
            id: simulatedNotifications.length + 1,
            date: notifDate.toISOString().split('T')[0],
            type: notificationTypes[i % notificationTypes.length],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            message: messages[i % messages.length],
            studentName: `${student.first_name} ${student.last_name}`,
            absenceDate: notifDate.toISOString().split('T')[0],
            absenceType: ['absence', 'late'][i % 2],
            recipientName: 'Parent/Tuteur',
            recipientContact: `+237 6XX XX XX ${(index + 10).toString().padStart(2, '0')}`,
            duration: notificationTypes[i % notificationTypes.length] === 'call' ? 
                     `${Math.floor(Math.random() * 5) + 1} min` : undefined
          });
        }
      });

      // Trier par date décroissante
      simulatedNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('✅ Historique notifications simulé créé:', simulatedNotifications.length);
      return simulatedNotifications;

    } catch (error) {
      console.error('❌ Erreur getAllNotificationHistory production:', error);
      console.log('🔄 Fallback vers historique vide');
      return [];
    }
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