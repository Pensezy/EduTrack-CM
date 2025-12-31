// Service de gestion du planning et des événements scolaires

import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

class PlanningService {
  constructor() {
    this.events = [];
    this.nextId = 1;
  }

  // Obtenir tous les événements avec filtres
  async getAllEvents(filters = {}) {
    try {
      const schoolId = await getCurrentSchoolId();

      if (!schoolId) {
        return {
          events: [],
          statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
        };
      }

      // Récupérer les étudiants réels pour générer des événements
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
        return {
          events: [],
          statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
        };
      }

      // Générer des événements basés sur les vrais étudiants
      const events = [];
      studentsData.forEach((student, index) => {
        const eventTypes = ['parent_meeting', 'meeting', 'school_event', 'inscription'];
        const statuses = ['confirmed', 'scheduled', 'pending'];

        const numEvents = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numEvents; i++) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (index * 2 + i + 1));

          const eventType = eventTypes[i % eventTypes.length];
          const startHour = 8 + (index + i) % 8;

          events.push({
            id: events.length + 1,
            title: this.generateEventTitle(eventType, student),
            type: eventType,
            date: eventDate.toISOString().split('T')[0],
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + 1).toString().padStart(2, '0')}:00`,
            duration: 60,
            status: statuses[i % statuses.length],
            description: this.generateEventDescription(eventType, student),
            attendees: this.generateAttendees(eventType, student),
            location: 'Bureau secrétariat',
            priority: ['high', 'medium', 'low'][i % 3],
            studentId: student.user_id || student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            studentClass: 'Non assigné',
            createdBy: 'secretary',
            reminders: [
              { type: 'email', time: '1 day before', sent: false }
            ],
            parentPhone: `+237 6XX XX XX ${(index + 10).toString().padStart(2, '0')}`,
            parentEmail: `${student.first_name.toLowerCase()}.parent@email.com`
          });
        }
      });

      // Appliquer les filtres
      let filteredEvents = this.applyFilters(events, filters);

      // Calculer les statistiques
      const statistics = this.calculateStatistics(filteredEvents);

      return {
        events: filteredEvents,
        statistics
      };

    } catch (error) {
      console.error('Erreur getAllEvents:', error);
      return {
        events: [],
        statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
      };
    }
  }

  // Appliquer les filtres aux événements
  applyFilters(events, filters) {
    let filteredEvents = [...events];

    // Filtrer par type
    if (filters.type && filters.type !== '') {
      filteredEvents = filteredEvents.filter(event => event.type === filters.type);
    }

    // Filtrer par statut
    if (filters.status && filters.status !== '') {
      filteredEvents = filteredEvents.filter(event => event.status === filters.status);
    }

    // Filtrer par date
    if (filters.startDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredEvents = filteredEvents.filter(event => 
        new Date(event.date) <= new Date(filters.endDate)
      );
    }

    // Filtrer par classe
    if (filters.studentClass) {
      filteredEvents = filteredEvents.filter(event => 
        event.studentClass === filters.studentClass
      );
    }

    // Recherche par texte
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        (event.studentName && event.studentName.toLowerCase().includes(searchLower))
      );
    }

    // Trier par date et heure
    filteredEvents.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA - dateB;
    });

    return filteredEvents;
  }

  // Fonctions utilitaires pour la génération d'événements
  generateEventTitle(eventType, student) {
    const titles = {
      parent_meeting: `Rendez-vous - Parents de ${student.first_name} ${student.last_name}`,
      meeting: `Réunion pédagogique - ${student.first_name}`,
      school_event: `Événement scolaire - Classe de ${student.first_name}`,
      inscription: `Inscription - ${student.first_name} ${student.last_name}`
    };
    return titles[eventType] || `Événement - ${student.first_name} ${student.last_name}`;
  }

  generateEventDescription(eventType, student) {
    const descriptions = {
      parent_meeting: `Entretien concernant ${student.first_name} ${student.last_name} - Suivi scolaire`,
      meeting: `Réunion d'équipe pédagogique concernant la classe`,
      school_event: `Événement organisé pour la classe`,
      inscription: `Finalisation inscription de ${student.first_name} ${student.last_name}`
    };
    return descriptions[eventType] || `Événement concernant ${student.first_name} ${student.last_name}`;
  }

  generateAttendees(eventType, student) {
    const attendees = {
      parent_meeting: [`Parents de ${student.first_name}`, 'Enseignant', 'Secrétaire'],
      meeting: ['Direction', 'Équipe pédagogique', 'Secrétaire'],
      school_event: ['Élèves', 'Parents', 'Enseignants'],
      inscription: [`Parents de ${student.first_name}`, 'Secrétaire', 'Direction']
    };
    return attendees[eventType] || ['Participants'];
  }

  calculateStatistics(events) {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: events.length,
      upcoming: events.filter(e => new Date(e.date) >= new Date(today)).length,
      today: events.filter(e => e.date === today).length,
      confirmed: events.filter(e => e.status === 'confirmed').length,
      pending: events.filter(e => e.status === 'pending').length,
      cancelled: events.filter(e => e.status === 'cancelled').length
    };
  }

  // Créer un nouvel événement
  async createEvent(eventData) {
    await this.delay(500);

    const newEvent = {
      id: this.nextId++,
      ...eventData,
      status: eventData.status || 'scheduled',
      createdBy: 'secretary',
      createdAt: new Date().toISOString(),
      reminders: eventData.reminders || []
    };

    this.events.push(newEvent);
    return { success: true, event: newEvent };
  }

  // Modifier un événement
  async updateEvent(eventId, updates) {
    await this.delay(400);

    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Événement non trouvé');
    }

    this.events[eventIndex] = {
      ...this.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return { success: true, event: this.events[eventIndex] };
  }

  // Supprimer un événement
  async deleteEvent(eventId) {
    await this.delay(300);

    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      throw new Error('Événement non trouvé');
    }

    const deletedEvent = this.events.splice(eventIndex, 1)[0];
    return { success: true, event: deletedEvent };
  }

  // Confirmer un événement
  async confirmEvent(eventId) {
    return this.updateEvent(eventId, { status: 'confirmed' });
  }

  // Annuler un événement
  async cancelEvent(eventId, reason = '') {
    return this.updateEvent(eventId, { 
      status: 'cancelled', 
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    });
  }

  // Obtenir événements par date
  async getEventsByDate(date) {
    await this.delay(200);
    return this.events.filter(event => event.date === date);
  }

  // Obtenir événements de la semaine
  async getWeekEvents(startDate) {
    await this.delay(300);
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
  }

  // Vérifier disponibilités
  async checkAvailability(date, startTime, endTime, excludeEventId = null) {
    await this.delay(200);
    
    const conflicts = this.events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      if (event.date !== date) return false;
      if (event.status === 'cancelled') return false;

      const eventStart = this.timeToMinutes(event.startTime);
      const eventEnd = this.timeToMinutes(event.endTime);
      const checkStart = this.timeToMinutes(startTime);
      const checkEnd = this.timeToMinutes(endTime);

      // Vérifier le chevauchement
      return (checkStart < eventEnd && checkEnd > eventStart);
    });

    return {
      available: conflicts.length === 0,
      conflicts: conflicts
    };
  }

  // Envoyer rappels
  async sendReminders(eventId) {
    await this.delay(400);
    
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      throw new Error('Événement non trouvé');
    }

    // Simuler l'envoi des rappels
    const sentReminders = [];
    
    if (event.parentEmail) {
      sentReminders.push({
        type: 'email',
        recipient: event.parentEmail,
        sentAt: new Date().toISOString()
      });
    }

    if (event.parentPhone) {
      sentReminders.push({
        type: 'sms',
        recipient: event.parentPhone,
        sentAt: new Date().toISOString()
      });
    }

    // Mettre à jour l'événement
    event.reminders.forEach(reminder => {
      reminder.sent = true;
      reminder.sentAt = new Date().toISOString();
    });

    return { success: true, sentReminders };
  }

  // Calculer statistiques
  calculateStatistics(events) {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() + 7);
    const thisWeekStr = thisWeek.toISOString().split('T')[0];

    return {
      total: events.length,
      today: events.filter(e => e.date === today).length,
      thisWeek: events.filter(e => e.date >= today && e.date <= thisWeekStr).length,
      byStatus: {
        confirmed: events.filter(e => e.status === 'confirmed').length,
        scheduled: events.filter(e => e.status === 'scheduled').length,
        pending: events.filter(e => e.status === 'pending').length,
        cancelled: events.filter(e => e.status === 'cancelled').length
      },
      byType: {
        parent_meeting: events.filter(e => e.type === 'parent_meeting').length,
        meeting: events.filter(e => e.type === 'meeting').length,
        school_event: events.filter(e => e.type === 'school_event').length,
        training: events.filter(e => e.type === 'training').length,
        official_meeting: events.filter(e => e.type === 'official_meeting').length,
        inscription: events.filter(e => e.type === 'inscription').length,
        interview: events.filter(e => e.type === 'interview').length,
        holiday: events.filter(e => e.type === 'holiday').length
      },
      pendingConfirmations: events.filter(e => e.status === 'pending').length,
      upcomingThisWeek: events.filter(e => 
        e.date >= today && 
        e.date <= thisWeekStr && 
        e.status !== 'cancelled'
      ).length
    };
  }

  // Utilitaires
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Exporter planning
  async exportPlanning(format = 'csv', filters = {}) {
    const { events } = await this.getAllEvents(filters);
    
    if (format === 'csv') {
      const headers = [
        'Date', 'Heure', 'Titre', 'Type', 'Statut', 'Lieu', 
        'Participants', 'Description', 'Priorité', 'Durée (min)'
      ];
      
      const rows = events.map(event => [
        event.date,
        event.startTime,
        event.title,
        this.getTypeLabel(event.type),
        this.getStatusLabel(event.status),
        event.location,
        event.attendees.join('; '),
        event.description,
        event.priority,
        event.duration
      ]);

      return [headers, ...rows];
    }
    
    return events;
  }

  getTypeLabel(type) {
    const labels = {
      parent_meeting: 'Rendez-vous parents',
      meeting: 'Réunion',
      school_event: 'Événement scolaire',
      training: 'Formation',
      official_meeting: 'Conseil officiel',
      inscription: 'Inscription',
      interview: 'Entretien',
      holiday: 'Vacances'
    };
    return labels[type] || type;
  }

  getStatusLabel(status) {
    const labels = {
      confirmed: 'Confirmé',
      scheduled: 'Programmé',  
      pending: 'En attente',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }
}

const planningService = new PlanningService();
export default planningService;