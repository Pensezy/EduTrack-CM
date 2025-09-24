import React from 'react';
import Icon from '../../../components/AppIcon';

const ChildOverviewCard = ({ child }) => {
  if (!child) return null;

  const getPerformanceColor = (average) => {
    if (average >= 16) return 'text-success';
    if (average >= 14) return 'text-primary';
    if (average >= 12) return 'text-warning';
    return 'text-error';
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 95) return 'text-success';
    if (rate >= 90) return 'text-primary';
    if (rate >= 85) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Child Profile Section */}
        <div className="flex items-center gap-6 mb-6 lg:mb-0">
          <div className="relative">
            <img
              src={child?.photo}
              alt={child?.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
              <Icon name="User" size={12} className="text-white" />
            </div>
          </div>

          <div>
            <h2 className="font-heading font-heading-bold text-2xl text-card-foreground mb-2">
              {child?.name}
            </h2>
            <div className="space-y-1">
              <p className="font-body font-body-normal text-muted-foreground">
                <span className="font-body-semibold">Classe:</span> {child?.class}
              </p>
              <p className="font-body font-body-normal text-muted-foreground">
                <span className="font-body-semibold">Matricule:</span> {child?.matricule}
              </p>
              <p className="font-body font-body-normal text-muted-foreground">
                <span className="font-body-semibold">École:</span> {child?.school}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Performance */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="TrendingUp" size={24} className={`mx-auto mb-2 ${getPerformanceColor(child?.averageGrade)}`} />
            <div className={`font-heading font-heading-bold text-xl ${getPerformanceColor(child?.averageGrade)}`}>
              {child?.averageGrade}/20
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Moyenne générale
            </p>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon name="Calendar" size={24} className={`mx-auto mb-2 ${getAttendanceColor(child?.attendanceRate)}`} />
            <div className={`font-heading font-heading-bold text-xl ${getAttendanceColor(child?.attendanceRate)}`}>
              {child?.attendanceRate}%
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Présence
            </p>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon 
              name="Bell" 
              size={24} 
              className={`mx-auto mb-2 ${child?.unreadNotifications > 0 ? 'text-warning' : 'text-muted-foreground'}`} 
            />
            <div className={`font-heading font-heading-bold text-xl ${child?.unreadNotifications > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
              {child?.unreadNotifications}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Notifications
            </p>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-border text-center">
            <Icon 
              name="CreditCard" 
              size={24} 
              className={`mx-auto mb-2 ${child?.pendingPayments > 0 ? 'text-error' : 'text-success'}`} 
            />
            <div className={`font-heading font-heading-bold text-xl ${child?.pendingPayments > 0 ? 'text-error' : 'text-success'}`}>
              {child?.pendingPayments}
            </div>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground mt-1">
              Paiements dus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildOverviewCard;