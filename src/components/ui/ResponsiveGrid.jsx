/**
 * GRILLE RESPONSIVE
 *
 * Grille automatique avec breakpoints
 * Support pour différentes configurations de colonnes
 */

import React from 'react';
import { cn } from '../../utils/responsive';

const ResponsiveGrid = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 4,
  className = ''
}) => {
  const gridClass = cn(
    'grid',
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
    className
  );

  return <div className={gridClass}>{children}</div>;
};

/**
 * CARTE MÉTRIQUE RESPONSIVE
 */
export const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
  trend = null,
  color = 'primary',
  onClick = null
}) => {
  const colorClasses = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-yellow-500 to-orange-500',
    danger: 'from-red-500 to-red-600',
    info: 'from-cyan-500 to-cyan-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg shadow-card p-4 sm:p-6',
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg active:scale-95'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  'ml-2 text-xs sm:text-sm font-semibold',
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg',
              'flex items-center justify-center',
              'bg-gradient-to-br',
              colorClasses[color] || colorClasses.primary
            )}
          >
            {React.cloneElement(icon, {
              className: 'text-white',
              size: window.innerWidth < 640 ? 20 : 24
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * CARTE LISTE RESPONSIVE
 */
export const ListCard = ({ title, items = [], action = null, emptyMessage = 'Aucun élément' }) => {
  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm text-primary hover:text-primary/80 font-medium whitespace-nowrap"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-200">
        {items.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-center">
            <p className="text-sm text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'px-4 sm:px-6 py-3 sm:py-4',
                item.onClick && 'hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100'
              )}
              onClick={item.onClick}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                  {item.subtitle && (
                    <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                  )}
                </div>
                {item.value && (
                  <span className="ml-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {item.value}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={cn(
                      'ml-3 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
                      item.badge.color === 'success' && 'bg-green-100 text-green-800',
                      item.badge.color === 'warning' && 'bg-yellow-100 text-yellow-800',
                      item.badge.color === 'danger' && 'bg-red-100 text-red-800',
                      item.badge.color === 'info' && 'bg-blue-100 text-blue-800'
                    )}
                  >
                    {item.badge.label}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResponsiveGrid;
