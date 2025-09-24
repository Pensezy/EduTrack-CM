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
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
            Présences
          </h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <span className="font-body font-body-semibold text-sm text-card-foreground min-w-[120px] text-center">
              {monthNames?.[currentMonth?.getMonth()]} {currentMonth?.getFullYear()}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <div className="font-heading font-heading-bold text-lg text-success">
              {attendanceStats?.present}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Présent
            </div>
          </div>
          <div className="bg-error/10 rounded-lg p-3 text-center">
            <div className="font-heading font-heading-bold text-lg text-error">
              {attendanceStats?.absent}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Absent
            </div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <div className="font-heading font-heading-bold text-lg text-warning">
              {attendanceStats?.late}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Retard
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <div className="font-heading font-heading-bold text-lg text-primary">
              {attendanceRate}%
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Taux
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames?.map(day => (
            <div key={day} className="p-2 text-center">
              <span className="font-caption font-caption-normal text-xs text-muted-foreground">
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