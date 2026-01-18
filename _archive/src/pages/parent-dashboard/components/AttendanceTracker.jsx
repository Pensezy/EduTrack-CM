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
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <Icon name="Calendar" size={24} className="text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl text-gray-900">
            Suivi des Présences
          </h3>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
          <Icon name="TrendingUp" size={18} className="text-white" />
          <span className="font-body-bold text-sm text-white">
            {attendanceRate?.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="Check" size={24} className="mx-auto mb-2" />
          <div className="font-display font-bold text-2xl">{presentDays}</div>
          <p className="font-body-medium text-xs mt-1 text-white/90">Présent(e)</p>
        </div>

        <div className="text-center p-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="X" size={24} className="mx-auto mb-2" />
          <div className="font-display font-bold text-2xl">{absentDays}</div>
          <p className="font-body-medium text-xs mt-1 text-white/90">Absent(e)</p>
        </div>

        <div className="text-center p-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="Clock" size={24} className="mx-auto mb-2" />
          <div className="font-display font-bold text-2xl">{lateDays}</div>
          <p className="font-body-medium text-xs mt-1 text-white/90">Retards</p>
        </div>

        <div className="text-center p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg text-white hover:scale-105 transition-transform">
          <Icon name="FileText" size={24} className="mx-auto mb-2" />
          <div className="font-display font-bold text-2xl">{excusedDays}</div>
          <p className="font-body-medium text-xs mt-1 text-white/90">Excusé(e)</p>
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
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 p-5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border-2 border-gray-200">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Icon name="Check" size={12} className="text-white" />
            </div>
            <span className="font-body-bold text-xs text-gray-700">Présent(e)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
              <Icon name="X" size={12} className="text-white" />
            </div>
            <span className="font-body-bold text-xs text-gray-700">Absent(e)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={12} className="text-white" />
            </div>
            <span className="font-body-bold text-xs text-gray-700">En retard</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Icon name="FileText" size={12} className="text-white" />
            </div>
            <span className="font-body-bold text-xs text-gray-700">Excusé(e)</span>
          </div>
        </div>
      </div>

      {totalDays === 0 && (
        <div className="text-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icon name="Calendar" size={40} className="text-white" />
          </div>
          <p className="font-body-bold text-base text-gray-700">
            Aucune donnée de présence disponible
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;