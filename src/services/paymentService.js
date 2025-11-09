// Service de démonstration pour la gestion des paiements scolaires
// En production, ces données viendraient d'une base de données

import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

// Fonction pour détecter le mode de fonctionnement
const isProductionMode = () => {
  console.log('🔍 Vérification mode paiements...');
  
  // 1. Vérifier si c'est un compte démo dans localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (userData.demoAccount === true) {
    console.log('🎭 Compte démo détecté - mode démo');
    return false;
  }
  
  // 2. Vérifier s'il y a un utilisateur connecté via localStorage ou session
  const edutrackUser = localStorage.getItem('edutrack-user');
  const hasValidSession = edutrackUser && edutrackUser !== 'null';
  
  if (!hasValidSession) {
    console.log('❌ Pas de session utilisateur - mode démo');
    return false;
  }
  
  // 3. Si utilisateur réel connecté
  console.log('✅ Utilisateur réel connecté - mode production');
  return true;
};

// Données d'exemple pour les étudiants
const studentsData = [
  {
    id: "STU001",
    name: "Marie Dubois",
    class: "CM2",
    parentName: "Jean Dubois",
    parentPhone: "+237 6 12 34 56 78",
    parentEmail: "jean.dubois@email.com"
  },
  {
    id: "STU002",
    name: "Pierre Martin",
    class: "CM1", 
    parentName: "Sophie Martin",
    parentPhone: "+237 6 23 45 67 89",
    parentEmail: "sophie.martin@email.com"
  },
  {
    id: "STU003",
    name: "Camille Rousseau",
    class: "CE2",
    parentName: "Marc Rousseau", 
    parentPhone: "+237 6 34 56 78 90",
    parentEmail: "marc.rousseau@email.com"
  },
  {
    id: "STU004",
    name: "Lucas Bernard",
    class: "CM2",
    parentName: "Anne Bernard",
    parentPhone: "+237 6 45 67 89 01",
    parentEmail: "anne.bernard@email.com"
  },
  {
    id: "STU005",
    name: "Emma Leroy",
    class: "CE1",
    parentName: "David Leroy",
    parentPhone: "+237 6 56 78 90 12",
    parentEmail: "david.leroy@email.com"
  }
];

// Types de frais scolaires
const feeTypes = [
  { id: 'tuition', name: 'Frais de scolarité', amount: 25000, recurring: true },
  { id: 'registration', name: 'Frais d\'inscription', amount: 15000, recurring: false },
  { id: 'uniform', name: 'Uniforme scolaire', amount: 12000, recurring: false },
  { id: 'books', name: 'Manuels scolaires', amount: 8000, recurring: false },
  { id: 'transport', name: 'Transport scolaire', amount: 10000, recurring: true },
  { id: 'meal', name: 'Cantine', amount: 15000, recurring: true },
  { id: 'trip', name: 'Sortie scolaire', amount: 5000, recurring: false },
  { id: 'exam', name: 'Frais d\'examen', amount: 3000, recurring: false }
];

// Données d'exemple pour les paiements
let paymentsData = [
  {
    id: 1,
    student: {
      studentId: "STU001",
      firstName: "Marie",
      lastName: "Dubois",
      class: "CM2",
      parentName: "Jean Dubois",
      parentPhone: "+237 6 12 34 56 78",
      parentEmail: "jean.dubois@email.com"
    },
    feeType: "Frais de scolarité",
    period: "Novembre 2024",
    description: "Frais de scolarité mensuelle",
    totalAmount: 25000,
    amountPaid: 25000,
    remainingBalance: 0,
    status: "completed",
    dueDate: "2024-11-15",
    paymentDate: "2024-11-12",
    paymentMethod: "Mobile Money",
    receiptId: "REC001",
    paymentHistory: [
      {
        date: "2024-11-12",
        amount: 25000,
        method: "Mobile Money",
        reference: "MM123456",
        receivedBy: "Secrétaire"
      }
    ]
  },
  {
    id: 2,
    student: {
      studentId: "STU002",
      firstName: "Pierre",
      lastName: "Martin",
      class: "CM1",
      parentName: "Sophie Martin",
      parentPhone: "+237 6 23 45 67 89",
      parentEmail: "sophie.martin@email.com"
    },
    feeType: "Frais de scolarité",
    period: "Novembre 2024",
    description: "Frais de scolarité mensuelle",
    totalAmount: 25000,
    amountPaid: 0,
    remainingBalance: 25000,
    status: "pending",
    dueDate: "2024-11-15",
    paymentDate: null,
    paymentMethod: null,
    receiptId: null,
    paymentHistory: []
  },
  {
    id: 3,
    student: {
      studentId: "STU003",
      firstName: "Camille",
      lastName: "Rousseau",
      class: "CE2",
      parentName: "Marc Rousseau",
      parentPhone: "+237 6 34 56 78 90",
      parentEmail: "marc.rousseau@email.com"
    },
    feeType: "Frais de scolarité",
    period: "Octobre 2024",
    description: "Frais de scolarité mensuelle",
    totalAmount: 22000,
    amountPaid: 0,
    remainingBalance: 22000,
    status: "overdue",
    dueDate: "2024-10-15",
    paymentDate: null,
    paymentMethod: null,
    receiptId: null,
    paymentHistory: []
  },
  {
    id: 4,
    student: {
      studentId: "STU004",
      firstName: "Lucas",
      lastName: "Bernard",
      class: "CM2",
      parentName: "Anne Bernard",
      parentPhone: "+237 6 45 67 89 01",
      parentEmail: "anne.bernard@email.com"
    },
    feeType: "Frais mixtes",
    period: "Novembre 2024",
    description: "Frais de scolarité + sortie scolaire",
    totalAmount: 35000,
    amountPaid: 15000,
    remainingBalance: 20000,
    status: "partial",
    dueDate: "2024-11-15",
    paymentDate: "2024-11-10",
    paymentMethod: "Espèces",
    receiptId: "REC002",
    paymentHistory: [
      {
        date: "2024-11-10",
        amount: 15000,
        method: "Espèces",
        reference: "ESP001",
        receivedBy: "Secrétaire"
      }
    ]
  },
  {
    id: 5,
    student: {
      studentId: "STU005",
      firstName: "Emma",
      lastName: "Leroy",
      class: "CE1",
      parentName: "David Leroy",
      parentPhone: "+237 6 56 78 90 12",
      parentEmail: "david.leroy@email.com"
    },
    feeType: "Frais de scolarité",
    period: "Novembre 2024",
    description: "Frais de scolarité mensuelle",
    totalAmount: 20000,
    amountPaid: 20000,
    remainingBalance: 0,
    status: "completed",
    dueDate: "2024-11-15",
    paymentDate: "2024-11-08",
    paymentMethod: "Virement bancaire",
    receiptId: "REC003",
    paymentHistory: [
      {
        date: "2024-11-08",
        amount: 20000,
        method: "Virement bancaire",
        reference: "VIR789",
        receivedBy: "Secrétaire"
      }
    ]
  }
];

// Générateur de numéro de reçu
const generateReceiptNumber = () => {
  const nextNumber = Math.max(...paymentsData.map(p => parseInt(p.receiptId?.replace('REC', '') || '0')), 0) + 1;
  return `REC${nextNumber.toString().padStart(3, '0')}`;
};

// Formatage des dates
const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (date) => {
  return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// Service principal
export const paymentService = {
  // Obtenir tous les paiements avec statistiques
  getAllPayments: async (mode = 'auto') => {
    console.log('🔄 getAllPayments appelé avec mode:', mode);
    console.log('📊 Détection automatique mode:', isProductionMode());
    
    // Déterminer le mode : utiliser le paramètre fourni ou détecter automatiquement
    let useProduction = false;
    
    if (mode === 'production') {
      useProduction = true;
      console.log('🔧 Mode forcé: production');
    } else if (mode === 'demo') {
      useProduction = false;
      console.log('🔧 Mode forcé: demo');
    } else {
      useProduction = isProductionMode();
      console.log('🔧 Mode auto-détecté:', useProduction ? 'production' : 'demo');
    }
    
    if (!useProduction) {
      console.log('🎭 Mode DÉMO - Paiements fictifs');
      return new Promise((resolve) => {
        setTimeout(() => {
          const payments = [...paymentsData];
          
          // Calculer les statistiques
          const statistics = payments.reduce((acc, payment) => {
            acc.total += payment.totalAmount || 0;
            acc.collected += payment.amountPaid || 0;
            
            if (payment.status === 'overdue') {
              acc.overdue += payment.totalAmount - (payment.amountPaid || 0);
            }
            
            return acc;
          }, {
            total: 0,
            collected: 0,
            overdue: 0
          });
          
          statistics.outstanding = statistics.total - statistics.collected;
          
          console.log('📊 Statistiques démo:', statistics);
          resolve({
            payments,
            statistics
          });
        }, 300);
      });
    }

    // Mode production : utiliser Supabase
    try {
      console.log('✅ Mode PRODUCTION - Chargement paiements Supabase');
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.error('❌ Aucune école associée - fallback démo');
        throw new Error('Pas d\'école associée');
      }

      console.log('🏫 École trouvée:', schoolId);

      // Debug: Vérifier d'abord tous les étudiants de la base
      console.log('🔍 Vérification complète de la table students...');
      const { data: allStudents, error: allError } = await supabase
        .from('students')
        .select('*')
        .limit(5);
        
      if (allError) {
        console.error('❌ Erreur lecture table students:', allError);
      } else {
        console.log('📊 Total étudiants dans la table:', allStudents?.length || 0);
        if (allStudents?.length > 0) {
          console.log('👤 Exemple étudiant:', allStudents[0]);
          console.log('🏫 Schools IDs présents:', [...new Set(allStudents.map(s => s.school_id))]);
        }
      }

      // Charger les étudiants réels depuis Supabase
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          school_id,
          is_active,
          created_at
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('❌ Erreur requête students:', error);
        throw error;
      }

      console.log('📋 Étudiants trouvés pour simulation paiements:', studentsData?.length || 0);

      if (!studentsData || studentsData.length === 0) {
        console.log('📭 Aucun étudiant trouvé - affichage liste vide');
        // Retourner une structure vide au lieu de données démo
        return {
          payments: [],
          statistics: {
            total: 0,
            collected: 0,
            overdue: 0,
            outstanding: 0
          }
        };
      }

      // Simuler des paiements depuis les vrais étudiants
      const simulatedPayments = studentsData.map((student, index) => {
        const baseAmount = 20000 + (index % 3) * 5000; // Montants variés
        const statuses = ['completed', 'pending', 'overdue', 'partial'];
        const status = statuses[index % statuses.length];
        const amountPaid = status === 'completed' ? baseAmount : 
                          status === 'partial' ? Math.floor(baseAmount * 0.6) : 0;

        return {
          id: index + 1,
          student: {
            studentId: student.user_id || student.id,
            firstName: student.first_name,
            lastName: student.last_name,
            class: 'Non assigné', // Table students n'a pas de classe pour le moment
            parentName: 'À renseigner',
            parentPhone: 'À renseigner', 
            parentEmail: 'À renseigner'
          },
          feeType: ['Frais de scolarité', 'Transport', 'Cantine', 'Uniforme'][index % 4],
          period: 'Novembre 2024',
          description: 'Paiement mensuel',
          totalAmount: baseAmount,
          amountPaid: amountPaid,
          remainingBalance: baseAmount - amountPaid,
          status: status,
          dueDate: '2024-11-15',
          paymentDate: status === 'completed' || status === 'partial' ? '2024-11-10' : null,
          paymentMethod: status === 'completed' || status === 'partial' ? 
                        ['Mobile Money', 'Espèces', 'Virement'][index % 3] : null,
          receiptId: status === 'completed' || status === 'partial' ? `REC${(index + 1).toString().padStart(3, '0')}` : null,
          paymentHistory: status === 'completed' || status === 'partial' ? [{
            date: '2024-11-10',
            amount: amountPaid,
            method: ['Mobile Money', 'Espèces', 'Virement'][index % 3],
            reference: `REF${index + 1}`,
            receivedBy: 'Secrétaire'
          }] : [],
          notes: 'Données réelles depuis table students (simulation)',
          createdAt: student.created_at
        };
      });

      console.log('✅ Paiements simulés créés:', simulatedPayments.length);

      // Calculer les statistiques
      const statistics = simulatedPayments.reduce((acc, payment) => {
        acc.total += payment.totalAmount || 0;
        acc.collected += payment.amountPaid || 0;
        
        if (payment.status === 'overdue') {
          acc.overdue += payment.totalAmount - (payment.amountPaid || 0);
        }
        
        return acc;
      }, {
        total: 0,
        collected: 0,
        overdue: 0
      });
      
      statistics.outstanding = statistics.total - statistics.collected;

      return {
        payments: simulatedPayments,
        statistics
      };

    } catch (error) {
      console.error('❌ Erreur chargement paiements Supabase:', error);
      console.log('🔄 Affichage liste vide suite à erreur');
      // Retourner une structure vide au lieu de données démo
      return {
        payments: [],
        statistics: {
          total: 0,
          collected: 0,
          overdue: 0,
          outstanding: 0
        }
      };
    }
  },

  // Obtenir un paiement par ID
  getPaymentById: async (paymentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payment = paymentsData.find(p => p.id === paymentId);
        resolve(payment || null);
      }, 200);
    });
  },

  // Rechercher des étudiants pour créer un nouveau paiement
  searchStudents: async (searchTerm = '') => {
    console.log('🔍 searchStudents appelé avec:', searchTerm);
    
    if (!isProductionMode()) {
      console.log('🎭 Mode DÉMO - Recherche étudiants fictifs');
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
      console.log('✅ Mode PRODUCTION - Recherche étudiants Supabase');
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        console.warn('❌ ID école non trouvé pour recherche étudiants');
        return [];
      }

      console.log('🔍 Recherche étudiants pour école ID:', schoolId);
      
      let query = supabase
        .from('students')
        .select('id, user_id, first_name, last_name')
        .eq('school_id', schoolId)
        .eq('is_active', true);

      // Appliquer le filtre de recherche si fourni
      if (searchTerm && searchTerm.trim() !== '') {
        query = query.or(`first_name.ilike.%${searchTerm}%, last_name.ilike.%${searchTerm}%`);
      }

      const { data: students, error } = await query
        .order('first_name')
        .limit(50);

      if (error) {
        console.error('❌ Erreur recherche étudiants:', error);
        throw error;
      }

      console.log('✅ Étudiants trouvés:', students?.length || 0);

      return students?.map(student => ({
        id: student.user_id || student.id,
        name: `${student.first_name} ${student.last_name}`,
        class: 'Non assigné', // Classe pas disponible pour le moment
        parentName: 'À renseigner',
        parentPhone: 'À renseigner',
        parentEmail: 'À renseigner'
      })) || [];

    } catch (error) {
      console.error('❌ Erreur searchStudents production:', error);
      // Fallback vers données démo en cas d'erreur
      console.log('🔄 Fallback vers données démo');
      return studentsData.filter(student => {
        const matchesSearch = searchTerm === '' || 
          student.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
    }
  },

  // Obtenir les types de frais
  getFeeTypes: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...feeTypes]), 200);
    });
  },

  // Enregistrer un nouveau paiement
  recordPayment: async (paymentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.id === paymentData.studentId);
        if (!student) {
          reject(new Error('Étudiant non trouvé'));
          return;
        }

        const feeType = feeTypes.find(f => f.id === paymentData.feeType);
        if (!feeType) {
          reject(new Error('Type de frais non trouvé'));
          return;
        }

        // Vérifier s'il y a un paiement existant à mettre à jour (paiement partiel)
        const existingPaymentIndex = paymentsData.findIndex(p => 
          p.studentId === paymentData.studentId && 
          p.feeType === paymentData.feeType && 
          p.period === paymentData.period &&
          p.status !== 'paid'
        );

        const receiptNumber = generateReceiptNumber();
        const paymentRecord = {
          date: formatDate(new Date()),
          amount: paymentData.amount,
          method: paymentData.paymentMethod,
          reference: paymentData.reference || '',
          receivedBy: "Secrétaire"
        };

        if (existingPaymentIndex !== -1) {
          // Mettre à jour un paiement existant (paiement partiel)
          const existingPayment = paymentsData[existingPaymentIndex];
          const newPaidAmount = existingPayment.paidAmount + paymentData.amount;
          const newStatus = newPaidAmount >= existingPayment.amount ? 'paid' : 'partial';

          paymentsData[existingPaymentIndex] = {
            ...existingPayment,
            paidAmount: newPaidAmount,
            status: newStatus,
            paidDate: formatDate(new Date()),
            paymentMethod: paymentData.paymentMethod,
            receiptNumber: newStatus === 'paid' ? receiptNumber : existingPayment.receiptNumber,
            paymentHistory: [...existingPayment.paymentHistory, paymentRecord]
          };

          resolve(paymentsData[existingPaymentIndex]);
        } else {
          // Créer un nouveau paiement
          const newPayment = {
            id: Math.max(...paymentsData.map(p => p.id), 0) + 1,
            studentName: student.name,
            studentId: student.id,
            class: student.class,
            parentName: student.parentName,
            parentPhone: student.parentPhone,
            parentEmail: student.parentEmail,
            period: paymentData.period,
            feeType: paymentData.feeType,
            description: paymentData.description || feeType.name,
            amount: paymentData.totalAmount || feeType.amount,
            paidAmount: paymentData.amount,
            status: paymentData.amount >= (paymentData.totalAmount || feeType.amount) ? 'paid' : 'partial',
            dueDate: paymentData.dueDate,
            paidDate: formatDate(new Date()),
            paymentMethod: paymentData.paymentMethod,
            receiptNumber: receiptNumber,
            paymentHistory: [paymentRecord]
          };

          paymentsData.push(newPayment);
          resolve(newPayment);
        }
      }, 500);
    });
  },

  // Marquer un paiement comme payé (paiement complet)
  markAsPaid: async (paymentId, paymentDetails) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const paymentIndex = paymentsData.findIndex(p => p.id === paymentId);
        if (paymentIndex === -1) {
          reject(new Error('Paiement non trouvé'));
          return;
        }

        const payment = paymentsData[paymentIndex];
        if (payment.status === 'paid') {
          reject(new Error('Ce paiement est déjà marqué comme payé'));
          return;
        }

        const remainingAmount = payment.amount - payment.paidAmount;
        const paymentRecord = {
          date: formatDate(new Date()),
          amount: remainingAmount,
          method: paymentDetails.paymentMethod,
          reference: paymentDetails.reference || '',
          receivedBy: "Secrétaire"
        };

        paymentsData[paymentIndex] = {
          ...payment,
          paidAmount: payment.amount,
          status: 'paid',
          paidDate: formatDate(new Date()),
          paymentMethod: paymentDetails.paymentMethod,
          receiptNumber: payment.receiptNumber || generateReceiptNumber(),
          paymentHistory: [...payment.paymentHistory, paymentRecord]
        };

        resolve(paymentsData[paymentIndex]);
      }, 400);
    });
  },

  // Envoyer un rappel de paiement
  sendPaymentReminder: async (paymentId, reminderType = 'sms') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const payment = paymentsData.find(p => p.id === paymentId);
        if (!payment) {
          reject(new Error('Paiement non trouvé'));
          return;
        }

        if (payment.status === 'paid') {
          reject(new Error('Ce paiement est déjà effectué'));
          return;
        }

        const reminderData = {
          paymentId: paymentId,
          studentName: payment.studentName,
          parentName: payment.parentName,
          amount: payment.amount - payment.paidAmount,
          dueDate: payment.dueDate,
          reminderType: reminderType,
          sentDate: formatDateTime(new Date()),
          status: 'sent'
        };

        resolve(reminderData);
      }, 600);
    });
  },

  // Envoyer des rappels en lot
  bulkSendReminders: async (paymentIds, reminderType = 'sms') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        const errors = [];

        paymentIds.forEach(paymentId => {
          const payment = paymentsData.find(p => p.id === paymentId);
          if (!payment) {
            errors.push(`Paiement ${paymentId} non trouvé`);
            return;
          }

          if (payment.status === 'paid') {
            errors.push(`Paiement de ${payment.studentName} déjà effectué`);
            return;
          }

          results.push({
            paymentId: paymentId,
            studentName: payment.studentName,
            sent: true
          });
        });

        if (errors.length > 0) {
          reject(new Error(errors.join(', ')));
          return;
        }

        resolve(results);
      }, 800);
    });
  },

  // Obtenir l'historique des paiements d'un étudiant
  getStudentPaymentHistory: async (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentPayments = paymentsData.filter(p => p.studentId === studentId);
        resolve(studentPayments);
      }, 300);
    });
  },

  // Générer un reçu de paiement
  generateReceipt: async (paymentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const payment = paymentsData.find(p => p.id === paymentId);
        if (!payment) {
          reject(new Error('Paiement non trouvé'));
          return;
        }

        if (!payment.receiptNumber) {
          reject(new Error('Aucun reçu disponible pour ce paiement'));
          return;
        }

        const receiptData = {
          receiptNumber: payment.receiptNumber,
          date: payment.paidDate,
          studentName: payment.studentName,
          studentId: payment.studentId,
          class: payment.class,
          parentName: payment.parentName,
          description: payment.description,
          amount: payment.paidAmount,
          paymentMethod: payment.paymentMethod,
          schoolName: "EduTrack-CM",
          schoolAddress: "Yaoundé, Cameroun",
          paymentHistory: payment.paymentHistory
        };

        resolve(receiptData);
      }, 400);
    });
  },

  // Obtenir les statistiques de paiement
  getPaymentStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = paymentsData.reduce((acc, payment) => {
          acc.total += payment.amount;
          acc.collected += payment.paidAmount;
          acc[payment.status] = (acc[payment.status] || 0) + 1;
          
          // Calculer les retards
          const dueDate = new Date(payment.dueDate.split('/').reverse().join('-'));
          if (dueDate < new Date() && payment.status !== 'paid') {
            acc.overdue = (acc.overdue || 0) + 1;
          }
          
          return acc;
        }, { 
          total: 0, 
          collected: 0, 
          paid: 0, 
          pending: 0, 
          overdue: 0, 
          partial: 0 
        });

        stats.outstanding = stats.total - stats.collected;
        stats.collectionRate = stats.total > 0 ? (stats.collected / stats.total * 100).toFixed(1) : 0;
        
        resolve(stats);
      }, 200);
    });
  },

  // Créer une nouvelle facture/échéance
  createInvoice: async (invoiceData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.id === invoiceData.studentId);
        if (!student) {
          reject(new Error('Étudiant non trouvé'));
          return;
        }

        const feeType = feeTypes.find(f => f.id === invoiceData.feeType);
        if (!feeType) {
          reject(new Error('Type de frais non trouvé'));
          return;
        }

        const newInvoice = {
          id: Math.max(...paymentsData.map(p => p.id), 0) + 1,
          studentName: student.name,
          studentId: student.id,
          class: student.class,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          period: invoiceData.period,
          feeType: invoiceData.feeType,
          description: invoiceData.description || feeType.name,
          amount: invoiceData.amount || feeType.amount,
          paidAmount: 0,
          status: 'pending',
          dueDate: invoiceData.dueDate,
          paidDate: null,
          paymentMethod: null,
          receiptNumber: null,
          paymentHistory: []
        };

        paymentsData.push(newInvoice);
        resolve(newInvoice);
      }, 400);
    });
  },

  // Envoyer des rappels en lot
  sendBulkReminders: async (paymentIds, reminderType = 'sms') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const paymentId of paymentIds) {
          const payment = paymentsData.find(p => p.id === paymentId);
          
          if (!payment) {
            results.push({
              paymentId,
              status: 'error',
              message: 'Paiement non trouvé'
            });
            errorCount++;
            continue;
          }

          if (payment.status === 'completed') {
            results.push({
              paymentId,
              status: 'skipped',
              message: 'Paiement déjà effectué'
            });
            continue;
          }

          // Simuler l'envoi du rappel
          const reminderData = {
            paymentId: paymentId,
            studentName: payment.student?.firstName + ' ' + payment.student?.lastName || 'Élève inconnu',
            parentName: payment.student?.parentName || 'Parent inconnu',
            parentPhone: payment.student?.parentPhone || '',
            amount: payment.totalAmount - (payment.amountPaid || 0),
            dueDate: payment.dueDate,
            reminderType: reminderType,
            sentDate: formatDateTime(new Date()),
            status: 'sent'
          };

          results.push({
            paymentId,
            status: 'success',
            message: 'Rappel envoyé avec succès',
            data: reminderData
          });
          successCount++;
        }

        resolve({
          totalProcessed: paymentIds.length,
          successCount,
          errorCount,
          results
        });
      }, 800);
    });
  }
};

export default paymentService;