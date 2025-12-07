import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AttendanceCalendar = ({ attendanceData }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date) => {
    const year = date?.getFullYear();
    const month = date?.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay?.getDate();
    const startingDayOfWeek = firstDay?.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days?.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days?.push(day);
    }
    
    return days;
  };

  const getAttendanceStatus = (day) => {
    if (!day) return null;
    const dateKey = `${currentMonth?.getFullYear()}-${(currentMonth?.getMonth() + 1)?.toString()?.padStart(2, '0')}-${day?.toString()?.padStart(2, '0')}`;
    return attendanceData?.[dateKey] || null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'absent':
        return 'bg-error text-error-foreground';
      case 'late':
        return 'bg-warning text-warning-foreground';
      case 'excused':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return 'Check';
      case 'absent':
        return 'X';
      case 'late':
        return 'Clock';
      case 'excused':
        return 'FileCheck';
      default:
        return null;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate?.setMonth(prev?.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);

  const attendanceStats = {
    present: Object.values(attendanceData)?.filter(status => status === 'present')?.length,
    absent: Object.values(attendanceData)?.filter(status => status === 'absent')?.length,
    late: Object.values(attendanceData)?.filter(status => status === 'late')?.length,
    excused: Object.values(attendanceData)?.filter(status => status === 'excused')?.length
  };

  const totalDays = Object.keys(attendanceData)?.length;
  const attendanceRate = totalDays > 0 ? Math.round((attendanceStats?.present / totalDays) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-cyan-200 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-6 border-b-2 border-cyan-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-600 shadow-lg">
              <Icon name="Calendar" size={22} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-xl bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">
              Présences
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-xl bg-white border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
            >
              <Icon name="ChevronLeft" size={18} />
            </button>
            <span className="font-body-bold text-sm text-gray-800 min-w-[120px] text-center px-3">
              {monthNames?.[currentMonth?.getMonth()]} {currentMonth?.getFullYear()}
            </span>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-xl bg-white border-2 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
            >
              <Icon name="ChevronRight" size={18} />
            </button>
          </div>
        </div>

        {/* Attendance Stats - Modernisé */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border-2 border-green-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="text-2xl font-display font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {attendanceStats?.present}
            </div>
            <div className="font-body-medium text-xs text-gray-600 mt-1">
              Présent
            </div>
          </div>
          <div className="bg-white border-2 border-red-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="text-2xl font-display font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {attendanceStats?.absent}
            </div>
            <div className="font-body-medium text-xs text-gray-600 mt-1">
              Absent
            </div>
          </div>
          <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="text-2xl font-display font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              {attendanceStats?.late}
            </div>
            <div className="font-body-medium text-xs text-gray-600 mt-1">
              Retard
            </div>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {attendanceRate}%
            </div>
            <div className="font-body-medium text-xs text-gray-600 mt-1">
              Taux
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {dayNames?.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="font-body-bold text-xs text-gray-700">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days?.map((day, index) => {
            const status = getAttendanceStatus(day);
            const statusIcon = getStatusIcon(status);
            
            return (
              <div
                key={index}
                className={`aspect-square p-1 rounded-lg flex items-center justify-center relative transition-micro ${
                  day ? getStatusColor(status) : ''
                }`}
              >
                {day && (
                  <>
                    <span className="font-caption font-caption-normal text-xs">
                      {day}
                    </span>
                    {statusIcon && (
                      <Icon 
                        name={statusIcon} 
                        size={8} 
                        className="absolute top-0.5 right-0.5" 
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">Présent</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">Retard</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">Excusé</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;