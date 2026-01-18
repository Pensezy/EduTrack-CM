import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import Button from '../../../components/ui/Button';
import planningService from '../../../services/planningService';

export const PlanningCalendarModal = ({ isOpen, onClose, onEventSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadMonthEvents();
    }
  }, [isOpen, currentDate]);

  const loadMonthEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { events: monthEvents } = await planningService.getAllEvents({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      setEvents(monthEvents);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Commencer au lundi de la semaine contenant le 1er du mois
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - mondayOffset);
    
    const days = [];
    const current = new Date(startDate);
    
    // Générer 6 semaines (42 jours)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      parent_meeting: 'bg-blue-100 text-blue-700 border-blue-200',
      meeting: 'bg-purple-100 text-purple-700 border-purple-200',
      school_event: 'bg-green-100 text-green-700 border-green-200',
      training: 'bg-orange-100 text-orange-700 border-orange-200',
      official_meeting: 'bg-red-100 text-red-700 border-red-200',
      inscription: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      interview: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      holiday: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || colors.parent_meeting;
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      confirmed: '✅',
      scheduled: '📅',
      pending: '⏳',
      cancelled: '❌'
    };
    return indicators[status] || indicators.scheduled;
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDateClick = (date) => {
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length > 0) {
      setSelectedDate(date);
    }
  };

  const handleEventClick = (event) => {
    onEventSelect && onEventSelect(event);
    onClose();
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const calendarDays = generateCalendarDays();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendrier Planning
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Vue mensuelle des événements et rendez-vous
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[600px]">
          {/* Calendrier principal */}
          <div className="flex-1 flex flex-col">
            {/* Navigation mois */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold text-gray-900 ml-4 capitalize">
                  {formatMonthYear()}
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Aujourd'hui
              </Button>
            </div>

            {/* En-têtes jours de la semaine */}
            <div className="grid grid-cols-7 border-b bg-gray-50">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-700 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`border-r border-b last:border-r-0 p-1 cursor-pointer transition-colors ${
                      !isCurrentMonthDay 
                        ? 'bg-gray-50 text-gray-400' 
                        : hoveredDate?.toDateString() === date.toDateString()
                        ? 'bg-blue-50'
                        : 'bg-white hover:bg-gray-50'
                    } ${
                      selectedDate?.toDateString() === date.toDateString() 
                        ? 'bg-blue-100 ring-2 ring-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => setHoveredDate(date)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDate 
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                        : ''
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded border truncate ${getEventTypeColor(event.type)}`}
                          title={`${event.title} (${event.startTime})`}
                        >
                          <span className="mr-1">{getStatusIndicator(event.status)}</span>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar détails */}
          <div className="w-80 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h4 className="font-medium text-gray-900">
                {selectedDate ? (
                  <>Événements du {selectedDate.toLocaleDateString('fr-FR')}</>
                ) : (
                  'Sélectionnez une date'
                )}
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedDate ? (
                getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map(event => (
                    <div
                      key={event.id}
                      className="bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{event.title}</h5>
                        <span className="text-lg">{getStatusIndicator(event.status)}</span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {event.description}
                      </p>

                      <div className={`inline-block mt-2 px-2 py-1 rounded text-xs border ${getEventTypeColor(event.type)}`}>
                        {planningService.getTypeLabel(event.type)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun événement ce jour</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Cliquez sur une date pour voir les événements</p>
                </div>
              )}
            </div>

            {/* Légende */}
            <div className="p-4 border-t bg-white">
              <h5 className="font-medium text-gray-900 mb-2">Légende</h5>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span>✅</span> Confirmé
                </div>
                <div className="flex items-center gap-2">
                  <span>📅</span> Programmé
                </div>
                <div className="flex items-center gap-2">
                  <span>⏳</span> En attente
                </div>
                <div className="flex items-center gap-2">
                  <span>❌</span> Annulé
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningCalendarModal;