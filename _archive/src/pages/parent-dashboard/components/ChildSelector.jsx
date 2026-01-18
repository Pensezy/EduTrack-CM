import React from 'react';
import Icon from '../../../components/AppIcon';

const ChildSelector = ({ 
  children, 
  schools, 
  selectedChild, 
  selectedSchool, 
  onChildSelect, 
  onSchoolChange,
  getChildrenBySchool,
  onManageChild
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Icon name="Users" size={24} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900">
            Sélection Enfant & École
          </h2>
        </div>
        
        {/* Multi-School Selector - Modernisé */}
        {schools?.length > 1 && (
          <div className="flex items-center gap-3 bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border-2 border-blue-200">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Icon name="School" size={18} className="text-white" />
            </div>
            <select
              value={selectedSchool || ''}
              onChange={(e) => onSchoolChange(e?.target?.value)}
              className="px-4 py-2 bg-white border-2 border-blue-200 rounded-lg font-body-bold text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      
      {/* Children Cards - Modernisées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children?.map(child => {
          // Show child if no school selected or if child belongs to selected school
          const shouldShow = !selectedSchool || child?.schoolId === selectedSchool;
          if (!shouldShow) return null;

          const isSelected = selectedChild?.id === child?.id;

          return (
            <div
              key={child?.id}
              className={`relative p-5 rounded-2xl border-2 transition-all duration-200 group cursor-pointer ${
                isSelected 
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl scale-105' 
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg hover:scale-102'
              }`}
              onClick={() => onChildSelect(child)}
            >
              {/* Selection Indicator - Modernisé */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Icon name="Check" size={18} className="text-white" />
                </div>
              )}

              {/* Manage Button - Modernisé */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onManageChild?.(child);
                }}
                className="absolute top-3 right-3 p-2 bg-white hover:bg-gray-100 border-2 border-gray-200 rounded-lg shadow-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                title="Gérer cet enfant"
              >
                <Icon name="Settings" size={16} className="text-gray-600" />
              </button>

              <div className="flex items-center gap-4">
                {/* Child Photo - Modernisé */}
                <div className="relative">
                  <img
                    src={child?.photo || 'https://via.placeholder.com/64'}
                    alt={child?.name}
                    className={`w-16 h-16 rounded-xl object-cover border-2 transition-all ${
                      isSelected ? 'border-indigo-500' : 'border-gray-200 group-hover:border-indigo-300'
                    }`}
                  />
                  {/* Notification Badge - Modernisé */}
                  {child?.unreadNotifications > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="font-display font-bold text-xs text-white">
                        {child?.unreadNotifications}
                      </span>
                    </div>
                  )}
                </div>

                {/* Child Info - Modernisé */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1 truncate">
                    {child?.name}
                  </h3>
                  <p className="font-body-medium text-sm text-gray-600 mb-1">
                    {child?.class} • {child?.matricule}
                  </p>
                  <p className="font-body-medium text-xs text-gray-500 truncate">
                    {child?.school}
                  </p>

                  {/* Quick Stats - Modernisés */}
                  <div className="flex items-center gap-3 mt-3">
                    {child?.averageGrade > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                        <Icon name="TrendingUp" size={12} className="text-green-600" />
                        <span className="font-body-bold text-xs text-green-700">
                          {child?.averageGrade}/20
                        </span>
                      </div>
                    )}
                    {child?.attendanceRate > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-lg">
                        <Icon name="Calendar" size={12} className="text-blue-600" />
                        <span className="font-body-bold text-xs text-blue-700">
                          {child?.attendanceRate}%
                        </span>
                      </div>
                    )}
                    {child?.pendingPayments > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-lg">
                        <Icon name="CreditCard" size={12} className="text-orange-600" />
                        <span className="font-body-bold text-xs text-orange-700">
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
      
      {/* No Children Message - Modernisé */}
      {children?.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-md">
            <Icon name="Users" size={40} className="text-white" />
          </div>
          <p className="font-body-bold text-gray-700 text-lg">
            Aucun enfant trouvé pour cette école
          </p>
        </div>
      )}
    </div>
  );
};

export default ChildSelector;