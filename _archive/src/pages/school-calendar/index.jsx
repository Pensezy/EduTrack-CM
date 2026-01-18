import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentAcademicYear } from '../../utils/academicYear';

const SchoolCalendar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { user } = useAuth();
  
  // Récupérer l'année académique actuelle
  const currentAcademicYear = getCurrentAcademicYear();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const events = [
    {
      id: 1,
      title: 'Rentrée scolaire',
      date: '2025-09-01',
      type: 'academic',
      description: `Début de l'année scolaire ${currentAcademicYear}`,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Réunion parents d\'élèves',
      date: '2025-09-28',
      type: 'meeting',
      description: 'Réunion trimestrielle avec les parents',
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Fête nationale',
      date: '2025-05-20',
      type: 'holiday',
      description: 'Fête nationale - école fermée',
      color: 'bg-red-500'
    },
    {
      id: 4,
      title: 'Examens du 1er trimestre',
      date: '2025-12-10',
      type: 'exam',
      description: 'Début des examens trimestriels',
      color: 'bg-orange-500'
    },
    {
      id: 5,
      title: 'Formation des enseignants',
      date: '2025-10-15',
      type: 'training',
      description: 'Session de formation pédagogique',
      color: 'bg-purple-500'
    }
  ];

  const eventTypes = [
    { id: 'academic', label: 'Académique', color: 'bg-blue-500' },
    { id: 'meeting', label: 'Réunions', color: 'bg-green-500' },
    { id: 'holiday', label: 'Vacances', color: 'bg-red-500' },
    { id: 'exam', label: 'Examens', color: 'bg-orange-500' },
    { id: 'training', label: 'Formations', color: 'bg-purple-500' },
    { id: 'event', label: 'Événements', color: 'bg-pink-500' }
  ];

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEventTypeLabel = (type) => {
    return eventTypes.find(t => t.id === type)?.label || type;
  };

  const getEventTypeColor = (type) => {
    return eventTypes.find(t => t.id === type)?.color || 'bg-gray-500';
  };
  
  // Fonction pour changer de mois
  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };
  
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  const getMonthName = () => {
    return currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };
  
  // Fonction pour gérer les actions (à implémenter)
  const handleAddEvent = () => {
    alert('Fonctionnalité en développement : Ajouter un événement');
  };
  
  const handleExport = () => {
    alert('Fonctionnalité en développement : Exporter le calendrier');
  };

  return (
    <>
      <Helmet>
        <title>Calendrier Scolaire - EduTrack CM</title>
        <meta name="description" content="Gérer le calendrier et les événements scolaires" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header 
          userRole={user?.role} 
          userName={user?.full_name || user?.email?.split('@')[0] || "Utilisateur"}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <div className="flex pt-16">
          <Sidebar 
            userRole={user?.role}
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          } p-6`}>
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Calendar" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-heading-bold text-foreground">
                      Calendrier Scolaire
                    </h1>
                    <p className="text-muted-foreground">
                      Année académique {currentAcademicYear}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Exporter
                  </Button>
                  {(user?.role === 'principal' || user?.role === 'secretary') && (
                    <Button onClick={handleAddEvent}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Nouvel événement
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Vue du calendrier */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-border rounded-lg p-6 shadow-card">
                  {/* En-tête du calendrier */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-heading font-heading-semibold text-card-foreground capitalize">
                        {getMonthName()}
                      </h2>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={previousMonth}>
                          <Icon name="ChevronLeft" size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={goToToday}>
                          Aujourd'hui
                        </Button>
                        <Button variant="ghost" size="sm" onClick={nextMonth}>
                          <Icon name="ChevronRight" size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant={viewMode === 'month' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setViewMode('month')}
                      >
                        Mois
                      </Button>
                      <Button 
                        variant={viewMode === 'week' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setViewMode('week')}
                      >
                        Semaine
                      </Button>
                      <Button 
                        variant={viewMode === 'day' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setViewMode('day')}
                      >
                        Jour
                      </Button>
                    </div>
                  </div>

                  {/* Grille du calendrier (simplifiée) */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    {/* En-têtes des jours */}
                    <div className="grid grid-cols-7 bg-muted/50">
                      {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grille des dates (exemple pour une semaine) */}
                    <div className="grid grid-cols-7 min-h-[400px]">
                      {Array.from({ length: 35 }, (_, i) => (
                        <div key={i} className="border-r border-b border-border last:border-r-0 p-2 min-h-[100px] relative">
                          <span className="text-sm text-muted-foreground">
                            {i + 1 <= 30 ? i + 1 : ''}
                          </span>
                          
                          {/* Événements exemple */}
                          {i === 1 && (
                            <div className="mt-1">
                              <div className="bg-blue-500 text-white text-xs p-1 rounded mb-1">
                                Rentrée
                              </div>
                            </div>
                          )}
                          {i === 27 && (
                            <div className="mt-1">
                              <div className="bg-green-500 text-white text-xs p-1 rounded mb-1">
                                Réunion
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar des événements */}
              <div className="space-y-6">
                {/* Événements à venir */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-card">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                    Événements à venir
                  </h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 ${getEventTypeColor(event.type)} rounded-full mt-1.5 flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(event.date)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Légende des types d'événements */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-card">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                    Types d'événements
                  </h3>
                  <div className="space-y-2">
                    {eventTypes.map((type) => (
                      <div key={type.id} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${type.color} rounded-full`}></div>
                        <span className="text-sm text-foreground">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-card">
                  <h3 className="text-lg font-heading font-heading-semibold text-card-foreground mb-4">
                    Actions rapides
                  </h3>
                  <div className="space-y-2">
                    {(user?.role === 'principal' || user?.role === 'secretary') && (
                      <>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleAddEvent}>
                          <Icon name="Plus" size={14} className="mr-2" />
                          Ajouter événement
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => alert('Fonctionnalité en développement')}>
                          <Icon name="Calendar" size={14} className="mr-2" />
                          Programmer vacances
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => alert('Fonctionnalité en développement')}>
                          <Icon name="Users" size={14} className="mr-2" />
                          Réunion parents
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => alert('Fonctionnalité en développement')}>
                          <Icon name="BookOpen" size={14} className="mr-2" />
                          Planifier examens
                        </Button>
                      </>
                    )}
                    {user?.role === 'teacher' && (
                      <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                        <Icon name="Info" size={14} className="inline mr-2" />
                        Consultation uniquement
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SchoolCalendar;