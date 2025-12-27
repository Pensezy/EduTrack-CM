import React from 'react';
import Icon from '../../../components/AppIcon';

const AssignedClassesOverview = ({ classes, selectedClass }) => {
  if (!selectedClass) return null;

  const getTotalStudents = () => {
    return classes?.reduce((total, cls) => total + cls?.students, 0);
  };

  const getWeeklyHours = () => {
    return classes?.reduce((total, cls) => {
      // Support pour les deux formats
      if (Array.isArray(cls?.schedule)) {
        return total + cls?.schedule?.length * 1.5;
      } else if (cls?.schedule?.weekly_hours) {
        return total + cls?.schedule?.weekly_hours;
      }
      return total;
    }, 0) || 0;
  };

  const getTodaySchedule = () => {
    const today = new Date()?.toLocaleDateString('fr-FR', { weekday: 'long' });
    const todayFr = today?.charAt(0)?.toUpperCase() + today?.slice(1)?.toLowerCase();
    
    // Support uniquement pour le format array
    if (Array.isArray(selectedClass?.schedule)) {
      return selectedClass?.schedule?.filter(slot => 
        slot?.day?.toLowerCase() === todayFr?.toLowerCase()
      ) || [];
    }
    return [];
  };

  const getNextClass = () => {
    const now = new Date();
    const currentDay = now?.toLocaleDateString('fr-FR', { weekday: 'long' });
    const currentTime = now?.getHours() * 60 + now?.getMinutes();
    
    for (const cls of (classes || [])) {
      // Support uniquement pour le format array
      if (Array.isArray(cls?.schedule)) {
        for (const slot of cls?.schedule) {
          if (slot?.day === currentDay) {
            const [startHour, startMin] = slot?.time?.split('-')?.[0]?.split(':')?.map(Number);
            const slotTime = startHour * 60 + startMin;
            if (slotTime > currentTime) {
              return { class: cls, slot };
            }
          }
        }
      }
    }
    return null;
  };

  const nextClass = getNextClass();
  const todaySchedule = getTodaySchedule();

  return (
    <div className="bg-gradient-to-r from-success/5 to-primary/5 rounded-lg border border-primary/10 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Selected Class Info */}
        <div className="mb-6 lg:mb-0">
          <h2 className="font-heading font-heading-bold text-2xl text-card-foreground mb-2">
            Classe sélectionnée: {selectedClass?.name}
          </h2>
          <div className="space-y-1">
            <p className="font-body font-body-normal text-muted-foreground">
              <span className="font-body-semibold">Matière:</span> {selectedClass?.subject}
            </p>
            <p className="font-body font-body-normal text-muted-foreground">
              <span className="font-body-semibold">Niveau:</span> {selectedClass?.level}
            </p>
            <p className="font-body font-body-normal text-muted-foreground">
              <span className="font-body-semibold">École:</span> {selectedClass?.school}
            </p>
          </div>
        </div>

        {/* Teaching Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="Users" size={24} className="mx-auto mb-2 text-primary" />
            <div className="font-heading font-heading-bold text-xl text-primary">
              {getTotalStudents()}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Total élèves
            </p>
          </div>

          {/* Classes Count */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="GraduationCap" size={24} className="mx-auto mb-2 text-success" />
            <div className="font-heading font-heading-bold text-xl text-success">
              {classes?.length}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Classes assignées
            </p>
          </div>

          {/* Weekly Hours */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="Clock" size={24} className="mx-auto mb-2 text-warning" />
            <div className="font-heading font-heading-bold text-xl text-warning">
              {getWeeklyHours()}h
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Heures/semaine
            </p>
          </div>

          {/* Current Class Students */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="User" size={24} className="mx-auto mb-2 text-accent-foreground" />
            <div className="font-heading font-heading-bold text-xl text-accent-foreground">
              {selectedClass?.students}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Élèves classe
            </p>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Next Class */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calendar" size={18} className="text-primary" />
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Programme d'aujourd'hui
            </h3>
          </div>
          
          {todaySchedule?.length > 0 ? (
            <div className="space-y-2">
              {todaySchedule?.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-primary/5 rounded">
                  <div>
                    <span className="font-body font-body-semibold text-sm text-card-foreground">
                      {slot?.time}
                    </span>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {slot?.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-caption font-caption-semibold text-xs text-primary">
                      {selectedClass?.name}
                    </span>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {selectedClass?.subject}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Pas de cours aujourd'hui pour cette classe
              </p>
            </div>
          )}
        </div>

        {/* Next Class */}
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Clock" size={18} className="text-success" />
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Prochain cours
            </h3>
          </div>
          
          {nextClass ? (
            <div className="p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-heading-semibold text-lg text-success">
                  {nextClass?.slot?.time}
                </span>
                <span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-caption font-caption-semibold">
                  {nextClass?.slot?.day}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-body font-body-semibold text-sm text-card-foreground">
                  {nextClass?.class?.name} - {nextClass?.class?.subject}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                  📍 {nextClass?.slot?.room}
                </p>
                <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                  👥 {nextClass?.class?.students} élèves
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Icon name="CheckCircle" size={32} className="text-success mx-auto mb-2" />
              <p className="font-body font-body-normal text-sm text-muted-foreground">
                Plus de cours aujourd'hui
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedClassesOverview;