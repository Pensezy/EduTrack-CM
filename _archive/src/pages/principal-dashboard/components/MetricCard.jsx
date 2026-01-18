import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, description, trend, onClick, navigateTo }) => {
  const navigate = useNavigate();
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  const getGradientColors = () => {
    if (changeType === 'positive') return 'from-green-50 to-emerald-50 border-green-200';
    if (changeType === 'negative') return 'from-red-50 to-pink-50 border-red-200';
    return 'from-blue-50 to-indigo-50 border-blue-200';
  };

  const getIconBgColor = () => {
    if (changeType === 'positive') return 'from-green-600 to-emerald-600';
    if (changeType === 'negative') return 'from-red-600 to-pink-600';
    return 'from-blue-600 to-indigo-600';
  };

  const getProgressColor = () => {
    if (changeType === 'positive') return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (changeType === 'negative') return 'bg-gradient-to-r from-red-500 to-pink-500';
    return 'bg-gradient-to-r from-blue-500 to-indigo-500';
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const isClickable = onClick || navigateTo;

  return (
    <div
      className={`group bg-gradient-to-br ${getGradientColors()} border-2 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-100' : ''}`}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyPress={isClickable ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getIconBgColor()} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}>
            <Icon name={icon} size={20} className="text-white sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-heading-bold text-xs sm:text-sm text-gray-900 mb-0.5 truncate">
              {title}
            </h3>
            {description && (
              <p className="font-caption font-caption-normal text-[10px] sm:text-xs text-gray-600 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        {change && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm ${getChangeColor()} flex-shrink-0`}>
            <Icon name={getChangeIcon()} size={14} />
            <span className="font-caption font-caption-bold text-xs">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="font-heading font-heading-bold text-2xl sm:text-3xl text-gray-900">
            {value}
          </span>
          {isClickable && (
            <Icon name="ChevronRight" size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors sm:hidden" />
          )}
        </div>
        {trend !== undefined && (
          <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, Math.max(0, trend))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;