/**
 * MODAL RESPONSIVE
 *
 * - Full-screen sur mobile
 * - Centered modal sur desktop
 * - Animation slide-up sur mobile
 * - Support clavier et accessibilité
 */

import React, { useEffect } from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/responsive';

const ResponsiveModal = ({
  isOpen = false,
  onClose = () => {},
  title,
  children,
  footer = null,
  size = 'md', // 'sm', 'md', 'lg', 'xl', 'full'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true
}) => {
  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md md:max-w-lg',
    lg: 'sm:max-w-lg md:max-w-xl lg:max-w-2xl',
    xl: 'sm:max-w-xl md:max-w-2xl lg:max-w-4xl',
    full: 'sm:max-w-full sm:h-full'
  };

  return (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-0 sm:p-4">
        {/* Modal */}
        <div
          className={cn(
            'relative w-full transform overflow-hidden bg-white shadow-2xl transition-all',
            'h-full sm:h-auto sm:rounded-xl',
            // Animation mobile (slide-up)
            'animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95',
            'duration-300',
            sizeClasses[size]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <h3 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-8">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
                aria-label="Fermer"
              >
                <Icon name="X" size={20} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto max-h-[calc(100vh-8rem)] sm:max-h-[calc(100vh-12rem)]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * FOOTER BUTTONS POUR MODAL
 */
export const ModalFooter = ({ children, align = 'right' }) => {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn('flex flex-col-reverse sm:flex-row gap-3', alignClass[align])}>
      {children}
    </div>
  );
};

export default ResponsiveModal;
