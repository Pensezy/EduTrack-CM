// Service de gestion du planning et des événements scolaires

import { supabase } from '../lib/supabase';
import { getCurrentSchoolId } from './cardService';

// Fonction pour détecter le mode de fonctionnement
const isProductionMode = () => {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (userData.demoAccount === true) {
    return false;
  }
  
  const edutrackUser = localStorage.getItem('edutrack-user');
  const hasValidSession = edutrackUser && edutrackUser !== 'null';
  
  return hasValidSession;
};

class PlanningService {
  constructor() {
    this.events = this.loadMockEvents();
    this.nextId = Math.max(...this.events.map(e => e.id)) + 1;
  }

  loadMockEvents() {
    return [
      {
        id: 1,
        title: "Rendez-vous - M. et Mme Dubois",
        type: "parent_meeting",
        date: "2025-10-15",
        startTime: "14:30",
        endTime: "15:00", 
        duration: 30,
        status: "confirmed",
        description: "Entretien concernant Marie Dubois - Résultats scolaires du 1er trimestre",
        attendees: ["Jean Dubois", "Marie Dubois (parent)", "Mme Lambert (enseignante)"],
        location: "Bureau secrétariat",
        priority: "medium",
        studentId: "STU001",
        studentName: "Marie Dubois",
        studentClass: "CM2",
        createdBy: "secretary",
        reminders: [
          { type: "email", time: "1 day before", sent: false },
          { type: "sms", time: "2 hours before", sent: false }
        ],
        notes: "Prévoir les bulletins et les copies d'évaluation",
        parentPhone: "06.12.34.56.78",
        parentEmail: "dubois.marie@email.com"
      },
      {
        id: 2,
        title: "Réunion équipe pédagogique",
        type: "meeting",
        date: "2025-10-16",
        startTime: "16:00",
        endTime: "17:30",
        duration: 90,
        status: "scheduled",
        description: "Préparation conseil de classe du 1er trimestre - Analyse des résultats",
        attendees: ["Direction", "Mme Lambert (CM2)", "M. Durand (CM1)", "Mme Martin (CE2)", "Mlle Dupont (CE1)"],
        location: "Salle des professeurs",
        priority: "high",
        createdBy: "principal",
        reminders: [
          { type: "email", time: "1 day before", sent: true }
        ],
        documents: ["Grilles d'évaluation", "Statistiques trimestrielles"],
        recurring: { type: "monthly", interval: 1 }
      },
      {
        id: 3,
        title: "Sortie pédagogique - CM2",
        type: "school_event",
        date: "2025-10-18",
        startTime: "09:00",
        endTime: "16:30",
        duration: 450,
        status: "confirmed",
        description: "Visite du musée d'histoire naturelle - Découverte des dinosaures",
        attendees: ["Classe CM2 (24 élèves)", "Mme Lambert", "2 accompagnateurs parents"],
        location: "Musée d'Histoire Naturelle - Paris",
        priority: "medium",
        studentClass: "CM2",
        createdBy: "teacher",
        cost: 15,
        transport: "Bus scolaire",
        authorizations: { required: 24, collected: 22 },
        emergency_contact: "Mme Lambert - 06.78.90.12.34"
      },
      {
        id: 4,
        title: "Inscription - Nouvelle élève",
        type: "inscription",
        date: "2025-10-17",
        startTime: "15:00",
        endTime: "15:45",
        duration: 45,
        status: "pending",
        description: "Inscription nouvelle élève Sophie Martin pour rentrée janvier 2026",
        attendees: ["Sophie Martin (parent)", "Direction", "Secrétariat"],
        location: "Bureau direction",
        priority: "medium",
        studentName: "Emma Martin",
        studentBirthDate: "2016-03-15",
        requestedClass: "CE2",
        previousSchool: "École Sainte-Marie",
        documents_required: ["Livret scolaire", "Certificat radiation", "Carnet santé"],
        parentPhone: "06.98.76.54.32",
        parentEmail: "martin.sophie@email.com"
      },
      {
        id: 5,
        title: "Conseil d'école",
        type: "official_meeting",
        date: "2025-10-22",
        startTime: "18:00",
        endTime: "20:00",
        duration: 120,
        status: "scheduled",
        description: "Conseil d'école du 1er trimestre - Bilan et projets",
        attendees: [
          "Direction", 
          "Équipe pédagogique (4 enseignants)", 
          "Parents élus (6 membres)",
          "Représentant mairie",
          "DDEN"
        ],
        location: "Salle polyvalente",
        priority: "high",
        createdBy: "principal",
        agenda: [
          "Bilan pédagogique 1er trimestre",
          "Projets sorties 2ème trimestre", 
          "Budget cantine",
          "Travaux à prévoir"
        ],
        documents: ["Bilan financier", "Rapport pédagogique", "Projets 2026"]
      },
      {
        id: 6,
        title: "Formation premiers secours",
        type: "training",
        date: "2025-10-14",
        startTime: "13:30",
        endTime: "16:30",
        duration: 180,
        status: "confirmed",
        description: "Formation obligatoire aux gestes de premiers secours pour l'équipe",
        attendees: ["Équipe pédagogique", "Personnel administratif", "Personnel cantine"],
        location: "Salle de motricité",
        priority: "high",
        trainer: "Croix-Rouge locale",
        certification: true,
        mandatory: true
      },
      {
        id: 7,
        title: "Vacances de la Toussaint",
        type: "holiday",
        date: "2025-10-20",
        startTime: "16:30",
        endTime: "17:00",
        duration: null,
        status: "scheduled",
        description: "Vacances scolaires de la Toussaint - Fermeture établissement",
        attendees: ["Toute l'école"],
        location: "École fermée",
        priority: "info",
        startDate: "2025-10-20",
        endDate: "2025-11-03",
        schoolClosed: true
      },
      {
        id: 8,
        title: "Entretien - Personnel cantine",
        type: "interview",
        date: "2025-10-16",
        startTime: "10:30",
        endTime: "11:15",
        duration: 45,
        status: "scheduled",
        description: "Entretien embauche pour poste aide-cuisinier temps partiel",
        attendees: ["Candidate", "Direction", "Secrétariat", "Responsable cantine"],
        location: "Bureau direction",
        priority: "medium",
        candidateName: "Mme Lefebvre",
        position: "Aide-cuisinier",
        experience: "2 ans en restauration collective",
        availability: "Temps partiel - 4h/jour"
      }
    ];
  }

  // Obtenir tous les événements avec filtres
  async getAllEvents(filters = {}, mode = 'auto') {
    console.log('🔄 getAllEvents Planning appelé avec mode:', mode);
    
    // Déterminer le mode
    const useProduction = mode === 'production' || (mode === 'auto' && isProductionMode());
    
    if (!useProduction) {
      console.log('🎭 Mode DÉMO - Planning fictif');
      return this.getAllEventsDemoMode(filters);
    }

    // Mode production : générer un planning basé sur les vraies données
    try {
      console.log('✅ Mode PRODUCTION - Planning Supabase');
      const schoolId = await getCurrentSchoolId();
      
      if (!schoolId) {
        console.warn('❌ Pas d\'ID école - planning vide');
        return {
          events: [],
          statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
        };
      }

      console.log('🏫 École ID trouvée:', schoolId);

      // Récupérer les étudiants réels pour simuler des événements
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

      console.log('📋 Étudiants trouvés pour planning:', studentsData?.length || 0);

      if (!studentsData || studentsData.length === 0) {
        console.log('📭 Aucun étudiant trouvé - planning vide');
        return {
          events: [],
          statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
        };
      }

      // Générer des événements basés sur les vrais étudiants
      const simulatedEvents = [];
      studentsData.forEach((student, index) => {
        const eventTypes = ['parent_meeting', 'meeting', 'school_event', 'inscription'];
        const statuses = ['confirmed', 'scheduled', 'pending'];
        
        // Créer 1-2 événements par étudiant
        const numEvents = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numEvents; i++) {
          const eventDate = new Date();
          eventDate.setDate(eventDate.getDate() + (index * 2 + i + 1)); // Étaler sur plusieurs jours futurs
          
          const eventType = eventTypes[i % eventTypes.length];
          const startHour = 8 + (index + i) % 8; // Entre 8h et 16h
          
          simulatedEvents.push({
            id: simulatedEvents.length + 1,
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
            notes: 'Données réelles depuis table students (simulation)',
            parentPhone: `+237 6XX XX XX ${(index + 10).toString().padStart(2, '0')}`,
            parentEmail: `${student.first_name.toLowerCase()}.parent@email.com`
          });
        }
      });

      // Appliquer les filtres
      let filteredEvents = this.applyFilters(simulatedEvents, filters);

      // Calculer les statistiques
      const statistics = this.calculateStatistics(filteredEvents);

      console.log('✅ Planning simulé créé:', filteredEvents.length);
      return {
        events: filteredEvents,
        statistics
      };

    } catch (error) {
      console.error('❌ Erreur getAllEvents planning production:', error);
      console.log('🔄 Retour planning vide suite à erreur');
      return {
        events: [],
        statistics: { total: 0, upcoming: 0, today: 0, confirmed: 0, pending: 0, cancelled: 0 }
      };
    }
  }

  // Mode démo (fonction séparée pour clarté)
  async getAllEventsDemoMode(filters = {}) {
    await this.delay(300);
    
    let filteredEvents = this.applyFilters([...this.events], filters);
    const statistics = this.calculateStatistics(filteredEvents);

    return {
      events: filteredEvents,
      statistics
    };
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