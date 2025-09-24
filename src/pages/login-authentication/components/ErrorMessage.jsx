import React from 'react';
import Icon from '../../../components/AppIcon';

const ErrorMessage = ({ message, type = 'error', onDismiss, className = '' }) => {
  if (!message) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'CheckCircle', colorClass: 'text-success bg-success/10 border-success/20' };
      case 'warning':
        return { icon: 'AlertTriangle', colorClass: 'text-warning bg-warning/10 border-warning/20' };
      case 'info':
        return { icon: 'Info', colorClass: 'text-primary bg-primary/10 border-primary/20' };
      default:
        return { icon: 'XCircle', colorClass: 'text-error bg-error/10 border-error/20' };
    }
  };

  const { icon, colorClass } = getIconAndColor();

  return (
    <div className={`flex items-start space-x-3 p-4 border rounded-lg ${colorClass} ${className}`}>
      <Icon name={icon} size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-body font-body-normal text-sm">
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-micro"
        >
          <Icon name="X" size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;