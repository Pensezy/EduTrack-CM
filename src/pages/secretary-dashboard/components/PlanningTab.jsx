import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useToast, ToastContainer } from '../../../components/ui/Toast';
import { useDataMode } from '../../../hooks/useEduTrackData';
import planningService from '../../../services/planningService';
import EventModal from './EventModal';
import PlanningCalendarModal from './PlanningCalendarModal';
import PlanningAnalyticsModal from './PlanningAnalyticsModal';

const PlanningTab = () => {
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();
  const { isProductionMode } = useDataMode(); // Détecter le mode production
  
  const [selectedDate, setSelectedDate] = useState(new Date()?.toISOString()?.split('T')?.[0]);
  const [viewMode, setViewMode] = useState('list');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour les données
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  
  // États pour les modals
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, [filterType, filterStatus, filterClass, searchTerm, selectedDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const filters = {
        type: filterType,
        status: filterStatus,
        studentClass: filterClass,
        search: searchTerm
      };

      console.log('🔄 Chargement planning - Mode production (hook):', isProductionMode);
      
      // Debug du mode et forcer production si utilisateur réel connecté
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const edutrackUser = localStorage.getItem('edutrack-user');
      console.log('🔍 userData.demoAccount:', userData.demoAccount);
      console.log('🔍 edutrack-user exists:', !!edutrackUser);
      console.log('🔍 Hook isProductionMode:', isProductionMode);
      
      // Forcer le mode production si on détecte un utilisateur réel
      let mode;
      if (edutrackUser && edutrackUser !== 'null' && !userData.demoAccount) {
        mode = 'production';
        console.log('🔧 Mode forcé vers production car utilisateur réel connecté');
      } else {
        mode = isProductionMode ? 'production' : 'demo';
        console.log('🔍 Mode selon hook:', mode);
      }
      
      const data = await planningService.getAllEvents(filters, mode);
      setEvents(data.events || []);
      setStatistics(data.statistics || {});
      console.log('✅ Événements chargés:', data.events?.length || 0);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      showError('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const eventTypes = [
    { value: '', label: 'Tous les événements' },
    { value: 'parent_meeting', label: 'Rendez-vous parents' },
    { value: 'meeting', label: 'Réunions pédagogiques' },
    { value: 'school_event', label: 'Événements scolaires' },
    { value: 'training', label: 'Formations' },
    { value: 'official_meeting', label: 'Conseils officiels' },
    { value: 'inscription', label: 'Inscriptions' },
    { value: 'interview', label: 'Entretiens' },
    { value: 'holiday', label: 'Vacances scolaires' }
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'confirmed', label: 'Confirmé' },
    { value: 'scheduled', label: 'Programmé' },
    { value: 'pending', label: 'En attente' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const classOptions = [
    { value: '', label: 'Toutes les classes' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' }
  ];

  const viewModes = [
    { value: 'list', label: 'Liste' },
    { value: 'calendar', label: 'Calendrier' },
    { value: 'week', label: 'Semaine' }
  ];

  // Gestion des actions
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleConfirmEvent = async (eventId) => {
    try {
      await planningService.confirmEvent(eventId);
      showSuccess('Événement confirmé avec succès');
      loadEvents();
    } catch (error) {
      showError('Erreur lors de la confirmation');
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) {
      try {
        await planningService.cancelEvent(eventId, 'Annulé par le secrétariat');
        showSuccess('Événement annulé');
        loadEvents();
      } catch (error) {
        showError('Erreur lors de l\'annulation');
      }
    }
  };

  const handleSendReminder = async (eventId) => {
    try {
      await planningService.sendReminders(eventId);
      showSuccess('Rappels envoyés avec succès');
    } catch (error) {
      showError('Erreur lors de l\'envoi des rappels');
    }
  };

  const handleEventModalSuccess = () => {
    showSuccess(selectedEvent ? 'Événement modifié avec succès' : 'Événement créé avec succès');
    loadEvents();
    setShowEventModal(false);
  };

  const handleShowCalendar = () => {
    setShowCalendarModal(true);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleExportPlanning = async () => {
    try {
      const filters = {
        type: filterType,
        status: filterStatus,
        studentClass: filterClass,
        search: searchTerm
      };
      
      const csvData = await planningService.exportPlanning('csv', filters);
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Planning exporté avec succès');
    } catch (error) {
      showError('Erreur lors de l\'export');
    }
  };

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

  // Calculer des statistiques rapides basées sur les données chargées
  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date() && event.status !== 'cancelled');

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="font-heading font-heading-bold text-lg text-text-primary">
            Planning & Événements
          </h2>
          <p className="font-body font-body-normal text-xs text-text-secondary mt-0.5">
            Gestion des rendez-vous, événements scolaires et tâches administratives
          </p>
        </div>
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            size="sm"
            iconName="Calendar"
            iconPosition="left"
            onClick={handleShowCalendar}
          >
            Calendrier
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="BarChart3"
            iconPosition="left"
            onClick={() => setShowAnalyticsModal(true)}
            disabled={loading}
          >
            Analyses
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={handleExportPlanning}
            disabled={loading}
          >
            Export
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={handleCreateEvent}
            disabled={loading}
          >
            Nouveau
          </Button>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
              <Icon name="Clock" size={16} className="text-primary" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {todayEvents.length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Aujourd'hui
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center">
              <Icon name="Calendar" size={16} className="text-success" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {statistics.thisWeek || 0}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                Cette semaine
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-warning/10 rounded flex items-center justify-center">
              <Icon name="Users" size={16} className="text-warning" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {statistics.pendingConfirmations || 0}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                À confirmer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded border border-border p-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-error/10 rounded flex items-center justify-center">
              <Icon name="AlertTriangle" size={16} className="text-error" />
            </div>
            <div>
              <p className="font-heading font-heading-semibold text-sm text-text-primary">
                {events.filter(e => e.type === 'parent_meeting').length}
              </p>
              <p className="font-caption font-caption-normal text-xs text-text-secondary">
                RDV parents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded border border-border p-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input
            type="search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          <Select
            options={eventTypes}
            value={filterType}
            onChange={setFilterType}
            placeholder="Type d'événement"
          />
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Statut"
          />
          <Select
            options={classOptions}
            value={filterClass}
            onChange={setFilterClass}
            placeholder="Classe"
          />
          <Select
            options={viewModes}
            value={viewMode}
            onChange={setViewMode}
            placeholder="Affichage"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="bg-card rounded border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-text-primary">
            Événements & Rendez-vous ({events.length})
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => loadEvents()}
            disabled={loading}
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Actualiser
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-3">
            {events.map((event) => {
            const statusConfig = getStatusConfig(event.status);
            const typeConfig = getTypeConfig(event.type);
            const priorityConfig = getPriorityConfig(event.priority);
            
            return (
              <div key={event.id} className="border border-border rounded p-3 hover:bg-muted/50 transition-micro">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="font-body font-body-semibold text-base text-text-primary">
                        {event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${typeConfig.className}`}>
                        <Icon name={typeConfig.icon} size={12} className="mr-1" />
                        {typeConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${statusConfig.className}`}>
                        <Icon name={statusConfig.icon} size={12} className="mr-1" />
                        {statusConfig.label}
                      </span>
                      {event.priority === 'high' && (
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityConfig.className}`}>
                          <Icon name={priorityConfig.icon} size={12} className="mr-1" />
                          {priorityConfig.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Calendar" size={14} />
                          <span>{event.date} à {event.startTime}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="Clock" size={14} />
                          <span>Durée: {event.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-2 text-text-secondary">
                          <Icon name="MapPin" size={14} />
                          <span>{event.location}</span>
                        </div>
                        {event.studentName && (
                          <div className="flex items-center space-x-2 text-text-secondary">
                            <Icon name="User" size={14} />
                            <span>{event.studentName} ({event.studentClass})</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-text-primary">
                          <p className="text-text-secondary text-xs line-clamp-2">{event.description}</p>
                        </div>
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="text-text-secondary text-xs">
                            <strong>Participants:</strong> {event.attendees.slice(0, 2).join(', ')}
                            {event.attendees.length > 2 && ` +${event.attendees.length - 2} autres`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-3">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleEditEvent(event)}
                      title="Modifier"
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    {event.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleConfirmEvent(event.id)}
                        title="Confirmer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Icon name="CheckCircle" size={14} />
                      </Button>
                    )}
                    {(event.type === 'parent_meeting' && event.status === 'confirmed') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleSendReminder(event.id)}
                        title="Envoyer rappel"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Icon name="Mail" size={14} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleCancelEvent(event.id)}
                      title="Annuler"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon name="XCircle" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-3" />
            <h3 className="font-heading font-heading-semibold text-base text-text-primary mb-2">
              Aucun événement programmé
            </h3>
            <p className="font-body font-body-normal text-sm text-text-secondary mb-4">
              Aucun événement ne correspond à vos critères.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateEvent}
              iconName="Plus"
              iconPosition="left"
            >
              Créer le premier événement
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={handleEventModalSuccess}
      />

      <PlanningCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onEventSelect={handleEventSelect}
      />

      <PlanningAnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />
    </div>
  );
};

export default PlanningTab;