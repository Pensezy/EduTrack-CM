import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AttendanceTracker = ({ attendance, childName }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <Icon name="Check" size={14} className="text-success" />;
      case 'absent': return <Icon name="X" size={14} className="text-error" />;
      case 'late': return <Icon name="Clock" size={14} className="text-warning" />;
      case 'excused': return <Icon name="FileText" size={14} className="text-primary" />;
      default: return <Icon name="Minus" size={14} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-success text-white';
      case 'absent': return 'bg-error text-white';
      case 'late': return 'bg-warning text-white';
      case 'excused': return 'bg-primary text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Présent(e)';
      case 'absent': return 'Absent(e)';
      case 'late': return 'En retard';
      case 'excused': return 'Excusé(e)';
      default: return 'Non renseigné';
    }
  };

  // Calculate statistics
  const dates = Object?.keys(attendance) || [];
  const totalDays = dates?.length;
  const presentDays = dates?.filter(date => attendance?.[date] === 'present')?.length;
  const absentDays = dates?.filter(date => attendance?.[date] === 'absent')?.length;
  const lateDays = dates?.filter(date => attendance?.[date] === 'late')?.length;
  const excusedDays = dates?.filter(date => attendance?.[date] === 'excused')?.length;

  const attendanceRate = totalDays > 0 ? ((presentDays + excusedDays) / totalDays * 100) : 0;

  // Get last 14 days for display
  const sortedDates = dates?.sort((a, b) => new Date(b) - new Date(a))?.slice(0, 14);

  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Suivi des Présences
        </h3>
        <div className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg">
          <Icon name="Calendar" size={16} className="text-success" />
          <span className="font-heading font-heading-semibold text-sm text-success">
            {attendanceRate?.toFixed(1)}% de présence
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <Icon name="Check" size={20} className="text-success mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-success">{presentDays}</div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">Présent(e)</p>
        </div>

        <div className="text-center p-3 bg-error/10 rounded-lg">
          <Icon name="X" size={20} className="text-error mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-error">{absentDays}</div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">Absent(e)</p>
        </div>

        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <Icon name="Clock" size={20} className="text-warning mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-warning">{lateDays}</div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">Retards</p>
        </div>

        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <Icon name="FileText" size={20} className="text-primary mx-auto mb-2" />
          <div className="font-heading font-heading-bold text-lg text-primary">{excusedDays}</div>
          <p className="font-caption font-caption-normal text-xs text-muted-foreground">Excusé(e)</p>
        </div>
      </div>

      {/* Attendance Calendar - Last 14 days */}
      <div>
        <h4 className="font-heading font-heading-semibold text-lg text-card-foreground mb-4">
          Derniers jours de classe
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {sortedDates?.map(date => {
            const status = attendance?.[date];
            const dateObj = new Date(date);
            const isToday = new Date()?.toDateString() === dateObj?.toDateString();
            
            return (
              <div
                key={date}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                className={`relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedDate === date ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                } ${isToday ? 'ring-2 ring-primary/30' : ''}`}
              >
                <div className="text-center">
                  <div className="font-caption font-caption-normal text-xs text-muted-foreground mb-1">
                    {dateObj?.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className="font-body font-body-semibold text-sm text-card-foreground mb-2">
                    {dateObj?.getDate()}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>
                </div>

                {/* Tooltip on selection */}
                {selectedDate === date && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                    <div className="text-center">
                      <div className="font-caption font-caption-semibold">
                        {dateObj?.toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </div>
                      <div className="font-caption font-caption-normal mt-1">
                        {getStatusText(status)}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
              <Icon name="Check" size={10} className="text-white" />
            </div>
            <span className="font-caption font-caption-normal text-xs">Présent(e)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-error rounded-full flex items-center justify-center">
              <Icon name="X" size={10} className="text-white" />
            </div>
            <span className="font-caption font-caption-normal text-xs">Absent(e)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded-full flex items-center justify-center">
              <Icon name="Clock" size={10} className="text-white" />
            </div>
            <span className="font-caption font-caption-normal text-xs">En retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Icon name="FileText" size={10} className="text-white" />
            </div>
            <span className="font-caption font-caption-normal text-xs">Excusé(e)</span>
          </div>
        </div>
      </div>

      {totalDays === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body font-body-normal text-muted-foreground">
            Aucune donnée de présence disponible
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;