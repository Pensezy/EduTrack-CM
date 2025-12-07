import React from 'react';
import Icon from '../../../components/AppIcon';

const ChildOverviewCard = ({ child }) => {
  if (!child) return null;

  const getPerformanceColor = (average) => {
    if (average >= 16) return 'from-green-500 to-emerald-600';
    if (average >= 14) return 'from-blue-500 to-indigo-600';
    if (average >= 12) return 'from-orange-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getPerformanceTextColor = (average) => {
    if (average >= 16) return 'text-green-700';
    if (average >= 14) return 'text-blue-700';
    if (average >= 12) return 'text-orange-700';
    return 'text-red-700';
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 95) return 'from-green-500 to-emerald-600';
    if (rate >= 90) return 'from-blue-500 to-indigo-600';
    if (rate >= 85) return 'from-orange-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getAttendanceTextColor = (rate) => {
    if (rate >= 95) return 'text-green-700';
    if (rate >= 90) return 'text-blue-700';
    if (rate >= 85) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Child Profile Section - Modernisé */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={child?.photo || 'https://via.placeholder.com/80'}
              alt={child?.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg backdrop-blur-sm"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl border-2 border-white flex items-center justify-center shadow-md">
              <Icon name="User" size={16} className="text-white" />
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-3xl mb-3">
              {child?.name}
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Icon name="GraduationCap" size={16} />
                <span className="font-body-bold text-sm">{child?.class || 'Classe non renseignée'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Icon name="Hash" size={16} />
                <span className="font-body-medium text-sm">{child?.matricule || 'Matricule non renseigné'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Icon name="School" size={16} />
                <span className="font-body-medium text-sm">{child?.school || 'École non renseignée'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics - Modernisés */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Performance */}
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center hover:scale-105 transition-transform">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${getPerformanceColor(child?.averageGrade || 0)} flex items-center justify-center shadow-md`}>
              <Icon name="TrendingUp" size={24} className="text-white" />
            </div>
            <div className={`font-display font-bold text-2xl ${getPerformanceTextColor(child?.averageGrade || 0)}`}>
              {child?.averageGrade || 0}/20
            </div>
            <p className="font-body-medium text-xs text-gray-600 mt-2">
              Moyenne générale
            </p>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center hover:scale-105 transition-transform">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${getAttendanceColor(child?.attendanceRate || 0)} flex items-center justify-center shadow-md`}>
              <Icon name="Calendar" size={24} className="text-white" />
            </div>
            <div className={`font-display font-bold text-2xl ${getAttendanceTextColor(child?.attendanceRate || 0)}`}>
              {child?.attendanceRate || 0}%
            </div>
            <p className="font-body-medium text-xs text-gray-600 mt-2">
              Taux de présence
            </p>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center hover:scale-105 transition-transform">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${child?.unreadNotifications > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-600' : 'bg-gray-300'} flex items-center justify-center shadow-md`}>
              <Icon name="Bell" size={24} className="text-white" />
            </div>
            <div className={`font-display font-bold text-2xl ${child?.unreadNotifications > 0 ? 'text-orange-700' : 'text-gray-500'}`}>
              {child?.unreadNotifications || 0}
            </div>
            <p className="font-body-medium text-xs text-gray-600 mt-2">
              Notifications
            </p>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-2xl p-5 shadow-lg text-center hover:scale-105 transition-transform">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl ${child?.pendingPayments > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'} flex items-center justify-center shadow-md`}>
              <Icon name="CreditCard" size={24} className="text-white" />
            </div>
            <div className={`font-display font-bold text-2xl ${child?.pendingPayments > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {child?.pendingPayments || 0}
            </div>
            <p className="font-body-medium text-xs text-gray-600 mt-2">
              Paiements dus
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildOverviewCard;