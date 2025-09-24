import React from 'react';
import Icon from '../../../components/AppIcon';

const ChildSelector = ({ 
  children, 
  schools, 
  selectedChild, 
  selectedSchool, 
  onChildSelect, 
  onSchoolChange,
  getChildrenBySchool 
}) => {
  return (
    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="font-heading font-heading-semibold text-xl text-card-foreground">
          Sélection Enfant & École
        </h2>
        
        {/* Multi-School Selector */}
        {schools?.length > 1 && (
          <div className="flex items-center gap-3">
            <Icon name="School" size={18} className="text-primary" />
            <select
              value={selectedSchool || ''}
              onChange={(e) => onSchoolChange(e?.target?.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg font-body font-body-normal text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Toutes les écoles</option>
              {schools?.map(school => (
                <option key={school?.id} value={school?.id}>
                  {school?.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children?.map(child => {
          // Show child if no school selected or if child belongs to selected school
          const shouldShow = !selectedSchool || child?.schoolId === selectedSchool;
          if (!shouldShow) return null;

          const isSelected = selectedChild?.id === child?.id;

          return (
            <div
              key={child?.id}
              onClick={() => onChildSelect(child)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/2'
              }`}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={14} className="text-white" />
                </div>
              )}

              <div className="flex items-center gap-4">
                {/* Child Photo */}
                <div className="relative">
                  <img
                    src={child?.photo}
                    alt={child?.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                  />
                  {/* Notification Badge */}
                  {child?.unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center">
                      <span className="font-caption font-caption-semibold text-xs text-white">
                        {child?.unreadNotifications}
                      </span>
                    </div>
                  )}
                </div>

                {/* Child Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-heading-semibold text-lg text-card-foreground mb-1 truncate">
                    {child?.name}
                  </h3>
                  <p className="font-body font-body-normal text-sm text-muted-foreground mb-1">
                    {child?.class} • {child?.matricule}
                  </p>
                  <p className="font-caption font-caption-normal text-xs text-muted-foreground truncate">
                    {child?.school}
                  </p>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1">
                      <Icon name="TrendingUp" size={12} className="text-success" />
                      <span className="font-caption font-caption-semibold text-xs text-success">
                        {child?.averageGrade}/20
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} className="text-primary" />
                      <span className="font-caption font-caption-semibold text-xs text-primary">
                        {child?.attendanceRate}%
                      </span>
                    </div>
                    {child?.pendingPayments > 0 && (
                      <div className="flex items-center gap-1">
                        <Icon name="CreditCard" size={12} className="text-warning" />
                        <span className="font-caption font-caption-semibold text-xs text-warning">
                          {child?.pendingPayments}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* No Children Message */}
      {children?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-body font-body-normal text-muted-foreground">
            Aucun enfant trouvé pour cette école
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;