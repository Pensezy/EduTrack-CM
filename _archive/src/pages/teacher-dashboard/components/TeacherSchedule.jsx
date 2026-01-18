import React from 'react';
import Icon from '../../../components/AppIcon';

const TeacherSchedule = ({ schedule, teacherName }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return <Icon name="BookOpen" size={16} className="text-primary" />;
      case 'evaluation': return <Icon name="FileText" size={16} className="text-error" />;
      case 'tp': return <Icon name="Laptop" size={16} className="text-success" />;
      case 'meeting': return <Icon name="Users" size={16} className="text-warning" />;
      default: return <Icon name="Calendar" size={16} className="text-muted-foreground" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'bg-primary/10 border-primary/20';
      case 'evaluation': return 'bg-error/10 border-error/20';
      case 'tp': return 'bg-success/10 border-success/20';
      case 'meeting': return 'bg-warning/10 border-warning/20';
      default: return 'bg-muted/10 border-border';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'course': return 'Cours';
      case 'evaluation': return 'Évaluation';
      case 'tp': return 'Travaux Pratiques';
      case 'meeting': return 'Réunion';
      default: return 'Activité';
    }
  };

  const formatTime = (timeString) => {
    return timeString?.replace('-', ' - ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date?.toDateString() === today?.toDateString();
    
    if (isToday) {
      return 'Aujourd\'hui';
    }
    
    const tomorrow = new Date(today);
    tomorrow?.setDate(today?.getDate() + 1);
    const isTomorrow = date?.toDateString() === tomorrow?.toDateString();
    
    if (isTomorrow) {
      return 'Demain';
    }
    
    return date?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDayOfWeek = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', { weekday: 'long' });
  };

  const isToday = (dateString) => {
    return new Date(dateString)?.toDateString() === new Date()?.toDateString();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now?.getHours() * 60 + now?.getMinutes();
  };

  const getTimeInMinutes = (timeString) => {
    const [startTime] = timeString?.split('-');
    const [hours, minutes] = startTime?.split(':')?.map(Number);
    return hours * 60 + minutes;
  };

  const isCurrentClass = (scheduleItem) => {
    if (!isToday(scheduleItem?.date)) return false;
    
    const now = getCurrentTime();
    const [startTime, endTime] = scheduleItem?.time?.split('-');
    const startMinutes = getTimeInMinutes(startTime + ':00');
    const endMinutes = getTimeInMinutes(endTime + ':00');
    
    return now >= startMinutes && now <= endMinutes;
  };

  const getNextClass = () => {
    const now = getCurrentTime();
    const today = new Date()?.toDateString();
    
    return schedule?.find(item => {
      if (new Date(item.date)?.toDateString() !== today) return false;
      const startMinutes = getTimeInMinutes(item?.time?.split('-')?.[0] + ':00');
      return startMinutes > now;
    });
  };

  const nextClass = getNextClass();
  const currentClass = schedule?.find(item => isCurrentClass(item));

  // Group schedule by date
  const groupedSchedule = schedule?.reduce((groups, item) => {
    const date = item?.date;
    if (!groups?.[date]) {
      groups[date] = [];
    }
    groups?.[date]?.push(item);
    return groups;
  }, {}) || {};

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Mon Planning de la Semaine
        </h3>
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
          <Icon name="Calendar" size={16} className="text-primary" />
          <span className="font-caption font-caption-semibold text-sm text-primary">
            {schedule?.length} cours cette semaine
          </span>
        </div>
      </div>
      {/* Current/Next Class Alert */}
      {(currentClass || nextClass) && (
        <div className={`mb-6 p-4 rounded-lg border ${
          currentClass 
            ? 'bg-success/5 border-success/20' :'bg-primary/5 border-primary/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              currentClass ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              {currentClass 
                ? <Icon name="PlayCircle" size={20} className="text-success" />
                : <Icon name="Clock" size={20} className="text-primary" />
              }
            </div>
            
            <div className="flex-1">
              <h4 className={`font-heading font-heading-semibold text-lg ${
                currentClass ? 'text-success' : 'text-primary'
              }`}>
                {currentClass ? 'Cours en cours' : 'Prochain cours'}
              </h4>
              <div className="mt-1">
                {(currentClass || nextClass) && (
                  <div>
                    <p className="font-body font-body-semibold text-card-foreground">
                      {(currentClass || nextClass)?.className} - {(currentClass || nextClass)?.topic}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={14} />
                        {formatTime((currentClass || nextClass)?.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {(currentClass || nextClass)?.room}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {currentClass && (
              <div className="text-right">
                <div className="font-heading font-heading-bold text-success text-lg">
                  EN COURS
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Schedule by Day */}
      <div className="space-y-6">
        {Object.entries(groupedSchedule)?.map(([date, daySchedule]) => (
          <div key={date}>
            <div className={`flex items-center gap-3 mb-4 ${
              isToday(date) ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <h4 className="font-heading font-heading-semibold text-lg">
                {formatDate(date)}
              </h4>
              {isToday(date) && (
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-caption font-caption-semibold">
                  Aujourd'hui
                </span>
              )}
              <div className="flex-1 h-px bg-border"></div>
            </div>

            <div className="space-y-3">
              {daySchedule
                ?.sort((a, b) => getTimeInMinutes(a?.time) - getTimeInMinutes(b?.time))
                ?.map(item => (
                <div
                  key={item?.id}
                  className={`border rounded-lg p-4 transition-all ${getTypeColor(item?.type)} ${
                    isCurrentClass(item) ? 'ring-2 ring-success shadow-md' : 'hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item?.type)}
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-caption font-caption-semibold ${
                          item?.type === 'course' ? 'bg-primary/10 text-primary' :
                          item?.type === 'evaluation' ? 'bg-error/10 text-error' :
                          item?.type === 'tp'? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {getTypeText(item?.type)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h5 className="font-heading font-heading-semibold text-lg text-card-foreground">
                        {item?.className} - {item?.topic}
                      </h5>
                      <p className="font-body font-body-normal text-sm text-muted-foreground">
                        {item?.subject}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-heading font-heading-bold text-lg text-card-foreground">
                        {formatTime(item?.time)}
                      </div>
                      <p className="font-caption font-caption-normal text-sm text-muted-foreground">
                        📍 {item?.room}
                      </p>
                    </div>
                  </div>

                  {isCurrentClass(item) && (
                    <div className="mt-3 pt-3 border-t border-success/20">
                      <div className="flex items-center justify-between">
                        <span className="font-body font-body-semibold text-success">
                          Cours en cours - {item?.className}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 bg-success/10 text-success hover:bg-success/20 rounded-lg transition-colors">
                            <Icon name="Users" size={12} className="inline mr-1" />
                            Liste classe
                          </button>
                          <button className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors">
                            <Icon name="Calendar" size={12} className="inline mr-1" />
                            Présences
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {schedule?.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Calendar" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="font-heading font-heading-semibold text-xl text-card-foreground mb-2">
              Aucun cours programmé
            </h4>
            <p className="font-body font-body-normal text-muted-foreground">
              Votre planning de la semaine est vide.
            </p>
          </div>
        )}
      </div>
      {/* Weekly Summary */}
      {schedule?.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
            Résumé de la semaine
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="font-heading font-heading-bold text-xl text-primary">
                {schedule?.filter(s => s?.type === 'course')?.length}
              </div>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                Cours
              </p>
            </div>
            
            <div className="text-center p-3 bg-error/5 rounded-lg">
              <div className="font-heading font-heading-bold text-xl text-error">
                {schedule?.filter(s => s?.type === 'evaluation')?.length}
              </div>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                Évaluations
              </p>
            </div>
            
            <div className="text-center p-3 bg-success/5 rounded-lg">
              <div className="font-heading font-heading-bold text-xl text-success">
                {schedule?.length * 1.5}h
              </div>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                Total heures
              </p>
            </div>
            
            <div className="text-center p-3 bg-warning/5 rounded-lg">
              <div className="font-heading font-heading-bold text-xl text-warning">
                {new Set(schedule?.map(s => s.className))?.size}
              </div>
              <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                Classes diff.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSchedule;