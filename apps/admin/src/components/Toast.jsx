/**
 * Composant Toast pour afficher des notifications
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Contexte pour les toasts
const ToastContext = createContext(null);

// Types de toast
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClass: 'text-green-500',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClass: 'text-yellow-500',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClass: 'text-blue-500',
  },
};

// Composant Toast individuel
function ToastItem({ toast, onClose }) {
  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${config.className}`}
      role="alert"
    >
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm">{toast.title}</p>
        )}
        <p className="text-sm">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Conteneur des toasts
function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((options) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      type: 'info',
      duration: 5000,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-remove après la durée
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Raccourcis pour les différents types
  const toast = {
    success: (message, options = {}) =>
      addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) =>
      addToast({ type: 'error', message, duration: 8000, ...options }),
    warning: (message, options = {}) =>
      addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) =>
      addToast({ type: 'info', message, ...options }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook pour utiliser les toasts
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Styles CSS pour l'animation (à ajouter dans le CSS global ou via Tailwind)
// On les injecte ici pour que ça marche immédiatement
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#toast-styles')) {
  style.id = 'toast-styles';
  document.head.appendChild(style);
}

export default { ToastProvider, useToast };
