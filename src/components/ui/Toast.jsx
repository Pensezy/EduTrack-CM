import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: CheckCircle,
        className: 'bg-green-50 border-green-200 text-green-800',
        iconColor: 'text-green-500'
      },
      error: {
        icon: AlertCircle,
        className: 'bg-red-50 border-red-200 text-red-800',
        iconColor: 'text-red-500'
      },
      warning: {
        icon: AlertTriangle,
        className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        iconColor: 'text-yellow-500'
      },
      info: {
        icon: Info,
        className: 'bg-blue-50 border-blue-200 text-blue-800',
        iconColor: 'text-blue-500'
      }
    };
    return configs[type] || configs.success;
  };

  if (!isVisible) return null;

  const config = getToastConfig(type);
  const Icon = config.icon;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isLeaving ? 'translate-y-[-100px] opacity-0' : 'translate-y-0 opacity-100'
    }`}>
      <div className={`
        flex items-center p-4 rounded-lg border shadow-lg max-w-md
        ${config.className}
        transform transition-all duration-300
      `}>
        <Icon className={`w-5 h-5 mr-3 ${config.iconColor}`} />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={handleClose}
          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 w-full max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook pour gérer les toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess: (message, duration = 6000) => addToast(message, 'success', duration),
    showError: (message, duration = 8000) => addToast(message, 'error', duration),
    showWarning: (message, duration = 7000) => addToast(message, 'warning', duration),
    showInfo: (message, duration = 5000) => addToast(message, 'info', duration)
  };
};

export default Toast;