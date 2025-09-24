import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, description, trend }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card hover:shadow-modal transition-state">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-heading-semibold text-sm text-card-foreground">
              {title}
            </h3>
            <p className="font-caption font-caption-normal text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {trend && (
          <div className="w-16 h-8 bg-muted rounded flex items-center justify-center">
            <div className="w-12 h-4 bg-primary/20 rounded-sm relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-primary rounded-sm transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(0, trend))}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="font-heading font-heading-bold text-2xl text-card-foreground">
            {value}
          </span>
          {change && (
            <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
              <Icon name={getChangeIcon()} size={14} />
              <span className="font-caption font-caption-normal text-sm">
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-1">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, (parseFloat(value) / 100) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;