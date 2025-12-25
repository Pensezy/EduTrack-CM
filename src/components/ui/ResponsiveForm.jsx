/**
 * FORMULAIRE RESPONSIVE
 *
 * - Layouts adaptés mobile/desktop
 * - Touch-friendly inputs
 * - Validation visuelle
 */

import React from 'react';
import { cn } from '../../utils/responsive';
import Icon from '../AppIcon';

/**
 * Container de formulaire
 */
export const FormContainer = ({ children, onSubmit, className = '' }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-4 sm:space-y-6', className)}
    >
      {children}
    </form>
  );
};

/**
 * Groupe de champs (row)
 */
export const FormRow = ({ children, cols = { default: 1, sm: 1, md: 2 } }) => {
  const gridClass = cn(
    'grid gap-4',
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`
  );

  return <div className={gridClass}>{children}</div>;
};

/**
 * Groupe de champ avec label
 */
export const FormGroup = ({
  label,
  error,
  required = false,
  hint,
  children
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <Icon name="AlertCircle" size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Input responsive
 */
export const FormInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  disabled = false,
  icon = null,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon name={icon} size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2.5 sm:py-2 rounded-lg border transition-colors',
          'text-sm sm:text-base',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          icon && 'pl-10',
          error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-white',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
          className
        )}
        {...props}
      />
    </div>
  );
};

/**
 * Textarea responsive
 */
export const FormTextarea = ({
  placeholder,
  value,
  onChange,
  rows = 4,
  error = false,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2.5 sm:py-2 rounded-lg border transition-colors resize-none',
        'text-sm sm:text-base',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-white',
        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    />
  );
};

/**
 * Select responsive
 */
export const FormSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Sélectionner...',
  error = false,
  disabled = false,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        'w-full px-3 py-2.5 sm:py-2 rounded-lg border transition-colors',
        'text-sm sm:text-base',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        'appearance-none bg-no-repeat bg-right',
        'pr-10',
        error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-white',
        disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em'
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

/**
 * Checkbox responsive
 */
export const FormCheckbox = ({
  label,
  checked,
  onChange,
  disabled = false
}) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'w-5 h-5 rounded border-gray-300 text-primary',
          'focus:ring-2 focus:ring-primary/20 transition-colors',
          'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      <span className="text-sm sm:text-base text-gray-700">{label}</span>
    </label>
  );
};

/**
 * Bouton submit responsive
 */
export const FormSubmitButton = ({
  children,
  loading = false,
  disabled = false,
  fullWidth = false,
  variant = 'primary'
}) => {
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10'
  };

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        'px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all',
        'text-sm sm:text-base',
        'focus:outline-none focus:ring-2 focus:ring-primary/20',
        'active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        fullWidth ? 'w-full' : 'min-w-[120px]',
        variantClasses[variant]
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Loader2" size={18} className="animate-spin" />
          <span>Chargement...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default FormContainer;
