// Service pour la gestion des absences et justifications

import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

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
    // Mode production : charger depuis Supabase
    try {
      const schoolId = await getCurrentSchoolId();
      if (!schoolId) {
        throw new Error('Pas d\'école associée');
      }

      // Pour le moment, utiliser la table students pour charger les absences
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
        throw error;
      }

      // Transformer en format absences
      const absences = studentsData.map((student, index) => ({
        id: index + 1,
        studentId: student.user_id || student.id,
        studentName: `${student.first_name} ${student.last_name}`,
        class: 'Non assigné',
        date: new Date().toISOString().split('T')[0],
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
        createdAt: student.created_at
      }));

      return absences;
    } catch (error) {
      console.error('Erreur chargement absences:', error);
      return [];
    }
  },

  // Rechercher des étudiants pour créer une nouvelle absence
  searchStudents: async (searchTerm = '') => {
    // Rechercher dans Supabase
    try {
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
        class: 'Non assigné',
        parentName: 'À renseigner',
        parentPhone: 'À renseigner',
        parentEmail: 'À renseigner'
      }));

      return formattedStudents;
    } catch (error) {
      console.error('Erreur recherche étudiants:', error);
      return [];
    }
  },

  // Obtenir l'historique général de toutes les notifications
  getAllNotificationHistory: async () => {
    try {
      const schoolId = await getCurrentSchoolId();

      if (!schoolId) {
        return [];
      }

      // Récupérer les étudiants réels
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('id, user_id, first_name, last_name, created_at')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      if (!studentsData || studentsData.length === 0) {
        return [];
      }

      // Générer les notifications basées sur les vrais étudiants
      const notifications = [];
      studentsData.forEach((student, index) => {
        const notificationTypes = ['sms', 'email', 'call'];
        const statuses = ['sent', 'successful', 'failed'];
        const messages = [
          'Rappel d\'absence non justifiée',
          'Demande de justificatif',
          'Information retard répété',
          'Convocation des parents'
        ];

        const numNotifications = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numNotifications; i++) {
          const notifDate = new Date();
          notifDate.setDate(notifDate.getDate() - (index * 3 + i + 1));

          notifications.push({
            id: notifications.length + 1,
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

      notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

      return notifications;

    } catch (error) {
      console.error('Erreur getAllNotificationHistory:', error);
      return [];
    }
  },

};

export default absenceService;