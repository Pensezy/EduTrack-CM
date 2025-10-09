import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PlanningTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [viewMode, setViewMode] = useState('week');
  const [filterType, setFilterType] = useState('');

  const eventTypes = [
    { value: '', label: 'Tous les événements' },
    { value: 'meeting', label: 'Rendez-vous parents' },
    { value: 'event', label: 'Événements scolaires' },
    { value: 'admin', label: 'Tâches administratives' },
    { value: 'holiday', label: 'Vacances scolaires' }
  ];

  const viewModes = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' }
  ];

  const events = [
    {
      id: 1,
      title: "Rendez-vous - M. et Mme Dubois",
      type: "meeting",
      date: "2024-11-18",
      time: "14:30",
      duration: "30 min",
      status: "confirmed",
      description: "Entretien concernant Marie Dubois - Résultats scolaires",
      attendees: ["Jean Dubois", "Marie Dubois (parent)"],
      location: "Bureau secrétariat",
      priority: "medium"
    },
    {
      id: 2,
      title: "Réunion équipe pédagogique",
      type: "admin",
      date: "2024-11-19",
      time: "16:00",
      duration: "1h 30min",
      status: "scheduled",
      description: "Préparation conseil de classe du 1er trimestre",
      attendees: ["Équipe enseignante", "Direction"],
      location: "Salle des professeurs",
      priority: "high"
    },
    {
      id: 3,
      title: "Sortie pédagogique - CM2",
      type: "event",
      date: "2024-11-20",
      time: "09:00",
      duration: "Journée",
      status: "confirmed",
      description: "Visite du musée d'histoire naturelle",
      attendees: ["Classe CM2", "Mme Lambert", "2 accompagnateurs"],
      location: "Musée d'Histoire Naturelle",
      priority: "medium"
    },
    {
      id: 4,
      title: "Rendez-vous - Mme Martin",  
      type: "meeting",
      date: "2024-11-21",
      time: "15:00",
      duration: "45 min",
      status: "pending",
      description: "Inscription nouvelle élève pour janvier",
      attendees: ["Sophie Martin"],
      location: "Bureau secrétariat",
      priority: "medium"
    },
    {
      id: 5,
      title: "Conseil d'école",
      type: "admin",
      date: "2024-11-22",
      time: "18:00",
      duration: "2h",
      status: "scheduled",
      description: "Conseil d'école du 1er trimestre",
      attendees: ["Parents élus", "Équipe pédagogique", "Mairie"],
      location: "Salle polyvalente",
      priority: "high"
    },
    {
      id: 6,
      title: "Vacances de Noël",
      type: "holiday",
      date: "2024-12-21",
      time: "Fin des cours",
      duration: "2 semaines",
      status: "scheduled",
      description: "Vacances scolaires de fin d'année",
      attendees: ["Toute l'école"],
      location: "École fermée",
      priority: "low"
    }
  ];

  const getStatusConfig = (status) => {
    const configs = {
      confirmed: {
        label: 'Confirmé',
        className: 'bg-success/10 text-success border-success/20',
        icon: 'CheckCircle'
      },
      scheduled: {
        label: 'Programmé',
        className: 'bg-primary/10 text-primary border-primary/20',
        icon: 'Calendar'
      },
      pending: {
        label: 'En attente',
        className: 'bg-warning/10 text-warning border-warning/20',
        icon: 'Clock'
      },
      cancelled: {
        label: 'Annulé',
        className: 'bg-error/10 text-error border-error/20',
        icon: 'XCircle'
      }
    };
    return configs?.[status] || configs?.scheduled;
  }; 

  const getTypeConfig = (type) => {
    const configs = {
      meeting: {
        label: 'Rendez-vous',
        className: 'bg-blue-100 text-blue-600',
        icon: 'Users'
      },
      event: {
        label: 'Événement',
        className: 'bg-purple-100 text-purple-600',
        icon: 'Star'  
      },
      admin: {
        label: 'Administratif',
        className: 'bg-orange-100 text-orange-600',
        icon: 'FileText'
      },
      holiday: {
        label: 'Vacances',
        className: 'bg-green-100 text-green-600',
        icon: 'Sun'
      }
    };
    return configs?.[type] || configs?.admin;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      high: {
        label: 'Urgent',
        className: 'bg-red-100 text-red-600',
        icon: 'AlertTriangle'
      },
      medium: {
        label: 'Normal',
        className: 'bg-yellow-100 text-yellow-600',
        icon: 'Circle'
      },
      low: {
        label: 'Faible',
        className: 'bg-gray-100 text-gray-600',
        icon: 'Minus'
      }
    };
    return configs?.[priority] || configs?.medium;
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === '' || event.type === filterType;
    return matchesType;
  });

  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());

  const handleCreateEvent = () => {
    console.log('Create new event');
  };

  const handleEditEvent = (eventId) => {
    console.log('Edit event:', eventId);
  };

  const handleConfirmEvent = (eventId) => {
    console.log('Confirm event:', eventId);
  };

  const handleCancelEvent = (eventId) => {
    console.log('Cancel event:', eventId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="font-heading font-heading-bold text-2xl text-text-primary">
            Planning & Événements
          </h2>
          <p className="font-body font-body-normal text-text-secondary mt-1">
            Gestion des rendez-vous, événements scolaires et tâches administratives
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            iconName="Calendar"
            iconPosition="left"
            onClick={handleCreateEvent}
          >
            Nouveau rendez-vous
          </Button>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={handleCreateEvent}
          >
            Créer événement
          </Button>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {todayEvents.length}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Événements aujourd'hui
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={24} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {upcomingEvents.length}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                Événements à venir
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-bold text-2xl text-text-primary">
                {events.filter(e => e.type === 'meeting' && e.status === 'pending').length}
              </p>
              <p className="font-caption font-caption-normal text-sm text-text-secondary">
                RDV à confirmer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            options={eventTypes}
            value={filterType}
            onChange={setFilterType}
            placeholder="Type d'événement"
          />
          <Select
            options={viewModes}
            value={viewMode}
            onChange={setViewMode}
            placeholder="Mode d'affichage"
          />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            iconName="Calendar"
            iconPosition="left"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Événements & Rendez-vous ({filteredEvents.length})
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const statusConfig = getStatusConfig(event.status);
            const typeConfig = getTypeConfig(event.type);
            const priorityConfig = getPriorityConfig(event.priority);
            
            return (
              <div key={event.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-body font-body-semibold text-lg text-text-primary">
                        {event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeConfig.className}`}>
                        <Icon name={typeConfig.icon} size={12} className="mr-1" />
                        {typeConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.className}`}>
                        <Icon name={statusConfig.icon} size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                      {event.priority === 'high' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.className}`}>
                          <Icon name={priorityConfig.icon} size={12} className="mr-1" />
                          {priorityConfig.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Calendar" size={16} />
                          <span>{event.date} à {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Clock" size={16} />
                          <span>Durée: {event.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="MapPin" size={16} />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-text-primary">
                          <strong>Description:</strong>
                          <p className="text-text-secondary mt-1">{event.description}</p>
                        </div>
                        <div className="text-text-primary">
                          <strong>Participants:</strong>
                          <p className="text-text-secondary mt-1">{event.attendees.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEvent(event.id)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    {event.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfirmEvent(event.id)}
                        title="Confirmer"
                      >
                        <Icon name="CheckCircle" size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEvent(event.id)}
                      title="Annuler"
                    >
                      <Icon name="XCircle" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-heading-semibold text-lg text-text-primary mb-2">
              Aucun événement programmé
            </h3>
            <p className="font-body font-body-normal text-text-secondary">
              Aucun événement ne correspond à vos critères.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningTab;