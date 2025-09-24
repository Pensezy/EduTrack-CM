import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingEvents = ({ events, selectedSchool, selectedChild }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Icon name="Users" size={20} className="text-primary" />;
      case 'ceremony': return <Icon name="Award" size={20} className="text-success" />;
      case 'excursion': return <Icon name="MapPin" size={20} className="text-warning" />;
      case 'exam': return <Icon name="FileText" size={20} className="text-error" />;
      default: return <Icon name="Calendar" size={20} className="text-muted-foreground" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-primary/10';
      case 'ceremony': return 'bg-success/10';
      case 'excursion': return 'bg-warning/10';
      case 'exam': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  const getEventTypeText = (type) => {
    switch (type) {
      case 'meeting': return 'Réunion';
      case 'ceremony': return 'Cérémonie';
      case 'excursion': return 'Sortie';
      case 'exam': return 'Examen';
      default: return 'Événement';
    }
  };

  // Filter events based on selected school and child
  const filteredEvents = events?.filter(event => {
    if (selectedSchool && selectedChild) {
      return event?.school === selectedChild?.school;
    }
    if (selectedSchool) {
      const schoolName = event?.school;
      return schoolName?.includes(selectedSchool) || event?.child === selectedChild?.name;
    }
    return true;
  }) || [];

  // Sort events by date
  const sortedEvents = filteredEvents?.sort((a, b) => new Date(a?.date) - new Date(b?.date));

  const formatEventDate = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const timeDiff = eventDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let dateFormatted = eventDate?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    if (daysDiff === 0) {
      dateFormatted = `Aujourd'hui`;
    } else if (daysDiff === 1) {
      dateFormatted = `Demain`;
    } else if (daysDiff > 0 && daysDiff <= 7) {
      dateFormatted = `Dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`;
    }

    return dateFormatted;
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5);
  };

  const getDaysUntilEvent = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const timeDiff = eventDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Événements à Venir
        </h3>
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={16} className="text-primary" />
          <span className="font-caption font-caption-semibold text-sm text-primary">
            {sortedEvents?.length} événement{sortedEvents?.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {selectedChild && (
        <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="font-body font-body-normal text-sm text-muted-foreground">
            Événements concernant <span className="font-body-semibold text-primary">{selectedChild?.name}</span> à 
            <span className="font-body-semibold text-primary"> {selectedChild?.school}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sortedEvents?.map(event => {
          const daysUntil = getDaysUntilEvent(event?.date);
          const isUrgent = daysUntil <= 2;
          const isPast = daysUntil < 0;

          return (
            <div
              key={event?.id}
              className={`border-l-4 rounded-lg p-4 transition-all ${
                isPast ? 'border-l-muted bg-muted/5 opacity-60' : isUrgent ?'border-l-error bg-error/5' : 'border-l-primary bg-primary/5'
              } ${isUrgent && !isPast ? 'shadow-md' : 'shadow-sm'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getEventColor(event?.type)} ${isPast ? 'opacity-60' : ''}`}>
                  {getEventIcon(event?.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-heading font-heading-semibold text-lg text-card-foreground">
                      {event?.title}
                    </h4>
                    <div className="text-right ml-3">
                      {isUrgent && !isPast && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-error/10 text-error rounded-full mb-1">
                          <Icon name="AlertCircle" size={12} />
                          <span className="font-caption font-caption-semibold text-xs">Urgent</span>
                        </div>
                      )}
                      <div className={`font-caption font-caption-semibold text-xs ${
                        isPast ? 'text-muted-foreground' : 'text-primary'
                      }`}>
                        {formatEventDate(event?.date)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={14} className="text-muted-foreground" />
                      <span className="font-body font-body-normal text-muted-foreground">
                        Concerné: <span className="font-body-semibold">{event?.child}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Icon name="School" size={14} className="text-muted-foreground" />
                      <span className="font-body font-body-normal text-muted-foreground">
                        {event?.school}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Icon name="Clock" size={14} className="text-muted-foreground" />
                        <span className="font-body font-body-normal text-muted-foreground">
                          {formatTime(event?.time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} className="text-muted-foreground" />
                        <span className="font-body font-body-normal text-muted-foreground">
                          {event?.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-caption font-caption-semibold ${getEventColor(event?.type)}`}>
                        {getEventTypeText(event?.type)}
                      </span>

                      {!isPast && (
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                            <Icon name="Bell" size={12} className="inline mr-1" />
                            Rappel
                          </button>
                          <button className="px-3 py-1 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors">
                            <Icon name="Calendar" size={12} className="inline mr-1" />
                            Agenda
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sortedEvents?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-body font-body-normal text-muted-foreground">
              Aucun événement programmé
              {selectedChild && ` pour ${selectedChild?.name}`}
            </p>
          </div>
        )}
      </div>

      {/* Calendar Integration Note */}
      {sortedEvents?.length > 0 && (
        <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Calendar" size={16} className="text-accent-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-body font-body-semibold text-accent-foreground mb-1">
                Synchronisation Calendrier
              </p>
              <p className="font-body font-body-normal text-muted-foreground">
                Vous pouvez synchroniser ces événements avec votre calendrier personnel 
                et recevoir des rappels automatiques.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;