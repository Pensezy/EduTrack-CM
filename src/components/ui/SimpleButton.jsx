import React from 'react';
import Icon from '../AppIcon';
import { cn } from '../../utils/cn';

const SimpleButton = React.forwardRef(({
    className = '',
    variant = 'default',
    size = 'default',
    children,
    loading = false,
    disabled = false,
    ...props
}, ref) => {
    // Base button classes
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    // Variant classes
    const variantClasses = {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-blue-500",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };
    
    // Size classes
    const sizeClasses = {
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-11 px-8 text-base"
    };

    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    return (
        <button
            className={cn(
                baseClasses,
                variantClasses[variant] || variantClasses.default,
                sizeClasses[size] || sizeClasses.default,
                className
            )}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {children}
        </button>
    );
});

SimpleButton.displayName = "SimpleButton";

export default SimpleButton;